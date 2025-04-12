"use strict"	// execute JS code in strict mode

import Phaser from "./lib/phaserModule.js";
import WFCTesting from "./src/4_phaserScenes/wfcTesting.js";

const config = {
	parent: "phaserCanvas",
	type: Phaser.CANVAS,
	width: 640,		// 40 tiles x 16 pixels each
	height: 400,	// 25 tiles x 16 pixels each
	zoom: 1,
	autoCenter: true,
	render: { pixelArt: true },	// scale pixel art without blurring
	scene: [WFCTesting]
}

window.game = new Phaser.Game(config);