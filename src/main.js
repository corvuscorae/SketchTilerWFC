import initSketchpad from "./1_Sketchpad/initSketchpad.js";
import initPhaser from "./4_Phaser/initPhaser.js";

const params = new URLSearchParams(window.location.search);

if (params.get("embed") === "1") {
	document.body.classList.add("embed-mode");
}

initSketchpad();
initPhaser();