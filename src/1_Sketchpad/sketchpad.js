import { chaikinSmooth, ramerDouglasPeucker } from "./lineCleanup.js";
import { LineDisplayble, MouseDisplayable } from "./displayables.js";
import { getShape } from "./shapeDetection.js";

const sketchCanvas = document.getElementById("sketch-canvas");
const ctx = sketchCanvas.getContext("2d");

//* DRAWING *//
const normalizeToggle = document.getElementById("normalize-toggle");
let normalizing = normalizeToggle.checked;

const lineThickness = 5;
let workingLine = { points: [], thickness: lineThickness, hue: 0, structure: null };
let mouseObject = new MouseDisplayable({
	x: 0,
	y: 0,
	hue: 0,
	active: false,
}, lineThickness);

//* STATE TRACKING *//
// strokes
let displayList = []; 
let redoDisplayList = [];

// actions
const ACTION = {
	CLEAR: "clear",
	DRAW: "draw"
}
let undoStack = [];
let redoStack = [];

// define structures
// NOTE: regions can be "box" or "trace",
//    this will be the region that structure generators use to place tiles.
const structures = {  
	"House" : { color: '#f54242', regionType: "box"   },
	"Forest": { color: '#009632', regionType: "box"   },
	"Fence" : { color: '#f5c842', regionType: "trace" },
	"Path"  : { color: '#8000ff', regionType: "trace" },
};

//console.log(structureSketches); // DEBUG

//* EVENTS *//

// updates phaser scene, clearing structures
const clearPhaser = new CustomEvent("clearSketch");

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
	}, lineThickness);
	if(inBounds({ x: mouseObject.mouse.x, y: mouseObject.mouse.y })){ 
		workingLine = {
			points: [{ x: mouseObject.mouse.x, y: mouseObject.mouse.y }],
			thickness: lineThickness,
			hue: mouseObject.mouse.hue,
			structure: activeButton
		};
		displayList.push(new LineDisplayble(workingLine)); 
		redoDisplayList = [];
	}
	sketchCanvas.dispatchEvent(changeDraw);
	sketchCanvas.dispatchEvent(movedTool);
});

// mouse move event, draw on canvas
sketchCanvas.addEventListener("mousemove", (ev) => {
	mouseObject = new MouseDisplayable({
		x: ev.offsetX,
		y: ev.offsetY,
		hue: mouseObject.mouse.hue,
		active: mouseObject.mouse.active,
	}, lineThickness);
	if (mouseObject?.mouse.active) {
		if(inBounds({ x: mouseObject.mouse.x, y: mouseObject.mouse.y })){ 
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
	}, lineThickness);

	// check if "Normalize shapes" is checked
	normalizing = document.getElementById("normalize-toggle").checked;
	if(normalizing) normalizeStrokes();

	// action tracking
	undoStack.push({type: ACTION.DRAW});
	redoStack = [];

	//updateStructureSketchHistory();
	sketchCanvas.dispatchEvent(changeDraw);
	sketchCanvas.dispatchEvent(movedTool);
});

//* BUTTONS *//

// clear drawing
const clearButton = document.getElementById(`clear-button`);
clearButton.onclick = clear;
function clear() {
	ctx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
	undoStack.push({
		type: ACTION.CLEAR,
		state: {
			displayList: displayList,
			redoDisplayList: redoDisplayList
		}
	});
	displayList = [];
	redoDisplayList = [];
	window.dispatchEvent(clearPhaser);
};

// undo last stroke
const undoButton = document.getElementById(`undo-button`);
undoButton.onclick = undo;
function undo(){
	let lastAction = undoStack.pop();
	if(!lastAction) return;

	if(lastAction.type === ACTION.DRAW){
		const toRedo = displayList.pop();

		if(toRedo != undefined) {
			redoDisplayList.push(toRedo);
			redoStack.push(lastAction);
			
			window.dispatchEvent(new CustomEvent("undoSketch", { 
				detail: displayList.length
			}));

			sketchCanvas.dispatchEvent(changeDraw);
		}

		return;
	}
	if(lastAction.type = ACTION.CLEAR){
		// restoring sketch data from lastAction state snapshot
		displayList = lastAction.state.displayList;
		redoDisplayList = lastAction.state.redoDisplayList;
		sketchCanvas.dispatchEvent(changeDraw);

		return;
	}
}

