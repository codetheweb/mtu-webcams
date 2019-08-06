const got = require('got');
const ffmpeg = require('fluent-ffmpeg');

/**
 * Main camera class.
 * @class
 */
class Camera {
  constructor({imageURL, name, description, ffmpegPath} = {}) {
    this.id = Number(imageURL.split('webcam')[imageURL.split('webcam').length - 1].replace('.jpg', ''));
    this.name = name;
    this.description = description;
    this.ffmpegPath = ffmpegPath;
    this.imageURL = imageURL;
  }

  /**
   * Returns the URL to a static snapshot.
   * @returns {String}
   */
  getImageURL() {
    return this.imageURL;
  }

  /**
   * Returns a stream of the latest static snapshot.
   * @returns {stream.Readable}
   */
  streamImage() {
    return got.stream(this.getImageURL());
  }

  /**
   * Returns the URL to a live `m3u8` playlist.
   * @returns {String}
   */
  getVideoURL() {
    return `https://streamingwebcams.mtu.edu:1935/rtplive/camera${('00' + this.id).slice(-3)}.stream/playlist.m3u8`;
  }

  /**
   * Returns a live video stream from the webcam.
   * @param {Object} [options={}]
   * @param {String} [options.format='flv']
   * format specifier passed to FFMPEG
   * @returns {stream.Readable}
   */
  streamVideo({format = 'flv'} = {}) {
    const video = ffmpeg(this.getVideoURL());

    if (this.ffmpegPath) {
      video.setFfmpegPath(this.ffmpegPath);
    }

    return video.format(format).pipe();
  }

  /**
   * Returns the URL for a MP4 recording.
   * @param {Date} date of recording
   * @returns {String}
   */
  getRecordingURL(date) {
    const twoDigitYear = date.getFullYear().toString().slice(2);
    const month = ('00' + (date.getMonth() + 1)).slice(-2);
    const day = ('00' + date.getDate()).slice(-2);

    return `https://webcams.mtu.edu/timelapse/webcam${this.id}/${twoDigitYear}-${month}-${day}/timelapse.mp4`;
  }

  /**
   * Returns a recording as a stream.
   * @param {Date} date of recording to retrieve
   * @returns {stream.Readable}
   */
  streamRecording(date) {
    return got.stream(this.getRecordingURL(date));
  }
}

module.exports = Camera;
