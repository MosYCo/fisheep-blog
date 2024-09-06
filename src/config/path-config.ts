import path from "path";

const BACKUP_PATH = "output/backup" as const;
const PAGES_PATH = "output/pages" as const;
const PAGER_PATH = "output/pager" as const;
const TEMPLATE_PATH = "src/template" as const;

/**
 * 获取备份MD文件路径
 * @param {string} name
 */
export const getBackupPath = (name: string) => {
  return path.resolve(process.cwd(), BACKUP_PATH + '/' + name);
}

/**
 * 获取详情页面文件路径
 * @param {string} name
 */
export const getPagesPath = (name: string) => {
  return path.resolve(process.cwd(), PAGES_PATH + '/' + name);
}

/**
 * 获取分页页面文件路径
 * @param {string} name
 */
export const getPagerPath = (name: string) => {
  if (name === 'index') {
    return path.resolve(process.cwd(), "output/index.html");
  } else {
    return path.resolve(process.cwd(), `${PAGER_PATH}/${name}.html`);
  }
}

/**
 * 获取解析模板文件路径
 * @param {string} name
 */
export const getTemplatePath = (name: string) => {
  return path.resolve(process.cwd(), TEMPLATE_PATH + '/' + name);
}