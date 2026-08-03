import initSketchpad from "./1_Sketchpad/initSketchpad.js";
import initPhaser from "./4_Phaser/initPhaser.js";

const params = new URLSearchParams(window.location.search);
const embedMode = params.get("embed") === "1";

if (embedMode) {
	document.body.classList.add("embed-mode");
}

initSketchpad();
initPhaser();

if (embedMode) {
	const fitEmbed = () => {
		const contentWidth = 750;
		const contentHeight = 800;
		const padding = 24;

		const widthScale = (window.innerWidth - padding) / contentWidth;
		const heightScale = (window.innerHeight - padding) / contentHeight;
		const scale = Math.min(1, widthScale, heightScale);

		document.documentElement.style.setProperty("--embed-scale", scale);
	};

	fitEmbed();
	window.addEventListener("resize", fitEmbed);
}