import CommandBuilder from './command-builder';

export default class FFMpegCommandBuilder extends CommandBuilder {
  private outputFilePath: string;
  private inputCommandOptions = {};
  private streamArgCommands = [];
  private mapCommands = [];
  private videoFilters: string[];

  constructor() {
    super();
    this.outputFilePath = '';
    this.inputCommandOptions = {};
    this.streamArgCommands = [];
    this.mapCommands = [];
    this.videoFilters = [];
  }

  setFfmpegPath(path): FFMpegCommandBuilder {
    if (path.length <= 0) {
      return;
    } else if (path[path.length - 1] == '/') {
      this.ffmpegBaseCommandPath = path;
    } else {
      this.ffmpegBaseCommandPath = path + '/';
    }
    return this;
  }

  updateInputCommandOptions(options = {}): FFMpegCommandBuilder {
    this.inputCommandOptions = Object.assign(this.inputCommandOptions, options);
    return this;
  }

  updateOutputCommandOptions(options = {}): FFMpegCommandBuilder {
    this.outputCommandOptions = Object.assign(this.outputCommandOptions, options);
    return this;
  }

  baseInput(inputPath): FFMpegCommandBuilder {
    this.inputFilePathes = [inputPath];
    return this;
  }

  output(outputPath): FFMpegCommandBuilder {
    this.outputFilePath = outputPath;
    return this;
  }

  // This command concat the videos
  concat(concatPath, enableVideo = true, enableAudio = true, options = {}): FFMpegCommandBuilder {
    var videoFiles = Array.prototype.concat.apply([], [concatPath]);
    for (var i = 0; i < videoFiles.length; ++i) {
      this.inputFilePathes.push(videoFiles[i]);
    }
    var concatFilterComplex = 'concat=n=' + this.inputFilePathes.length + ':';
    if (enableVideo) {
      concatFilterComplex = concatFilterComplex + 'v=1:';
    } else {
      concatFilterComplex = concatFilterComplex + 'v=0:';
    }
    if (enableAudio) {
      concatFilterComplex = concatFilterComplex + 'a=1';
    } else {
      concatFilterComplex = concatFilterComplex + 'a=0';
    }
    this.outputCommandOptions['filter_complex'] = '"' + concatFilterComplex + '"';
    return this;
  }

  // To composite the base movie overlay movies or images.(there are various commands)
  // If do not adjust PTS to the starting point of the movie, it seems to be the wrong starting point when composed the movie.
  overlay(overlayPath, overlayOption, options = {}): FFMpegCommandBuilder {
    this.inputFilePathes.push(overlayPath);
    var insertNumber = this.inputFilePathes.length - 1;
    if (overlayOption instanceof Object) {
      var tmpPrefix = '[pts' + insertNumber.toString() + ']';
      var tmpOverlay = '[overlayout' + insertNumber.toString() + ']';
      var prevOverlay = '[overlayout' + (insertNumber - 1).toString() + ']';
      if (insertNumber - 1 <= 0) {
        prevOverlay = '[0:v]';
      }
      this.streamArgCommands.push('[' + insertNumber.toString() + ':v]setpts=PTS+' + overlayOption.start.toString() + '/TB' + tmpPrefix);
      this.streamArgCommands.push(
        prevOverlay +
          tmpPrefix +
          "overlay=enable='between(t," +
          overlayOption.start.toString() +
          ',' +
          overlayOption.end.toString() +
          ")'" +
          tmpOverlay,
      );
      // 0:a is set to make sound.
      this.mapCommands = [tmpOverlay, '0:a'];
    } else {
      this.streamArgCommands.push(overlayOption);
    }
    this.outputCommandOptions['filter_complex'] = '"' + this.streamArgCommands.join(';') + '"';
    return this;
  }

  inputfps(framePerSecond): FFMpegCommandBuilder {
    this.inputCommandOptions['r'] = framePerSecond;
    return this;
  }

  outputfps(framePerSecond): FFMpegCommandBuilder {
    this.outputCommandOptions['r'] = framePerSecond;
    return this;
  }

  inputBitrate(bitrate): FFMpegCommandBuilder {
    this.inputCommandOptions['b'] = bitrate;
    return this;
  }

  outputBitrate(bitrate): FFMpegCommandBuilder {
    this.outputCommandOptions['b'] = bitrate;
    return this;
  }

  inputVideoCodec(vcodec): FFMpegCommandBuilder {
    this.inputCommandOptions['vcodec'] = vcodec;
    return this;
  }

  outputVideoCodec(vcodec): FFMpegCommandBuilder {
    this.outputCommandOptions['vcodec'] = vcodec;
    return this;
  }

  inputPixelFormat(pix_fmt): FFMpegCommandBuilder {
    this.inputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  }

  outputPixelFormat(pix_fmt): FFMpegCommandBuilder {
    this.outputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  }

  crop(x, y, width, height): FFMpegCommandBuilder {
    this.videoFilters.push('crop=' + [width, height, x, y].join(':'));
    return this;
  }

  cropCommand(cropString): FFMpegCommandBuilder {
    this.videoFilters.push('crop=' + cropString);
    return this;
  }

  scale(width, height): FFMpegCommandBuilder {
    this.videoFilters.push('scale=' + [width, height].join(':'));
    return this;
  }

