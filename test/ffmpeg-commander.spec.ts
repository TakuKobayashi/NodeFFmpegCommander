import FFmpegCommander from '../lib/ffmpeg-commander';
import { TelopElement } from '../lib/interfaces';

jest.setTimeout(30000);

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
        const exportFilePath = path.join(outputDirectoryPath, 'PNGthumbnail1.png');
        FFmpegCommander.captureThumbnail(sampleVideoFilePath, exportFilePath);
        expect(fs.existsSync(exportFilePath)).toBeTruthy();
      });

      it('asyncCaptureThumbnail', async () => {
        const exportFilePath = path.join(outputDirectoryPath, 'asyncPNGThumbnail2.png');
        await FFmpegCommander.asyncCaptureThumbnail(sampleVideoFilePath, exportFilePath);
        expect(fs.existsSync(exportFilePath)).toBeTruthy();
      });
    });

    describe('jpg', () => {
      it('captureThumbnail', () => {
        const exportFilePath = path.join(outputDirectoryPath, 'JPGthumbnail1.jpg');
        FFmpegCommander.captureThumbnail(sampleVideoFilePath, exportFilePath);
        expect(fs.existsSync(exportFilePath)).toBeTruthy();
      });

      it('asyncCaptureTumbnail',async () => {
        const exportFilePath = path.join(outputDirectoryPath, 'asyncJPGThumbnail2.jpg');
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
    it('mp4 to wav', () => {
      const exportFilePath = path.join(outputDirectoryPath, 'exportSound.wav');
      FFmpegCommander.covertFile(sampleVideoFilePath, exportFilePath);
      expect(fs.existsSync(exportFilePath)).toBeTruthy();
    });

    it('mp4 to mov', () => {
      const exportFilePath = path.join(outputDirectoryPath, 'convertEncode.mov');
      FFmpegCommander.covertFile(sampleVideoFilePath, exportFilePath);
      expect(fs.existsSync(exportFilePath)).toBeTruthy();
    });

    it('mp4 to gif', () => {
      const exportFilePath = path.join(outputDirectoryPath, 'convertAnimationGif.gif');
      FFmpegCommander.covertFile(sampleVideoFilePath, exportFilePath);
      expect(fs.existsSync(exportFilePath)).toBeTruthy();
    });

    it('srt to ass', () => {
      const convertBaseFilePath = path.join(outputDirectoryPath, 'convertBase.srt');
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

      const exportFilePath = path.join(outputDirectoryPath, 'convertBase.ass');
      FFmpegCommander.covertFile(convertBaseFilePath, exportFilePath);
      expect(fs.existsSync(exportFilePath)).toBeTruthy();
    });
  });

  describe('asyncCovertFile', () => {
    it('mp4 to wav', async () => {
      const exportFilePath = path.join(outputDirectoryPath, 'asyncExportSound.wav');
      await FFmpegCommander.asyncCovertFile(sampleVideoFilePath, exportFilePath);
      expect(fs.existsSync(exportFilePath)).toBeTruthy();
    });

    it('mp4 to mov', async () => {
      const exportFilePath = path.join(outputDirectoryPath, 'asyncConvertEncode.mov');
      await FFmpegCommander.asyncCovertFile(sampleVideoFilePath, exportFilePath);
      expect(fs.existsSync(exportFilePath)).toBeTruthy();
    });

    it('mp4 to gif', async() => {
      const exportFilePath = path.join(outputDirectoryPath, 'asyncConvertAnimationGif.gif');
      await FFmpegCommander.asyncCovertFile(sampleVideoFilePath, exportFilePath);
      expect(fs.existsSync(exportFilePath)).toBeTruthy();
    });

    it('srt to ass', async () => {
      const convertBaseFilePath = path.join(outputDirectoryPath, 'asyncConvertBase.srt');
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

      const exportFilePath = path.join(outputDirectoryPath, 'asyncConvertBase.ass');
      await FFmpegCommander.asyncCovertFile(convertBaseFilePath, exportFilePath);
      expect(fs.existsSync(exportFilePath)).toBeTruthy();
    });
  });
});
