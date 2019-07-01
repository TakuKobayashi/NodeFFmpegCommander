import { VideoSize, TelopElement, FFprobOutput } from './interfaces';
import FFmpegCommandBuilder from './ffmpeg-command-builder';
import FfprobeCommandBuilder from './ffprobe-command-builder';

const fs = require('fs');
const child_process = require('child_process');

export default class FFmpegCommander {
  static getMetaInfo(videoFilePath: string): FFprobOutput {
    const ffprobCommandBuilder = new FfprobeCommandBuilder();
    const result = this.runSync(ffprobCommandBuilder.baseInput(videoFilePath).build());
    return JSON.parse(result) as FFprobOutput;
  }

  static async asyncGetMetaInfo(videoFilePath: string): Promise<FFprobOutput> {
    const ffprobCommandBuilder = new FfprobeCommandBuilder();
    const result = await this.run(ffprobCommandBuilder.baseInput(videoFilePath).build());
    return JSON.parse(result) as FFprobOutput;
  }

  private static convertVideoSize(fprobOutput: FFprobOutput): VideoSize {
    const videoInfo = fprobOutput.streams.find(function(element) {
      return element.width && element.height;
    });
    const videoSize: VideoSize = {
      width: videoInfo.width,
      height: videoInfo.height,
      rotate: 0,
      actualWidth: 0,
      actualHeight: 0,
    };
    if (videoInfo.tags.rotate) {
      videoSize.rotate = parseInt(videoInfo.tags.rotate);
    }
    if (videoSize.rotate % 90 == 0 && videoSize.rotate % 180 != 0) {
      videoSize.actualWidth = videoSize.height;
      videoSize.actualHeight = videoSize.width;
    } else {
      videoSize.actualWidth = videoSize.width;
      videoSize.actualHeight = videoSize.height;
    }
    return videoSize;
  }

  static getVideoSize(videoFilePath: string): VideoSize {
    const fprobOutput = this.getMetaInfo(videoFilePath);
    return this.convertVideoSize(fprobOutput);
  }

  static async asyncGetVideoSize(videoFilePath: string): Promise<VideoSize> {
    const fprobOutput = await this.asyncGetMetaInfo(videoFilePath);
    return this.convertVideoSize(fprobOutput);
  }

  static captureThumbnail(videoFilePath: string, outputImageFilePath: string, frameNumber: number = 2): string {
    const ffmpegCommandBuilder = new FFmpegCommandBuilder();
    ffmpegCommandBuilder.baseInput(videoFilePath);
    ffmpegCommandBuilder.output(outputImageFilePath);
    ffmpegCommandBuilder.setupSelectCaptureThumbnail(frameNumber);
    return this.runSync(ffmpegCommandBuilder.build());
  }

  static async asyncCaptureThumbnail(videoFilePath: string, outputImageFilePath: string, frameNumber: number = 2): Promise<string> {
    const ffmpegCommandBuilder = new FFmpegCommandBuilder();
    ffmpegCommandBuilder.baseInput(videoFilePath);
    ffmpegCommandBuilder.output(outputImageFilePath);
    ffmpegCommandBuilder.setupSelectCaptureThumbnail(frameNumber);
    return this.run(ffmpegCommandBuilder.build());
  }

  static createTelopSrtFile(outputFilePath: string, ...telopElements: TelopElement[]): void {
    const resultTelopSrtStrings = [];
    for (let i = 0; i < telopElements.length; ++i) {
      const telopElement = telopElements[i];
      const srtStrings = [];
      srtStrings.push(i.toString());
      srtStrings.push(
        [this.convertFFmpegTime(telopElement.startMilliSecond), this.convertFFmpegTime(telopElement.endMilliSecond)].join(' --> '),
      );
      srtStrings.push(telopElement.word);
      resultTelopSrtStrings.push(srtStrings.join('\n'));
    }
    fs.writeFileSync(outputFilePath, resultTelopSrtStrings.join('\n\n'));
  }

  private static convertFFmpegTime(millisocond: number): string {
    const milli = millisocond % 1000;
    const seconds = Math.max((millisocond - milli) % 60000, 0);
    const minutes = Math.max((millisocond - seconds * 60000 - milli) % 3600000, 0);
    const hours = Math.max(millisocond - minutes * 3600000 - seconds * 60000 - milli, 0);
    const hms = [];
    if (hours.toString().length < 2) {
      hms.push(['0', hours.toString()].join(''));
    } else {
      hms.push(hours.toString());
    }
    if (minutes.toString().length < 2) {
      hms.push(['0', minutes.toString()].join(''));
    } else {
      hms.push(minutes.toString());
    }
    if (seconds.toString().length < 2) {
      hms.push(['0', seconds.toString()].join(''));
    } else {
      hms.push(seconds.toString());
    }
    return [hms.join(':'), minutes].join(',');
  }

  static covertFile(inputFilePath: string, outputFilePath: string): string {
    const ffmpegCommandBuilder = new FFmpegCommandBuilder();
    ffmpegCommandBuilder.baseInput(inputFilePath);
    ffmpegCommandBuilder.output(outputFilePath);
    return this.runSync(ffmpegCommandBuilder.build());
  }

  static asyncCovertFile(inputFilePath: string, outputFilePath: string): Promise<string> {
    const ffmpegCommandBuilder = new FFmpegCommandBuilder();
    ffmpegCommandBuilder.baseInput(inputFilePath);
    ffmpegCommandBuilder.output(outputFilePath);
    return this.run(ffmpegCommandBuilder.build());
  }

  static async run(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      child_process.exec(command, (error: Error, stdout: Buffer, stderr: Buffer) => {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          reject(stderr);
          return;
        }
        resolve(stdout.toString('utf8'));
      });
    });
  }

  static runSync(command: string): string {
    try {
      return child_process.execSync(command).toString('utf8');
    } catch (err) {
      throw err;
    }
  }
}
