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
  pageUrl: string;
  createdDate: string;
  updatedDate: string;
  commentNum: number;
  description: string;
}

export interface BlogConfig {
  title: string;
  subTitle: string;
  linkIssue?: Issue;
  aboutIssue?: Issue;
  pageIssueList: Issue[];
  labels: Label[];
  totalCount: number;
  language: 'CN' | "EN";
  pageSize: number;
  totalPages: number;
  currentYear: number;
}
