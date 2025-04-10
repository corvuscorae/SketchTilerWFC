export default class PerformanceProfiler {
	/** The combined total duration of all functions timed (in ms). */
	#combinedTotalDuration = 0;

	/**
	 * A map storing the performance data of all functions timed.
	 * @type {Map<string, { totalDuration: number, numCalls: number }>}
	 * */
	#data = new Map();

	/**
	 * Executes a function and records how long it takes.
	 * @template T
	 * @param {() => T} func use an arrow function to encapsulate the function to be executed (e.g. () => myFunction(args))
	 * @param {string} funcName
	 * @returns {T} whatever the function returns
	 */
	time(func, funcName) {
		const start = performance.now();
		const result = func();
		const duration = performance.now() - start;

		this.#combinedTotalDuration += duration;

		if (this.#data.has(funcName)) {
			this.#data.get(funcName).totalDuration += duration;
			this.#data.get(funcName).numCalls++;
		}
		else {
			this.#data.set(funcName, {
				totalDuration: duration,
				numCalls: 1
			});
		}

		return result;
	}

	/** Console logs the performance data of all functions timed. */
	logData() {
		let message = `Combined Total Duration: ${this.#combinedTotalDuration} ms\n\n`;

		for (const [funcName, perfData] of this.#data) {
			message += `${funcName}():\n`;
			message += `\tAverage Duration: ${perfData.totalDuration / perfData.numCalls} ms\n`
			message += `\tTotal Duration: ${perfData.totalDuration} ms\n`;
			message += `\tNum Calls: ${perfData.numCalls}\n`;
		}

		console.log(message);
	}

	/** Clears all tracked performance data. */
	clearData() {
		this.#combinedTotalDuration = 0;
		this.#data.clear();
	}
}