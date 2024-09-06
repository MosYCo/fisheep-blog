import {BlogApi, FileHelper} from "./helper";

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    return;
  }
  const [ githubToken, repo ] = args;
  await FileHelper.clearOutputFile();
  const api = new BlogApi(githubToken, repo);
  await api.initBlog()
  api.generateHtml();
};

main();

