import fs from "node:fs";
import * as process from "node:process";
import {
  ROOT_DIR,
  BACKUP_PATH
} from '../config/path-config';

class FileHelper {
  static async clearOutputFile() {
    await this.createDir(ROOT_DIR);
    await this.createDir(BACKUP_PATH);
    await this.createDir(`/${ROOT_DIR}/pages`);
  }

  protected static createDir(dir: string) {
    return new Promise<void>(resolve => {
      const dirPath = process.cwd() + `${dir.startsWith('/') ? dir : '/' + dir}`;
      fs.access(dirPath, (err) => {
        console.log("===========================================");
        if (err) {
          fs.mkdirSync(dirPath);
          console.log("The directory does not exist, create it...");
        } else {
          console.log("The directory already exists, start clearing files...");
          const files = fs.readdirSync(dirPath);
          for (let file of files) {
            fs.unlinkSync(`${dirPath}/${file}`);
            console.log("Deleting files:", `${dirPath}/${file}`);
          }
          console.log("Deleting files successfully...")
        }
        resolve();
      });
    })
  }
}

export default FileHelper;