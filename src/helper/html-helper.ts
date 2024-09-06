import {minify} from "html-minifier";

/**
 * HTML Helper
 */
class HtmlHelper {
  static miniHtml(htmlStr: string) {
    return minify(htmlStr, {
      //  去除空格
      collapseWhitespace: true,
      // 最小化CSS
      minifyCSS: true
    });
  }
}

export default HtmlHelper;