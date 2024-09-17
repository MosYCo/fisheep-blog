import path from "path";

export const ROOT_DIR = "docs" as const;
export const BACKUP_PATH = "backup" as const;
export const PAGES_PATH = `${ROOT_DIR}/pages` as const;
export const TEMPLATE_PATH = "src/template" as const;
export const ASSETS_PATH = `${TEMPLATE_PATH}/assets` as const;
export const ASSETS_OUT_DIR = `${ROOT_DIR}/assets` as const;

/**
 * 获取备份MD文件路径
 * @param {string} name
 */
export const getBackupPath = (name: string) => {
  return path.resolve(process.cwd(), BACKUP_PATH + '/' + name);
}