import fs from "node:fs";
import {
  ASSETS_PATH,
  ASSETS_OUT_DIR
} from '../config/path-config';
import path from "path";
import Log from "./log";

class FileHelper {

  static async clearOutputFile() {
    this.deleteDir('docs');
    this.deleteDir("backup");
    this.copyAssets();
  }

  static deleteDir(dirPath: string) {
    const basePath = path.resolve(process.cwd(), dirPath);
    Log.log("==================== Regenerate directory ====================");
    try {
      fs.accessSync(basePath);
      fs.rmSync(basePath, { recursive: true });
      Log.log(`Delete directory ${basePath} successfully...`);
    } catch {

    } finally {
      fs.mkdirSync(basePath);
      Log.log(`Create directory ${basePath} successfully...`);
    }
  }

  static createFileSync(filePath: string, data: string) {
    const createDir = (p: string) => {
      try {
        fs.accessSync(p);
      } catch {
        const parentPath = path.dirname(p);
        createDir(parentPath);
        fs.mkdirSync(p);
      }
    };
    const basePath = path.resolve(process.cwd(), filePath);
    const dirPath = path.dirname(basePath);
    createDir(dirPath);
    fs.writeFileSync(basePath, data, 'utf-8');
  }

  static readFileSync(filePath: string) {
    try {
      return fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
    } catch {
      return "";
    }
  }

  private static copyAssets() {
    const assetsPath = path.resolve(process.cwd(), ASSETS_PATH);
    const outputPath = path.resolve(process.cwd(), ASSETS_OUT_DIR);
    fs.cp(assetsPath, outputPath, { recursive: true }, (err) => {
      if (!err) {
        Log.log('Copy assets successfully.');
      }
    });
  }
}

export default FileHelper;