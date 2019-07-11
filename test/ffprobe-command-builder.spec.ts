import FFmpegCommander from '../lib/ffmpeg-commander';

import FFprobeCommandBuilder from '../lib/ffprobe-command-builder';

jest.setTimeout(30000);

const path = require('path');

const sampleVideoFilePath = path.join(__dirname, 'sample.mp4');

describe('FFprobeCommandBuilder', () => {
  it('baseInput build', () => {
    const ffprobCommandBuilder = new FFprobeCommandBuilder();
    const command = ffprobCommandBuilder.baseInput(sampleVideoFilePath).build();
    expect(command).toBe('ffprobe -i ' + sampleVideoFilePath + ' -loglevel warning -show_streams -print_format json');
    expect(FFmpegCommander.runSync(command)).toBeTruthy();
  });
});
