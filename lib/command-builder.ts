import {CommandGeneraterOptions} from './interfaces/command-generater-options'

export default abstract class CommandBuilder {
  protected commandGeneraterOptions: CommandGeneraterOptions;

  constructor() {
    this.clear();
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
