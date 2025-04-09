//import "./style.css";

const APP_NAME = "Sketch Co-Collaborate";
const app = document.querySelector("#app");

document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
app.append(canvas);
canvas.width = 1280;
canvas.height = 720;
canvas.style.cursor = "none";

context.font = "30px serif";

// Button container for proper styling
const buttonContainer = document.createElement("div");
buttonContainer.classList.add("button-container"); // Add a class for CSS styling
app.append(buttonContainer);


//interface Displayable {
//  display(ctx: CanvasRenderingContext2D): void;
//}
//
//interface Point {
//  x: number;
//  y: number;
//}

//type Line = { points: Array<Point>; thickness: number; hue: number, structure: string };

const lineThickness = 5;
let workingLine = { points: [], thickness: lineThickness, hue: 0, structure: "House" };

class LineDisplayble {
  constructor(line) { this.line = line; }
  
  display(ctx) {
    ctx.lineWidth = this.line.thickness;
    ctx.beginPath();
    ctx.moveTo(this.line.points[0].x, this.line.points[0].y); //get to line start
    for (const { x, y } of this.line.points) {
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `hsl(${this.line.hue}, 100%, 50%)`;
    ctx.stroke();
  }
}

let displayList = []; 
let redoDisplayList = [];

const changeDraw = new Event("drawing-changed"); //When changeDraw is dispatched, the drawing area will be repainted.

canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const d of displayList) {
    d.display(context);
  }
});

//interface Sticker {
//  x: number;
//  y: number;
//  emoji: string;
//}

class stickerDisplayable {
  constructor(sticker) { this.sticker = sticker; }
  
  display(ctx) {
    if (this.sticker != null) {
      ctx.fillText(this.sticker.emoji, this.sticker.x, this.sticker.y);
    }
  }
}

let currentSticker = new stickerDisplayable(null);

//interface Mouse {
//  x: number;
//  y: number;
//  hue: number;
//  active: boolean;
//  sticker: Sticker | null;
//}

class mouseDisplayable {
  constructor(mouse) { this.mouse = mouse; }
  
  display(ctx) {
    if (!this.mouse.active) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (this.mouse.sticker == null) {
        ctx.arc(
          this.mouse.x,
          this.mouse.y,
          lineThickness,
          0,
          2 * Math.PI,
          false,
        );
        ctx.fillStyle = `hsl(${this.mouse.hue}, 100%, 50%)`;
        ctx.fill();
      } else {
        ctx.fillText(this.mouse.sticker.emoji, this.mouse.x, this.mouse.y);
      }
    }
  }
}

let mouseObject = new mouseDisplayable({
  x: 0,
  y: 0,
  hue: 0,
  active: false,
  sticker: null,
});

const movedTool = new Event("tool-moved");

canvas.addEventListener("tool-moved", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const d of displayList) {
    d.display(context);
  }
  mouseObject.display(context);
  currentSticker.display(context);
});

canvas.addEventListener("mousedown", (ev) => {
  mouseObject = new mouseDisplayable({
    x: ev.offsetX,
    y: ev.offsetY,
    hue: mouseObject.mouse.hue,
    active: true,
    sticker: currentSticker.sticker,
  });
  if (currentSticker.sticker == null) {
    workingLine = {
      points: [{ x: mouseObject.mouse.x, y: mouseObject.mouse.y }],
      thickness: lineThickness,
      hue: mouseObject.mouse.hue,
      structure: workingLine.structure
    };
    displayList.push(new LineDisplayble(workingLine));
  } else {
    currentSticker.sticker.x = ev.offsetX;
    currentSticker.sticker.y = ev.offsetY;
  }
  canvas.dispatchEvent(changeDraw);
  canvas.dispatchEvent(movedTool);
});

canvas.addEventListener("mousemove", (ev) => {
  mouseObject = new mouseDisplayable({
    x: ev.offsetX,
    y: ev.offsetY,
    hue: mouseObject.mouse.hue,
    active: mouseObject.mouse.active,
    sticker: currentSticker.sticker,
  });
  if (mouseObject?.mouse.active) {
    if (currentSticker.sticker == null) {
      workingLine.points.push({
        x: mouseObject.mouse.x,
        y: mouseObject.mouse.y,
      });
      canvas.dispatchEvent(changeDraw);
    } else {
      currentSticker.sticker.x = ev.offsetX;
      currentSticker.sticker.y = ev.offsetY;
    }
  }
  canvas.dispatchEvent(movedTool);
});

