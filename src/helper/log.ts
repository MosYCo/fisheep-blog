import * as process from "node:process";
import dayjs from "dayjs";

class Log {

  static log(...args: any[]) {
    if (process.env.NODE_ENV === 'dev') {
      const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
      console.log(`[${date}] `, ...args);
    }
  }
}

export default Log;