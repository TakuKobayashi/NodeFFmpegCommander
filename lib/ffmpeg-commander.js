var child_process = require('child_process');

var outputFilePath = '';
var inputFilePathes = [];
var ffmpegBaseCommandPath = '';
var inputCommandOptions = {};
var streamArgCommands = [];
var mapCommands = [];
// When loglevel is set thewarning, below the warning level logs will not be output.
var outputCommandOptions = {
  loglevel: 'warning',
};

var FFMpegCommander = function() {
  this.setFfmpegPath = function(path) {
    if (path.length <= 0) {
      return;
    } else if (path[path.length - 1] == '/') {
      ffmpegBaseCommandPath = path;
    } else {
      ffmpegBaseCommandPath = path + '/';
    }
    return this;
  };

  this.getMetaInfo = function(videoFilePath) {
    var tmpOutputFilePath = new String(outputFilePath);
    var tmpInputFilePathes = new Array(inputFilePathes);
    var tmpInputCommandOptions = Object.assign({}, inputCommandOptions);
    var tmpOutputCommandOptions = Object.assign({}, outputCommandOptions);
    outputFilePath = '';
    inputFilePathes = [videoFilePath];
    inputCommandOptions = {};
    outputCommandOptions = {
      loglevel: 'warning',
      show_streams: '',
      print_format: 'json',
    };
    var result = this.runSync({
      commandName: 'ffprobe',
    }).toString('utf8');
    outputFilePath = tmpOutputFilePath;
    inputFilePathes = tmpInputFilePathes;
    inputCommandOptions = tmpInputCommandOptions;
    outputCommandOptions = tmpOutputCommandOptions;
    return JSON.parse(result);
  };

  this.getVideoSize = function(videoFilePath) {
    var jsonObject = this.getMetaInfo(videoFilePath);
    var videoInfo = jsonObject.streams.find(function(element) {
      return element.width && element.height;
    });
    if (!videoInfo) {
      videoInfo = {};
    }
    var rotate = (videoInfo.tags || {}).rotate || '0';
    var resultObj = {
      width: videoInfo.width || 0,
      height: videoInfo.height || 0,
      rotate: parseInt(rotate),
    };
    if (resultObj.rotate % 90 == 0 && resultObj.rotate % 180 != 0) {
      resultObj.actualWidth = resultObj.height;
      resultObj.actualHeight = resultObj.width;
    } else {
      resultObj.actualWidth = resultObj.width;
      resultObj.actualHeight = resultObj.height;
    }
    return resultObj;
  };

  this.toCommand = function(options = {}) {
    var commands = [ffmpegBaseCommandPath + 'ffmpeg'];
    if (options.commandName) {
      commands = [ffmpegBaseCommandPath + options.commandName];
    }

    var inputKeys = Object.keys(inputCommandOptions);
    for (var i = 0; i < inputKeys.length; ++i) {
      commands.push('-' + inputKeys[i]);
      if (inputCommandOptions[inputKeys[i]] instanceof Array) {
        commands.push('"' + inputCommandOptions[inputKeys[i]].join(',') + '"');
      } else if (inputCommandOptions[inputKeys[i]] && inputCommandOptions[inputKeys[i]].toString().length > 0) {
        commands.push(inputCommandOptions[inputKeys[i]]);
      }
    }

    for (var i = 0; i < inputFilePathes.length; ++i) {
      commands.push('-i');
      commands.push(inputFilePathes[i]);
    }

    var outputKeys = Object.keys(outputCommandOptions);
    for (var i = 0; i < outputKeys.length; ++i) {
      commands.push('-' + outputKeys[i]);
      if (outputCommandOptions[outputKeys[i]] instanceof Array) {
        commands.push('"' + outputCommandOptions[outputKeys[i]].join(',') + '"');
      } else if (outputCommandOptions[outputKeys[i]] && outputCommandOptions[outputKeys[i]].toString().length > 0) {
        commands.push(outputCommandOptions[outputKeys[i]]);
      }
    }
    for (var i = 0; i < mapCommands.length; ++i) {
      commands.push('-map');
      commands.push(mapCommands[i]);
    }
    if (outputFilePath != null && outputFilePath.length > 0) {
      commands.push(outputFilePath);
    }
    return commands.join(' ');
  };

  this.updateInputCommandOptions = function(options = {}) {
    inputCommandOptions = Object.assign(inputCommandOptions, options);
    return this;
  };

  this.updateOutputCommandOptions = function(options = {}) {
    outputCommandOptions = Object.assign(outputCommandOptions, options);
    return this;
  };

  this.baseInput = function(inputPath) {
    inputFilePathes = [inputPath];
    return this;
  };

  this.output = function(outputPath) {
    outputFilePath = outputPath;
    return this;
  };

  // This command concat the videos
  this.concat = function(concatPath, enableVideo = true, enableAudio = true, options = {}) {
    var videoFiles = Array.prototype.concat.apply([], [concatPath]);
    for (var i = 0; i < videoFiles.length; ++i) {
      inputFilePathes.push(videoFiles[i]);
    }
    var concatFilterComplex = 'concat=n=' + inputFilePathes.length + ':';
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
    outputCommandOptions['filter_complex'] = '"' + concatFilterComplex + '"';
    return this;
  };

  // To composite the base movie overlay movies or images.(there are various commands)
  // If do not adjust PTS to the starting point of the movie, it seems to be the wrong starting point when composed the movie.
  this.overlay = function(overlayPath, overlayOption, options = {}) {
    inputFilePathes.push(overlayPath);
    var insertNumber = inputFilePathes.length - 1;
    if (overlayOption instanceof Object) {
      var tmpPrefix = '[pts' + insertNumber.toString() + ']';
      var tmpOverlay = '[overlayout' + insertNumber.toString() + ']';
      var prevOverlay = '[overlayout' + (insertNumber - 1).toString() + ']';
      if (insertNumber - 1 <= 0) {
        prevOverlay = '[0:v]';
      }
      streamArgCommands.push('[' + insertNumber.toString() + ':v]setpts=PTS+' + overlayOption.start.toString() + '/TB' + tmpPrefix);
      streamArgCommands.push(
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
      mapCommands = [tmpOverlay, '0:a'];
    } else {
      streamArgCommands.push(overlayOption);
    }
    outputCommandOptions['filter_complex'] = '"' + streamArgCommands.join(';') + '"';
    return this;
  };

  this.inputfps = function(framePerSecond) {
    inputCommandOptions['r'] = framePerSecond;
    return this;
  };

  this.outputfps = function(framePerSecond) {
    outputCommandOptions['r'] = framePerSecond;
    return this;
  };

  this.inputBitrate = function(bitrate) {
    inputCommandOptions['b'] = bitrate;
    return this;
  };

  this.outputBitrate = function(bitrate) {
    outputCommandOptions['b'] = bitrate;
    return this;
  };

  this.inputVideoCodec = function(vcodec) {
    inputCommandOptions['vcodec'] = vcodec;
    return this;
  };

  this.outputVideoCodec = function(vcodec) {
    outputCommandOptions['vcodec'] = vcodec;
    return this;
  };

  this.inputPixelFormat = function(pix_fmt) {
    inputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  };

  this.outputPixelFormat = function(pix_fmt) {
    outputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  };

  this.crop = function(x, y, width, height) {
    // vf = ビデオフィルター
    if (!outputCommandOptions['vf']) {
      outputCommandOptions['vf'] = [];
    }
    outputCommandOptions['vf'].push('crop=' + [width, height, x, y].join(':'));
    return this;
  };

  this.cropCommand = function(cropString) {
    // vf = ビデオフィルター
    if (!outputCommandOptions['vf']) {
      outputCommandOptions['vf'] = [];
    }
    outputCommandOptions['vf'].push('crop=' + cropString);
    return this;
  };

  this.scale = function(width, height) {
    // vf = video filter
    if (!outputCommandOptions['vf']) {
      outputCommandOptions['vf'] = [];
    }
    outputCommandOptions['vf'].push('scale=' + [width, height].join(':'));
    return this;
  };

  this.scaleCommand = function(scaleString) {
    // vf = video filter
    if (!outputCommandOptions['vf']) {
      outputCommandOptions['vf'] = [];
    }
    outputCommandOptions['vf'].push('scale=' + scaleString);
    return this;
  };

  this.padding = function(x, y, width, height) {
    // vf = video filter
    if (!outputCommandOptions['vf']) {
      outputCommandOptions['vf'] = [];
    }
    outputCommandOptions['vf'].push('pad=' + [width, height, x, y].join(':'));
    return this;
  };

  this.paddingCommand = function(paddingString) {
    // vf = video filter
    if (!outputCommandOptions['vf']) {
      outputCommandOptions['vf'] = [];
    }
    outputCommandOptions['vf'].push('pad=' + paddingString);
    return this;
  };

  this.setMovFlags = function(movFlag) {
    outputCommandOptions['movflags'] = movFlag;
    return this;
  };

  // [Reference] Example of command when transmitting Gif image:ffmpeg -i 500156_loop.gif -movflags faststart -auto-alt-ref 0 -c:v libvpx -b:v 4M -crf 4 -pix_fmt rgba -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" 500156_loop2.webm
  this.alphaRendering = function(codec = 'libvpx', pixelFormat = 'rgba') {
    outputCommandOptions['auto-alt-ref'] = 0;
    this.setVideoCodec(codec);
    this.setPixelFormat(pixelFormat);
    return this;
  };

  // Setting the quality of the video
  // You can set 0 to 51 in the range.If you set the smaller value, the higher image quality will be, but the file size will be increased accordingly.
  this.renderingQuality = function(quality) {
    outputCommandOptions['crf'] = quality;
    return this;
  };

  this.setVideoCodec = function(vcodec) {
    outputCommandOptions['vcodec'] = vcodec;
    return this;
  };

  this.setPixelFormat = function(pix_fmt) {
    outputCommandOptions['pix_fmt'] = pix_fmt;
    return this;
  };

  this.setupSelectCaptureThumbnail = function(chooseFrameNumber = 100) {
    outputCommandOptions['vf'] = ['thumbnail=' + chooseFrameNumber.toString()];
    return this.setupCaptureThumbnail();
  };

  this.setupCaptureThumbnail = function() {
    outputCommandOptions['frames:v'] = '1';
    return this;
  };

  this.inputStartSeeking = function(startTime) {
    inputCommandOptions['ss'] = startTime.toString();
    return this;
  };

  this.outputStartSeeking = function(startTime) {
    outputCommandOptions['ss'] = startTime.toString();
    return this;
  };

  this.seekTo = function(toTime) {
    outputCommandOptions['t'] = toTime.toString();
    return this;
  };

  // Can set preset name is [ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow, placebo]
  this.setPreset = function(presetName) {
    outputCommandOptions['preset'] = presetName.toString();
  };

  // Can set tune name is [film, animation, grain, stillimage, fastdecode, zerolatency]
  this.setTune = function(tuneName) {
    outputCommandOptions['tune'] = tuneName.toString();
  };

  this.renderSubtitleFromAss = function(assfilePath) {
    if (!outputCommandOptions['vf']) {
      outputCommandOptions['vf'] = [];
    }
    outputCommandOptions['vf'].push('ass=' + assfilePath);
  };

  this.renderSubtitleFromSrt = function(srtfilePath) {
    if (!outputCommandOptions['vf']) {
      outputCommandOptions['vf'] = [];
    }
    outputCommandOptions['vf'].push('subtitles=' + srtfilePath);
  };

  this.run = function(options = {}) {
    return new Promise((resolve, reject) => {
      var command = this.toCommand(options);
      if (options.showCommand) {
        console.log(command);
      }
      child_process.exec(command, (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(stdout, stderr);
      });
    });
  };

  this.runSync = function(options = {}) {
    var command = this.toCommand(options);
    if (options.showCommand) {
      console.log(command);
    }
    try {
      var result = child_process.execSync(command);
      this.clear();
      return result;
    } catch (err) {
      this.clear();
      return err;
    }
  };

  this.clear = function() {
    inputFilePathes = [];
    mapCommands = [];
    outputFilePath = '';
    inputCommandOptions = {};
    streamArgCommands = [];
    outputCommandOptions = {
      loglevel: 'warning',
    };
    return this;
  };
};

module.exports = FFMpegCommander;
