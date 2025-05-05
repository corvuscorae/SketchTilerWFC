//* STRAIGHTEN LINES *//
// Ramer-Douglas-Peucker algorithm to simplify lines
export function ramerDouglasPeucker(points, tolerance) {
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

// Helper function to calculate the perpendicular distance from a point to a line
function perpendicularDistance(point, start, end) {
    const numerator = Math.abs((end.y - start.y) * point.x - (end.x - start.x) * point.y + end.x * start.y - end.y * start.x);
    const denominator = Math.sqrt(Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2));
    return numerator / denominator;
}

// Chaikin smoothing
// https://medium.com/@jrespinozah/creating-smooth-curves-with-chaikins-algorithm-a0ad91d98ef7 
export function chaikinSmooth(points, iterations = 2) {
  let result = points;

  for (let iter = 0; iter < iterations; iter++) {
    const newPoints = [result[0]];

    for (let i = 0; i < result.length - 1; i++) {
      const p1 = result[i];
      const p2 = result[i + 1];

      const a = {
        x: 0.75 * p1.x + 0.25 * p2.x,
        y: 0.75 * p1.y + 0.25 * p2.y
      };
      const b = {
        x: 0.25 * p1.x + 0.75 * p2.x,
        y: 0.25 * p1.y + 0.75 * p2.y
      };

      newPoints.push(a, b);
    }

    newPoints.push(result[result.length - 1]);
    result = newPoints;
  }

  return result;
}

