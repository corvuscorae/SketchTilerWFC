"use strict"	// execute JS code in strict mode

import Phaser from "./lib/phaser.module.js";
import WFCTesting_Scene from "./src/3_phaserScenes/wfcTesting.js";

const config = {
	parent: "phaserCanvas",
	type: Phaser.CANVAS,
	width: 640,
	height: 400,
	zoom: 1,
	autoCenter: true,
	render: { pixelArt: true },	// scale pixel art without blurring
	scene: [WFCTesting_Scene]
}

window.game = new Phaser.Game(config);