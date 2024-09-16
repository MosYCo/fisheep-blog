import { IConfig } from '../types';
import * as process from 'node:process';
import path from 'path';
import fs from 'node:fs';
import Log from './log';

const DEFAULT_CONFIG: IConfig = {
  title: "Fisheep Sky",
  subTitle: "人生有梦，各自精彩",
  email: "moseternal@gmail.com",
  language: "CN",
  footerUrl: "https://github.com/MosYCo/fisheep-blog",
  footerTitle: "Fisheep",
  pageTemp: "default",
  enableComments: true
} as const;

class ConfigHelper {
  static getConfig() {
    const configPath = path.resolve(process.cwd(), 'config.json');
    if (!fs.existsSync(configPath)) {
      return DEFAULT_CONFIG;
    }
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      return {
        ...DEFAULT_CONFIG,
        ...JSON.parse(content)
      }
    } catch (error) {
      Log.log("Get config error, return default config...");
      return DEFAULT_CONFIG;
    }
  }
}

export default ConfigHelper;