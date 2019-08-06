const cheerio = require('cheerio');
const got = require('got');

const Camera = require('./lib/camera');

/**
 * Main cameras class.
 * @class
 * @param {Object} [options={}]
 * @param {String} [options.ffmpegPath] path to local FFMPEG binary
 */
class Webcams {
  constructor({ffmpegPath} = {}) {
    this.cameras = [];
    this.ffmpegPath = ffmpegPath;
  }

  async init() {
    const page = await got('https://www.mtu.edu/webcams/');
    const $ = cheerio.load(page.body);

    const cams = $('img[src*="webcams"]');

    const self = this;

    cams.each(function () {
      const cam = $(this);

      const name = cam.closest('.full-column').find('h3').text().trim();

      const camera = {
        description: cam.attr('alt'),
        imageURL: cam.attr('src'),
        ffmpegPath: this.ffmpegPath,
        name
      };

      self.cameras.push(new Camera(camera));
    });

    return this.cameras;
  }

  /**
   * Get all cameras saved in instance.
   * @returns {Array<Camera>}
   */
  getAll() {
    return this.cameras;
  }

  /**
   * Gets camera by ID.
   * @param {Number} id of camera
   * @returns {Camera}
   */
  byId(id) {
    return this.cameras.find(c => c.id === id);
  }

  /**
   * Gets camera by name.
   * @param {String} name of camera
   * @returns {Camera}
   */
  byName(name) {
    return this.cameras.find(c => c.name === name);
  }
}

module.exports = Webcams;
