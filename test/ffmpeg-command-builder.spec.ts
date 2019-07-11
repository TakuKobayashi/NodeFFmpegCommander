import FFmpegCommandBuilder from '../lib/ffmpeg-command-builder';
import FFmpegCommander from '../lib/ffmpeg-commander';

jest.setTimeout(30000);

const path = require('path');
const fs = require('fs');

const outputDirectoryPath = path.join(__dirname, 'outputs');
const sampleVideoFilePath = path.join(__dirname, 'sample.mp4');
let exportFilePath: string;

beforeAll(() => {
  if (!fs.existsSync(outputDirectoryPath)) {
    fs.mkdirSync(outputDirectoryPath);
  }
});

afterAll(() => {
  const files = fs.readdirSync(outputDirectoryPath);
  for (const file of files) {
    fs.unlinkSync(path.join(outputDirectoryPath, file));
  }
});

describe('FFmpegCommandBuilder', () => {
  beforeEach(() => {
    exportFilePath = path.join(outputDirectoryPath, Math.random().toString(36).slice(-8) + '.mov');
  })

  it('baseInput output build', () => {
    const ffmpegCommandBuilder = new FFmpegCommandBuilder();
    const command = ffmpegCommandBuilder
      .baseInput(sampleVideoFilePath)
      .output(exportFilePath)
      .build();
    expect(command).toBe('ffmpeg -i ' + sampleVideoFilePath + ' -loglevel warning -y ' + exportFilePath);
    FFmpegCommander.runSync(command);
    expect(fs.existsSync(exportFilePath)).toBeTruthy();
  });

  describe('basic add option command', () => {
    let ffmpegCommandBuilder: FFmpegCommandBuilder;

    beforeEach(() => {
      const basicFFmpegCommandBuilder = new FFmpegCommandBuilder();
      ffmpegCommandBuilder = basicFFmpegCommandBuilder.baseInput(sampleVideoFilePath).output(exportFilePath);
    });

    describe('concat', () => {
      it('concat single', () => {
        const command = ffmpegCommandBuilder.concat(sampleVideoFilePath).build();
        expect(command).toBe('ffmpeg -i ' + sampleVideoFilePath + ' -i ' + sampleVideoFilePath + ' -loglevel warning -y -filter_complex "concat=n=2:v=1:a=1" ' + exportFilePath);
      });

      it('concat multi', () => {
        const command = ffmpegCommandBuilder.concat([sampleVideoFilePath, sampleVideoFilePath]).build();
        expect(command).toBe(
          'ffmpeg -i ' + sampleVideoFilePath + ' -i '+ sampleVideoFilePath +' -i '+ sampleVideoFilePath +' -loglevel warning -y -filter_complex "concat=n=3:v=1:a=1" ' + exportFilePath,
        );
      });

      it('video audio mute', () => {
        const command = ffmpegCommandBuilder.concat(sampleVideoFilePath, false, false).build();
        expect(command).toBe('ffmpeg -i ' + sampleVideoFilePath + ' -i '+ sampleVideoFilePath +' -loglevel warning -y -filter_complex "concat=n=2:v=0:a=0" ' + exportFilePath);
      });
    });

    describe('overlay', () => {});

    it('inputfps', () => {
      const command = ffmpegCommandBuilder.inputfps(30).build();
      expect(command).toBe('ffmpeg -r 30 -i '+ sampleVideoFilePath +' -loglevel warning -y ' + exportFilePath);
    });

    it('outputfps', () => {
      const command = ffmpegCommandBuilder.outputfps(30).build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -r 30 '  + exportFilePath);
    });

    it('inputBitrate', () => {
      const command = ffmpegCommandBuilder.inputBitrate(30000).build();
      expect(command).toBe('ffmpeg -b 30000 -i '+ sampleVideoFilePath +' -loglevel warning -y ' + exportFilePath);
    });

    it('outputBitrate', () => {
      const command = ffmpegCommandBuilder.outputBitrate(30000).build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -b 30000 ' + exportFilePath);
    });

    it('inputVideoCodec', () => {
      const command = ffmpegCommandBuilder.inputVideoCodec('libx264').build();
      expect(command).toBe('ffmpeg -vcodec libx264 -i '+ sampleVideoFilePath +' -loglevel warning -y ' + exportFilePath);
    });

    it('outputVideoCodec', () => {
      const command = ffmpegCommandBuilder.outputVideoCodec('libx264').build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -vcodec libx264 ' + exportFilePath);
    });

    it('inputPixelFormat', () => {
      const command = ffmpegCommandBuilder.inputPixelFormat('yuv420p').build();
      expect(command).toBe('ffmpeg -pix_fmt yuv420p -i '+ sampleVideoFilePath +' -loglevel warning -y ' + exportFilePath);
    });

    it('outputPixelFormat', () => {
      const command = ffmpegCommandBuilder.outputPixelFormat('yuv420p').build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -pix_fmt yuv420p ' + exportFilePath);
    });

    it('crop', () => {
      const command = ffmpegCommandBuilder.crop(100, 100, 200, 200).build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -vf "crop=200:200:100:100" ' + exportFilePath);
    });

    it('cropCommand', () => {
      const command = ffmpegCommandBuilder.cropCommand('150:150:300:300').build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -vf "crop=150:150:300:300" ' + exportFilePath);
    });

    it('scale', () => {
      const command = ffmpegCommandBuilder.scale(1.4, 1.5).build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -vf "scale=1.4:1.5" ' + exportFilePath);
    });

    it('scaleCommand', () => {
      const command = ffmpegCommandBuilder.scaleCommand('1.5:1.4').build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -vf "scale=1.5:1.4" ' + exportFilePath);
    });

    it('padding', () => {
      const command = ffmpegCommandBuilder.padding(100, 200, 300, 400).build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -vf "pad=300:400:100:200" ' + exportFilePath);
    });

    it('paddingCommand', () => {
      const command = ffmpegCommandBuilder.paddingCommand('150:150:200:300').build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -vf "pad=150:150:200:300" ' + exportFilePath);
    });

    it('setMovFlags', () => {
      const command = ffmpegCommandBuilder.setMovFlags('faststart').build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -movflags faststart ' + exportFilePath);
    });

    it('alphaRendering', () => {
      const command = ffmpegCommandBuilder.alphaRendering('libvpx', 'rgba').build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -auto-alt-ref 0 -vcodec libvpx -pix_fmt rgba ' + exportFilePath);
    });

    it('renderingQuality', () => {
      const command = ffmpegCommandBuilder.renderingQuality(4).build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -crf 4 ' + exportFilePath);
    });

    it('inputStartSeeking', () => {
      const command = ffmpegCommandBuilder.inputStartSeeking(4).build();
      expect(command).toBe('ffmpeg -ss 4 -i '+ sampleVideoFilePath +' -loglevel warning -y ' + exportFilePath);
    });

    it('outputStartSeeking', () => {
      const command = ffmpegCommandBuilder.outputStartSeeking(1).build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -ss 1 ' + exportFilePath);
    });

    it('seekTo', () => {
      const command = ffmpegCommandBuilder.seekTo(10).build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -t 10 ' + exportFilePath);
    });

    it('setPreset', () => {
      const command = ffmpegCommandBuilder.setPreset('medium').build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -preset medium ' + exportFilePath);
    });

    it('setTune', () => {
      const command = ffmpegCommandBuilder.setTune('animation').build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -tune animation ' + exportFilePath);
    });

    it('renderSubtitleFromAss', () => {
      const convertBaseFilePath = path.join(outputDirectoryPath, 'sampleTelop.srt');
      const terop1 = {
        startMilliSecond: 1000,
        endMilliSecond: 2000,
        word: 'terop1Test',
      };
      const terop2 = {
        startMilliSecond: 3000,
        endMilliSecond: 3540,
        word: 'terop2Test',
      };
      FFmpegCommander.createTelopSrtFile(convertBaseFilePath, terop1, terop2);

      const assExportFilePath = path.join(outputDirectoryPath, 'sampleASSTelop.ass');
      FFmpegCommander.covertFile(convertBaseFilePath, assExportFilePath);

      const command = ffmpegCommandBuilder.renderSubtitleFromAss(assExportFilePath).build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -vf "ass=' + assExportFilePath+ '" ' + exportFilePath);
    });

    it('renderSubtitleFromSrt', () => {
      const convertBaseFilePath = path.join(outputDirectoryPath, 'sampleTelop.srt');
      const terop1 = {
        startMilliSecond: 1000,
        endMilliSecond: 2000,
        word: 'terop1Test',
      };
      const terop2 = {
        startMilliSecond: 3000,
        endMilliSecond: 3540,
        word: 'terop2Test',
      };
      FFmpegCommander.createTelopSrtFile(convertBaseFilePath, terop1, terop2);

      const command = ffmpegCommandBuilder.renderSubtitleFromSrt(convertBaseFilePath).build();
      expect(command).toBe('ffmpeg -i '+ sampleVideoFilePath +' -loglevel warning -y -vf "subtitles='+convertBaseFilePath+'" '  + exportFilePath);
    });
  });

  describe('thumnail', () => {
    let ffmpegCommandBuilder: FFmpegCommandBuilder;
    beforeEach(() => {
      exportFilePath = path.join(outputDirectoryPath, Math.random().toString(36).slice(-8) + '.jpg');
    })

    beforeEach(() => {
      const basicFFmpegCommandBuilder = new FFmpegCommandBuilder();
      ffmpegCommandBuilder = basicFFmpegCommandBuilder.baseInput(sampleVideoFilePath).output(exportFilePath);
    });

    it('setupSelectCaptureThumbnail', () => {
      const command = ffmpegCommandBuilder.setupSelectCaptureThumbnail(100).build();
      expect(command).toBe('ffmpeg -i '+sampleVideoFilePath+' -loglevel warning -y -frames:v 1 -vf "thumbnail=100" ' + exportFilePath);
    });

    it('setupCaptureThumbnail', () => {
      const command = ffmpegCommandBuilder.setupCaptureThumbnail().build();
      expect(command).toBe('ffmpeg -i '+sampleVideoFilePath+' -loglevel warning -y -frames:v 1 ' + exportFilePath);
    });
  });
});
