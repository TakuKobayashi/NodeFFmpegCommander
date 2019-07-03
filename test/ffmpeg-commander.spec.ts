import FFmpegCommander from '../lib/ffmpeg-commander';
import { TelopElement } from '../lib/interfaces';

const path = require('path');
const fs = require('fs');

const outputDirectoryPath = path.join(__dirname, 'outputs');
const sampleVideoFilePath = path.join(__dirname, 'sample.mp4');

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

describe('FFmpegCommander', () => {
  it('getMetaInfo', () => {
    const metaInfo = FFmpegCommander.getMetaInfo(sampleVideoFilePath);
    expect(metaInfo.streams.length).toBeGreaterThan(0);
  });

  it('asyncGetMetaInfo', async () => {
    const metaInfo = await FFmpegCommander.asyncGetMetaInfo(sampleVideoFilePath);
    expect(metaInfo.streams.length).toBeGreaterThan(0);
  });

  it('getVideoSize', () => {
    const videoSize = FFmpegCommander.getVideoSize(sampleVideoFilePath);
    expect(videoSize.width).toBeGreaterThan(0);
    expect(videoSize.height).toBeGreaterThan(0);
  });

  it('asyncGetVideoSize', async () => {
    const videoSize = await FFmpegCommander.asyncGetVideoSize(sampleVideoFilePath);
    expect(videoSize.width).toBeGreaterThan(0);
    expect(videoSize.height).toBeGreaterThan(0);
  });

  describe('captureThumbnail', () => {
    describe('png', () => {
      it('captureThumbnail', () => {
        const exportFilePath = path.join(outputDirectoryPath, 'thumbnail1.png');
        FFmpegCommander.captureThumbnail(sampleVideoFilePath, exportFilePath);
        expect(fs.existsSync(exportFilePath)).toBeTruthy();
      });

      it('asyncCaptureThumbnail', async () => {
        const exportFilePath = path.join(outputDirectoryPath, 'thumbnail2.png');
        await FFmpegCommander.captureThumbnail(sampleVideoFilePath, exportFilePath);
        expect(fs.existsSync(exportFilePath)).toBeTruthy();
      });
    });

    describe('jpg', () => {
      it('captureThumbnail', () => {
        const exportFilePath = path.join(outputDirectoryPath, 'thumbnail1.jpg');
        FFmpegCommander.captureThumbnail(sampleVideoFilePath, exportFilePath);
        expect(fs.existsSync(exportFilePath)).toBeTruthy();
      });

      it('asyncCaptureThumbnail', async () => {
        const exportFilePath = path.join(outputDirectoryPath, 'thumbnail2.jpg');
        await FFmpegCommander.asyncCaptureThumbnail(sampleVideoFilePath, exportFilePath);
        expect(fs.existsSync(exportFilePath)).toBeTruthy();
      });
    });
  });

  it('createTelopSrtFile', () => {
    const exportFilePath = path.join(outputDirectoryPath, 'telop.srt');
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
    FFmpegCommander.createTelopSrtFile(exportFilePath, terop1, terop2);
    expect(fs.existsSync(exportFilePath)).toBeTruthy();
    expect(fs.readFileSync(exportFilePath).toString('utf8')).toBe(
      [
        ['0', '00:00:01,000 --> 00:00:02,000', 'terop1Test'].join('\n'),
        ['1', '00:00:03,000 --> 00:00:03,540', 'terop2Test'].join('\n'),
      ].join('\n\n'),
    );
  });

  describe('covertFile', () => {
    it('mp4 to wav', () => {});

    it('mp4 to mov', () => {});

    it('mp4 to gif', () => {});

    it('srt to ass', () => {});
  });

  describe('asyncCovertFile', () => {
    it('mp4 to wav', () => {});

    it('mp4 to mov', () => {});

    it('mp4 to gif', () => {});

    it('srt to ass', () => {});
  });
});
