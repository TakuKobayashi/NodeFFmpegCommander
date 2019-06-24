export interface CommandGeneraterOptions {
  outputCommandOptions: { [s: string]: string };
  ffmpegBaseCommandPath: string;
  inputFilePathes: string[];
  outputFilePath: string;
  inputCommandOptions: { [s: string]: string };
  streamArgCommands: string[];
  mapCommands: string[];
  videoFilters: string[];
}
