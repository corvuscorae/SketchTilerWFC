import DIRECTIONS from "./directions.js";
import Queue from "./queue.js";
import PerformanceProfiler from "../../5_Utility/PerformanceProfiler.js";
import PriorityQueue from "./priorityQueue.js";
import BigBitmask from "./BigBitmask.js";


export default class ConstraintSolver {
  /**
   * Represents the possibility space of an image in the middle of generation.
   * @type {Cell[][]}
   */
  waveMatrix;

  performanceProfiler = new PerformanceProfiler();

  /**
   * Attempts to solve this.waveMatrix based on learned pattern data.
   * @param {number[]} weights
   * @param {AdjacentPatternsMap[]} adjacencies
   * @param {SetTileInstruction[]} setTiles
   * @param {number} width The width to set this.waveMatrix to.
   * @param {number} height The height to set this.waveMatrix to.
   * @param {number} maxAttempts
   * @param {bool} logProgress Whether to log the progress of this function or not.
   * @param {bool} profile Whether to profile the performance of this function or not.
   * @param {bool} logProfile Whether to log the performance profile of this function or not.
   * @returns {bool} Whether the attempt was successful or not.
   */
  solve(weights, adjacencies, setTileInstructions, width, height, maxAttempts, logProgress, profile, logProfile = false) {
    this.performanceProfiler.clearData();
    this.profileFunctions(profile);

    this.initializeWaveMatrix(weights.length, width, height);
    this.setTiles(setTileInstructions, adjacencies);
    this.priorityQueue = new PriorityQueue((a, b) => a.entropy - b.entropy)

    this.priorityQueue.buildHeap(this.cells);

    let numAttempts = 1;
    while (numAttempts <= maxAttempts) {
      const cell = this.priorityQueue.extractMin();
      
      if(!cell) {
        if (logProgress) console.log(`solved in ${numAttempts} attempt(s)`);
        if (logProfile) this.performanceProfiler.logData();
        console.log(this.performanceProfiler.returnData())
        return true;
      }

      this.observe(cell, weights);

      if (logProgress) console.log("propagating...");
      const contradictionCreated = this.propagate(cell, adjacencies, weights)

      if (contradictionCreated) {
        this.initializeWaveMatrix(weights.length, width, height, weights);
        this.setTiles(setTileInstructions, adjacencies);
        this.priorityQueue.buildHeap(this.cells);
        numAttempts++;
      }
    }

    if (logProgress) console.log("max attempts reached");
    if (logProfile){
      this.performanceProfiler.logData()
    } 
    return false;
  }

  /**
   * Registers/unregisters important member functions to the performance profiler.
   * @param {bool} value Whether to profile (register) or not (unregister).
   */
  profileFunctions(value) {
    if (value) {
      this.initializeWaveMatrix = this.performanceProfiler.register(this.initializeWaveMatrix, false);
      this.setTiles = this.performanceProfiler.register(this.setTiles, false);
      this.getLeastEntropyUnsolvedCellPosition = this.performanceProfiler.register(this.getLeastEntropyUnsolvedCellPosition, false);
      this.getShannonEntropy = this.performanceProfiler.register(this.getShannonEntropy, true);
      this.observe = this.performanceProfiler.register(this.observe, false);
      this.propagate = this.performanceProfiler.register(this.propagate, false);
    } else {
      this.initializeWaveMatrix = this.performanceProfiler.unregister(this.initializeWaveMatrix);
      this.setTiles = this.performanceProfiler.unregister(this.setTiles);
      this.getLeastEntropyUnsolvedCellPosition = this.performanceProfiler.unregister(this.getLeastEntropyUnsolvedCellPosition);
      this.getShannonEntropy = this.performanceProfiler.unregister(this.getShannonEntropy);
      this.observe = this.performanceProfiler.unregister(this.observe);
      this.propagate = this.performanceProfiler.unregister(this.propagate);
    }
  }

