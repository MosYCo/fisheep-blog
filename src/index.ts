import {Blog, FileHelper} from "./helper";

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    return;
  }
  const [ githubToken, repo ] = args;
  await FileHelper.clearOutputFile();
  const api = new Blog(githubToken, repo);
  await api.initBlog()
  api.generateHtml();
};

main();

