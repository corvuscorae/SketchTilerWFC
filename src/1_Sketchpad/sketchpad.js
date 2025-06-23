import { LineDisplayble, MouseDisplayable } from "./1_Classes/displayables.js";
import { conf } from "./2_Utils/canvasConfig.js";
import { normalizeStrokes, inCanvasBounds, showDebugText } from "./2_Utils/canvasUtils.js"
import { undo, redo, getSnapshot } from "./2_Utils/canvasHistory.js"

const sketchCanvas = document.getElementById("sketch-canvas");
const ctx = sketchCanvas.getContext("2d");

//* DRAWING *//
let workingLine = { points: [], thickness: conf.lineThickness, hue: 0, structure: null };
let mouseObject = new MouseDisplayable({
	x: 0,
	y: 0,
	hue: 0,
	active: false,
}, conf.lineThickness);

//* STATE TRACKING *//
// strokes
let displayList = []; 
let redoDisplayList = [];

// state snapshots
let undoStack = [];
let redoStack = [];

//* STRUCTURES *//
// STRUCTURE BUTTONS
let activeButton;
for (const type in conf.structures) {
	const structure = conf.structures[type];
	const button = document.getElementById(`${type.toLowerCase()}-button`);
	if(!button) continue;
	button.onclick = () => {
		mouseObject.mouse.hue = structure.color;
		button.style.borderColor = structure.color;  
		activeButton = type;
	}
}
// initial selected marker
document.getElementById("house-button").click();

//* SKETCH EVENTS *//
// When changeDraw is dispatched, the drawing area will be repainted.
const changeDraw = new Event("drawing-changed"); 
sketchCanvas.addEventListener("drawing-changed", () => {
	ctx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
	for (const d of displayList) {
		d.display(ctx);
	}
});

// move tool/cursor around canvas
const movedTool = new Event("tool-moved");
sketchCanvas.addEventListener("tool-moved", () => {
	ctx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
	for (const d of displayList) {
		d.display(ctx);
	}
	mouseObject.display(ctx);
});

// mouse click event, start drawing
sketchCanvas.addEventListener("mousedown", (ev) => {
	mouseObject = new MouseDisplayable({
		x: ev.offsetX,
		y: ev.offsetY,
		hue: mouseObject.mouse.hue,
		active: true,
	}, conf.lineThickness);
	if(inCanvasBounds({ x: mouseObject.mouse.x, y: mouseObject.mouse.y }, sketchCanvas)){ 
		// action tracking: save current canvas state before adding a stroke
		undoStack.push(getSnapshot());

		// init workingLine with new points
		workingLine = {
			points: [{ x: mouseObject.mouse.x, y: mouseObject.mouse.y }],
			thickness: conf.lineThickness,
			hue: mouseObject.mouse.hue,
			structure: activeButton
		};
		displayList.push(new LineDisplayble(workingLine)); 

		// clear redo strokes
		redoDisplayList = [];

		sketchCanvas.dispatchEvent(changeDraw);
		sketchCanvas.dispatchEvent(movedTool);
	}
});

// mouse move event, draw on canvas
sketchCanvas.addEventListener("mousemove", (ev) => {
	mouseObject = new MouseDisplayable({
		x: ev.offsetX,
		y: ev.offsetY,
		hue: mouseObject.mouse.hue,
		active: mouseObject.mouse.active,
	}, conf.lineThickness);
	if (mouseObject?.mouse.active) {
		if(inCanvasBounds({ x: mouseObject.mouse.x, y: mouseObject.mouse.y }, sketchCanvas)){ 
			// add new point to working line
			workingLine.points.push({
				x: mouseObject.mouse.x,
				y: mouseObject.mouse.y,
			});

			sketchCanvas.dispatchEvent(changeDraw);
		}
	}
	sketchCanvas.dispatchEvent(movedTool);
});

// mouse up event, stop drawing
sketchCanvas.addEventListener("mouseup", (ev) => {
	mouseObject = new MouseDisplayable({
		x: ev.offsetX,
		y: ev.offsetY,
		hue: mouseObject.mouse.hue,
		active: false,
	}, conf.lineThickness);

	if(workingLine.points.length <= conf.sizeThreshold){
		displayList.pop();  // remove accidental tiny stroke
		undoStack.pop();	// also forget this canvas state
	} else {
		// check if "Normalize shapes" is checked
		normalizing = document.getElementById("normalize-toggle").checked;
		if(normalizing) normalizeStrokes(displayList, sketchCanvas);

		redoStack = [];

		sketchCanvas.dispatchEvent(changeDraw);
		sketchCanvas.dispatchEvent(movedTool);
	}
});

//*** BUTTONS ***/
//* CLEAR *//
// updates phaser scene, clearing structures
const clearButton = document.getElementById(`clear-button`);
const clearPhaser = new CustomEvent("clearSketch");	// clears phaser canvas
clearButton.onclick = () => {
	// push a clear action to undo stack
	undoStack.push(getSnapshot());
	
	// clear displayables
	displayList = [];
	redoDisplayList = [];
	
	// clear canvas
	ctx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
	window.dispatchEvent(clearPhaser);
	sketchCanvas.dispatchEvent(changeDraw);
};

//* GENERATE */
const generateButton = document.getElementById("generate-button");
generateButton.onclick = () => {
	showDebugText(ctx, displayList);
	
	// sends sketch data to Phaser scene
	const toPhaser = new CustomEvent("generate", { 
		detail: {sketch: displayList, structures: conf.structures} 
	});
	window.dispatchEvent(toPhaser);
}

//* NORMALIZE STROKES *//
const normalizeToggle = document.getElementById("normalize-toggle");
let normalizing = normalizeToggle.checked;
normalizeToggle.onclick = () => {
	normalizing = document.getElementById("normalize-toggle").checked;
	if(normalizing){ 
		normalizeStrokes(displayList, sketchCanvas); 
		sketchCanvas.dispatchEvent(changeDraw); // Re-render the canvas after simplifying
	}
}

//*** HISTORY ***/
//* UNDO *//
const undoButton = document.getElementById(`undo-button`);
undoButton.onclick = () => {
	if(undoStack.length === 0){ return; }
	redoStack.push(undo(undoStack.pop()));
	sketchCanvas.dispatchEvent(changeDraw);
}

//* REDO *//
const redoButton = document.getElementById(`redo-button`);
redoButton.onclick = () => {
	if(redoStack.length === 0){ return; }
	undoStack.push(redo(redoStack.pop()));
	sketchCanvas.dispatchEvent(changeDraw);
}

//* KEYBOARD SHORTCUTS *//
document.addEventListener('keydown', (e) => {
	if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z"){
		if(e.shiftKey){ document.getElementById("redo-button").click(); }
		else { document.getElementById("undo-button").click(); }
	}
});

//*** GETTERS ***//
export function getDisplayList(l){
	if(!l || l.toLowerCase() === "undo") return displayList;
	else if(l.toLowerCase() === "redo") return redoDisplayList;
}

//*** SETTERS ***//
export function setDisplayList(data, key){
	if(!key || key.toLowerCase() === "undo"){
		displayList = data;
	} else if(key.toLowerCase() === "redo"){
		redoDisplayList = data;
	}
}