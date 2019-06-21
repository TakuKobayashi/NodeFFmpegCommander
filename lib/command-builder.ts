export default abstract class CommandBuilder {
  // When loglevel is set thewarning, below the warning level logs will not be output.
  protected outputCommandOptions: { [s: string]: string };
  protected ffmpegBaseCommandPath: string;
  protected inputFilePathes: string[];

  constructor() {
    this.outputCommandOptions = {
      loglevel: 'warning',
    };
    this.ffmpegBaseCommandPath = '';
    this.inputFilePathes = [];
  }

  abstract build(): string;

  abstract baseInput(inputPath: string);
}
