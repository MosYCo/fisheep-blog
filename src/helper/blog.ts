import { BlogConfig, Issue, Label } from "../types";
import Log from "./log";
import GithubApi, { GithubIssue } from './github';
import dayjs from "dayjs";
import ConfigHelper from './config';
import EjsHelper from './ejs-helper';
import { FileHelper } from './index';
import path from 'path';
import * as process from 'node:process';

/**
 * 博客API
 */
class Blog {

  /**
   * github api工具
   * @private
   */
  private github: GithubApi;

  /**
   * 博客配置
   * @private
   */
  private readonly blogConfig!: BlogConfig;

  /**
   * 构造器
   * @param githubToken
   * @param repo
   */
  constructor(githubToken: string, private readonly repo: string) {
    const [owner, repoName] = this.repo.split('/');
    this.github = new GithubApi(githubToken, repoName, owner);
    const config = ConfigHelper.getConfig();
    this.blogConfig = {
      ...config,
      repo: this.repo,
      pageIssueList: [],
      labels: [],
      totalCount: 0,
      pageSize: 10,
      totalPages: 0,
      currentYear: new Date().getFullYear(),
      linkIssue: null,
      aboutIssue: null,
      rootPath: path.resolve(process.cwd(), 'docs')
    };
    EjsHelper.setTemplate(this.blogConfig.pageTemp || 'default');
  }

  /**
   * 格式化时间
   * @param dateString
   * @private
   */
  private formatDate(dateString: string) {
    const date = new Date(dateString);
    return dayjs(date).format('YYYY-MM-DD');
  }

  /**
   * 备份Issue md
   * @param issue
   * @param body
   * @private
   */
  private issueBackup(issue: Issue, body: string) {
    FileHelper.createFileSync(`backup/${issue.title}.md`, body);
    Log.log(`Save backup file ${issue.title}.md successfully.`)
  }

  /**
   * 转化Issue Label
   * @param labelObjs
   * @private
   */
  private transformIssueLabels(labelObjs: GithubIssue['labels']): Label[] {
    return labelObjs.filter(label => typeof label !== 'string').map(label => {
      const {
        id,
        name,
        color,
        description,
      } = label;
      return {
        id,
        name,
        color: '#' + color,
        description,
        default: label.default
      } as Label;
    })
  }

  private getPostOutputPath(name: string) {
    return `posts/${name}.html`
  }

  /**
   * 转化Issue
   * @param issueObj
   * @private
   */
  private transformIssue(issueObj: GithubIssue): Issue {
    const {
      id,
      title,
      created_at,
      updated_at,
      comments,
      body
    } = issueObj;
    const labels = this.transformIssueLabels(issueObj.labels);
    const issue = {
      id,
      title,
      labels,
      commentNum: comments,
      createdDate: this.formatDate(created_at),
      updatedDate: this.formatDate(updated_at),
      isLink: labels.findIndex(label => label.name.toLowerCase() === 'link') !== -1,
      isAbout: labels.findIndex(label => label.name.toLowerCase() === 'about') !== -1,
      //  TODO 后续可能会调整此段逻辑
      description: body ? body.replace(new RegExp(/(?<!!)\[(.*?)\]\((.*?)\)/g), '$1').replaceAll("#", "").slice(0, 200) + '...' : ''
    }
    return Object.assign(issue, {
      pageUrl: this.getPostOutputPath(issue.isLink ? "link" : issue.isAbout ? "about" : issue.id.toString())
    });
  }

  /**
   * 获取所有的Labels
   * @private
   */
  private async getLabels() {
    this.blogConfig.labels = this.transformIssueLabels(await this.github.getIssueLabels());
  }

  /**
   * 获取所有的Issue List
   * @private
   */
  private async getIssueList() {
    const issueList = await this.github.getIssueList();

    let count = 0;
    for (let githubIssue of issueList) {
      //  忽略关闭状态的Issue
      if (githubIssue.state === 'closed') {
        continue;
      }
      const issue = this.transformIssue(githubIssue);
      if (issue.labels.findIndex(label => label.name.toLowerCase() === 'about') !== -1) {
        this.blogConfig.aboutIssue = issue;
      } else if (issue.labels.findIndex(label => label.name.toLowerCase() === 'link') !== -1) {
        this.blogConfig.linkIssue = issue;
      } else {
        this.blogConfig.pageIssueList.push(issue);
        count++;
      }
      this.issueBackup(issue, githubIssue.body || "");
    }
    //  计算总条数与总页数, 要除去计入About和Link的数据
    const { pageSize } = this.blogConfig;
    this.blogConfig.totalCount = count;
    this.blogConfig.totalPages = Math.floor(count / pageSize) + (count % pageSize !== 0 ? 1 : 0);
  }

  async initRootPath() {
    if (process.env.NODE_ENV !== 'dev') {
      if (this.blogConfig.homeUrl) {
        this.blogConfig.rootPath = this.blogConfig.homeUrl;
      } else {
        const repo = await this.github.getRepo();
        if (repo) {
          const [owner, repoName] = this.repo.split('/');
          if (repo.owner.login === owner) {
            this.blogConfig.rootPath = `https://${owner.toLowerCase()}.github.io`;
          } else {
            this.blogConfig.rootPath = `https://${repo.owner.login.toLowerCase()}.github.io/${repoName.toLowerCase()}`
          }
        }
      }
    }
  }

  /**
   * 初始化Blog
   */
  async initBlog() {
    await this.initRootPath();
    await FileHelper.clearOutputFile();
    await this.getLabels();
    await this.getIssueList();
  }

  /**
   * 生成首页HTML文件
   */
  generateIndexHtml() {
    let currentPage = 1;
    const { totalPages, pageSize } = this.blogConfig;
    while (currentPage <= totalPages) {
      const name = currentPage === 1 ? 'index.html' : `pages/${currentPage}/index.html`;
      EjsHelper.generate('index.ejs', {
        ...this.blogConfig,
        pageIssueList: this.blogConfig.pageIssueList.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        currentPage,
        hasPrev: totalPages > 1 && currentPage > 1,
        hasNext: totalPages > 1 && currentPage < totalPages,
      }, name)
      currentPage++;
    }
  }

  /**
   * Issue md转HTML
   * @param issue
   */
  issueMarkdownToHtml(issue: Issue): Promise<string> {
    return new Promise(resolve => {
      const data =  FileHelper.readFileSync(`backup/${issue.title}.md`);
      if (data !== '') {
        this.github.markdownToHTML(data).then(htmlStr => resolve(htmlStr));
      } else {
        resolve("");
        return Log.log(`Read markdown file error: ${issue.title}.md`);
      }
    });
  }

  /**
   * 生成页面HTML
   * @param issue
   */
  async generatePageHtml(issue: Issue) {
    const content = await this.issueMarkdownToHtml(issue);
    EjsHelper.generate('post.ejs', {
      blog: this.blogConfig,
      ...issue,
      content
    }, issue.pageUrl);
  }

  /**
   * 生成Issue 页面HTML文件
   */
  async generateIssuePageHtml() {
    const { pageIssueList, linkIssue, aboutIssue } = this.blogConfig;
    if (linkIssue) {
      await this.generatePageHtml(linkIssue);
    }
    if (aboutIssue) {
      await this.generatePageHtml(aboutIssue);
    }
    for (let issue of pageIssueList) {
      await this.generatePageHtml(issue);
    }
  }

  /**
   * 生成HTML文件
   */
  generateHtml() {
    this.generateIndexHtml();
    this.generateIssuePageHtml();
  }

}

export default Blog;
