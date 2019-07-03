import CommandBuilder from './command-builder';

export default class FFmpegCommandBuilder extends CommandBuilder {
  constructor() {
    super();
    // overwrite option
    this.commandGeneraterOptions.outputCommandOptions['y'] = '';
  }

  updateInputCommandOptions(options: { [s: string]: string }): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions = { ...this.commandGeneraterOptions.inputCommandOptions, ...options };
    return this;
  }

  updateOutputCommandOptions(options: { [s: string]: string }): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions = { ...this.commandGeneraterOptions.outputCommandOptions, ...options };
    return this;
  }

  output(outputPath: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputFilePath = outputPath;
    return this;
  }

  // This command concat the videos
  concat(concatPathes: string | string[], enableVideo = true, enableAudio = true): FFmpegCommandBuilder {
    const videoFiles: string[] = Array.prototype.concat.apply([], [concatPathes]);
    for (const videoFile of videoFiles) {
      this.commandGeneraterOptions.inputFilePathes.push(videoFile);
    }
    const concatFilterComplexes = [['concat', 'n', this.commandGeneraterOptions.inputFilePathes.length].join('=')];
    if (enableVideo) {
      concatFilterComplexes.push(['v', '1'].join('='));
    } else {
      concatFilterComplexes.push(['v', '0'].join('='));
    }
    if (enableAudio) {
      concatFilterComplexes.push(['a', '1'].join('='));
    } else {
      concatFilterComplexes.push(['a', '0'].join('='));
    }
    this.commandGeneraterOptions.outputCommandOptions['filter_complex'] = ['"', concatFilterComplexes.join(':'), '"'].join('');
    return this;
  }

  // To composite the base movie overlay movies or images.(there are various commands)
  // If do not adjust PTS to the starting point of the movie, it seems to be the wrong starting point when composed the movie.
  overlay(overlayPath: string, startTime: string | number, endTime: string | number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputFilePathes.push(overlayPath);
    const insertNumber = this.commandGeneraterOptions.inputFilePathes.length - 1;
    const tmpPrefix = '[pts' + insertNumber.toString() + ']';
    const tmpOverlay = '[overlayout' + insertNumber.toString() + ']';
    let prevOverlay = '[overlayout' + (insertNumber - 1).toString() + ']';
    if (insertNumber - 1 <= 0) {
      prevOverlay = '[0:v]';
    }
    this.commandGeneraterOptions.streamArgCommands.push(
      '[' + insertNumber.toString() + ':v]setpts=PTS+' + startTime.toString() + '/TB' + tmpPrefix,
    );
    this.commandGeneraterOptions.streamArgCommands.push(
      prevOverlay + tmpPrefix + "overlay=enable='between(t," + startTime.toString() + ',' + endTime.toString() + ")'" + tmpOverlay,
    );
    // 0:a is set to make sound.
    this.commandGeneraterOptions.mapCommands = [tmpOverlay, '0:a'];
    this.commandGeneraterOptions.outputCommandOptions['filter_complex'] = [
      '"',
      this.commandGeneraterOptions.streamArgCommands.join(';'),
      '"',
    ].join('');
    return this;
  }

  inputfps(framePerSecond: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions['r'] = framePerSecond.toString();
    return this;
  }

  outputfps(framePerSecond: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['r'] = framePerSecond.toString();
    return this;
  }

  inputBitrate(bitrate: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions['b'] = bitrate.toString();
    return this;
  }

  outputBitrate(bitrate: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['b'] = bitrate.toString();
    return this;
  }

  inputVideoCodec(vcodec: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions['vcodec'] = vcodec;
    return this;
  }

  outputVideoCodec(vcodec: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['vcodec'] = vcodec;
    return this;
  }

  inputPixelFormat(pix_fmt: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  }

  outputPixelFormat(pix_fmt: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  }

  crop(x: number, y: number, width: number, height: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters['crop'] = [width, height, x, y].join(':');
    return this;
  }

  cropCommand(cropString: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters['crop'] = cropString;
    return this;
  }

  scale(width: number, height: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters['scale'] = [width, height].join(':');
    return this;
  }

  scaleCommand(scaleString: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters['scale'] = scaleString;
    return this;
  }

  padding(x: number, y: number, width: number, height: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters['pad'] = [width, height, x, y].join(':');
    return this;
  }

  paddingCommand(paddingString: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters['pad'] = paddingString;
    return this;
  }

  setMovFlags(movFlag: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['movflags'] = movFlag;
    return this;
  }

  setupSelectCaptureThumbnail(chooseFrameNumber: number = 100): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters['thumbnail'] = chooseFrameNumber.toString();
    return this.setupCaptureThumbnail();
  }

  setupCaptureThumbnail(): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['frames:v'] = '1';
    return this;
  }

  // [Reference] Example of command when transmitting Gif image:ffmpeg -i 500156_loop.gif -movflags faststart -auto-alt-ref 0 -c:v libvpx -b:v 4M -crf 4 -pix_fmt rgba -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" 500156_loop2.webm
  alphaRendering(codec: string = 'libvpx', pixelFormat: string = 'rgba'): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['auto-alt-ref'] = '0';
    this.outputVideoCodec(codec);
    this.outputPixelFormat(pixelFormat);
    return this;
  }

  // Setting the quality of the video
  // You can set 0 to 51 in the range.If you set the smaller value, the higher image quality will be, but the file size will be increased accordingly.
  renderingQuality(quality: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['crf'] = quality.toString();
    return this;
  }

  inputStartSeeking(startTime: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions['ss'] = startTime.toString();
    return this;
  }

  outputStartSeeking(startTime: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['ss'] = startTime.toString();
    return this;
  }

  seekTo(toTime: number): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['t'] = toTime.toString();
    return this;
  }

  // Can set preset name is [ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow, placebo]
  setPreset(presetName: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['preset'] = presetName.toString();
    return this;
  }

  // Can set tune name is [film, animation, grain, stillimage, fastdecode, zerolatency]
  setTune(tuneName: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['tune'] = tuneName.toString();
    return this;
  }

  renderSubtitleFromAss(assfilePath: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters['ass'] = assfilePath;
    return this;
  }

  renderSubtitleFromSrt(srtfilePath: string): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters['subtitles'] = srtfilePath;
    return this;
  }

  build(): string {
    const commands = [this.commandGeneraterOptions.ffmpegBaseCommandPath + 'ffmpeg'];
    var inputKeys = Object.keys(this.commandGeneraterOptions.inputCommandOptions);
    for (const inputKey of Object.keys(this.commandGeneraterOptions.inputCommandOptions)) {
      commands.push('-' + inputKey);
      commands.push(this.commandGeneraterOptions.inputCommandOptions[inputKey]);
    }

    for (const inputFilePath of this.commandGeneraterOptions.inputFilePathes) {
      commands.push('-i');
      commands.push(inputFilePath);
    }

    for (const outputKey of Object.keys(this.commandGeneraterOptions.outputCommandOptions)) {
      commands.push('-' + outputKey);
      if (
        !this.commandGeneraterOptions.outputCommandOptions[outputKey] ||
        this.commandGeneraterOptions.outputCommandOptions[outputKey].length <= 0
      ) {
        continue;
      }
      commands.push(this.commandGeneraterOptions.outputCommandOptions[outputKey]);
    }
    if (Object.keys(this.commandGeneraterOptions.videoFilters).length > 0) {
      commands.push('-vf');
      const flters = [];
      for (const videoFilterKey of Object.keys(this.commandGeneraterOptions.videoFilters)) {
        flters.push([videoFilterKey, this.commandGeneraterOptions.videoFilters[videoFilterKey]].join('='));
      }
      commands.push(['"', flters.join(','), '"'].join(''));
    }
    for (const mapCommand of this.commandGeneraterOptions.mapCommands) {
      commands.push('-map');
      commands.push(mapCommand);
    }
    if (this.commandGeneraterOptions.outputFilePath != null && this.commandGeneraterOptions.outputFilePath.length > 0) {
      commands.push(this.commandGeneraterOptions.outputFilePath);
    }

    return commands.join(' ');
  }

  clear() {
    super.clear();
    // overwrite option
    this.commandGeneraterOptions.outputCommandOptions['y'] = '';
  }
}