// redo last stroke
const redoButton = document.getElementById(`redo-button`);
redoButton.onclick = redo;
function redo() {
	let action = redoStack.pop();
	if(!action) return;
 	if(action.type === ACTION.DRAW){
		const toDisplay = redoDisplayList.pop();
		if (toDisplay != undefined) {
			displayList.push(toDisplay);
			undoStack.push(action);

			window.dispatchEvent(new CustomEvent("redoSketch", { 
				detail: displayList.length
			}));

			sketchCanvas.dispatchEvent(changeDraw);
		}
	}
}

/*
// export canvas as png
const exportButton = document.createElement("button");
exportButton.innerHTML = "Export Drawing";
buttonContainer.append(exportButton);
exportButton.onclick = () => {
	const exportCanvas = document.createElement("canvas");
	const exportContext = exportCanvas.getContext("2d");
	exportCanvas.width = 1920;
	exportCanvas.height = 1080;
	exportContext.scale(1.5, 1.5);

	for (const d of displayList) {
		d.display(exportContext);
	}

	const imageData = exportCanvas.toDataURL("image/png");

	const downloadLink = document.createElement("a");
	downloadLink.href = imageData;
	downloadLink.download = `${APP_NAME}.png`;
	downloadLink.click();
};
*/

// assign structure buttons
let activeButton;
for (const type in structures) {
	const structure = structures[type];
	const button = document.getElementById(`${type.toLowerCase()}-button`);
	if(!button) continue;
	button.onclick = () => {
		mouseObject.mouse.hue = structure.color;
		button.style.borderColor = structure.color;  // TODO: only highlight active button
		//workingLine.structure = type;
		activeButton = type;
	}
}
// initial selected marker
document.getElementById("house-button").click();

/*
// straighten lines
const straightenLinesButton = document.getElementById("straighten-lines-button");
straightenLinesButton.onclick = () => {
	// Simplify each line in displayList
	for (const displayable of displayList) {
		if (displayable instanceof LineDisplayble) {
			const simplifiedPoints = ramerDouglasPeucker(displayable.line.points, 10); // Adjust tolerance as needed
			displayable.line.points = simplifiedPoints;
		}
	}
	sketchCanvas.dispatchEvent(changeDraw); // Re-render the canvas after simplifying
}
*/

// generate button
const generateButton = document.getElementById("generate-button");
generateButton.onclick = () => {
	showDebugText();
	
	// sends sketch data to Phaser scene
	const toPhaser = new CustomEvent("generate", { 
		detail: {sketch: displayList, structures: structures} 
	});
	window.dispatchEvent(toPhaser);
}

//* NORMALIZE STROKES *//
normalizeToggle.onclick = () => {
	normalizing = document.getElementById("normalize-toggle").checked;
	if(normalizing){ normalizeStrokes(); }
}

function normalizeStrokes(){
	// shape-ify each line in displayList
	for (const displayable of displayList) {
		if (displayable instanceof LineDisplayble) {
			if(!displayable.normalized){	// don't re-normalize a stroke that has already been normalized
				displayable.normalized = true;
				const shape = getShape(displayable.line.points);
				//console.log(displayable, shape)
				if(shape){
					displayable.line.points = shape.points;
				} else {
					// for unrecognized shapes, de-noise stroke by running rdp, then chaikin
					const simplified = ramerDouglasPeucker(displayable.line.points, 10); // Adjust tolerance as needed
					const smoothed = chaikinSmooth(simplified, 4);
					displayable.line.points = smoothed;
				}
			}
		}
	}
	sketchCanvas.dispatchEvent(changeDraw); // Re-render the canvas after simplifying
}

// DEBUG: labels strokes' structure types
function showDebugText(){
	//console.log(displayList);
	ctx.fillStyle = "black";      
	for(let d of displayList){
		let line = d.line;
		ctx.fillText(line.structure, line.points[0].x, line.points[0].y)
	}
}

  // KEYBOARD SHORTCUTS
  document.addEventListener('keydown', (e) => {
	if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z"){
		if(e.shiftKey){ redo(); }
		else { undo(); }
	}
  });

function inBounds(point){
	if(point.x < 0 || point.y < 0 || 
		point.x > sketchCanvas.width || point.y > sketchCanvas.height)
	{
		return false;
	}
	return true;
}