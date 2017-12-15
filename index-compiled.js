'use strict';

/**
 * Huemidity (noun): Hue MIDI Thank You! It's a bad name. Or is it!? ...it is.
 *
 * Uses huejay and node-midi to map MIDI trigger notes to the color wheel. When
 * a note is hit, signals will be sent to all available Hue lights under the
 * bridge and user specified in `./.credentials.json`. There are some hacks
 * here to get things working with my specific instruments; tweaked forks are
 * encouraged.
 *
 * May be unsettling for synesthites whose pairs don't match up with this.
 *
 * Usage:
 *
 *   > touch .credentials.json  # Add hue `host` and `username` keys here.
 *   > npm i
 *   > babel-node index.js
 *
 */

var _averageColor = require('average-color');

var _huejay = require('huejay');

var _huejay2 = _interopRequireDefault(_huejay);

var _credentials = require('./.credentials.json');

var _credentials2 = _interopRequireDefault(_credentials);

var _onKeyDown = require('./lib/on-key-down.js');

var _onKeyDown2 = _interopRequireDefault(_onKeyDown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Color variables.
var SATURATION = 100;
var BRIGHTNESS = 50;
var DESCRIPTION = 'huemidity';

// 10 DrumKAT pads, minus one duplicate for the snare.
var NUM_NOTES = 9;

var client = new _huejay2.default.Client(_credentials2.default);

// Change the light color when a note or chord is played.
(0, _onKeyDown2.default)(function paintColor(chord) {
  var color = (0, _averageColor.averageColorNormalized)(chord.map(function (note) {
    return [note / NUM_NOTES * 360, SATURATION, BRIGHTNESS];
  }));

  client.lights.getAll().then(function (lights) {
    return lights.map(function (light) {
      if (!light.reachable) return;
      light.on = true;
      light.transitionTime = 0;
      light.hue = Math.round(color[0] * 65535); // uint16
      light.saturation = Math.round(color[1] * 254); // uint8
      light.brightness = Math.round(color[2] * 254); // uint8
      return client.lights.save(light);
    });
  });
});
