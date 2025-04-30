import { canvas, context, buttonContainer, drawGrid } from "./2_Utility/init.js";
import { ramerDouglasPeucker } from "./2_Utility/lineCleanup.js";
import { LineDisplayble, mouseDisplayable } from "./1_Classes/displayables.js";

// TODO: UIX cleanup (after we get wireframes)
drawGrid();

//* DRAWING *//
const lineThickness = 5;
let workingLine = { points: [], thickness: lineThickness, hue: 0, structure: null };
let mouseObject = new mouseDisplayable({
  x: 0,
  y: 0,
  hue: 0,
  active: false,
}, lineThickness);

let displayList = []; 
let redoDisplayList = [];

// define structures
// NOTE: regions can be "box" or "trace",
//    this will be the region that structure generators use to place tiles.
let structures = [  
  {key: "House" , color: '#f54242', region: "box"   },
  {key: "Forest", color: '#009632', region: "box"   },
  {key: "Fence" , color: '#f5c842', region: "trace" },
  {key: "Path"  , color: '#8000ff', region: "trace" },
]
let structureSketches = { lastIndex: -1 }
structures.forEach((s) => {
  structureSketches[s.key] = {
    info: s,
    strokes: []
  }
});
console.log(structureSketches); // DEBUG

//* EVENTS *//
// sends sketch data to Phaser scene
const toPhaser = new CustomEvent('sketchToPhaser', { detail: structureSketches });

// updates phaser scene, clearing structures
const clearPhaser = new CustomEvent('clearSketch');

// When changeDraw is dispatched, the drawing area will be repainted.
const changeDraw = new Event("drawing-changed"); 
canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const d of displayList) {
    d.display(context);
  }
});

// move tool/cursor around canvas
const movedTool = new Event("tool-moved");
canvas.addEventListener("tool-moved", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const d of displayList) {
    d.display(context);
  }
  mouseObject.display(context);
});

// mouse click event, start drawing
canvas.addEventListener("mousedown", (ev) => {
  mouseObject = new mouseDisplayable({
    x: ev.offsetX,
    y: ev.offsetY,
    hue: mouseObject.mouse.hue,
    active: true,
  }, lineThickness);
    workingLine = {
      points: [{ x: mouseObject.mouse.x, y: mouseObject.mouse.y }],
      thickness: lineThickness,
      hue: mouseObject.mouse.hue,
      structure: workingLine.structure
    };
    displayList.push(new LineDisplayble(workingLine));
  canvas.dispatchEvent(changeDraw);
  canvas.dispatchEvent(movedTool);
});

// mouse move event, draw on canvas
canvas.addEventListener("mousemove", (ev) => {
  mouseObject = new mouseDisplayable({
    x: ev.offsetX,
    y: ev.offsetY,
    hue: mouseObject.mouse.hue,
    active: mouseObject.mouse.active,
  }, lineThickness);
  if (mouseObject?.mouse.active) {
      workingLine.points.push({
        x: mouseObject.mouse.x,
        y: mouseObject.mouse.y,
      });
      canvas.dispatchEvent(changeDraw);
  }
  canvas.dispatchEvent(movedTool);
});

// mouse up event, stop drawing
canvas.addEventListener("mouseup", (ev) => {
  mouseObject = new mouseDisplayable({
    x: ev.offsetX,
    y: ev.offsetY,
    hue: mouseObject.mouse.hue,
    active: false,
  }, lineThickness);
  updateStructureSketchHistory();
  canvas.dispatchEvent(changeDraw);
  canvas.dispatchEvent(movedTool);
});

//* BUTTONS *//
// clear drawing
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Drawing";
buttonContainer.append(clearButton);
clearButton.onclick = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  displayList = [];
  redoDisplayList = [];
  clearStructureSketchHistory();
  window.dispatchEvent(clearPhaser);
};

// undo last stroke
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
buttonContainer.append(undoButton);
undoButton.onclick = () => {
  // TODO: optimize?
  //    would be better to just remove the stroke in question but this works for now
  clearStructureSketchHistory();      
  const toRedo = displayList.pop();
  if (toRedo != undefined) {
    redoDisplayList.push(toRedo);
  }
  canvas.dispatchEvent(changeDraw);
};

// redo last stroke
const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
buttonContainer.append(redoButton);
redoButton.onclick = () => {
  // TODO: optimize?
  //    would be better to just remove the stroke in question but this works for now
  clearStructureSketchHistory();
  const toDisplay = redoDisplayList.pop();
  if (toDisplay != undefined) {
    displayList.push(toDisplay);
  }

  canvas.dispatchEvent(changeDraw);
};

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

// make button for each structure
structures.forEach((s) => makePen(s.key, s.color));
function makePen(name, hue) {
  const hueButton = document.createElement("button");
  hueButton.innerHTML = name; 
  hueButton.dataset.structure = name;
  buttonContainer.append(hueButton);

  hueButton.onclick = () => {
    mouseObject.mouse.hue = hue;
    hueButton.style.borderColor = hue;  // TODO: only highlight active button
    workingLine.structure = name;
  };
}
// simulate clicking the button for "House" 
const initButton = document.querySelector('[data-structure="House"]');
if(initButton) initButton.click();

// Straighten lines
const straightenButton = document.createElement("button");
straightenButton.innerHTML = "Straighten Lines";
buttonContainer.append(straightenButton);
straightenButton.onclick = () => {
  // Simplify each line in displayList
  for (const displayable of displayList) {
    if (displayable instanceof LineDisplayble) {
      const simplifiedPoints = ramerDouglasPeucker(displayable.line.points, 10); // Adjust tolerance as needed
      displayable.line.points = simplifiedPoints;
    }
  }
  
  canvas.dispatchEvent(changeDraw); // Re-render the canvas after simplifying
};


// send sketch data to Phaser Scene
const sendSketchButton = document.createElement("button");
sendSketchButton.innerHTML = "Generate";
buttonContainer.append(sendSketchButton);
sendSketchButton.onclick = () => { 
  showDebugText();
  window.dispatchEvent(toPhaser);
}


//* STRUCTURES ORGANIZATION *//
// organize displayList by structure,
function updateStructureSketchHistory(){
  // only add new strokes (added since last generation call)
  for(let i = structureSketches.lastIndex + 1; i < displayList.length; i++){
    let stroke = displayList[i].line;
      // ignore invis "strokes" and non-structure strokes
    if(stroke.points.length > 1 && stroke.structure){ 
      structureSketches[stroke.structure].strokes.push(stroke.points);
    }
  }

  structureSketches.lastIndex = displayList.length - 1;
}

// clears drawn points from structure history
function clearStructureSketchHistory(){
  for(let s in structureSketches){
    if(structureSketches[s].strokes){ 
      structureSketches[s].strokes = []; 
    }
  }
  structureSketches.lastIndex = -1;

}

// DEBUG: labels strokes' structure types
function showDebugText(){
  updateStructureSketchHistory();
  for(let s in structureSketches){
    if(structureSketches[s].strokes){
      structureSketches[s].strokes.forEach((ln) => {
        context.fillStyle = "black";      
        context.fillText(s, ln[0].x, ln[0].y)
      })
    }
  }
}
