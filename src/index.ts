import { BlogApi } from "./helper";

const main = () => {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    return;
  }
  const [ githubToken, owner, repoName ] = args;
  const api = new BlogApi(githubToken, repoName, owner);
  api.getIssuesList().then(() => {
    api.generateHtml();
  });
};

main();

