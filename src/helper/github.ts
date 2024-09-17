import { Octokit } from "octokit";
import { components } from '@octokit/openapi-types';

export type GithubIssue = components['schemas']['issue'];

export type GithubLabel = components['schemas']['label'];

export type GithubRepo = components['schemas']['repository'];

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

  getRepo() {
    return new Promise<GithubRepo | null>(resolve => {
      this.octokit.request("GET /repos/{owner}/{repo}", {
        owner: this.owner,
        repo: this.repoName,
      }).then((res: {
        status: number,
        data: GithubRepo
      }) => {
        if (res && res.status === 200) {
          resolve(res.data)
        } else {
          resolve(null);
        }
      }).catch(() => {
        resolve(null);
      });
    });
  }

  /**
   * 获取Issue List
   */
  getIssueList(): Promise<GithubIssue[]> {
    return new Promise(resolve => {
      this.octokit.paginate("GET /repos/{owner}/{repo}/issues", {
        owner: this.owner,
        repo: this.repoName,
        sort: 'updated'
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