canvas.addEventListener("mouseup", (ev) => {
  mouseObject = new mouseDisplayable({
    x: ev.offsetX,
    y: ev.offsetY,
    hue: mouseObject.mouse.hue,
    active: false,
    sticker: currentSticker.sticker,
  });
  if (currentSticker.sticker != null) {
    currentSticker.sticker.x = ev.offsetX;
    currentSticker.sticker.y = ev.offsetY;
    displayList.push(currentSticker);
    currentSticker = new stickerDisplayable(null); //Switch back to pen once sticker is placed.
  }
  canvas.dispatchEvent(changeDraw);
  canvas.dispatchEvent(movedTool);
});

// Buttons:
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Drawing";
buttonContainer.append(clearButton);

clearButton.onclick = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  displayList = [];
  redoDisplayList = [];
};

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
buttonContainer.append(undoButton);

undoButton.onclick = () => {
  const toRedo = displayList.pop();
  if (toRedo != undefined) {
    redoDisplayList.push(toRedo);
  }
  canvas.dispatchEvent(changeDraw);
};

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
buttonContainer.append(redoButton);

redoButton.onclick = () => {
  const toDisplay = redoDisplayList.pop();
  if (toDisplay != undefined) {
    displayList.push(toDisplay);
  }

  canvas.dispatchEvent(changeDraw);
};

/*
const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin Line";
buttonContainer.append(thinButton);

thinButton.onclick = () => {
  mouseObject.mouse.sticker = null;
  currentSticker = new stickerDisplayable(null);
  lineThickness = 2;
};

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick Line";
buttonContainer.append(thickButton);

thickButton.onclick = () => {
  mouseObject.mouse.sticker = null;
  currentSticker = new stickerDisplayable(null);
  lineThickness = 5;
};

let stickerNumber = 1;
function makeStickerButton(emoji: string): void {
  const emojiButton = document.createElement("button");
  emojiButton.innerHTML = "Emoji Sticker " + stickerNumber + ": " + emoji;
  buttonContainer.append(emojiButton);
  stickerNumber++;

  emojiButton.onclick = () => {
    currentSticker = new stickerDisplayable({
      x: currentSticker.sticker?.x!,
      y: currentSticker.sticker?.y!,
      emoji: emoji,
    });
  };
}


makeStickerButton("🤡");
makeStickerButton("😭");
makeStickerButton("🤩");


const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "Create a Custom Sticker";
buttonContainer.append(customStickerButton);

customStickerButton.onclick = () => {
  const newEmoji = prompt("Enter New Emoji Sticker Here:", "🤨");
  if (newEmoji != null) {
    makeStickerButton(newEmoji);
  }
};
*/

//Was able to talk through with Brace how to make this code
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

function makeColorButton(name, hue) {
  const hueButton = document.createElement("button");
  hueButton.innerHTML = name; 

  buttonContainer.append(hueButton);

  hueButton.onclick = () => {
    mouseObject.mouse.hue = hue;
    hueButton.style.borderColor = `hsl(${hue}, 100%, 50%)`;
    workingLine.structure = name.substring(1, name.length-1);
  };
}

makeColorButton("🏠House🏠", 0);
makeColorButton("🧱Fence🧱", 49);
makeColorButton("🌲Forest🌲", 131);
makeColorButton("🌐Path🌐", 268);

// Helper function to calculate the perpendicular distance from a point to a line
function perpendicularDistance(point, start, end) {
  const numerator = Math.abs((end.y - start.y) * point.x - (end.x - start.x) * point.y + end.x * start.y - end.y * start.x);
  const denominator = Math.sqrt(Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2));
  return numerator / denominator;
}

// Ramer-Douglas-Peucker algorithm to simplify lines
function ramerDouglasPeucker(points, tolerance) {
  // Find the point with the maximum perpendicular distance
  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  // If the maximum distance is greater than the tolerance, recursively simplify
  if (dmax > tolerance) {
    const left = ramerDouglasPeucker(points.slice(0, index + 1), tolerance);
    const right = ramerDouglasPeucker(points.slice(index), tolerance);
    return [...left.slice(0, left.length - 1), ...right];
  } else {
    return [points[0], points[end]];
  }
}

// Add a button to straighten lines
const straightenButton = document.createElement("button");
straightenButton.innerHTML = "Straighten Lines";
buttonContainer.append(straightenButton);

// When the button is clicked, straighten the lines
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
