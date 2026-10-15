//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/scramble-text/default-chars.mjs
var DEFAULT_SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/scramble-text/get-scramble-char.mjs
function getScrambleChar(chars) {
	const charSet = chars ?? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	if (typeof charSet === "string") return charSet[Math.floor(Math.random() * charSet.length)];
	return charSet[Math.floor(Math.random() * charSet.length)];
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/scramble-text/resolve-stagger.mjs
function resolveStagger(value, index, total, defaultValue) {
	if (typeof value === "function") return value(index, total);
	return value ?? defaultValue;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/scramble-text/index.mjs
function isMotionValue(target) {
	return target !== null && typeof target === "object" && "set" in target && typeof target.set === "function";
}
function resolveElement(elementOrSelector) {
	if (typeof elementOrSelector === "string") return document.querySelector(elementOrSelector);
	return elementOrSelector;
}
function scrambleText(target, options = {}) {
	const { chars, delay: delayOption = 0, duration = 1, interval = .05, onComplete } = options;
	const motionValueMode = isMotionValue(target);
	let originalText;
	let setText;
	if (motionValueMode) {
		originalText = target.get();
		setText = (text) => target.set(text);
	} else {
		const resolvedElement = resolveElement(target);
		if (!resolvedElement) return {
			stop: () => {},
			play: () => {},
			finish: () => {},
			finished: Promise.resolve()
		};
		originalText = resolvedElement.textContent || "";
		setText = (text) => {
			resolvedElement.textContent = text;
		};
	}
	const charCount = originalText.length;
	const charStates = new Array(charCount).fill("idle");
	const cancelFns = new Array(charCount).fill(null);
	let scrambleIntervalId = null;
	let isActive = false;
	let resolveFinished = null;
	const finished = new Promise((resolve) => {
		resolveFinished = resolve;
	});
	function updateDisplay() {
		let display = "";
		for (let i = 0; i < charCount; i++) {
			const char = originalText[i];
			if (char === " " || charStates[i] === "revealed") display += char;
			else if (charStates[i] === "scrambling") display += getScrambleChar(chars);
			else display += char;
		}
		setText(display);
	}
	function checkComplete() {
		if (charStates.every((state, i) => state === "revealed" || originalText[i] === " ")) {
			stopScrambleLoop();
			onComplete?.();
			resolveFinished?.();
		}
	}
	function startScrambleLoop() {
		if (scrambleIntervalId) return;
		scrambleIntervalId = setInterval(updateDisplay, interval * 1e3);
	}
	function stopScrambleLoop() {
		if (scrambleIntervalId) {
			clearInterval(scrambleIntervalId);
			scrambleIntervalId = null;
		}
	}
	function clearAllTimers() {
		for (let i = 0; i < cancelFns.length; i++) if (cancelFns[i]) {
			cancelFns[i]();
			cancelFns[i] = null;
		}
	}
	function scheduleReveal(i, delayMs) {
		const timerId = setTimeout(() => {
			if (!isActive) return;
			charStates[i] = "revealed";
			updateDisplay();
			checkComplete();
		}, delayMs);
		cancelFns[i] = () => clearTimeout(timerId);
	}
	function play() {
		if (isActive) return;
		isActive = true;
		for (let i = 0; i < charCount; i++) if (originalText[i] === " ") charStates[i] = "revealed";
		else {
			const charDelay = resolveStagger(delayOption, i, charCount, 0);
			charStates[i] = charDelay === 0 ? "scrambling" : "idle";
		}
		startScrambleLoop();
		for (let i = 0; i < charCount; i++) {
			if (originalText[i] === " ") continue;
			const charDelay = resolveStagger(delayOption, i, charCount, 0);
			const charDuration = resolveStagger(duration, i, charCount, 0);
			if (charDelay > 0) {
				const timerId = setTimeout(() => {
					if (!isActive) return;
					charStates[i] = "scrambling";
					if (charDuration !== Infinity) scheduleReveal(i, charDuration * 1e3);
				}, charDelay * 1e3);
				cancelFns[i] = () => clearTimeout(timerId);
			} else if (charDuration !== Infinity) scheduleReveal(i, charDuration * 1e3);
		}
		updateDisplay();
	}
	function stop() {
		if (!isActive) return;
		isActive = false;
		clearAllTimers();
		for (let i = 0; i < charCount; i++) charStates[i] = "revealed";
		stopScrambleLoop();
		setText(originalText);
		resolveFinished?.();
	}
	function finish() {
		if (!isActive) return;
		isActive = false;
		clearAllTimers();
		let minOffset = Infinity;
		for (let i = 0; i < charCount; i++) {
			if (originalText[i] === " ") continue;
			const charDuration = resolveStagger(duration, i, charCount, 0);
			if (charDuration !== Infinity) minOffset = Math.min(minOffset, charDuration);
		}
		if (minOffset === Infinity) minOffset = 0;
		for (let i = 0; i < charCount; i++) {
			if (originalText[i] === " ") {
				charStates[i] = "revealed";
				continue;
			}
			const charDuration = resolveStagger(duration, i, charCount, 0);
			const relativeOffset = charDuration === Infinity ? 0 : charDuration - minOffset;
			if (relativeOffset === 0) charStates[i] = "revealed";
			else {
				charStates[i] = "scrambling";
				const timerId = setTimeout(() => {
					charStates[i] = "revealed";
					updateDisplay();
					checkComplete();
				}, relativeOffset * 1e3);
				cancelFns[i] = () => clearTimeout(timerId);
			}
		}
		if (charStates.some((s) => s === "scrambling")) startScrambleLoop();
		else stopScrambleLoop();
		updateDisplay();
		checkComplete();
	}
	play();
	return {
		stop,
		play,
		finish,
		finished
	};
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/typewriter/needs-backspace.mjs
function needsBackspace(currentText, fullText) {
	return currentText.length > fullText.length || currentText.length > 0 && !fullText.startsWith(currentText);
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/typewriter/delay.mjs
/**
* Natural typing variance patterns based on research
* Returns delay as a multiple of the base interval using realistic typing patterns
*/
function mix(a, b, t) {
	return a + (b - a) * t;
}
/**
* Calculate a delay before typing the next character in the text.
*/
function getTypewriterDelay(fullText, currentText, interval, variance, backspaceFactor) {
	if (needsBackspace(currentText, fullText)) return interval * backspaceFactor;
	if (variance === "natural") return getNaturalDelay(fullText, currentText, interval);
	if (typeof variance === "number" && variance > 0) {
		const varianceAmount = interval * (variance / 100);
		return interval + mix(-varianceAmount, varianceAmount, Math.random());
	}
	return interval;
}
function getNaturalDelay(fullText, currentText, interval) {
	const currentIndex = currentText.length;
	const char = fullText[currentIndex];
	const previousChar = fullText[currentIndex - 1];
	if (!char) return interval;
	const lastSpaceIndex = fullText.slice(0, currentIndex).lastIndexOf(" ");
	const positionInWord = currentIndex - lastSpaceIndex - 1;
	const wordStart = lastSpaceIndex + 1;
	const nextSpaceIndex = fullText.slice(currentIndex).indexOf(" ");
	const wordLength = (nextSpaceIndex === -1 ? fullText.length : currentIndex + nextSpaceIndex) - wordStart;
	let delayMultiplier = 1;
	if (previousChar && /[.!?]/.test(previousChar) && char === " ") delayMultiplier *= 3;
	if (wordLength <= 3) delayMultiplier *= .7;
	else {
		if (positionInWord === 0 && char !== " ") delayMultiplier *= 1.5;
		if (positionInWord === wordLength - 1) delayMultiplier *= 1.4;
	}
	if (positionInWord > 0 && positionInWord < wordLength - 1 && wordLength > 3) {
		const middleBoost = Math.min(positionInWord / wordLength, .4);
		delayMultiplier *= 1 - middleBoost;
	}
	if (punctuation.has(char)) delayMultiplier *= 1.5;
	if (shiftRequired.has(char)) delayMultiplier *= 1.5;
	if (/\d/.test(char)) delayMultiplier *= 1.3;
	if (wordLength > 8) delayMultiplier *= 1.3;
	if (char !== char.toLowerCase()) delayMultiplier *= 1.25;
	const fatigueThreshold = 200;
	if (currentIndex > fatigueThreshold) {
		const fatigueAmount = Math.min((currentIndex - fatigueThreshold) / 1e3, .3);
		delayMultiplier *= 1 + fatigueAmount;
	}
	const randomVariance = mix(-.25, .25, Math.random());
	delayMultiplier *= 1 + randomVariance;
	const finalDelay = interval * delayMultiplier;
	return Math.max(interval * .2, finalDelay);
}
var punctuation = /* @__PURE__ */ new Set([
	".",
	",",
	"!",
	"?",
	":",
	";",
	"'",
	"\"",
	"-",
	"(",
	")"
]);
var shiftRequired = /* @__PURE__ */ new Set([
	"!",
	"@",
	"#",
	"$",
	"%",
	"^",
	"&",
	"*",
	"(",
	")",
	"_",
	"+",
	"{",
	"}",
	"|",
	":",
	"\"",
	"<",
	">",
	"?"
]);
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/typewriter/find-previous-word-index.mjs
function findPreviousWordIndex(text, fromIndex) {
	let i = fromIndex - 1;
	while (i >= 0 && /\s/.test(text[i])) i--;
	while (i >= 0 && !/\s/.test(text[i])) i--;
	return Math.max(0, i + 1);
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/typewriter/find-common-prefix-index.mjs
function findCommonPrefixIndex(current, target) {
	const commonPrefixLength = Math.min(current.length, target.length);
	let prefixLength = 0;
	for (let i = 0; i < commonPrefixLength; i++) if (current[i] === target[i]) prefixLength = i + 1;
	else break;
	return prefixLength;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/typewriter/get-next-text.mjs
function getNextText(current, target, replace, backspace) {
	if (replace === "type" && needsBackspace(current, target)) {
		if (backspace === "all") return target.slice(0, findCommonPrefixIndex(current, target));
		else if (backspace === "word") {
			const newLength = findPreviousWordIndex(current, current.length);
			return current.slice(0, newLength);
		} else return current.slice(0, -1);
	}
	return target.slice(0, current.length + 1);
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/wheel/index.mjs
function calcDirection(delta) {
	return -Math.sign(delta);
}
function wheel(element, { axis = "y", onWheel, onSwipe, swipeThreshold = 100, swipeTimeout = 150, jitterThreshold = 2, lineHeight = 16 }) {
	let state = "IDLE";
	/**
	* The accumulated delta value. Once this becomes greater than
	* swipeThreshold, a swipe is triggered. It gets reset to 0 either when
	* swipe is interrupted, or after a timeout from wheel events.
	*/
	let accumulator = 0;
	/**
	* The direction of the swipe.
	* 1 = forward, -1 = backward, 0 = no swipe.
	*/
	let swipeDirection = 0;
	/**
	* The last delta value. Used to detect momentum scrolls and decide
	* when a new wheel sessions has started via touchpad.
	*/
	let lastDelta = 0;
	/**
	* True when the wheel delta is decelerating. If this is true, then further
	* wheel acceleration will be considered a new gesture and wheel events
	* will start firing.
	*/
	let isDecelerating = false;
	let accelerationCount = 0;
	/**
	* Whether the gesture has swiped in the wheel session. This caps the number
	* of swipes per session to 1.
	*/
	let hasSwipedInSession = false;
	/**
	* The timeout ID for the session.
	*/
	let sessionTimeoutId = null;
	const wheelHandler = (event) => {
		const primaryDelta = axis === "x" && !event.shiftKey ? event.deltaX : event.deltaY;
		const perpendicularDelta = axis === "x" && !event.shiftKey ? event.deltaY : event.deltaX;
		if (Math.abs(primaryDelta) < Math.abs(perpendicularDelta)) return;
		if (onWheel || onSwipe) event.preventDefault();
		let delta = -(event.deltaMode === WheelEvent.DOM_DELTA_LINE ? primaryDelta * lineHeight : primaryDelta);
		if (delta === 0) return;
		if (sessionTimeoutId) clearTimeout(sessionTimeoutId);
		sessionTimeoutId = setTimeout(() => {
			state = "IDLE";
			hasSwipedInSession = false;
			accumulator = 0;
		}, swipeTimeout);
		if (state === "IDLE") state = "WHEELING";
		const newDirection = calcDirection(delta);
		function startSwipe(triggeringDelta, currentAccumulator) {
			state = "SWIPING";
			hasSwipedInSession = true;
			swipeDirection = calcDirection(currentAccumulator);
			isDecelerating = false;
			accelerationCount = 0;
			lastDelta = Math.abs(triggeringDelta);
			onSwipe?.(swipeDirection);
			accumulator = Math.abs(currentAccumulator) % swipeThreshold * swipeDirection;
		}
		switch (state) {
			case "WHEELING": {
				const newAccumulator = accumulator + delta;
				if (onSwipe && !hasSwipedInSession && Math.abs(newAccumulator) >= swipeThreshold) startSwipe(delta, newAccumulator);
				else {
					accumulator = newAccumulator;
					onWheel?.(delta);
				}
				break;
			}
			case "SWIPING": {
				const deltaAbs = Math.abs(delta);
				const isDirectionChange = newDirection !== swipeDirection;
				let isMomentumChange = false;
				if (lastDelta > 0) {
					const deltaDiff = deltaAbs - lastDelta;
					if (deltaDiff < 0) isDecelerating = true;
					if (isDecelerating && deltaDiff > jitterThreshold) {
						accelerationCount++;
						if (accelerationCount > 2) isMomentumChange = true;
					} else accelerationCount = 0;
				}
				if (isDirectionChange || isMomentumChange) {
					hasSwipedInSession = false;
					const newAccumulator = delta;
					if (onSwipe && !hasSwipedInSession && Math.abs(newAccumulator) >= swipeThreshold) startSwipe(delta, newAccumulator);
					else {
						state = "WHEELING";
						accumulator = newAccumulator;
						onWheel?.(delta);
					}
					break;
				}
				lastDelta = deltaAbs;
				break;
			}
		}
	};
	element.addEventListener("wheel", wheelHandler, { passive: false });
	return () => {
		if (sessionTimeoutId) clearTimeout(sessionTimeoutId);
		element.removeEventListener("wheel", wheelHandler);
	};
}
//#endregion
export { scrambleText as a, getTypewriterDelay as i, getNextText as n, DEFAULT_SCRAMBLE_CHARS as o, findPreviousWordIndex as r, wheel as t };
