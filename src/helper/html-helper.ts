import {minify} from "html-minifier";
import * as process from "node:process";

/**
 * HTML Helper
 */
class HtmlHelper {
  static miniHtml(htmlStr: string) {
    return minify(htmlStr, {
      //  去除空格
      collapseWhitespace: process.env.NODE_ENV === 'dev',
      // 最小化CSS
      minifyCSS: true
    });
  }
}

export default HtmlHelper;