import {CommandGeneraterOptions} from './interfaces/command-generater-options'

export default abstract class CommandBuilder {
  protected commandGeneraterOptions: CommandGeneraterOptions;

  constructor() {
    this.clear();
  }


  ffmpegRootPath(path: string) {
    if (path.length <= 0) {
      return;
    } else if (path[path.length - 1] == '/') {
      this.commandGeneraterOptions.ffmpegBaseCommandPath = path;
    } else {
      this.commandGeneraterOptions.ffmpegBaseCommandPath = path + '/';
    }
    return this;
  }

  abstract build(): string;

  baseInput(inputPath: string){
    this.commandGeneraterOptions.inputFilePathes = [inputPath];
    return this;
  }

  clear(): void {
    this.commandGeneraterOptions = {
      outputCommandOptions: {
        loglevel: 'warning',
      },
      ffmpegBaseCommandPath: "",
      inputFilePathes: [],
      outputFilePath: '',
      inputCommandOptions: {},
      streamArgCommands: [],
      mapCommands: [],
      videoFilters: [],
    };
  }
}
