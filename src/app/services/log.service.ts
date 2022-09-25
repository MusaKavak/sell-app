import { Injectable } from '@angular/core';
import { BaseDirectory, createDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { LogItem } from '../models/LogItem';

@Injectable({
  providedIn: 'any'
})
export class LogService {

  currentLogList: Array<LogItem> = [

  ]

  private async getLogsFromFile(): Promise<Array<LogItem>> {
    try {
      const string = await readTextFile("SellApp\\logs.txt", { dir: BaseDirectory.Document })
      return JSON.parse(string);
    } catch (err) {
      return [];
    }
  }

  async getLogs(): Promise<Array<LogItem>> {
    return await this.getLogsFromFile();
  }

  async addNewLog(log: LogItem) {
    const logs = await this.getLogs()

    logs.push(log);
    await this.writeLogsToFile(logs);
  }

  async writeLogsToFile(logs: Array<LogItem>) {
    const string = JSON.stringify(logs);
    try {
      await writeTextFile('SellApp\\logs.txt', string, { dir: BaseDirectory.Document, });

    } catch (error) {
      console.log(error);
      await createDir("SellApp", { dir: BaseDirectory.Document })
      this.writeLogsToFile(logs)
    }
  }
}
