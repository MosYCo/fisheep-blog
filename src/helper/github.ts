import { Octokit } from "octokit";
import { GithubIssue, GithubLabel } from "../types";

/**
 * Github API封装
 */
class GithubApi {

  readonly octokit!: Octokit;

  constructor(private readonly githubToken: string, private readonly repoName: string, private readonly owner: string) {
    this.octokit = new Octokit({
      auth: this.githubToken,
    });
  }

  /**
   * 获取Issue List
   */
  getIssueList(): Promise<GithubIssue[]> {
    return new Promise(resolve => {
      this.octokit.paginate("GET /repos/{owner}/{repo}/issues", {
        owner: this.owner,
        repo: this.repoName
      }).then((issues: GithubIssue[]) => {
        resolve(issues || []);
      }).catch(() => {
        resolve([]);
      });
    })
  }

  getIssueLabels(): Promise<GithubLabel[]> {
    return new Promise(resolve => {
      this.octokit.paginate("GET /repos/{owner}/{repo}/labels", {
        owner: this.owner,
        repo: this.repoName
      }).then((labels: GithubLabel[]) => {
        resolve(labels || []);
      }).catch(() => {
        resolve([]);
      });
    })
  }

  markdownToHTML(text: string) {
    return new Promise<string>(resolve => {
      this.octokit.request("POST /markdown", {
        text,
        mode: "gfm"
      }).then((res: any) => {
        const data = res.status === 200 ? res.data : "";
        resolve(data);
      }).catch(() => {
        resolve("");
      })
    })
  }
}

export default GithubApi;