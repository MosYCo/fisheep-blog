export interface Label {
  id: number,
  name: string,
  color: string,
  description: string,
  default: boolean,
}

export interface Issue {
  id: number;
  labels: Label[];
  title: string;
  createdDate: string;
  updatedDate: string;
  commentNum: number;
  pageUrl: string;
  isLink?: boolean;
  isAbout?: boolean;
  description: string;
}

export interface RuntimeBlogConfig {
  repo: string;
  linkIssue: Issue | null;
  aboutIssue: Issue | null;
  pageIssueList: Issue[];
  labels: Label[];
  totalCount: number;
  pageSize: number;
  totalPages: number;
  currentYear: number;
}

export interface IConfig {
  title: string;
  subTitle: string;
  email: string;
  language: 'CN' | "EN";
  footerUrl?: string;
  footerTitle?: string;
  enableComments?: boolean;
}

export type BlogConfig = IConfig & RuntimeBlogConfig;

export interface GithubLabel {
  /**
   * Unique identifier for the label.
   */
  id: number;
  /**
   * Optional description of the label, such as its purpose.
   */
  description: string;
  /**
   * URL for the label
   */
  url: string;
  /**
   * The name of the label.
   */
  name: string;
  /**
   * 6-character hex code, without the leading #, identifying the color
   */
  color: string;
  /**
   * Whether this label comes by default in a new repository.
   */
  default: boolean;
}

export interface GithubIssue {
  /**
   * Unique identifier for the issue.
   */
  id: number;
  /**
   * URL for the issue
   */
  url: string;
  /**
   * URL for the repo
   */
  repository_url: string;
  /**
   * URL for the issue
   */
  comments_url: string;
  events_url: string;
  html_url: string;
  /**
   * Number uniquely identifying the issue within its repository
   */
  number: number;
  /**
   * State of the issue; either 'open' or 'closed'
   */
  state: 'open' | 'closed',
  /**
   * Title of the issue
   */
  title: string;
  /**
   * Contents of the issue
   */
  body: string;
  /**
   * Labels to associate with this issue;
   * pass one or more label names to replace the set of labels on this issue;
   * send an empty array to clear all labels from the issue;
   * note that the labels are silently dropped for users without push access to the repository
   */
  labels: GithubLabel[];

  /**
   * 创建时间
   */
  created_at: string;

  /**
   * 上次更新时间
   */
  updated_at: string;

  /**
   * 评论数
   */
  comments: number;
}
