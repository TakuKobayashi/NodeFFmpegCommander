import CommandBuilder from './command-builder';

export default class FFprobeCommandBuilder extends CommandBuilder {
  constructor() {
    super();
    this.outputCommandOptions['show_streams'] = '';
    this.outputCommandOptions['print_format'] = 'json';
  }

  baseInput(inputPath): FFprobeCommandBuilder {
    this.inputFilePathes = [inputPath];
    return this;
  }

  build(): string {
    const commands = [this.ffmpegBaseCommandPath + 'ffprobe'];

    for(const inputPath of this.inputFilePathes){
      commands.push('-i');
      commands.push(inputPath);
    }

    for(const outputKey of Object.keys(this.outputCommandOptions)){
      commands.push('-' + outputKey);
      if(!this.outputCommandOptions[outputKey] || this.outputCommandOptions[outputKey].length <= 0){
        continue;
      }
      commands.push(this.outputCommandOptions[outputKey]);
    }
    return commands.join(' ');
  }
}
