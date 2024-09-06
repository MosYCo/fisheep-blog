import {Octokit} from "octokit";
import fs from "node:fs";
import ejs from "ejs";
import {BlogConfig, Issue, Label} from "../types";
import Config from '../config/config.json';
import {
  getTemplatePath,
  getBackupPath,
  getPagesPath,
  getPagerPath
} from '../config/path-config';
import HtmlHelper from "./html-helper";
import Log from "./log";

/**
 * 博客API
 */
class BlogApi {

  /**
   * github api工具
   * @private
   */
  private octokit: Octokit;

  /**
   * 博客配置
   * @private
   */
  private blogConfig!: BlogConfig;

  /**
   * 仓库名称
   * @private
   */
  private readonly repoName!: string;

  /**
   * 仓库拥有者
   * @private
   */
  private readonly owner!: string;

  /**
   * 构造器
   * @param githubToken
   * @param repo
   */
  constructor(private readonly githubToken: string, private readonly repo: string) {
    const [owner, repoName] = this.repo.split('/');
    this.owner = owner;
    this.repoName = repoName;
    this.init();
  }

  /**
   * 初始化
   */
  private init() {
    this.octokit = new Octokit({
      auth: this.githubToken
    });
    this.blogConfig = {
      title: Config.title,
      subTitle: Config.subTitle,
      language: Config.language as any,
      pageIssueList: [],
      labels: [],
      totalCount: 0,
      pageSize: 10,
      totalPages: 0,
      currentYear: new Date().getFullYear()
    }
  }

  /**
   * 获取Issue page url
   * @param issue
   * @private
   */
  private getIssuePageUrl(issue: any): string {
    return getPagesPath(`${issue.id}.html`);
  }

  /**
   * 格式化时间
   * @param dateString
   * @private
   */
  private formatDate(dateString: string) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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
   * 初始化Label
   * @param issue
   */
  initLabel(issue: any): Label {
    return {
      id: issue.id,
      name: issue.name,
      color: '#' + issue.color,
      description: issue.description,
      default: issue.default,
    }
  }

  /**
   * 获取Label
   */
  async getLabels() {
    const res: any[] = await this.octokit.paginate("GET /repos/{owner}/{repo}/labels", {
      owner: this.owner,
      repo: this.repoName,
    });
    if (res && res.length > 0) {
      this.blogConfig.labels = res.map((i: any) => this.initLabel(i));
    }
  }

  /**
   * 初始化Blog
   */
  async initBlog() {
    await this.getLabels();
    await this.getIssuesList();
  }

  /**
   * 获取Issue List
   */
  async getIssuesList() {
    const res = await this.octokit.paginate("GET /repos/{owner}/{repo}/issues", {
      owner: this.owner,
      repo: this.repoName
    });
    const splitChar = this.blogConfig.language === 'CN' ? '。' : '.';
    if (res && res.length) {
      const { pageSize } = this.blogConfig;
      this.blogConfig.totalCount = res.length;
      this.blogConfig.totalPages = Math.floor(res.length / pageSize) + (res.length % pageSize !== 0 ? 1 : 0);
      res.forEach((i: any) => {
        const issue: Issue = {
          id: i.id,
          labels: (i.labels || []).map((label: any) => this.initLabel(label)),
          title: i.title,
          pageUrl: this.getIssuePageUrl(i),
          createdDate: this.formatDate(i.created_at),
          updatedDate: this.formatDate(i.updated_at),
          commentNum: i.comments,
          description: i.body ? i.body.split(splitChar)[0] + splitChar : '',
        };
        if (issue.labels.findIndex(label => label.name === 'link') !== -1) {
          this.blogConfig.linkIssue = issue;
        } else if (issue.labels.findIndex(label => label.name === 'about') !== -1) {
          this.blogConfig.aboutIssue = issue;
        } else {
          this.blogConfig.pageIssueList.push(issue);
        }
        this.issueBackup(issue, i.body);
      });
    }
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
   * 生成单页HTML
   * @param issue
   * @param content
   * @private
   */
  private generateSinglePageHtml(issue: Issue, content: string) {
    const htmlStr = ejs.render(this.getTemplate('issue-page.ejs'), {
      ...issue,
      content,
      currentYear: this.blogConfig.currentYear
    });
    fs.writeFileSync(issue.pageUrl, HtmlHelper.miniHtml(htmlStr), 'utf-8');
    Log.log(`Generate page html: ${issue.pageUrl}`);
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
          return console.log(`Read markdown file error: ${issue.title}.md`);
        } else {
          this.octokit.request("POST /markdown", {
            text: data,
            mode: "gfm"
          }).then((res: any) => {
            const data = res.status === 200 ? res.data : "";
            resolve(data);
          }).catch(() => {
            resolve("");
          })
        }
      })
    });
  }

  /**
   * 生成Issue 页面HTML文件
   */
  async generateIssuePageHtml() {
    for (let issue of this.blogConfig.pageIssueList) {
      const content = await this.issueMarkdownToHtml(issue);
      this.generateSinglePageHtml(issue, content);
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

export default BlogApi;
