export class LineDisplayble {
	constructor(line) { this.line = line; }
	
	display(ctx) {
		ctx.lineWidth = this.line.thickness;
		ctx.beginPath();
		ctx.moveTo(this.line.points[0].x, this.line.points[0].y); //get to line start
		for (const { x, y } of this.line.points) {
			ctx.lineTo(x, y);
		}

		ctx.strokeStyle = this.line.hue;
		ctx.stroke();
	}
}

export class mouseDisplayable {
	constructor(mouse, lineThickness) { 
		this.mouse = mouse; 
		this.lineThickness = lineThickness;
	}
	
	display(ctx) {
		if (!this.mouse.active) {
			ctx.lineWidth = 2;
			ctx.beginPath();
			//if (this.mouse.sticker == null) {
				ctx.arc(
					this.mouse.x,
					this.mouse.y,
					this.lineThickness,
					0,
					2 * Math.PI,
					false,
				);
				ctx.fillStyle = this.mouse.hue;
				ctx.fill();
			//} else {
			//  ctx.fillText(this.mouse.sticker.emoji, this.mouse.x, this.mouse.y);
			//}
		}
	}
}