import fs from "node:fs";
import * as process from "node:process";
import {
  ROOT_DIR,
  BACKUP_PATH,
  ASSETS_PATH,
  ASSETS_OUT_DIR
} from '../config/path-config';
import path from "path";
import Log from "./log";

class FileHelper {
  static async clearOutputFile() {
    await this.createDir(ROOT_DIR);
    await this.createDir(BACKUP_PATH);
    await this.createDir(`/${ROOT_DIR}/pages`);
    this.copyAssets();
  }

  protected static createDir(dir: string) {
    return new Promise<void>(resolve => {
      const dirPath = process.cwd() + `${dir.startsWith('/') ? dir : '/' + dir}`;
      fs.access(dirPath, (err) => {
        Log.log("===========================================");
        if (err) {
          fs.mkdirSync(dirPath);
          Log.log("The directory does not exist, create it...");
        } else {
          Log.log("The directory already exists, start clearing files...");
          const files = fs.readdirSync(dirPath);
          for (let file of files) {
            const filePath = `${dirPath}/${file}`;
            if (!fs.lstatSync(filePath).isDirectory()) {
              fs.unlinkSync(filePath);
              Log.log("Deleting files:", filePath);
            }

          }
          Log.log("Deleting files successfully...")
        }
        resolve();
      });
    })
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