/*
	Did a lot of AI consulting (ChatGPT) to write register()
	The ideas of returning a wrapped function and using Function.apply() is credited to it
*/

/** Profiles the performances of functions. */
export default class PerformanceProfiler {
	/** @type {Map<string, { totalExecutionTime: number, timesCalled: number }>} */
	data = new Map();

	/**
	 * Registers a function to have its performance data recorded each time it's called. Returns the function back.
	 * @param {Function} func
	 * @returns {Function}
	 */
	register(func) {
		if (!func.name) throw new Error("The function cannot be anonymous (nameless)");
		if (func.original) return func;	// prevent double-wrapping

		const profiler = this;

		/**
		 * A wrapped version of func() that executes like normal but now additionally lets the profiler record its performance data.
		 * @template T func()'s return type
		 * @param {...any} args any amount of arguments
		 * @returns {T} whatever func() returns
		 */
		function func_Registered(...args) {
			const start = performance.now();
			const result = func.apply(this, args);	// execute func() with the same this context as its caller
			const duration = performance.now() - start;
		
			if (profiler.data.has(func.name)) {
				profiler.data.get(func.name).totalExecutionTime += duration;
				profiler.data.get(func.name).timesCalled++;
			}
			else {
				profiler.data.set(func.name, {
					totalExecutionTime: duration,
					timesCalled: 1,
				});
			}
	
			return result;
		}
	
		func_Registered.unregistered = func; // for unwrapping
		return func_Registered;
	}

	/**
	 * Unregisters a function from having its performance data recorded each time it's called.
	 * @param {Function} func
	 * @returns {Function}
	 */
	unregister(func) {
		return func.unregistered ?? func;	// only unwrap if func is wrapped
	}

	/** Console logs the performance data of all functions profiled. */
	logData() {
		let message = "";
		let combinedTotalExecutionTime = 0;

		for (const [funcName, funcData] of this.data) {
			message += `${funcName}():\n`;
			message += `\tTotal Duration: ${funcData.totalExecutionTime} ms\n`;
			message += `\tAverage Duration: ${(funcData.totalExecutionTime / funcData.timesCalled).toFixed(2)} ms\n`
			message += `\tNum Calls: ${funcData.timesCalled}\n`;
			combinedTotalExecutionTime += funcData.totalExecutionTime;
		}
		message += `\nCombined Total Duration: ${combinedTotalExecutionTime} ms`;

		console.log(message);
	}

	/** Clears all tracked performance data. */
	clearData() {
		this.data.clear();
	}
}