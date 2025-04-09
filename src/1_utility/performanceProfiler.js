export default class PerformanceProfiler {
	/** The combined total duration of all functions timed (in ms). */
	#combinedTotalDuration = 0;

	/**
	 * Stores the names of all functions timed and their total durations (in ms) and number of calls.
	 * @description <funcName: string, [totalDuration: number, numCalls: number]>
	 * */
	#data = new Map();

	/**
	 * Executes a function and records how long it takes.
	 * @param {Function} func
	 * @param {any[]} args an array storing the arguments for the function
	 * @returns {any} whatever the function returns
	 */
	timeFunction(func, args) {
		const start = performance.now();
		const result = func(...args);
		const duration = performance.now() - start;

		this.#combinedTotalDuration += duration;

		if (this.#data.has(func.name)) {
			this.#data.get(func.name)[0] += duration;
			this.#data.get(func.name)[1]++;
		}
		else this.#data.set(func.name, [duration, 1]);

		return result;
	}

	/** Console logs the combined total duration of all functions timed and each function's average duration. */
	logData() {
		let message = `Combined Total Duration: ${this.#combinedTotalDuration} ms`;

		for (const [funcName, data] of this.#data) {
			message += `
			${funcName}():
				Total Duration: ${data[0]} ms
				Num Calls: ${data[1]}
				Average Duration: ${data[0] / data[1]} ms
			`;
		}

		console.log(message);
	}

	clearData() {
		this.#combinedTotalDuration = 0;
		this.#data.clear();
	}
}