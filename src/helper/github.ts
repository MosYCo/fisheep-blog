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
import { minify } from 'html-minifier';
import Log from "./log";

const miniHtml = (htmlStr: string) => {
  return minify(htmlStr, {
    //  去除空格
    collapseWhitespace: true,
    // 最小化CSS
    minifyCSS: true
  });
}


class BlogApi {

  private octokit: Octokit;

  private blogConfig!: BlogConfig;

  constructor(private readonly githubToken: string, private readonly repoName: string, private readonly owner: string) {
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

  private getIssuePageUrl(issue: any): string {
    return getPagesPath(`${issue.id}.html`);
  }

  private formatDate(dateString: string) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  private issueBackup(issue: Issue, body: string) {
    fs.writeFile(getBackupPath(issue.title + '.md'), body || "", 'utf-8', (err) => {
      if (err) {
        Log.log(`Save backup file error: ${issue.title}.md`);
      } else {
        Log.log(`Save backup file: ${issue.title}.md`);
      }
    });
  }

  getTemplate(fileName: string) {
    return fs.readFileSync(getTemplatePath(fileName), 'utf-8');
  }

  initLabel(issue: any): Label {
    return {
      id: issue.id,
      name: issue.name,
      color: '#' + issue.color,
      description: issue.description,
      default: issue.default,
    }
  }

  async getLabels() {
    const res: any[] = await this.octokit.paginate("GET /repos/{owner}/{repo}/labels", {
      owner: this.owner,
      repo: this.repoName,
    });
    if (res && res.length > 0) {
      this.blogConfig.labels = res.map((i: any) => this.initLabel(i));
    }
  }

  async initBlog() {
    await this.getLabels();
    await this.getIssuesList();
  }

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
      fs.writeFileSync(getPagerPath(name), miniHtml(htmlStr), 'utf-8');
      Log.log(`Generate pager html: ${name}.html`);
      currentPage++;
    }
  }

  private generateSinglePageHtml(issue: Issue, content: string) {
    const htmlStr = ejs.render(this.getTemplate('issue-page.ejs'), {
      ...issue,
      content,
      currentYear: this.blogConfig.currentYear
    });
    fs.writeFileSync(issue.pageUrl, miniHtml(htmlStr), 'utf-8');
    Log.log(`Generate page html: ${issue.pageUrl}`);
  }

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

  async generateIssuePageHtml() {
    for (let issue of this.blogConfig.pageIssueList) {
      const content = await this.issueMarkdownToHtml(issue);
      this.generateSinglePageHtml(issue, content);
    }
  }

  generateHtml() {
    this.generateIndexHtml();
    this.generateIssuePageHtml();
  }

}

export default BlogApi;