  /**
   * Initializes each cell in this.waveMatrix to have every pattern be possible.
   * @param {number} numPatterns Used to create PossiblePatternBitmasks for cells.
   * @param {number} width The width to set this.waveMatrix to.
   * @param {number} height The height to set this.waveMatrix to.
   */
  initializeWaveMatrix(numPatterns, width, height) {
    this.waveMatrix = [];
    this.cells = [];

    const allPatternsPossible = new BigBitmask(numPatterns);
    for (let i = 0; i < numPatterns; i++) allPatternsPossible.setBit(i);

    //const initialEntropy = this.getShannonEntropy(allPatternsPossible, weights)

    for (let y = 0; y < height; y++) {
        this.waveMatrix[y] = [];
        for (let x = 0; x < width; x++) {
            const cell = this.createCell(x, y, BigBitmask.createDeepCopy(allPatternsPossible));
            this.waveMatrix[y][x] = cell;
            this.cells.push(cell);
        }
    }
  }

  /**
   * Creates cell for priority queue
   * @param {number} x 
   */
  createCell(x, y, bitmask) {
    return {
        x,
        y,
        bitmask
    };
  }

  /**
   * Executes the user's set tile instructions.
   * @param {SetTileInstruction[]} setTileInstructions 
   * @param {AdjacentPatternsMap[]} adjacencies
   */
  setTiles(setTileInstructions, adjacencies) {
    for (const [y, x, tilePatternsBitmask] of setTileInstructions) {
      if (y < 0 || y > this.waveMatrix.length-1 || x < 0 || x > this.waveMatrix[0].length-1) {
        console.warn("A set tile instruction asks for a position outside of the wave matrix. Ignoring this instruction.");
        continue;
      }
      this.waveMatrix[y][x].intersectWith(tilePatternsBitmask);
      const contradictionCreated = this.propagate(y, x, adjacencies);
      if (contradictionCreated) throw new Error("User's set tiles formed a contradiction.");
    }
  }

  /**
   * Returns the position of the least entropy unsolved (entropy > 0) cell. If all cells are solved, returns [-1, -1].
   * @param {number[]} weights
   * @returns {number[]} The position of the cell ([y, x]) or [-1, -1] if all cells are solved.
   */
  getLeastEntropyUnsolvedCellPosition(weights) {
    /*
      Build an array containing the positions of all cells tied with the least entropy
      Return the position of a random cell from that array
    */

    let leastEntropy = Infinity;
    let leastEntropyCellPositions = [];

    for (let y = 0; y < this.waveMatrix.length; y++) {
    for (let x = 0; x < this.waveMatrix[0].length; x++) {
      const entropy = this.getShannonEntropy(this.waveMatrix[y][x], weights);
      if (entropy < leastEntropy && entropy > 0) {
        leastEntropy = entropy;
        leastEntropyCellPositions = [[y, x]];
      }
      else if (entropy === leastEntropy) {
        leastEntropyCellPositions.push([y, x]);
      }
    }}

    const len = leastEntropyCellPositions.length;
    if (len > 0) return leastEntropyCellPositions[Math.floor(Math.random() * len)];	// random element (cell position)
    else return [-1, -1];
  }

  /**
   * Returns the Shannon Entropy of a cell using its possible patterns and those patterns' weights.
   * @param {PossiblePatternsBitmask} bitmask 
   * @param {number[]} weights 
   * @returns {number}
   */
  getShannonEntropy(bitmask, weights) {
    const possiblePatterns = bitmask.toArray();

    if (possiblePatterns.length === 0) throw new Error("Contradiction found.");
    if (possiblePatterns.length === 1) return 0;	// what the calculated result would have been

    let sumOfWeights = 0;
    let sumOfWeightLogWeights = 0;
    for (const i of possiblePatterns) {
      const w = weights[i];
      sumOfWeights += w;
      sumOfWeightLogWeights += w * Math.log(w);
    }

    return Math.log(sumOfWeights) - sumOfWeightLogWeights/sumOfWeights;
  }

