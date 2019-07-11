import CommandBuilder from './command-builder';
const path = require('path');

export default class FFprobeCommandBuilder extends CommandBuilder {
  constructor() {
    super();
    this.commandGeneraterOptions.outputCommandOptions['show_streams'] = '';
    this.commandGeneraterOptions.outputCommandOptions['print_format'] = 'json';
  }

  build(): string {
    const commands = [];
    if(this.commandGeneraterOptions.ffmpegBaseCommandPath && this.commandGeneraterOptions.ffmpegBaseCommandPath.length > 0){
      commands.push(path.join(path.resolve(this.commandGeneraterOptions.ffmpegBaseCommandPath), 'ffprobe'))
    }else{
      commands.push('ffprobe')
    }

    for (const inputPath of this.commandGeneraterOptions.inputFilePathes) {
      commands.push('-i');
      commands.push(inputPath);
    }

    for (const outputKey of Object.keys(this.commandGeneraterOptions.outputCommandOptions)) {
      commands.push('-' + outputKey);
      if (
        !this.commandGeneraterOptions.outputCommandOptions[outputKey] ||
        this.commandGeneraterOptions.outputCommandOptions[outputKey].length <= 0
      ) {
        continue;
      }
      commands.push(this.commandGeneraterOptions.outputCommandOptions[outputKey]);
    }
    return commands.join(' ');
  }
}
