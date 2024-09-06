import fs from "node:fs";
import * as process from "node:process";
const OUTPUT_ROOT_DIR = "output" as const;

class FileHelper {
  static async clearOutputFile() {
    await this.createRootDir();
    await this.clearDirFile("backup");
    await this.clearDirFile("pager");
    await this.clearDirFile("pages");
  }

  protected static createRootDir() {
    const rootDir = process.cwd() + `/${OUTPUT_ROOT_DIR}`;
    return new Promise<void>(resolve => {
      fs.access(rootDir, (err) => {
        if (err) {
          console.log("The output root directory does not exist, create it...");
          fs.mkdirSync(rootDir);
        }
        resolve();
      })
    })
  }

  protected static clearDirFile(dir: string) {
    return new Promise<void>(resolve => {
      const dirPath = process.cwd() + `/${OUTPUT_ROOT_DIR}/${dir}`;
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
        console.log("===========================================");
        resolve();
      });
    })
  }
}

export default FileHelper;