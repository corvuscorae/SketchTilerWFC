/** Records data on the performances of the functions you give it. */
export default class PerformanceProfiler {

	#combinedTotalExecutionTime = 0;

	/** @type {Map<string, { totalExecutionTime: number, timesCalled: number }>} */
	#data = new Map();

	/**
	 * Executes a function and records its performance data.
	 * @template T the return type of the function to be executed
	 * @param {() => T} func use an arrow function to encapsulate the function to be executed (e.g. () => myFunction(args)) so you maintain the "this" context
	 * @param {string} funcName
	 * @returns {T} whatever the function returns
	 */
	profile(func, funcName) {
		const start = performance.now();
		const result = func();
		const duration = performance.now() - start;

		this.#combinedTotalExecutionTime += duration;

		if (this.#data.has(funcName)) {
			this.#data.get(funcName).totalExecutionTime += duration;
			this.#data.get(funcName).timesCalled++;
		}
		else {
			this.#data.set(funcName, {
				totalExecutionTime: duration,
				timesCalled: 1
			});
		}

		return result;
	}

	/** Console logs the performance data of all functions timed. */
	logData() {
		let message = `Combined Total Duration: ${this.#combinedTotalExecutionTime} ms\n\n`;

		for (const [funcName, funcData] of this.#data) {
			message += `${funcName}():\n`;
			message += `\tTotal Duration: ${funcData.totalExecutionTime} ms\n`;
			message += `\tAverage Duration: ${(funcData.totalExecutionTime / funcData.timesCalled).toFixed(2)} ms\n`
			message += `\tNum Calls: ${funcData.timesCalled}\n`;
		}

		console.log(message);
	}

	/** Clears all tracked performance data. */
	clearData() {
		this.#combinedTotalExecutionTime = 0;
		this.#data.clear();
	}
}