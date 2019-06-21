import CommandBuilder from './command-builder';

export default class FFprobCommandBuilder extends CommandBuilder{
  constructor(){
    super()
    this.outputCommandOptions["show_streams"] = "";
    this.outputCommandOptions["print_format"] = "json";
  }

  baseInput(inputPath): FFprobCommandBuilder {
    this.inputFilePathes = [inputPath];
    return this;
  };

  build(): string {
    const commands = [this.ffmpegBaseCommandPath + "ffprob"];
    return commands.join(" ");
  };
}