  /**
   * Picks a pattern for a cell in this.waveMatrix to become.
   * @param {number} y The y position/index of the cell.
   * @param {number} x The x position/index of the cell.
   * @param {number[]} weights 
   */
  observe(cell, weights) {
    // Uses weighted random
    // https://dev.to/jacktt/understanding-the-weighted-random-algorithm-581p

    const possiblePatterns = cell.bitmask.toArray();

    const possiblePatternWeights = [];	// is parallel with possiblePatterns
    let totalWeight = 0;
    for (const i of possiblePatterns) {
      const w = weights[i];
      possiblePatternWeights.push(w);
      totalWeight += w;
    }

    const random = Math.random() * totalWeight;

    let cursor = 0;
    for (let i = 0; i < possiblePatternWeights.length; i++) {
      cursor += possiblePatternWeights[i];
      if (cursor >= random) {
        cell.bitmask.clear();
        cell.bitmask.setBit(possiblePatterns[i]);
        return;
      }
    }

    throw new Error("A pattern wasn't chosen within the for loop");
  }

  /**
   * Adjusts the possible patterns of each cell affected by the observation of a cell.
   * @param {number} y The y position/index of the observed cell.
   * @param {number} x The x position/index of the observed cell.
   * @param {AdjacentPatternsMap[]} adjacencies
   * @returns {boolean} Whether a contradiction was created or not.
   */
  propagate(startCell, adjacencies) {
    const queue = [startCell];

    while (queue.length > 0) {
      const cell1 = queue.shift();
      const cell1Patterns = cell1.bitmask.toArray();


      for (let k = 0; k < DIRECTIONS.length; k++) {	// using k because k is associated with iterating over DIRECTIONS in the ImageProcessor class
        /*
          Given two adjacent cells: cell1 at (y1, x1) and cell2 at (y2, x2)

          Get cell2's currernt possible patterns
          Use the adjacency data of cell1's possible patterns to build a set of all possible patterns cell2 can be
          Create an array for cell2's new possible patterns by taking the shared elements between the two aforementioned data structures 

          If cell2's new possible patterns is the same size as its current: there were no changes - do nothing
          If cell2's new possible patterns is empty: there are no possible patterns cell2 can be - return contradiction
          If cell2's new possible patterns is smaller than its current: there were changes - enqueue cell2 so its adjacent cells can also be adjusted
        */

        const dir = DIRECTIONS[k];
        const dy = -dir[0];	// need to reverse direction or else output will be upside down
        const dx = -dir[1];	// need to reverse direction or else output will be upside down
        const ny = cell1.y+dy;
        const nx = cell1.x+dx;

        // Don't go out of bounds
        if (ny < 0 || ny >= this.waveMatrix.length || nx < 0 || nx >= this.waveMatrix[0].length) continue;

        const cell2 = this.waveMatrix[ny][nx];

        const allowedFromCell1 = new BigBitmask(adjacencies.length);
        for (const pattern of cell1Patterns) {
          const neighborMask = adjacencies[pattern][k];
          if (!neighborMask) {
            console.error("Undefined adjacency:", { pattern, direction: k, row: adjacencies[pattern] });
            continue;
}
          allowedFromCell1.mergeWith(adjacencies[pattern][k]);
        }

        const newBitmask = BigBitmask.AND(cell2.bitmask, allowedFromCell1);

        const contradictionCreated = newBitmask.isEmpty();
        if (contradictionCreated) return true;
        
        const cell2Changed = !BigBitmask.EQUALS(cell2.bitmask, newBitmask);
        if (cell2Changed) {
          cell2.bitmask = newBitmask
          queue.push(cell2);
          
          if (this.priorityQueue) this.priorityQueue.update(cell2)
        }
      }
    }
    return false;	// no contradiction created
  }
}