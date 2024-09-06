import path from "path";

export const ROOT_DIR = "docs" as const;
export const BACKUP_PATH = "backup" as const;
export const PAGES_PATH = `${ROOT_DIR}/pages` as const;
export const TEMPLATE_PATH = "src/template" as const;
export const ASSETS_PATH = `src/assets` as const;
export const ASSETS_OUT_DIR = `${TEMPLATE_PATH}/assets` as const;

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
  return path.resolve(process.cwd(), `${ROOT_DIR}/${name}.html`);
}

/**
 * 获取解析模板文件路径
 * @param {string} name
 */
export const getTemplatePath = (name: string) => {
  return path.resolve(process.cwd(), TEMPLATE_PATH + '/' + name);
}