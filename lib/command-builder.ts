import { CommandGeneraterOptions } from './interfaces/command-generater-options';
const path = require('path');

export default abstract class CommandBuilder {
  protected commandGeneraterOptions: CommandGeneraterOptions;

  constructor() {
    this.clear();
  }

  ffmpegRootPath(rootPath: string) {
    this.commandGeneraterOptions.ffmpegBaseCommandPath = path.resolve(rootPath);
    return this;
  }

  abstract build(): string;

  baseInput(inputPath: string) {
    this.commandGeneraterOptions.inputFilePathes = [path.resolve(inputPath)];
    return this;
  }

  clear(): void {
    this.commandGeneraterOptions = {
      outputCommandOptions: {
        loglevel: 'warning',
      },
      ffmpegBaseCommandPath: '',
      inputFilePathes: [],
      outputFilePath: '',
      inputCommandOptions: {},
      streamArgCommands: [],
      mapCommands: [],
      videoFilters: {},
    };
  }
}
