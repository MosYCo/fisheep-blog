import {Blog} from "./helper";
const main = async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    return;
  }
  const [ githubToken, repo ] = args;
  const api = new Blog(githubToken, repo);
  await api.initBlog();
  api.generateHtml();
};

main();

