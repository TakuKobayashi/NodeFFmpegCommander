import { VideoSize } from './interfaces/video-size';
import { FFprobOutput, MediaMetaData } from './interfaces/ffprob-output-fromat';
import FFmpegCommandBuilder from './ffmpeg-command-builder';
import FFprobCommandBuilder from './ffprob-command-builder';

const child_process = require('child_process');

export default class FFMpegCommander {
  static getMetaInfo(videoFilePath: string): FFprobOutput {
    const ffprobCommandBuilder = new FFprobCommandBuilder();
    const result = this.runSync(ffprobCommandBuilder.baseInput(videoFilePath).build());
    return JSON.parse(result) as FFprobOutput;
  }

  static getVideoSize(videoFilePath: string): VideoSize {
    const jsonObject = this.getMetaInfo(videoFilePath);
    const videoInfo = jsonObject.streams.find(function(element) {
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

  static captureThumbnail(videoFilePath: string, frameNumber: number = 1): string {
    const ffmpegCommandBuilder = new FFmpegCommandBuilder();
    ffmpegCommandBuilder.baseInput(videoFilePath);
    ffmpegCommandBuilder.setupSelectCaptureThumbnail(frameNumber);
    return this.runSync(ffmpegCommandBuilder.baseInput(videoFilePath).build());
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
