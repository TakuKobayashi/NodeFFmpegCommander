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
});
