'use strict';

/**
 * Exports a function that accepts a callback which will be called whenever a
 * key or chord is played on the attached MIDI keyboard.
 */
const midi = require('midi');

// Max time delay between two keypresses to form a chord (in milliseconds).
const MAX_CHORD_DELAY = 50;

// MIDI status codes.
const STATUS_CODES = {
	0x90: 'DOWN',
	0x99: 'DRUM_ON',
};

// HACK: Keys on my current DrumKAT setup. E Dorian 9.
const KEYS = {
	28: 0,
	47: 1,
	49: 2,
	50: 3,
	52: 4,
	54: 5,
	55: 6,
	59: 7,
	64: 8,
};

// Set up a new input.
const input = new midi.input();

// Hack, but it works.
const state = {
	chord: [],
	triggerFn: null,
};

// Add a brief delay before triggering in case the user is actually trying to
// play a chord.
let triggerTimeout = null;
function trigger () {
	const {chord, triggerFn} = state;

	triggerFn && triggerFn(chord);

	// Reset the chord.
	state.chord = [];
}

input.on('message', function(_, message) {
	const [status, key, velocity] = message;
	const {keysDown} = state;

	// Early exit for everything but keydown signals.
	const statusCode = STATUS_CODES[status];
	if (!velocity || (statusCode !== 'DOWN' && statusCode !== 'DRUM_ON')) {
		return;
	}
	state.chord.push(KEYS[key]);
	clearTimeout(triggerTimeout);
	triggerTimeout = setTimeout(trigger, MAX_CHORD_DELAY);
});

// Open the first available input port, YOLO.
input.openPort(0);

// lol sry everybody...
module.exports = function onKeyDown (fn) {
	state.triggerFn = fn;
}
