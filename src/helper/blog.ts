import fs from "node:fs";
import ejs from "ejs";
import {BlogConfig, GithubIssue, GithubLabel, Issue, Label} from "../types";
import Config from '../config/config.json';
import {
  getTemplatePath,
  getBackupPath,
  getPagesPath,
  getPagerPath
} from '../config/path-config';
import HtmlHelper from "./html-helper";
import Log from "./log";
import Github from "./github";
import GithubApi from "./github";
import dayjs from "dayjs";

/**
 * 博客API
 */
class Blog {

  /**
   * github api工具
   * @private
   */
  private github: Github;

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
    this.blogConfig = {
      title: Config.title,
      subTitle: Config.subTitle,
      language: Config.language as any,
      pageIssueList: [],
      labels: [],
      totalCount: 0,
      pageSize: 10,
      totalPages: 0,
      currentYear: new Date().getFullYear(),
      linkIssue: null,
      aboutIssue: null
    }
  }

  /**
   * 获取Issue page url
   * @param name
   * @private
   */
  private getIssuePageUrl(name: string): string {
    return getPagesPath(`${name}.html`);
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
    fs.writeFile(getBackupPath(issue.title + '.md'), body || "", 'utf-8', (err) => {
      if (err) {
        Log.log(`Save backup file error: ${issue.title}.md`);
      } else {
        Log.log(`Save backup file: ${issue.title}.md`);
      }
    });
  }

  /**
   * 获取模板
   * @param fileName
   */
  getTemplate(fileName: string) {
    return fs.readFileSync(getTemplatePath(fileName), 'utf-8');
  }

  /**
   * 转化Issue Label
   * @param labelObjs
   * @private
   */
  private transformIssueLabels(labelObjs: GithubLabel[] = []): Label[] {
    return labelObjs.map(label => {
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
      }
    })
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
      labels,
      body
    } = issueObj;
    const issue = {
      id,
      title,
      labels: this.transformIssueLabels(issueObj.labels),
      commentNum: comments,
      createdDate: this.formatDate(created_at),
      updatedDate: this.formatDate(updated_at),
      isLink: labels.findIndex(label => label.name.toLowerCase() === 'link') !== -1,
      isAbout: labels.findIndex(label => label.name.toLowerCase() === 'about') !== -1,
      //  TODO 后续可能会调整此段逻辑
      description: body.replace(new RegExp(/(?<!!)\[(.*?)\]\((.*?)\)/g), '$1').replaceAll("#", "").slice(0, 200) + '...'
    }
    return Object.assign(issue, {
      pageUrl: this.getIssuePageUrl(issue.isLink ? 'link' : issue.isAbout ? 'about' : issue.id.toString()),
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
      this.issueBackup(issue, githubIssue.body);
    }
    //  计算总条数与总页数, 要除去计入About和Link的数据
    const { pageSize } = this.blogConfig;
    this.blogConfig.totalCount = count;
    this.blogConfig.totalPages = Math.floor(count / pageSize) + (count % pageSize !== 0 ? 1 : 0);
  }

  /**
   * 初始化Blog
   */
  async initBlog() {
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
      const htmlStr = ejs.render(this.getTemplate('index.ejs'), {
        ...this.blogConfig,
        pageIssueList: this.blogConfig.pageIssueList.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        currentPage,
        hasPrev: totalPages > 1 && currentPage > 1,
        hasNext: totalPages > 1 && currentPage < totalPages,
      });
      const name = currentPage === 1 ? 'index' : `page${currentPage}`;
      fs.writeFileSync(getPagerPath(name), HtmlHelper.miniHtml(htmlStr), 'utf-8');
      Log.log(`Generate pager html: ${name}.html`);
      currentPage++;
    }
  }

  /**
   * Issue md转HTML
   * @param issue
   */
  issueMarkdownToHtml(issue: Issue): Promise<string> {
    return new Promise(resolve => {
      fs.readFile(getBackupPath(issue.title + '.md'), 'utf-8', (err, data) => {
        if (err) {
          resolve("");
          return Log.log(`Read markdown file error: ${issue.title}.md`);
        } else {
          this.github.markdownToHTML(data).then(htmlStr => resolve(htmlStr));
        }
      })
    });
  }

  /**
   * 生成页面HTML
   * @param issue
   */
  async generatePageHtml(issue: Issue) {
    const content = await this.issueMarkdownToHtml(issue);
    const { linkIssue, aboutIssue, title: blogTitle, subTitle: blogSubTitle } = this.blogConfig;
    const htmlStr = ejs.render(this.getTemplate('issue-page.ejs'), {
      ...issue,
      blogTitle,
      blogSubTitle,
      linkIssue,
      aboutIssue,
      content,
      currentYear: this.blogConfig.currentYear
    });
    fs.writeFileSync(issue.pageUrl, HtmlHelper.miniHtml(htmlStr), 'utf-8');
    Log.log(`Generate page html: ${issue.pageUrl}`);
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
