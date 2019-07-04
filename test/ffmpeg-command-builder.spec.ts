import FFmpegCommandBuilder from '../lib/ffmpeg-command-builder';

describe('FFmpegCommandBuilder', () => {
  it('baseInput output build', () => {
    const ffmpegCommandBuilder = new FFmpegCommandBuilder();
    const command = ffmpegCommandBuilder
      .baseInput('./sample.mp4')
      .output('./sample.mov')
      .build();
    expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y ./sample.mov');
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
        expect(command).toBe('ffmpeg -i ./sample.mp4 -i sample.mp4 -loglevel warning -y -filter_complex "concat=n=2:v=1:a=1" ./sample.mov');
      });

      it('concat multi', () => {
        const command = ffmpegCommandBuilder.concat(['sample.mp4', 'sample.mp4']).build();
        expect(command).toBe(
          'ffmpeg -i ./sample.mp4 -i sample.mp4 -i sample.mp4 -loglevel warning -y -filter_complex "concat=n=3:v=1:a=1" ./sample.mov',
        );
      });

      it('video audio mute', () => {
        const command = ffmpegCommandBuilder.concat('sample.mp4', false, false).build();
        expect(command).toBe('ffmpeg -i ./sample.mp4 -i sample.mp4 -loglevel warning -y -filter_complex "concat=n=2:v=0:a=0" ./sample.mov');
      });
    });

    describe('overlay', () => {});

    it('inputfps', () => {
      const command = ffmpegCommandBuilder.inputfps(30).build();
      expect(command).toBe('ffmpeg -r 30 -i ./sample.mp4 -loglevel warning -y ./sample.mov');
    });

    it('outputfps', () => {
      const command = ffmpegCommandBuilder.outputfps(30).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -r 30 ./sample.mov');
    });

    it('inputBitrate', () => {
      const command = ffmpegCommandBuilder.inputBitrate(30000).build();
      expect(command).toBe('ffmpeg -b 30000 -i ./sample.mp4 -loglevel warning -y ./sample.mov');
    });

    it('outputBitrate', () => {
      const command = ffmpegCommandBuilder.outputBitrate(30000).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -b 30000 ./sample.mov');
    });

    it('inputVideoCodec', () => {
      const command = ffmpegCommandBuilder.inputVideoCodec('libx264').build();
      expect(command).toBe('ffmpeg -vcodec libx264 -i ./sample.mp4 -loglevel warning -y ./sample.mov');
    });

    it('outputVideoCodec', () => {
      const command = ffmpegCommandBuilder.outputVideoCodec('libx264').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -vcodec libx264 ./sample.mov');
    });

    it('inputPixelFormat', () => {
      const command = ffmpegCommandBuilder.inputPixelFormat('yuv420p').build();
      expect(command).toBe('ffmpeg -pix_fmt yuv420p -i ./sample.mp4 -loglevel warning -y ./sample.mov');
    });

    it('outputPixelFormat', () => {
      const command = ffmpegCommandBuilder.outputPixelFormat('yuv420p').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -pix_fmt yuv420p ./sample.mov');
    });

    it('crop', () => {
      const command = ffmpegCommandBuilder.crop(100, 100, 200, 200).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -vf "crop=200:200:100:100" ./sample.mov');
    });

    it('cropCommand', () => {
      const command = ffmpegCommandBuilder.cropCommand('150:150:300:300').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -vf "crop=150:150:300:300" ./sample.mov');
    });

    it('scale', () => {
      const command = ffmpegCommandBuilder.scale(1.4, 1.5).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -vf "scale=1.4:1.5" ./sample.mov');
    });

    it('scaleCommand', () => {
      const command = ffmpegCommandBuilder.scaleCommand('1.5:1.4').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -vf "scale=1.5:1.4" ./sample.mov');
    });

    it('padding', () => {
      const command = ffmpegCommandBuilder.padding(100, 200, 300, 400).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -vf "pad=300:400:100:200" ./sample.mov');
    });

    it('paddingCommand', () => {
      const command = ffmpegCommandBuilder.paddingCommand('150:150:200:300').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -vf "pad=150:150:200:300" ./sample.mov');
    });

    it('setMovFlags', () => {
      const command = ffmpegCommandBuilder.setMovFlags('faststart').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -movflags faststart ./sample.mov');
    });

    it('alphaRendering', () => {
      const command = ffmpegCommandBuilder.alphaRendering('libvpx', 'rgba').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -auto-alt-ref 0 -vcodec libvpx -pix_fmt rgba ./sample.mov');
    });

    it('renderingQuality', () => {
      const command = ffmpegCommandBuilder.renderingQuality(4).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -crf 4 ./sample.mov');
    });

    it('inputStartSeeking', () => {
      const command = ffmpegCommandBuilder.inputStartSeeking(4).build();
      expect(command).toBe('ffmpeg -ss 4 -i ./sample.mp4 -loglevel warning -y ./sample.mov');
    });

    it('outputStartSeeking', () => {
      const command = ffmpegCommandBuilder.outputStartSeeking(1).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -ss 1 ./sample.mov');
    });

    it('seekTo', () => {
      const command = ffmpegCommandBuilder.seekTo(10).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -t 10 ./sample.mov');
    });

    it('setPreset', () => {
      const command = ffmpegCommandBuilder.setPreset('medium').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -preset medium ./sample.mov');
    });

    it('setTune', () => {
      const command = ffmpegCommandBuilder.setTune('animation').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -tune animation ./sample.mov');
    });

    it('renderSubtitleFromAss', () => {
      const command = ffmpegCommandBuilder.renderSubtitleFromAss('./sampleTelop.ass').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -vf "ass=./sampleTelop.ass" ./sample.mov');
    });

    it('renderSubtitleFromSrt', () => {
      const command = ffmpegCommandBuilder.renderSubtitleFromSrt('./sampleTelop.srt').build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -vf "subtitles=./sampleTelop.srt" ./sample.mov');
    });
  });

  describe('thumnail', () => {
    let ffmpegCommandBuilder: FFmpegCommandBuilder;

    beforeEach(() => {
      const basicFFmpegCommandBuilder = new FFmpegCommandBuilder();
      ffmpegCommandBuilder = basicFFmpegCommandBuilder.baseInput('./sample.mp4').output('./sample.jpg');
    });

    it('setupSelectCaptureThumbnail', () => {
      const command = ffmpegCommandBuilder.setupSelectCaptureThumbnail(100).build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -frames:v 1 -vf "thumbnail=100" ./sample.jpg');
    });

    it('setupCaptureThumbnail', () => {
      const command = ffmpegCommandBuilder.setupCaptureThumbnail().build();
      expect(command).toBe('ffmpeg -i ./sample.mp4 -loglevel warning -y -frames:v 1 ./sample.jpg');
    });
  });
});
