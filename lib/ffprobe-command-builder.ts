import CommandBuilder from './command-builder';

export default class FFprobeCommandBuilder extends CommandBuilder {
  constructor() {
    super();
    this.commandGeneraterOptions.outputCommandOptions['show_streams'] = '';
    this.commandGeneraterOptions.outputCommandOptions['print_format'] = 'json';
  }

  build(): string {
    const commands = [this.commandGeneraterOptions.ffmpegBaseCommandPath + 'ffprobe'];

    for(const inputPath of this.commandGeneraterOptions.inputFilePathes){
      commands.push('-i');
      commands.push(inputPath);
    }

    for(const outputKey of Object.keys(this.commandGeneraterOptions.outputCommandOptions)){
      commands.push('-' + outputKey);
      if(!this.commandGeneraterOptions.outputCommandOptions[outputKey] || this.commandGeneraterOptions.outputCommandOptions[outputKey].length <= 0){
        continue;
      }
      commands.push(this.commandGeneraterOptions.outputCommandOptions[outputKey]);
    }
    return commands.join(' ');
  }
}
