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
  rootPath: string;
}

export interface IConfig {
  title: string;
  subTitle: string;
  email: string;
  language: 'CN' | "EN";
  homeUrl?: string;
  footerTitle?: string;
  enableComments?: boolean;
  pageTemp?: string;
}

export type BlogConfig = IConfig & RuntimeBlogConfig;