import FFmpegCommandBuilder from '../lib/ffmpeg-command-builder';

describe('FFmpegCommandBuilder', () => {
  it('baseInput output build', () => {
    const ffmpegCommandBuilder = new FFmpegCommandBuilder();
    const command = ffmpegCommandBuilder
      .baseInput('./sample.mp4')
      .output('./sample.mov')
      .build();
    expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning ./sample.mov');
  });

  describe('basic add option command', () => {
    let ffmpegCommandBuilder: FFmpegCommandBuilder;

    beforeEach(() => {
      const basicFFmpegCommandBuilder = new FFmpegCommandBuilder();
      ffmpegCommandBuilder = basicFFmpegCommandBuilder.baseInput('./sample.mp4').output('./sample.mov');
    });

    describe('concat', () => {
      it('concat single', () => {
        const command = ffmpegCommandBuilder.concat('sample.mp4').build();
        expect(command).toBe('ffmpeg -i ./sample.mp4 -i sample.mp4 -loglevel warning -filter_complex "concat=n=2:v=1:a=1" ./sample.mov');
      });

      it('concat multi', () => {
        const command = ffmpegCommandBuilder.concat(['sample.mp4', 'sample.mp4']).build();
        expect(command).toBe(
          'ffmpeg -i ./sample.mp4 -i sample.mp4 -i sample.mp4 -loglevel warning -filter_complex "concat=n=3:v=1:a=1" ./sample.mov',
        );
      });
    });

    describe('overlay', () => {});

    it('inputfps', () => {
      const command = ffmpegCommandBuilder.inputfps(30).build();
      expect(command).toBe('ffmpeg -r 30 -i ./sample.mp4 -loglevel warning ./sample.mov');
    });

    it('outputfps', () => {
      const command = ffmpegCommandBuilder.outputfps(30).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -r 30 ./sample.mov');
    });

    it('inputBitrate', () => {
      const command = ffmpegCommandBuilder.inputBitrate(30000).build();
      expect(command).toBe('ffmpeg -b 30000 -i ./sample.mp4 -loglevel warning ./sample.mov');
    });

    it('outputBitrate', () => {
      const command = ffmpegCommandBuilder.outputBitrate(30000).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -b 30000 ./sample.mov');
    });

    it('inputVideoCodec', () => {
      const command = ffmpegCommandBuilder.inputVideoCodec('libx264').build();
      expect(command).toBe('ffmpeg -vcodec libx264 -i ./sample.mp4 -loglevel warning ./sample.mov');
    });

    it('outputVideoCodec', () => {
      const command = ffmpegCommandBuilder.outputVideoCodec('libx264').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -vcodec libx264 ./sample.mov');
    });

    it('inputPixelFormat', () => {
      const command = ffmpegCommandBuilder.inputPixelFormat('yuv420p').build();
      expect(command).toBe('ffmpeg -pix_fmt yuv420p -i ./sample.mp4 -loglevel warning ./sample.mov');
    });

    it('outputPixelFormat', () => {
      const command = ffmpegCommandBuilder.outputPixelFormat('yuv420p').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -pix_fmt yuv420p ./sample.mov');
    });

    it('crop', () => {
      const command = ffmpegCommandBuilder.crop(100, 100, 200, 200).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -vf "crop=200:200:100:100" ./sample.mov');
    });

    it('cropCommand', () => {
      const command = ffmpegCommandBuilder.outputPixelFormat('150:150:300:300').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -pix_fmt 150:150:300:300 ./sample.mov');
    });
  });
});
