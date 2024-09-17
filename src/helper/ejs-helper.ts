import path from 'path';
import ejs from 'ejs';
import fs from 'fs';
import * as process from 'node:process';
import Log from './log';
import { FileHelper } from './index';

/**
 * EJS Helper
 *
 * @class Helper
 */
class Helper {
  /**
   * EJS Helper唯一实例
   *
   * @private
   * @static
   * @type {Helper}
   * @memberof Helper
   */
  private static instance: Helper;

  /**
   * 模板基础路径
   *
   * @private
   * @memberof Helper
   */
  private rootPath = path.resolve(process.cwd(), 'src/template');

  /**
   * 输出基础路径
   *
   * @private
   * @memberof Helper
   */
  private readonly outPutPath = path.resolve(process.cwd(), "docs");

  /**
   * 获取唯一实例
   *
   * @static
   * @return {Helper} 
   * @memberof Helper
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new Helper();
    }
    return this.instance;
  }

  /**
   * Creates an instance of Helper.
   * @memberof Helper
   */
  private constructor() {
    //  私有化构造器
  }

  /**
   * 设置模板
   *
   * @param {string} template
   * @memberof Helper
   */
  setTemplate(template: string) {
    const p = path.resolve(this.rootPath, template)
    if (!fs.readdirSync(p)) {
      throw new TypeError("Template not find.");
    }
    this.rootPath = p;
  }

  createFile() {

  }

  /**
   * 生成文件
   *
   * @param {string} templateName 模板名称
   * @param {*} data 数据
   * @param {string} outputPath 输出路径
   * @memberof Helper
   */
  generate(templateName: string, data: any, outputPath: string) {
    const filename = path.resolve(this.rootPath, templateName);
    const template = fs.readFileSync(filename, 'utf-8');
    const htmlStr = ejs.render(template, data, {
      filename
    });
    const outputFile = path.resolve(process.cwd(), this.outPutPath, outputPath);
    FileHelper.createFileSync(outputFile, htmlStr);
    Log.log(`Generate HTML file ${outputPath} successfully`);
  }
}

const EjsHelper = Helper.getInstance();

export default EjsHelper;