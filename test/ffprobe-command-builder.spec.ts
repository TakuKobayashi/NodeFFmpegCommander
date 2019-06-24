import FFprobeCommandBuilder from '../lib/ffprobe-command-builder';

describe('FFprobeCommandBuilder', () => {
  it('baseInput build', () => {
    const ffprobCommandBuilder = new FFprobeCommandBuilder();
    const command = ffprobCommandBuilder.baseInput('./sample.mp4').build();
    expect(command).toBe('ffprobe -i ./sample.mp4 -loglevel warning -show_streams -print_format json');
  });
});