  scaleCommand(scaleString): FFMpegCommandBuilder {
    this.videoFilters.push('scale=' + scaleString);
    return this;
  }

  padding(x, y, width, height): FFMpegCommandBuilder {
    this.videoFilters.push('pad=' + [width, height, x, y].join(':'));
    return this;
  }

  paddingCommand(paddingString): FFMpegCommandBuilder {
    this.videoFilters.push('pad=' + paddingString);
    return this;
  }

  setMovFlags(movFlag): FFMpegCommandBuilder {
    this.outputCommandOptions['movflags'] = movFlag;
    return this;
  }

  setupSelectCaptureThumbnail(chooseFrameNumber = 100): FFMpegCommandBuilder {
    this.videoFilters.push('thumbnail=' + chooseFrameNumber.toString());
    return this.setupCaptureThumbnail();
  }

  setupCaptureThumbnail(): FFMpegCommandBuilder {
    this.outputCommandOptions['frames:v'] = '1';
    return this;
  }

  // [Reference] Example of command when transmitting Gif image:ffmpeg -i 500156_loop.gif -movflags faststart -auto-alt-ref 0 -c:v libvpx -b:v 4M -crf 4 -pix_fmt rgba -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" 500156_loop2.webm
  alphaRendering(codec = 'libvpx', pixelFormat = 'rgba'): FFMpegCommandBuilder {
    this.outputCommandOptions['auto-alt-ref'] = '0';
    this.setVideoCodec(codec);
    this.setPixelFormat(pixelFormat);
    return this;
  }

  // Setting the quality of the video
  // You can set 0 to 51 in the range.If you set the smaller value, the higher image quality will be, but the file size will be increased accordingly.
  renderingQuality(quality): FFMpegCommandBuilder {
    this.outputCommandOptions['crf'] = quality;
    return this;
  }

  setVideoCodec(vcodec): FFMpegCommandBuilder {
    this.outputCommandOptions['vcodec'] = vcodec;
    return this;
  }

  setPixelFormat = function(pix_fmt): FFMpegCommandBuilder {
    this.outputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  };

  inputStartSeeking(startTime): FFMpegCommandBuilder {
    this.inputCommandOptions['ss'] = startTime.toString();
    return this;
  }

  outputStartSeeking(startTime): FFMpegCommandBuilder {
    this.outputCommandOptions['ss'] = startTime.toString();
    return this;
  }

  seekTo(toTime): FFMpegCommandBuilder {
    this.outputCommandOptions['t'] = toTime.toString();
    return this;
  }

  // Can set preset name is [ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow, placebo]
  setPreset(presetName): FFMpegCommandBuilder {
    this.outputCommandOptions['preset'] = presetName.toString();
    return this;
  }

  // Can set tune name is [film, animation, grain, stillimage, fastdecode, zerolatency]
  setTune(tuneName): FFMpegCommandBuilder {
    this.outputCommandOptions['tune'] = tuneName.toString();
    return this;
  }

  renderSubtitleFromAss(assfilePath): FFMpegCommandBuilder {
    this.videoFilters.push('ass=' + assfilePath);
    return this;
  }

  renderSubtitleFromSrt(srtfilePath): FFMpegCommandBuilder {
    this.videoFilters.push('subtitles=' + srtfilePath);
    return this;
  }

  clear(): FFMpegCommandBuilder {
    this.inputFilePathes = [];
    this.mapCommands = [];
    this.outputFilePath = '';
    this.inputCommandOptions = {};
    this.streamArgCommands = [];
    this.outputCommandOptions = {
      loglevel: 'warning',
    };
    this.videoFilters = [];
    return this;
  }

  build(options = {}): string {
    var commands = [this.ffmpegBaseCommandPath + 'ffmpeg'];
    var inputKeys = Object.keys(this.inputCommandOptions);
    for (var i = 0; i < inputKeys.length; ++i) {
      commands.push('-' + inputKeys[i]);
      if (this.inputCommandOptions[inputKeys[i]] instanceof Array) {
        commands.push('"' + this.inputCommandOptions[inputKeys[i]].join(',') + '"');
      } else if (this.inputCommandOptions[inputKeys[i]] && this.inputCommandOptions[inputKeys[i]].toString().length > 0) {
        commands.push(this.inputCommandOptions[inputKeys[i]]);
      }
    }

    for (var i = 0; i < this.inputFilePathes.length; ++i) {
      commands.push('-i');
      commands.push(this.inputFilePathes[i]);
    }

    var outputKeys = Object.keys(this.outputCommandOptions);
    for (var i = 0; i < outputKeys.length; ++i) {
      commands.push('-' + outputKeys[i]);
      commands.push(this.outputCommandOptions[outputKeys[i]]);
    }
    if (this.videoFilters.length > 0) {
      commands.push('-vf');
      commands.push(['"', this.videoFilters.join(','), '"'].join());
    }
    for (var i = 0; i < this.mapCommands.length; ++i) {
      commands.push('-map');
      commands.push(this.mapCommands[i]);
    }
    if (this.outputFilePath != null && this.outputFilePath.length > 0) {
      commands.push(this.outputFilePath);
    }
    return commands.join(' ');
  }
}
