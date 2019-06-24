import CommandBuilder from './command-builder';

export default class FFmpegCommandBuilder extends CommandBuilder {
  constructor() {
    super();
  }

  setFfmpegPath(path): FFmpegCommandBuilder {
    if (path.length <= 0) {
      return;
    } else if (path[path.length - 1] == '/') {
      this.commandGeneraterOptions.ffmpegBaseCommandPath = path;
    } else {
      this.commandGeneraterOptions.ffmpegBaseCommandPath = path + '/';
    }
    return this;
  }

  updateInputCommandOptions(options = {}): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions = {...this.commandGeneraterOptions.inputCommandOptions, ...options};
    return this;
  }

  updateOutputCommandOptions(options = {}): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions = {...this.commandGeneraterOptions.outputCommandOptions, ...options};
    return this;
  }

  baseInput(inputPath): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputFilePathes = [inputPath];
    return this;
  }

  output(outputPath): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputFilePath = outputPath;
    return this;
  }

  // This command concat the videos
  concat(concatPath, enableVideo = true, enableAudio = true, options = {}): FFmpegCommandBuilder {
    var videoFiles = Array.prototype.concat.apply([], [concatPath]);
    for (var i = 0; i < videoFiles.length; ++i) {
      this.commandGeneraterOptions.inputFilePathes.push(videoFiles[i]);
    }
    var concatFilterComplex = 'concat=n=' + this.commandGeneraterOptions.inputFilePathes.length + ':';
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
    this.commandGeneraterOptions.outputCommandOptions['filter_complex'] = '"' + concatFilterComplex + '"';
    return this;
  }

  // To composite the base movie overlay movies or images.(there are various commands)
  // If do not adjust PTS to the starting point of the movie, it seems to be the wrong starting point when composed the movie.
  overlay(overlayPath, overlayOption, options = {}): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputFilePathes.push(overlayPath);
    var insertNumber = this.commandGeneraterOptions.inputFilePathes.length - 1;
    if (overlayOption instanceof Object) {
      var tmpPrefix = '[pts' + insertNumber.toString() + ']';
      var tmpOverlay = '[overlayout' + insertNumber.toString() + ']';
      var prevOverlay = '[overlayout' + (insertNumber - 1).toString() + ']';
      if (insertNumber - 1 <= 0) {
        prevOverlay = '[0:v]';
      }
      this.commandGeneraterOptions.streamArgCommands.push('[' + insertNumber.toString() + ':v]setpts=PTS+' + overlayOption.start.toString() + '/TB' + tmpPrefix);
      this.commandGeneraterOptions.streamArgCommands.push(
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
      this.commandGeneraterOptions.mapCommands = [tmpOverlay, '0:a'];
    } else {
      this.commandGeneraterOptions.streamArgCommands.push(overlayOption);
    }
    this.commandGeneraterOptions.outputCommandOptions['filter_complex'] = '"' + this.commandGeneraterOptions.streamArgCommands.join(';') + '"';
    return this;
  }

  inputfps(framePerSecond): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions['r'] = framePerSecond;
    return this;
  }

  outputfps(framePerSecond): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['r'] = framePerSecond;
    return this;
  }

  inputBitrate(bitrate): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions['b'] = bitrate;
    return this;
  }

  outputBitrate(bitrate): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['b'] = bitrate;
    return this;
  }

  inputVideoCodec(vcodec): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions['vcodec'] = vcodec;
    return this;
  }

  outputVideoCodec(vcodec): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['vcodec'] = vcodec;
    return this;
  }

  inputPixelFormat(pix_fmt): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  }

  outputPixelFormat(pix_fmt): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  }

  crop(x, y, width, height): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters.push('crop=' + [width, height, x, y].join(':'));
    return this;
  }

  cropCommand(cropString): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters.push('crop=' + cropString);
    return this;
  }

  scale(width, height): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters.push('scale=' + [width, height].join(':'));
    return this;
  }

  scaleCommand(scaleString): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters.push('scale=' + scaleString);
    return this;
  }

  padding(x, y, width, height): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters.push('pad=' + [width, height, x, y].join(':'));
    return this;
  }

  paddingCommand(paddingString): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters.push('pad=' + paddingString);
    return this;
  }

  setMovFlags(movFlag): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['movflags'] = movFlag;
    return this;
  }

  setupSelectCaptureThumbnail(chooseFrameNumber = 100): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters.push('thumbnail=' + chooseFrameNumber.toString());
    return this.setupCaptureThumbnail();
  }

  setupCaptureThumbnail(): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['frames:v'] = '1';
    return this;
  }

  // [Reference] Example of command when transmitting Gif image:ffmpeg -i 500156_loop.gif -movflags faststart -auto-alt-ref 0 -c:v libvpx -b:v 4M -crf 4 -pix_fmt rgba -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" 500156_loop2.webm
  alphaRendering(codec = 'libvpx', pixelFormat = 'rgba'): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['auto-alt-ref'] = '0';
    this.setVideoCodec(codec);
    this.setPixelFormat(pixelFormat);
    return this;
  }

  // Setting the quality of the video
  // You can set 0 to 51 in the range.If you set the smaller value, the higher image quality will be, but the file size will be increased accordingly.
  renderingQuality(quality): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['crf'] = quality;
    return this;
  }

  setVideoCodec(vcodec): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['vcodec'] = vcodec;
    return this;
  }

  setPixelFormat = function(pix_fmt): FFmpegCommandBuilder {
    this.outputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  };

  inputStartSeeking(startTime): FFmpegCommandBuilder {
    this.commandGeneraterOptions.inputCommandOptions['ss'] = startTime.toString();
    return this;
  }

  outputStartSeeking(startTime): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['ss'] = startTime.toString();
    return this;
  }

  seekTo(toTime): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['t'] = toTime.toString();
    return this;
  }

  // Can set preset name is [ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow, placebo]
  setPreset(presetName): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['preset'] = presetName.toString();
    return this;
  }

  // Can set tune name is [film, animation, grain, stillimage, fastdecode, zerolatency]
  setTune(tuneName): FFmpegCommandBuilder {
    this.commandGeneraterOptions.outputCommandOptions['tune'] = tuneName.toString();
    return this;
  }

  renderSubtitleFromAss(assfilePath): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters.push('ass=' + assfilePath);
    return this;
  }

  renderSubtitleFromSrt(srtfilePath): FFmpegCommandBuilder {
    this.commandGeneraterOptions.videoFilters.push('subtitles=' + srtfilePath);
    return this;
  }

  build(): string {
    var commands = [this.commandGeneraterOptions.ffmpegBaseCommandPath + 'ffmpeg'];
    var inputKeys = Object.keys(this.commandGeneraterOptions.inputCommandOptions);
    for (var i = 0; i < inputKeys.length; ++i) {
      commands.push('-' + inputKeys[i]);
      commands.push(this.commandGeneraterOptions.inputCommandOptions[inputKeys[i]]);
    }

    for (var i = 0; i < this.commandGeneraterOptions.inputFilePathes.length; ++i) {
      commands.push('-i');
      commands.push(this.commandGeneraterOptions.inputFilePathes[i]);
    }

    var outputKeys = Object.keys(this.commandGeneraterOptions.outputCommandOptions);
    for (var i = 0; i < outputKeys.length; ++i) {
      commands.push('-' + outputKeys[i]);
      commands.push(this.commandGeneraterOptions.outputCommandOptions[outputKeys[i]]);
    }
    if (this.commandGeneraterOptions.videoFilters.length > 0) {
      commands.push('-vf');
      commands.push(['"', this.commandGeneraterOptions.videoFilters.join(','), '"'].join());
    }
    for (var i = 0; i < this.commandGeneraterOptions.mapCommands.length; ++i) {
      commands.push('-map');
      commands.push(this.commandGeneraterOptions.mapCommands[i]);
    }
    if (this.commandGeneraterOptions.outputFilePath != null && this.commandGeneraterOptions.outputFilePath.length > 0) {
      commands.push(this.commandGeneraterOptions.outputFilePath);
    }
    return commands.join(' ');
  }
}
