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
import {averageColorNormalized} from 'average-color';
import huejay from 'huejay';

import credentials from './.credentials.json';
import onKeyDown from './lib/on-key-down.js';

// Color variables.
const SATURATION = 100;
const BRIGHTNESS = 50;
const DESCRIPTION = 'huemidity';

// 10 DrumKAT pads, minus one duplicate for the snare.
const NUM_NOTES = 9;

const client = new huejay.Client(credentials);

// Change the light color when a note or chord is played.
onKeyDown(function paintColor (chord) {
	const color = averageColorNormalized(chord.map(note => [
		note / NUM_NOTES * 360,
		SATURATION,
		BRIGHTNESS,
	]));


	client.lights.getAll()
		.then(lights => {
			return lights.map(light => {
				if (!light.reachable) return;
				light.on = true;
				light.transitionTime = 0;
				light.hue = Math.round(color[0] * 65535);       // uint16
				light.saturation = Math.round(color[1] * 254);  // uint8
				light.brightness = Math.round(color[2] * 254);  // uint8
				return client.lights.save(light);
			});
		});
});
