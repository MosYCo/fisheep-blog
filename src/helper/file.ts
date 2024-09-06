import fs from "node:fs";
const OUTPUT_ROOT_DIR = "output" as const;

class FileHelper {
  static async clearOutputFile() {
    await this.clearDirFile("backup");
    await this.clearDirFile("pager");
    await this.clearDirFile("pages");
  }

  protected static clearDirFile(dir: string) {
    return new Promise<void>(resolve => {
      const dirPath = process.cwd() + `/${OUTPUT_ROOT_DIR}/${dir}`;
      console.log(dirPath);
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