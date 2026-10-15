"use client";
import { n as __toESM, t as __commonJSMin } from "./rolldown-runtime-BPOCksWG.js";
import { Aa as easeOut, Bi as frame, Bn as buildSVGAttrs, C as resolveMotionValue, Ci as JSAnimation, Ct as setFeatureDefinitions, Et as prefersReducedMotion$1, F as eachAxis, Fr as collectMotionValues, Ga as millisecondsToSeconds, Hn as buildHTMLStyles, Ir as motionValue, Ja as progress, Ka as secondsToMilliseconds, Lt as createBox, Mn as convertBoxToBoundingBox, Mt as isVariantLabel, Nr as resolveTransition$1, Nt as isAnimationControls, O as addDomEvent, Ot as isControllingVariants, Qi as mixNumber, Qn as isHTMLElement, Sa as frameData, St as getFeatureDefinitions, Tr as resolveVariantFromProps, Tt as hasReducedMotionListener, Ua as warnOnce, Ui as mix, Va as wrap, Wt as attachSpring, Xa as noop, Xt as transform, Y as calcLength, Ya as pipe, br as isMotionValue, ct as scrapeMotionValuesFromProps$1, g as nodeGroup, hr as optimizedAppearDataAttribute, ht as isForcedMotionValue, in as press, io as clamp, jn as convertBoundingBoxToBox, kr as animateMotionValue, kt as isVariantNode, ln as hover, m as HTMLProjectionNode, mn as microtask, mt as scrapeMotionValuesFromProps, n as distance2D, nn as resize, no as invariant, o as animateMini, on as isElementTextInput, ot as createAnimationState, pt as HTMLVisualElement, r as inView, ro as warning, s as animate, sa as percent, sn as isPrimaryPointer, st as SVGVisualElement, un as setDragLock, ut as isSVGTag, vn as measurePageBox, vr as addValueToWillChange, w as delay, wr as resolveVariant, wt as initPrefersReducedMotion, x as globalProjectionState, xa as time, yt as Feature, zi as cancelFrame } from "./es-CzJv5fVJ.js";
import { a as scrambleText, i as getTypewriterDelay, n as getNextText, t as wheel } from "./wheel-Dcyxphb8.js";
import { t as require_react } from "./react.js";
import { t as require_react_dom } from "./react-dom-D8pswQzl.js";
//#region ets-grid-site/node_modules/react/cjs/react-jsx-runtime.development.js
/**
* @license React
* react-jsx-runtime.development.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_development = /* @__PURE__ */ __commonJSMin(((exports) => {
	(function() {
		function getComponentNameFromType(type) {
			if (null == type) return null;
			if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
			if ("string" === typeof type) return type;
			switch (type) {
				case REACT_FRAGMENT_TYPE: return "Fragment";
				case REACT_PROFILER_TYPE: return "Profiler";
				case REACT_STRICT_MODE_TYPE: return "StrictMode";
				case REACT_SUSPENSE_TYPE: return "Suspense";
				case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
				case REACT_ACTIVITY_TYPE: return "Activity";
				case REACT_VIEW_TRANSITION_TYPE: return "ViewTransition";
			}
			if ("object" === typeof type) switch ("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof) {
				case REACT_PORTAL_TYPE: return "Portal";
				case REACT_CONTEXT_TYPE: return type.displayName || "Context";
				case REACT_CONSUMER_TYPE: return (type._context.displayName || "Context") + ".Consumer";
				case REACT_FORWARD_REF_TYPE:
					var innerType = type.render;
					type = type.displayName;
					type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
					return type;
				case REACT_MEMO_TYPE: return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
				case REACT_LAZY_TYPE:
					innerType = type._payload;
					type = type._init;
					try {
						return getComponentNameFromType(type(innerType));
					} catch (x) {}
			}
			return null;
		}
		function testStringCoercion(value) {
			return "" + value;
		}
		function checkKeyStringCoercion(value) {
			try {
				testStringCoercion(value);
				var JSCompiler_inline_result = !1;
			} catch (e) {
				JSCompiler_inline_result = !0;
			}
			if (JSCompiler_inline_result) {
				JSCompiler_inline_result = console;
				var JSCompiler_temp_const = JSCompiler_inline_result.error;
				var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
				JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
				return testStringCoercion(value);
			}
		}
		function getTaskName(type) {
			if (type === REACT_FRAGMENT_TYPE) return "<>";
			if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
			try {
				var name = getComponentNameFromType(type);
				return name ? "<" + name + ">" : "<...>";
			} catch (x) {
				return "<...>";
			}
		}
		function getOwner() {
			var dispatcher = ReactSharedInternals.A;
			return null === dispatcher ? null : dispatcher.getOwner();
		}
		function UnknownOwner() {
			return Error("react-stack-top-frame");
		}
		function hasValidKey(config) {
			if (hasOwnProperty.call(config, "key")) {
				var getter = Object.getOwnPropertyDescriptor(config, "key").get;
				if (getter && getter.isReactWarning) return !1;
			}
			return void 0 !== config.key;
		}
		function defineKeyPropWarningGetter(props, displayName) {
			function warnAboutAccessingKey() {
				specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
			}
			warnAboutAccessingKey.isReactWarning = !0;
			Object.defineProperty(props, "key", {
				get: warnAboutAccessingKey,
				configurable: !0
			});
		}
		function elementRefGetterWithDeprecationWarning() {
			var componentName = getComponentNameFromType(this.type);
			didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
			componentName = this.props.ref;
			return void 0 !== componentName ? componentName : null;
		}
		function ReactElement(type, key, props, owner, debugStack, debugTask) {
			var refProp = props.ref;
			type = {
				$$typeof: REACT_ELEMENT_TYPE,
				type,
				key,
				props,
				_owner: owner
			};
			null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
				enumerable: !1,
				get: elementRefGetterWithDeprecationWarning
			}) : Object.defineProperty(type, "ref", {
				enumerable: !1,
				value: null
			});
			type._store = {};
			Object.defineProperty(type._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			});
			Object.defineProperty(type, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			});
			Object.defineProperty(type, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: debugStack
			});
			Object.defineProperty(type, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: debugTask
			});
			Object.freeze && (Object.freeze(type.props), Object.freeze(type));
			return type;
		}
		function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
			var children = config.children;
			if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
				for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++) validateChildKeys(children[isStaticChildren]);
				Object.freeze && Object.freeze(children);
			} else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
			else validateChildKeys(children);
			if (hasOwnProperty.call(config, "key")) {
				children = getComponentNameFromType(type);
				var keys = Object.keys(config).filter(function(k) {
					return "key" !== k;
				});
				isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
				didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error("A props object containing a \"key\" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />", isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
			}
			children = null;
			void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
			hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
			if ("key" in config) {
				maybeKey = {};
				for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
			} else maybeKey = config;
			children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
			return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
		}
		function validateChildKeys(node) {
			isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
		}
		function isValidElement(object) {
			return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
		}
		var React = require_react(), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
			return null;
		};
		React = { react_stack_bottom_frame: function(callStackForError) {
			return callStackForError();
		} };
		var specialPropKeyWarningShown;
		var didWarnAboutElementRef = {};
		var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
		var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
		var didWarnAboutKeySpread = {};
		exports.Fragment = REACT_FRAGMENT_TYPE;
		exports.jsx = function(type, config, maybeKey) {
			var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
			if (trackActualOwner) {
				var previousStackTraceLimit = Error.stackTraceLimit;
				Error.stackTraceLimit = 10;
				var debugStackDEV = Error("react-stack-top-frame");
				Error.stackTraceLimit = previousStackTraceLimit;
			} else debugStackDEV = unknownOwnerDebugStack;
			return jsxDEVImpl(type, config, maybeKey, !1, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
		};
		exports.jsxs = function(type, config, maybeKey) {
			var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
			if (trackActualOwner) {
				var previousStackTraceLimit = Error.stackTraceLimit;
				Error.stackTraceLimit = 10;
				var debugStackDEV = Error("react-stack-top-frame");
				Error.stackTraceLimit = previousStackTraceLimit;
			} else debugStackDEV = unknownOwnerDebugStack;
			return jsxDEVImpl(type, config, maybeKey, !0, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
		};
	})();
}));
//#endregion
//#region ets-grid-site/node_modules/react/jsx-runtime.js
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_development();
}));
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/context/LayoutGroupContext.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var LayoutGroupContext = (0, import_react.createContext)({});
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/use-constant.mjs
/**
* Creates a constant value over the lifecycle of a component.
*
* Even if `useMemo` is provided an empty array as its final argument, it doesn't offer
* a guarantee that it won't re-run for performance reasons later on. By using `useConstant`
* you can ensure that initialisers don't execute twice or more.
*/
function useConstant(init) {
	const ref = (0, import_react.useRef)(null);
	if (ref.current === null) ref.current = init();
	return ref.current;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/use-isomorphic-effect.mjs
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? import_react.useLayoutEffect : import_react.useEffect;
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/context/PresenceContext.mjs
/**
* @public
*/
var PresenceContext = /* @__PURE__ */ (0, import_react.createContext)(null);
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/context/MotionConfigContext.mjs
/**
* @public
*/
var MotionConfigContext = (0, import_react.createContext)({
	transformPagePoint: (p) => p,
	isStatic: false,
	reducedMotion: "never"
});
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/use-composed-ref.mjs
/**
* Taken from https://github.com/radix-ui/primitives/blob/main/packages/react/compose-refs/src/compose-refs.tsx
*/
/**
* Set a given ref to a given value
* This utility takes care of different types of refs: callback refs and RefObject(s)
*/
function setRef(ref, value) {
	if (typeof ref === "function") return ref(value);
	else if (ref !== null && ref !== void 0) ref.current = value;
}
/**
* A utility to compose multiple refs together
* Accepts callback refs and RefObject(s)
*/
function composeRefs(...refs) {
	return (node) => {
		let hasCleanup = false;
		const cleanups = refs.map((ref) => {
			const cleanup = setRef(ref, node);
			if (!hasCleanup && typeof cleanup === "function") hasCleanup = true;
			return cleanup;
		});
		if (hasCleanup) return () => {
			for (let i = 0; i < cleanups.length; i++) {
				const cleanup = cleanups[i];
				if (typeof cleanup === "function") cleanup();
				else setRef(refs[i], null);
			}
		};
	};
}
/**
* A custom hook that composes multiple refs
* Accepts callback refs and RefObject(s)
*/
function useComposedRefs(...refs) {
	return import_react.useCallback(composeRefs(...refs), refs);
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/components/AnimatePresence/PopChild.mjs
var import_jsx_runtime = require_jsx_runtime();
/**
* Measurement functionality has to be within a separate component
* to leverage snapshot lifecycle.
*/
var PopChildMeasure = class extends import_react.Component {
	getSnapshotBeforeUpdate(prevProps) {
		const element = this.props.childRef.current;
		if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
			const parent = element.offsetParent;
			const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
			const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
			const computedStyle = getComputedStyle(element);
			const size = this.props.sizeRef.current;
			size.height = parseFloat(computedStyle.height);
			size.width = parseFloat(computedStyle.width);
			size.top = element.offsetTop;
			size.left = element.offsetLeft;
			size.right = parentWidth - size.width - size.left;
			size.bottom = parentHeight - size.height - size.top;
			size.direction = computedStyle.direction;
		}
		return null;
	}
	/**
	* Required with getSnapshotBeforeUpdate to stop React complaining.
	*/
	componentDidUpdate() {}
	render() {
		return this.props.children;
	}
};
function PopChild({ children, isPresent, anchorX, anchorY, root, pop }) {
	const id = (0, import_react.useId)();
	const ref = (0, import_react.useRef)(null);
	const size = (0, import_react.useRef)({
		width: 0,
		height: 0,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		direction: "ltr"
	});
	const { nonce } = (0, import_react.useContext)(MotionConfigContext);
	const composedRef = useComposedRefs(ref, pop !== false ? children.props?.ref ?? children?.ref : void 0);
	/**
	* We create and inject a style block so we can apply this explicit
	* sizing in a non-destructive manner by just deleting the style block.
	*
	* We can't apply size via render as the measurement happens
	* in getSnapshotBeforeUpdate (post-render), likewise if we apply the
	* styles directly on the DOM node, we might be overwriting
	* styles set via the style prop.
	*/
	(0, import_react.useInsertionEffect)(() => {
		const { width, height, top, left, right, bottom, direction } = size.current;
		if (isPresent || pop === false || !ref.current || !width || !height) return;
		const isRTL = direction === "rtl";
		const x = anchorX === "left" ? isRTL ? `right: ${right}` : `left: ${left}` : isRTL ? `left: ${left}` : `right: ${right}`;
		const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
		const element = ref.current;
		element.dataset.motionPopId = id;
		/**
		* Use the element's own document so this works when rendering
		* into another window or iframe (e.g. via window.open()).
		*/
		const doc = element.ownerDocument;
		const style = doc.createElement("style");
		if (nonce) style.nonce = nonce;
		const parent = root ?? doc.head;
		parent.appendChild(style);
		if (style.sheet) style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
		return () => {
			ref.current?.removeAttribute("data-motion-pop-id");
			if (parent.contains(style)) parent.removeChild(style);
		};
	}, [isPresent]);
	return (0, import_jsx_runtime.jsx)(PopChildMeasure, {
		isPresent,
		childRef: ref,
		sizeRef: size,
		pop,
		children: pop === false ? children : import_react.cloneElement(children, { ref: composedRef })
	});
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/components/AnimatePresence/PresenceChild.mjs
var PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
	const presenceChildren = useConstant(newChildrenMap);
	const id = (0, import_react.useId)();
	const isPresentRef = (0, import_react.useRef)(isPresent);
	const onExitCompleteRef = (0, import_react.useRef)(onExitComplete);
	useIsomorphicLayoutEffect(() => {
		isPresentRef.current = isPresent;
		onExitCompleteRef.current = onExitComplete;
	});
	let isReusedContext = true;
	let context = (0, import_react.useMemo)(() => {
		isReusedContext = false;
		return {
			id,
			initial,
			isPresent,
			custom,
			onExitComplete: (childId) => {
				presenceChildren.set(childId, true);
				for (const isComplete of presenceChildren.values()) if (!isComplete) return;
				onExitComplete && onExitComplete();
			},
			register: (childId) => {
				presenceChildren.set(childId, false);
				return () => {
					presenceChildren.delete(childId);
					!isPresentRef.current && !presenceChildren.size && onExitCompleteRef.current?.();
				};
			}
		};
	}, [
		isPresent,
		presenceChildren,
		onExitComplete
	]);
	/**
	* If the presence of a child affects the layout of the components around it,
	* we want to make a new context value to ensure they get re-rendered
	* so they can detect that layout change.
	*/
	if (presenceAffectsLayout && isReusedContext) context = { ...context };
	(0, import_react.useMemo)(() => {
		presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
	}, [isPresent]);
	/**
	* If there's no `motion` components to fire exit animations, we want to remove this
	* component immediately.
	*/
	import_react.useEffect(() => {
		!isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
	}, [isPresent]);
	children = (0, import_jsx_runtime.jsx)(PopChild, {
		pop: mode === "popLayout",
		isPresent,
		anchorX,
		anchorY,
		root,
		children
	});
	return (0, import_jsx_runtime.jsx)(PresenceContext.Provider, {
		value: context,
		children
	});
};
function newChildrenMap() {
	return /* @__PURE__ */ new Map();
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/components/AnimatePresence/use-presence.mjs
/**
* When a component is the child of `AnimatePresence`, it can use `usePresence`
* to access information about whether it's still present in the React tree.
*
* ```jsx
* import { usePresence } from "framer-motion"
*
* export const Component = () => {
*   const [isPresent, safeToRemove] = usePresence()
*
*   useEffect(() => {
*     !isPresent && setTimeout(safeToRemove, 1000)
*   }, [isPresent])
*
*   return <div />
* }
* ```
*
* If `isPresent` is `false`, it means that a component has been removed from the tree,
* but `AnimatePresence` won't really remove it until `safeToRemove` has been called.
*
* @public
*/
function usePresence(subscribe = true) {
	const context = (0, import_react.useContext)(PresenceContext);
	if (context === null) return [true, null];
	const { isPresent, onExitComplete, register } = context;
	const id = (0, import_react.useId)();
	(0, import_react.useEffect)(() => {
		if (subscribe) return register(id);
	}, [subscribe]);
	const safeToRemove = (0, import_react.useCallback)(() => subscribe && onExitComplete && onExitComplete(id), [
		id,
		onExitComplete,
		subscribe
	]);
	return !isPresent && onExitComplete ? [false, safeToRemove] : [true];
}
/**
* Similar to `usePresence`, except `useIsPresent` simply returns whether or not the component is present.
* There is no `safeToRemove` function.
*
* ```jsx
* import { useIsPresent } from "framer-motion"
*
* export const Component = () => {
*   const isPresent = useIsPresent()
*
*   useEffect(() => {
*     !isPresent && console.log("I've been removed!")
*   }, [isPresent])
*
*   return <div />
* }
* ```
*
* @public
*/
function useIsPresent() {
	return isPresent((0, import_react.useContext)(PresenceContext));
}
function isPresent(context) {
	return context === null ? true : context.isPresent;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/components/AnimatePresence/utils.mjs
var getChildKey = (child) => child.key || "";
function onlyElements(children) {
	const filtered = [];
	import_react.Children.forEach(children, (child) => {
		if ((0, import_react.isValidElement)(child)) filtered.push(child);
	});
	return filtered;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs
/**
* `AnimatePresence` enables the animation of components that have been removed from the tree.
*
* When adding/removing more than a single child, every child **must** be given a unique `key` prop.
*
* Any `motion` components that have an `exit` property defined will animate out when removed from
* the tree.
*
* ```jsx
* import { motion, AnimatePresence } from 'framer-motion'
*
* export const Items = ({ items }) => (
*   <AnimatePresence>
*     {items.map(item => (
*       <motion.div
*         key={item.id}
*         initial={{ opacity: 0 }}
*         animate={{ opacity: 1 }}
*         exit={{ opacity: 0 }}
*       />
*     ))}
*   </AnimatePresence>
* )
* ```
*
* You can sequence exit animations throughout a tree using variants.
*
* If a child contains multiple `motion` components with `exit` props, it will only unmount the child
* once all `motion` components have finished animating out. Likewise, any components using
* `usePresence` all need to call `safeToRemove`.
*
* @public
*/
var AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
	const [isParentPresent, safeToRemove] = usePresence(propagate);
	/**
	* Filter any children that aren't ReactElements. We can only track components
	* between renders with a props.key.
	*/
	const presentChildren = (0, import_react.useMemo)(() => onlyElements(children), [children]);
	/**
	* Track the keys of the currently rendered children. This is used to
	* determine which children are exiting.
	*/
	const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
	/**
	* If `initial={false}` we only want to pass this to components in the first render.
	*/
	const isInitialRender = (0, import_react.useRef)(true);
	/**
	* Track which exiting children have finished animating out.
	*/
	const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
	/**
	* Track which components are currently processing exit to prevent duplicate processing.
	*/
	const exitingComponents = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	/**
	* Save children to render as React state. To ensure this component is concurrent-safe,
	* we check for exiting children via an effect.
	*/
	const [diffedChildren, setDiffedChildren] = (0, import_react.useState)(presentChildren);
	const [renderedChildren, setRenderedChildren] = (0, import_react.useState)(presentChildren);
	useIsomorphicLayoutEffect(() => {
		if (propagate && !isParentPresent && !renderedChildren.length) safeToRemove?.();
	}, [
		isParentPresent,
		propagate,
		renderedChildren.length,
		safeToRemove
	]);
	useIsomorphicLayoutEffect(() => {
		isInitialRender.current = false;
		/**
		* Update complete status of exiting children.
		*/
		for (let i = 0; i < renderedChildren.length; i++) {
			const key = getChildKey(renderedChildren[i]);
			if (!presentKeys.includes(key)) {
				if (exitComplete.get(key) !== true) exitComplete.set(key, false);
			} else {
				exitComplete.delete(key);
				exitingComponents.current.delete(key);
			}
		}
	}, [
		renderedChildren,
		presentKeys.length,
		presentKeys.join("-")
	]);
	const exitingChildren = [];
	if (presentChildren !== diffedChildren) {
		let nextChildren = [...presentChildren];
		/**
		* Loop through all the currently rendered components and decide which
		* are exiting.
		*
		* Exiting children are reinserted directly after the child they
		* previously followed. Splicing at their index within the previously
		* rendered children, as we used to, indexes into the wrong list: it
		* can interleave them with entering children and push present children
		* to new positions, remounting them (#3746).
		*/
		let insertionIndex = 0;
		for (const child of renderedChildren) {
			const presentIndex = presentKeys.indexOf(getChildKey(child));
			if (presentIndex === -1) {
				nextChildren.splice(insertionIndex++, 0, child);
				exitingChildren.push(child);
			} else insertionIndex = presentIndex + exitingChildren.length + 1;
		}
		/**
		* Once every exiting child has finished animating out, remove them
		* all at once. Otherwise, if we're in "wait" mode, we want to only
		* render the exiting children until they've all exited.
		*/
		if (exitingChildren.every((child) => exitComplete.get(getChildKey(child)))) nextChildren = presentChildren;
		else if (mode === "wait") nextChildren = exitingChildren;
		setRenderedChildren(onlyElements(nextChildren));
		setDiffedChildren(presentChildren);
		/**
		* Early return to ensure once we've set state with the latest diffed
		* children, we can immediately re-render.
		*/
		return null;
	}
	if (mode === "wait" && renderedChildren.length > 1) console.warn(`You're attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.`);
	/**
	* If we've been provided a forceRender function by the LayoutGroupContext,
	* we can use it to force a re-render amongst all surrounding components once
	* all components have finished animating out.
	*/
	const { forceRender } = (0, import_react.useContext)(LayoutGroupContext);
	return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: renderedChildren.map((child) => {
		const key = getChildKey(child);
		const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
		const onExit = () => {
			if (exitingComponents.current.has(key)) return;
			if (exitComplete.has(key)) {
				exitingComponents.current.add(key);
				exitComplete.set(key, true);
			} else return;
			let isEveryExitComplete = true;
			exitComplete.forEach((isExitComplete) => {
				if (!isExitComplete) isEveryExitComplete = false;
			});
			if (isEveryExitComplete) {
				forceRender?.();
				/**
				* Re-diff rather than setting the children to render
				* directly: this update can be applied after a
				* transition has committed new children, so any
				* children read now could be stale by then.
				*/
				setDiffedChildren([]);
				propagate && safeToRemove?.();
				onExitComplete && onExitComplete();
			}
		};
		return (0, import_jsx_runtime.jsx)(PresenceChild, {
			isPresent,
			initial: !isInitialRender.current || initial ? void 0 : false,
			custom,
			presenceAffectsLayout,
			mode,
			root,
			onExitComplete: isPresent ? void 0 : onExit,
			anchorX,
			anchorY,
			children: child
		}, key);
	}) });
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/context/DeprecatedLayoutGroupContext.mjs
/**
* Note: Still used by components generated by old versions of Framer
*
* @deprecated
*/
var DeprecatedLayoutGroupContext = (0, import_react.createContext)(null);
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/use-is-mounted.mjs
function useIsMounted() {
	const isMounted = (0, import_react.useRef)(false);
	useIsomorphicLayoutEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);
	return isMounted;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/use-force-update.mjs
function useForceUpdate() {
	const isMounted = useIsMounted();
	const [forcedRenderCount, setForcedRenderCount] = (0, import_react.useState)(0);
	const forceRender = (0, import_react.useCallback)(() => {
		isMounted.current && setForcedRenderCount(forcedRenderCount + 1);
	}, [forcedRenderCount]);
	return [(0, import_react.useCallback)(() => frame.postRender(forceRender), [forceRender]), forcedRenderCount];
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/components/LayoutGroup/index.mjs
var shouldInheritGroup = (inherit) => inherit === true;
var shouldInheritId = (inherit) => shouldInheritGroup(inherit === true) || inherit === "id";
var LayoutGroup = ({ children, id, inherit = true }) => {
	const layoutGroupContext = (0, import_react.useContext)(LayoutGroupContext);
	const deprecatedLayoutGroupContext = (0, import_react.useContext)(DeprecatedLayoutGroupContext);
	const [forceRender, key] = useForceUpdate();
	const context = (0, import_react.useRef)(null);
	const upstreamId = layoutGroupContext.id || deprecatedLayoutGroupContext;
	if (context.current === null) {
		if (shouldInheritId(inherit) && upstreamId) id = id ? upstreamId + "-" + id : upstreamId;
		context.current = {
			id,
			group: shouldInheritGroup(inherit) ? layoutGroupContext.group || nodeGroup() : nodeGroup()
		};
	}
	const memoizedContext = (0, import_react.useMemo)(() => ({
		...context.current,
		forceRender
	}), [key]);
	return (0, import_jsx_runtime.jsx)(LayoutGroupContext.Provider, {
		value: memoizedContext,
		children
	});
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/context/LazyContext.mjs
var LazyContext = (0, import_react.createContext)({ strict: false });
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/definitions.mjs
var featureProps = {
	animation: [
		"animate",
		"variants",
		"whileHover",
		"whileTap",
		"exit",
		"whileInView",
		"whileFocus",
		"whileDrag"
	],
	exit: ["exit"],
	drag: ["drag", "dragControls"],
	focus: ["whileFocus"],
	hover: [
		"whileHover",
		"onHoverStart",
		"onHoverEnd"
	],
	tap: [
		"whileTap",
		"onTap",
		"onTapStart",
		"onTapCancel"
	],
	pan: [
		"onPan",
		"onPanStart",
		"onPanSessionStart",
		"onPanEnd"
	],
	inView: [
		"whileInView",
		"onViewportEnter",
		"onViewportLeave"
	],
	layout: ["layout", "layoutId"]
};
var isInitialized = false;
/**
* Initialize feature definitions with isEnabled checks.
* This must be called before any motion components are rendered.
*/
function initFeatureDefinitions() {
	if (isInitialized) return;
	const initialFeatureDefinitions = {};
	for (const key in featureProps) initialFeatureDefinitions[key] = { isEnabled: (props) => featureProps[key].some((name) => !!props[name]) };
	setFeatureDefinitions(initialFeatureDefinitions);
	isInitialized = true;
}
/**
* Get the current feature definitions, initializing if needed.
*/
function getInitializedFeatureDefinitions() {
	initFeatureDefinitions();
	return getFeatureDefinitions();
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/load-features.mjs
function loadFeatures(features) {
	const featureDefinitions = getInitializedFeatureDefinitions();
	for (const key in features) featureDefinitions[key] = {
		...featureDefinitions[key],
		...features[key]
	};
	setFeatureDefinitions(featureDefinitions);
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/components/MotionConfig/index.mjs
/**
* `MotionConfig` is used to set configuration options for all children `motion` components.
*
* ```jsx
* import { motion, MotionConfig } from "framer-motion"
*
* export function App() {
*   return (
*     <MotionConfig transition={{ type: "spring" }}>
*       <motion.div animate={{ x: 100 }} />
*     </MotionConfig>
*   )
* }
* ```
*
* @public
*/
function MotionConfig({ children, ...config }) {
	/**
	* Inherit props from any parent MotionConfig components
	*/
	const parentConfig = (0, import_react.useContext)(MotionConfigContext);
	config = {
		...parentConfig,
		...config
	};
	config.transition = resolveTransition$1(config.transition, parentConfig.transition);
	/**
	* Don't allow isStatic to change between renders as it affects how many hooks
	* motion components fire.
	*/
	config.isStatic = useConstant(() => config.isStatic);
	/**
	* Creating a new config context object will re-render every `motion` component
	* every time it renders. So we only want to create a new one sparingly.
	*/
	const context = (0, import_react.useMemo)(() => config, [
		JSON.stringify(config.transition),
		config.transformPagePoint,
		config.reducedMotion,
		config.skipAnimations,
		config.isValidProp
	]);
	return (0, import_jsx_runtime.jsx)(MotionConfigContext.Provider, {
		value: context,
		children
	});
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/context/MotionContext/index.mjs
var MotionContext = /* @__PURE__ */ (0, import_react.createContext)({});
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/context/MotionContext/utils.mjs
function getCurrentTreeVariants(props, context) {
	if (isControllingVariants(props)) {
		const { initial, animate } = props;
		return {
			initial: initial === false || isVariantLabel(initial) ? initial : void 0,
			animate: isVariantLabel(animate) ? animate : void 0
		};
	}
	return props.inherit !== false ? context : {};
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/context/MotionContext/create.mjs
function useCreateMotionContext(props) {
	const { initial, animate } = getCurrentTreeVariants(props, (0, import_react.useContext)(MotionContext));
	return (0, import_react.useMemo)(() => ({
		initial,
		animate
	}), [variantLabelsAsDependency(initial), variantLabelsAsDependency(animate)]);
}
function variantLabelsAsDependency(prop) {
	return Array.isArray(prop) ? prop.join(" ") : prop;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/html/utils/create-render-state.mjs
var createHtmlRenderState = () => ({
	style: {},
	transform: {},
	transformOrigin: {},
	vars: {}
});
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/html/use-props.mjs
function copyRawValuesOnly(target, source, props) {
	for (const key in source) if (!isMotionValue(source[key]) && !isForcedMotionValue(key, props)) target[key] = source[key];
}
function useInitialMotionValues({ transformTemplate }, visualState) {
	return (0, import_react.useMemo)(() => {
		const state = createHtmlRenderState();
		buildHTMLStyles(state, visualState, transformTemplate);
		return Object.assign({}, state.vars, state.style);
	}, [visualState]);
}
function useStyle(props, visualState) {
	const styleProp = props.style || {};
	const style = {};
	/**
	* Copy non-Motion Values straight into style
	*/
	copyRawValuesOnly(style, styleProp, props);
	Object.assign(style, useInitialMotionValues(props, visualState));
	return style;
}
function useHTMLProps(props, visualState) {
	const htmlProps = {};
	const style = useStyle(props, visualState);
	if (props.drag && props.dragListener !== false) {
		htmlProps.draggable = false;
		style.userSelect = style.WebkitUserSelect = style.WebkitTouchCallout = "none";
		style.touchAction = props.drag === true ? "none" : `pan-${props.drag === "x" ? "y" : "x"}`;
	}
	if (props.tabIndex === void 0 && (props.onTap || props.onTapStart || props.whileTap)) htmlProps.tabIndex = 0;
	htmlProps.style = style;
	return htmlProps;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/svg/utils/create-render-state.mjs
var createSvgRenderState = () => ({
	...createHtmlRenderState(),
	attrs: {}
});
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/svg/use-props.mjs
function useSVGProps(props, visualState, _isStatic, Component) {
	const visualProps = (0, import_react.useMemo)(() => {
		const state = createSvgRenderState();
		buildSVGAttrs(state, visualState, isSVGTag(Component), props.transformTemplate, props.style);
		return {
			...state.attrs,
			style: { ...state.style }
		};
	}, [visualState]);
	if (props.style) {
		const rawStyles = {};
		copyRawValuesOnly(rawStyles, props.style, props);
		visualProps.style = {
			...rawStyles,
			...visualProps.style
		};
	}
	return visualProps;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/utils/valid-prop.mjs
/**
* A list of all valid MotionProps.
*
* @privateRemarks
* This doesn't throw if a `MotionProp` name is missing - it should.
*/
var validMotionProps = /* @__PURE__ */ new Set([
	"animate",
	"exit",
	"variants",
	"initial",
	"style",
	"values",
	"transition",
	"transformTemplate",
	"custom",
	"inherit",
	"onBeforeLayoutMeasure",
	"onAnimationStart",
	"onAnimationComplete",
	"onUpdate",
	"onDragStart",
	"onDrag",
	"onDragEnd",
	"onMeasureDragConstraints",
	"onDirectionLock",
	"onDragTransitionEnd",
	"_dragX",
	"_dragY",
	"onHoverStart",
	"onHoverEnd",
	"onViewportEnter",
	"onViewportLeave",
	"globalTapTarget",
	"propagate",
	"ignoreStrict",
	"viewport"
]);
/**
* Check whether a prop name is a valid `MotionProp` key.
*
* @param key - Name of the property to check
* @returns `true` is key is a valid `MotionProp`.
*
* @public
*/
function isValidMotionProp(key) {
	return key.startsWith("while") || key.startsWith("drag") && key !== "draggable" || key.startsWith("layout") || key.startsWith("onTap") || key.startsWith("onPan") || key.startsWith("onLayout") || validMotionProps.has(key);
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/dom/utils/filter-props.mjs
function shouldForward(key, isValidProp) {
	return key.startsWith("on") ? !isValidMotionProp(key) : isValidProp?.(key) ?? !isValidMotionProp(key);
}
function filterProps(props, isDom, forwardMotionProps, isValidProp) {
	const filteredProps = {};
	for (const key in props) {
		/**
		* values is considered a valid prop by Emotion, so if it's present
		* this will be rendered out to the DOM unless explicitly filtered.
		*
		* We check the type as it could be used with the `feColorMatrix`
		* element, which we support.
		*/
		if (key === "values" && typeof props.values === "object") continue;
		if (isMotionValue(props[key])) continue;
		if (shouldForward(key, isValidProp) || forwardMotionProps === true && isValidMotionProp(key) || !isDom && !isValidMotionProp(key) || props["draggable"] && key.startsWith("onDrag")) filteredProps[key] = props[key];
	}
	return filteredProps;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/svg/lowercase-elements.mjs
/**
* We keep these listed separately as we use the lowercase tag names as part
* of the runtime bundle to detect SVG components
*/
var lowercaseSVGElements = [
	"animate",
	"circle",
	"defs",
	"desc",
	"ellipse",
	"g",
	"image",
	"line",
	"filter",
	"marker",
	"mask",
	"metadata",
	"path",
	"pattern",
	"polygon",
	"polyline",
	"rect",
	"stop",
	"switch",
	"symbol",
	"svg",
	"text",
	"tspan",
	"use",
	"view"
];
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/dom/utils/is-svg-component.mjs
function isSVGComponent(Component) {
	if (typeof Component !== "string" || Component.includes("-")) return false;
	else if (lowercaseSVGElements.indexOf(Component) > -1 || /[A-Z]/u.test(Component)) return true;
	return false;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/dom/use-render.mjs
function useRender(Component, props, ref, { latestValues }, isStatic, forwardMotionProps = false, isSVG, isValidProp) {
	const visualProps = (isSVG ?? isSVGComponent(Component) ? useSVGProps : useHTMLProps)(props, latestValues, isStatic, Component);
	const filteredProps = filterProps(props, typeof Component === "string", forwardMotionProps, isValidProp);
	const elementProps = Component !== import_react.Fragment ? {
		...filteredProps,
		...visualProps,
		ref
	} : {};
	/**
	* If component has been handed a motion value as its child,
	* memoise its initial value and render that. Subsequent updates
	* will be handled by the onChange handler
	*/
	const { children } = props;
	const renderedChildren = (0, import_react.useMemo)(() => isMotionValue(children) ? children.get() : children, [children]);
	return (0, import_react.createElement)(Component, {
		...elementProps,
		children: renderedChildren
	});
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/utils/use-visual-state.mjs
function makeState({ scrapeMotionValuesFromProps, createRenderState }, props, context, presenceContext) {
	return {
		latestValues: makeLatestValues(props, context, presenceContext, scrapeMotionValuesFromProps),
		renderState: createRenderState()
	};
}
function makeLatestValues(props, context, presenceContext, scrapeMotionValues) {
	const values = {};
	const motionValues = scrapeMotionValues(props, {});
	for (const key in motionValues) values[key] = resolveMotionValue(motionValues[key]);
	let { initial, animate } = props;
	const isControllingVariants$1 = isControllingVariants(props);
	const isVariantNode$1 = isVariantNode(props);
	if (context && isVariantNode$1 && !isControllingVariants$1 && props.inherit !== false) {
		if (initial === void 0) initial = context.initial;
		if (animate === void 0) animate = context.animate;
	}
	let isInitialAnimationBlocked = presenceContext ? presenceContext.initial === false : false;
	isInitialAnimationBlocked = isInitialAnimationBlocked || initial === false;
	const variantToSet = isInitialAnimationBlocked ? animate : initial;
	if (variantToSet && typeof variantToSet !== "boolean" && !isAnimationControls(variantToSet)) {
		const list = Array.isArray(variantToSet) ? variantToSet : [variantToSet];
		for (let i = 0; i < list.length; i++) {
			const resolved = resolveVariantFromProps(props, list[i]);
			if (resolved) {
				const { transitionEnd, transition, ...target } = resolved;
				for (const key in target) {
					let valueTarget = target[key];
					if (Array.isArray(valueTarget)) {
						/**
						* Take final keyframe if the initial animation is blocked because
						* we want to initialise at the end of that blocked animation.
						*/
						const index = isInitialAnimationBlocked ? valueTarget.length - 1 : 0;
						valueTarget = valueTarget[index];
					}
					if (valueTarget !== null) values[key] = valueTarget;
				}
				for (const key in transitionEnd) values[key] = transitionEnd[key];
			}
		}
	}
	return values;
}
var makeUseVisualState = (config) => (props, isStatic) => {
	const context = (0, import_react.useContext)(MotionContext);
	const presenceContext = (0, import_react.useContext)(PresenceContext);
	const make = () => makeState(config, props, context, presenceContext);
	return isStatic ? make() : useConstant(make);
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/html/use-html-visual-state.mjs
var useHTMLVisualState = /*@__PURE__*/ makeUseVisualState({
	scrapeMotionValuesFromProps,
	createRenderState: createHtmlRenderState
});
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/svg/use-svg-visual-state.mjs
var useSVGVisualState = /*@__PURE__*/ makeUseVisualState({
	scrapeMotionValuesFromProps: scrapeMotionValuesFromProps$1,
	createRenderState: createSvgRenderState
});
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/utils/symbol.mjs
var motionComponentSymbol = Symbol.for("motionComponentSymbol");
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/utils/use-motion-ref.mjs
/**
* Creates a ref function that, when called, hydrates the provided
* external ref and VisualElement.
*/
function useMotionRef(visualState, visualElement, externalRef) {
	/**
	* Store externalRef in a ref to avoid including it in the useCallback
	* dependency array. Including externalRef in dependencies causes issues
	* with libraries like Radix UI that create new callback refs on each render
	* when using asChild - this would cause the callback to be recreated,
	* triggering element remounts and breaking AnimatePresence exit animations.
	*/
	const externalRefContainer = (0, import_react.useRef)(externalRef);
	(0, import_react.useInsertionEffect)(() => {
		externalRefContainer.current = externalRef;
	});
	const refCleanup = (0, import_react.useRef)(null);
	return (0, import_react.useCallback)((instance) => {
		if (instance) visualState.onMount?.(instance);
		if (visualElement) instance ? visualElement.mount(instance) : visualElement.unmount();
		const ref = externalRefContainer.current;
		if (typeof ref === "function") {
			if (instance) {
				const cleanup = ref(instance);
				if (typeof cleanup === "function") refCleanup.current = cleanup;
			} else if (refCleanup.current) {
				refCleanup.current();
				refCleanup.current = null;
			} else ref(instance);
		} else if (ref) ref.current = instance;
	}, [visualElement]);
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/context/SwitchLayoutGroupContext.mjs
/**
* Internal, exported only for usage in Framer
*/
var SwitchLayoutGroupContext = (0, import_react.createContext)({});
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/is-ref-object.mjs
function isRefObject(ref) {
	return ref && typeof ref === "object" && Object.prototype.hasOwnProperty.call(ref, "current");
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/utils/use-visual-element.mjs
function useVisualElement(Component, visualState, props, createVisualElement, ProjectionNodeConstructor, isSVG) {
	const { visualElement: parent } = (0, import_react.useContext)(MotionContext);
	const lazyContext = (0, import_react.useContext)(LazyContext);
	const presenceContext = (0, import_react.useContext)(PresenceContext);
	const motionConfig = (0, import_react.useContext)(MotionConfigContext);
	const reducedMotionConfig = motionConfig.reducedMotion;
	const skipAnimations = motionConfig.skipAnimations;
	const visualElementRef = (0, import_react.useRef)(null);
	/**
	* Track whether the component has been through React's commit phase.
	* Used to detect when LazyMotion features load after the component has mounted.
	*/
	const hasMountedOnce = (0, import_react.useRef)(false);
	/**
	* If we haven't preloaded a renderer, check to see if we have one lazy-loaded
	*/
	createVisualElement = createVisualElement || lazyContext.renderer;
	if (!visualElementRef.current && createVisualElement) {
		visualElementRef.current = createVisualElement(Component, {
			visualState,
			parent,
			props,
			presenceContext,
			blockInitialAnimation: presenceContext ? presenceContext.initial === false : false,
			reducedMotionConfig,
			skipAnimations,
			isSVG
		});
		/**
		* If the component has already mounted before features loaded (e.g. via
		* LazyMotion with async feature loading), we need to force the initial
		* animation to run. Otherwise state changes that occurred before features
		* loaded will be lost and the element will snap to its final state.
		*/
		if (hasMountedOnce.current && visualElementRef.current) visualElementRef.current.manuallyAnimateOnMount = true;
	}
	const visualElement = visualElementRef.current;
	/**
	* Load Motion gesture and animation features. These are rendered as renderless
	* components so each feature can optionally make use of React lifecycle methods.
	*/
	const initialLayoutGroupConfig = (0, import_react.useContext)(SwitchLayoutGroupContext);
	if (visualElement && !visualElement.projection && ProjectionNodeConstructor && (visualElement.type === "html" || visualElement.type === "svg")) createProjectionNode(visualElementRef.current, props, ProjectionNodeConstructor, initialLayoutGroupConfig);
	const isMounted = (0, import_react.useRef)(false);
	(0, import_react.useInsertionEffect)(() => {
		/**
		* Check the component has already mounted before calling
		* `update` unnecessarily. This ensures we skip the initial update.
		*/
		if (visualElement && isMounted.current) visualElement.update(props, presenceContext);
	});
	/**
	* Cache this value as we want to know whether HandoffAppearAnimations
	* was present on initial render - it will be deleted after this.
	*/
	const optimisedAppearId = props[optimizedAppearDataAttribute];
	const wantsHandoff = (0, import_react.useRef)(Boolean(optimisedAppearId) && typeof window !== "undefined" && !window.MotionHandoffIsComplete?.(optimisedAppearId) && window.MotionHasOptimisedAnimation?.(optimisedAppearId));
	/**
	* Layout effects re-run when a hidden Suspense/Activity boundary is
	* revealed, but passive effects only re-run if this component re-renders
	* (not the case for memoized elements). Replay animations on every
	* reconnection. Must be declared before the effect that sets hasMountedOnce.
	*/
	useIsomorphicLayoutEffect(() => {
		if (!hasMountedOnce.current || !visualElement) return;
		visualElement.animationState?.animateChanges();
		visualElement.enteringChildren = void 0;
	}, []);
	useIsomorphicLayoutEffect(() => {
		/**
		* Track that this component has mounted. This is used to detect when
		* LazyMotion features load after the component has already committed.
		*/
		hasMountedOnce.current = true;
		if (!visualElement) return;
		isMounted.current = true;
		window.MotionIsMounted = true;
		visualElement.updateFeatures();
		visualElement.scheduleRenderMicrotask();
		/**
		* Ideally this function would always run in a useEffect.
		*
		* However, if we have optimised appear animations to handoff from,
		* it needs to happen synchronously to ensure there's no flash of
		* incorrect styles in the event of a hydration error.
		*
		* So if we detect a situation where optimised appear animations
		* are running, we use useLayoutEffect to trigger animations.
		*/
		if (wantsHandoff.current && visualElement.animationState) visualElement.animationState.animateChanges();
	});
	(0, import_react.useEffect)(() => {
		if (!visualElement) return;
		if (!wantsHandoff.current && visualElement.animationState) visualElement.animationState.animateChanges();
		if (wantsHandoff.current) {
			queueMicrotask(() => {
				window.MotionHandoffMarkAsComplete?.(optimisedAppearId);
			});
			wantsHandoff.current = false;
		}
		/**
		* Now we've finished triggering animations for this element we
		* can wipe the enteringChildren set for the next render.
		*/
		visualElement.enteringChildren = void 0;
	});
	return visualElement;
}
function createProjectionNode(visualElement, props, ProjectionNodeConstructor, initialPromotionConfig) {
	const { layoutId, layout, drag, dragConstraints, layoutScroll, layoutRoot, layoutAnchor, layoutCrossfade } = props;
	visualElement.projection = new ProjectionNodeConstructor(visualElement.latestValues, props["data-framer-portal-id"] ? void 0 : getClosestProjectingNode(visualElement.parent));
	visualElement.projection.setOptions({
		layoutId,
		layout,
		alwaysMeasureLayout: Boolean(drag) || dragConstraints && isRefObject(dragConstraints),
		visualElement,
		/**
		* TODO: Update options in an effect. This could be tricky as it'll be too late
		* to update by the time layout animations run.
		* We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
		* ensuring it gets called if there's no potential layout animations.
		*
		*/
		animationType: typeof layout === "string" ? layout : "both",
		initialPromotionConfig,
		crossfade: layoutCrossfade,
		layoutScroll,
		layoutRoot,
		layoutAnchor
	});
}
function getClosestProjectingNode(visualElement) {
	if (!visualElement) return void 0;
	return visualElement.options.allowProjection !== false ? visualElement.projection : getClosestProjectingNode(visualElement.parent);
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/index.mjs
/**
* Create a `motion` component.
*
* This function accepts a Component argument, which can be either a string (ie "div"
* for `motion.div`), or an actual React component.
*
* Alongside this is a config option which provides a way of rendering the provided
* component "offline", or outside the React render cycle.
*/
function createMotionComponent(Component, { forwardMotionProps = false, type } = {}, preloadedFeatures, createVisualElement) {
	preloadedFeatures && loadFeatures(preloadedFeatures);
	/**
	* Determine whether to use SVG or HTML rendering based on:
	* 1. Explicit `type` option (highest priority)
	* 2. Auto-detection via `isSVGComponent`
	*/
	const isSVG = type ? type === "svg" : isSVGComponent(Component);
	const useVisualState = isSVG ? useSVGVisualState : useHTMLVisualState;
	function MotionDOMComponent(props, externalRef) {
		/**
		* If we need to measure the element we load this functionality in a
		* separate class component in order to gain access to getSnapshotBeforeUpdate.
		*/
		let MeasureLayout;
		const configAndProps = {
			...(0, import_react.useContext)(MotionConfigContext),
			...props,
			layoutId: useLayoutId(props)
		};
		const { isStatic, isValidProp } = configAndProps;
		const context = useCreateMotionContext(props);
		const visualState = useVisualState(props, isStatic);
		if (!isStatic && typeof window !== "undefined") {
			useStrictMode(configAndProps, preloadedFeatures);
			const layoutProjection = getProjectionFunctionality(configAndProps);
			MeasureLayout = layoutProjection.MeasureLayout;
			/**
			* Create a VisualElement for this component. A VisualElement provides a common
			* interface to renderer-specific APIs (ie DOM/Three.js etc) as well as
			* providing a way of rendering to these APIs outside of the React render loop
			* for more performant animations and interactions
			*/
			context.visualElement = useVisualElement(Component, visualState, configAndProps, createVisualElement, layoutProjection.ProjectionNode, isSVG);
		}
		/**
		* The mount order and hierarchy is specific to ensure our element ref
		* is hydrated by the time features fire their effects.
		*/
		return (0, import_jsx_runtime.jsxs)(MotionContext.Provider, {
			value: context,
			children: [MeasureLayout && context.visualElement ? (0, import_jsx_runtime.jsx)(MeasureLayout, {
				visualElement: context.visualElement,
				...configAndProps
			}) : null, useRender(Component, props, useMotionRef(visualState, context.visualElement, externalRef), visualState, isStatic, forwardMotionProps, isSVG, isValidProp)]
		});
	}
	MotionDOMComponent.displayName = `motion.${typeof Component === "string" ? Component : `create(${Component.displayName ?? Component.name ?? ""})`}`;
	const ForwardRefMotionComponent = (0, import_react.forwardRef)(MotionDOMComponent);
	ForwardRefMotionComponent[motionComponentSymbol] = Component;
	return ForwardRefMotionComponent;
}
function useLayoutId({ layoutId }) {
	const layoutGroupId = (0, import_react.useContext)(LayoutGroupContext).id;
	return layoutGroupId && layoutId !== void 0 ? layoutGroupId + "-" + layoutId : layoutId;
}
function useStrictMode(configAndProps, preloadedFeatures) {
	const isStrict = (0, import_react.useContext)(LazyContext).strict;
	/**
	* If we're in development mode, check to make sure we're not rendering a motion component
	* as a child of LazyMotion, as this will break the file-size benefits of using it.
	*/
	if (preloadedFeatures && isStrict) {
		const strictMessage = "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead.";
		configAndProps.ignoreStrict ? warning(false, strictMessage, "lazy-strict-mode") : invariant(false, strictMessage, "lazy-strict-mode");
	}
}
function getProjectionFunctionality(props) {
	const { drag, layout } = getInitializedFeatureDefinitions();
	if (!drag && !layout) return {};
	const combined = {
		...drag,
		...layout
	};
	return {
		MeasureLayout: drag?.isEnabled(props) || layout?.isEnabled(props) ? combined.MeasureLayout : void 0,
		ProjectionNode: combined.ProjectionNode
	};
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/components/create-proxy.mjs
function createMotionProxy(preloadedFeatures, createVisualElement) {
	if (typeof Proxy === "undefined") return createMotionComponent;
	/**
	* A cache of generated `motion` components, e.g `motion.div`, `motion.input` etc.
	* Rather than generating them anew every render.
	*/
	const componentCache = /* @__PURE__ */ new Map();
	const factory = (Component, options) => {
		return createMotionComponent(Component, options, preloadedFeatures, createVisualElement);
	};
	/**
	* Support for deprecated`motion(Component)` pattern
	*/
	const deprecatedFactoryFunction = (Component, options) => {
		warnOnce(false, "motion() is deprecated. Use motion.create() instead.");
		return factory(Component, options);
	};
	return new Proxy(deprecatedFactoryFunction, { 
	/**
	* Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
	* The prop name is passed through as `key` and we can use that to generate a `motion`
	* DOM component with that name.
	*/
get: (_target, key) => {
		if (key === "create") return factory;
		/**
		* If this element doesn't exist in the component cache, create it and cache.
		*/
		if (!componentCache.has(key)) componentCache.set(key, createMotionComponent(key, void 0, preloadedFeatures, createVisualElement));
		return componentCache.get(key);
	} });
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/dom/create-visual-element.mjs
var createDomVisualElement = (Component, options) => {
	return options.isSVG ?? isSVGComponent(Component) ? new SVGVisualElement(options) : new HTMLVisualElement(options, { allowProjection: Component !== import_react.Fragment });
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/animation/index.mjs
var AnimationFeature = class extends Feature {
	/**
	* We dynamically generate the AnimationState manager as it contains a reference
	* to the underlying animation library. We only want to load that if we load this,
	* so people can optionally code split it out using the `m` component.
	*/
	constructor(node) {
		super(node);
		node.animationState || (node.animationState = createAnimationState(node));
	}
	updateAnimationControlsSubscription() {
		const { animate } = this.node.getProps();
		if (isAnimationControls(animate)) this.unmountControls = animate.subscribe(this.node);
	}
	/**
	* Subscribe any provided AnimationControls to the component's VisualElement
	*/
	mount() {
		this.updateAnimationControlsSubscription();
	}
	update() {
		const { animate } = this.node.getProps();
		const { animate: prevAnimate } = this.node.prevProps || {};
		if (animate !== prevAnimate) this.updateAnimationControlsSubscription();
	}
	unmount() {
		this.node.animationState.reset();
		this.unmountControls?.();
	}
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/animation/exit.mjs
var id = 0;
var ExitAnimationFeature = class extends Feature {
	constructor() {
		super(...arguments);
		this.id = id++;
	}
	update() {
		const { presenceContext, prevPresenceContext, animationState } = this.node;
		if (!presenceContext || !animationState) return;
		const { isPresent, onExitComplete } = presenceContext;
		const prevIsPresent = prevPresenceContext?.isPresent;
		if (isPresent === prevIsPresent) return;
		if (isPresent && prevIsPresent === false) {
			/**
			* When re-entering after the exit completed (element is at
			* rest), replay the enter animation from initial.
			*/
			if (this.exit === true) {
				const { initial } = this.node.getProps();
				if (initial && !Array.isArray(initial)) {
					const { transition, transitionEnd, ...target } = resolveVariant(this.node, initial) || {};
					for (const key in target) this.node.getValue(key)?.jump(target[key]);
				}
				/**
				* A re-entering element is no longer an initial child, so
				* AnimatePresence's initial={false} mustn't block its enter.
				*/
				this.node.blockInitialAnimation = false;
				animationState.reset();
				animationState.animateChanges();
			} else animationState.setActive("exit", false);
			this.exit = void 0;
			return;
		}
		const exit = this.exit = animationState.setActive("exit", !isPresent);
		if (onExitComplete && !isPresent) exit.then(() => {
			/**
			* An exit can resolve after the element has re-entered, e.g.
			* when its final tick lands in the stop() of the enter.
			*/
			if (this.exit !== exit) return;
			this.exit = true;
			onExitComplete(this.id);
		});
	}
	mount() {
		const { register, onExitComplete } = this.node.presenceContext || {};
		if (onExitComplete) onExitComplete(this.id);
		if (register) this.unmount = register(this.id);
	}
	unmount() {}
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/animations.mjs
var animations = {
	animation: { Feature: AnimationFeature },
	exit: { Feature: ExitAnimationFeature }
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/events/event-info.mjs
function extractEventInfo(event) {
	return { point: {
		x: event.pageX,
		y: event.pageY
	} };
}
var addPointerInfo = (handler) => (event) => isPrimaryPointer(event) && handler(event, extractEventInfo(event));
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/events/add-pointer-event.mjs
function addPointerEvent(target, eventName, handler, options) {
	return addDomEvent(target, eventName, addPointerInfo(handler), options);
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/get-context-window.mjs
var getContextWindow = ({ current }) => {
	return current ? current.ownerDocument.defaultView : null;
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/gestures/pan/PanSession.mjs
var overflowStyles = /*#__PURE__*/ new Set(["auto", "scroll"]);
/**
* @internal
*/
var PanSession = class {
	constructor(event, handlers, { transformPagePoint, contextWindow = window, dragSnapToOrigin = false, distanceThreshold = 3, element } = {}) {
		/**
		* @internal
		*/
		this.startEvent = null;
		/**
		* @internal
		*/
		this.lastMoveEvent = null;
		/**
		* @internal
		*/
		this.lastMoveEventInfo = null;
		/**
		* Raw (untransformed) event info, re-transformed each frame
		* so transformPagePoint sees the current parent matrix.
		* @internal
		*/
		this.lastRawMoveEventInfo = null;
		/**
		* @internal
		*/
		this.handlers = {};
		/**
		* @internal
		*/
		this.contextWindow = window;
		/**
		* Scroll positions of scrollable ancestors and window.
		* @internal
		*/
		this.scrollPositions = /* @__PURE__ */ new Map();
		/**
		* Cleanup function for scroll listeners.
		* @internal
		*/
		this.removeScrollListeners = null;
		this.onElementScroll = (event) => {
			this.handleScroll(event.target);
		};
		this.onWindowScroll = () => {
			this.handleScroll(window);
		};
		this.updatePoint = () => {
			if (!(this.lastMoveEvent && this.lastMoveEventInfo)) return;
			this.hasPendingMove = false;
			if (this.lastRawMoveEventInfo) this.lastMoveEventInfo = transformPoint(this.lastRawMoveEventInfo, this.transformPagePoint);
			const info = getPanInfo(this.lastMoveEventInfo, this.history);
			const isPanStarted = this.startEvent !== null;
			const isDistancePastThreshold = distance2D(info.offset, {
				x: 0,
				y: 0
			}) >= this.distanceThreshold;
			if (!isPanStarted && !isDistancePastThreshold) return;
			const { point } = info;
			this.history.push({
				...point,
				timestamp: time.now()
			});
			const { onStart, onMove } = this.handlers;
			if (!isPanStarted) {
				onStart && onStart(this.lastMoveEvent, info);
				this.startEvent = this.lastMoveEvent;
			}
			onMove && onMove(this.lastMoveEvent, info);
		};
		this.handlePointerMove = (event, info) => {
			this.lastMoveEvent = event;
			this.lastRawMoveEventInfo = info;
			this.lastMoveEventInfo = transformPoint(info, this.transformPagePoint);
			this.hasPendingMove = true;
			frame.update(this.updatePoint, true);
		};
		this.handlePointerUp = (event, info) => {
			this.hasPendingMove && this.updatePoint();
			this.end();
			const { onEnd, onSessionEnd, resumeAnimation } = this.handlers;
			if (this.dragSnapToOrigin || !this.startEvent) resumeAnimation && resumeAnimation();
			if (!(this.lastMoveEvent && this.lastMoveEventInfo)) return;
			const panInfo = getPanInfo(event.type === "pointercancel" ? this.lastMoveEventInfo : transformPoint(info, this.transformPagePoint), this.history);
			if (this.startEvent && onEnd) onEnd(event, panInfo);
			onSessionEnd && onSessionEnd(event, panInfo);
		};
		if (!isPrimaryPointer(event)) return;
		this.dragSnapToOrigin = dragSnapToOrigin;
		this.handlers = handlers;
		this.transformPagePoint = transformPagePoint;
		this.distanceThreshold = distanceThreshold;
		this.contextWindow = contextWindow || window;
		const initialInfo = transformPoint(extractEventInfo(event), this.transformPagePoint);
		const { point } = initialInfo;
		const { timestamp } = frameData;
		this.history = [{
			...point,
			timestamp
		}];
		const { onSessionStart } = handlers;
		onSessionStart && onSessionStart(event, getPanInfo(initialInfo, this.history));
		const eventOptions = {
			passive: true,
			capture: true
		};
		this.removeListeners = pipe(addPointerEvent(this.contextWindow, "pointermove", this.handlePointerMove, eventOptions), addPointerEvent(this.contextWindow, "pointerup", this.handlePointerUp, eventOptions), addPointerEvent(this.contextWindow, "pointercancel", this.handlePointerUp, eventOptions));
		if (element) this.startScrollTracking(element);
	}
	/**
	* Start tracking scroll on ancestors and window.
	*/
	startScrollTracking(element) {
		let current = element.parentElement;
		while (current) {
			const style = getComputedStyle(current);
			if (overflowStyles.has(style.overflowX) || overflowStyles.has(style.overflowY)) this.scrollPositions.set(current, {
				x: current.scrollLeft,
				y: current.scrollTop
			});
			current = current.parentElement;
		}
		this.scrollPositions.set(window, {
			x: window.scrollX,
			y: window.scrollY
		});
		window.addEventListener("scroll", this.onElementScroll, { capture: true });
		window.addEventListener("scroll", this.onWindowScroll);
		this.removeScrollListeners = () => {
			window.removeEventListener("scroll", this.onElementScroll, { capture: true });
			window.removeEventListener("scroll", this.onWindowScroll);
		};
	}
	/**
	* Handle scroll compensation during drag.
	*
	* For element scroll: adjusts history origin since pageX/pageY doesn't change.
	* For window scroll: adjusts lastMoveEventInfo since pageX/pageY would change.
	*/
	handleScroll(target) {
		const initial = this.scrollPositions.get(target);
		if (!initial) return;
		const isWindow = target === window;
		const current = isWindow ? {
			x: window.scrollX,
			y: window.scrollY
		} : {
			x: target.scrollLeft,
			y: target.scrollTop
		};
		const delta = {
			x: current.x - initial.x,
			y: current.y - initial.y
		};
		if (delta.x === 0 && delta.y === 0) return;
		if (isWindow) {
			if (this.lastMoveEventInfo) {
				this.lastMoveEventInfo.point.x += delta.x;
				this.lastMoveEventInfo.point.y += delta.y;
			}
		} else if (this.history.length > 0) {
			this.history[0].x -= delta.x;
			this.history[0].y -= delta.y;
		}
		this.scrollPositions.set(target, current);
		frame.update(this.updatePoint, true);
	}
	updateHandlers(handlers) {
		this.handlers = handlers;
	}
	end() {
		this.removeListeners && this.removeListeners();
		this.removeScrollListeners && this.removeScrollListeners();
		this.scrollPositions.clear();
		cancelFrame(this.updatePoint);
	}
};
function transformPoint(info, transformPagePoint) {
	return transformPagePoint ? { point: transformPagePoint(info.point) } : info;
}
function subtractPoint(a, b) {
	return {
		x: a.x - b.x,
		y: a.y - b.y
	};
}
function getPanInfo({ point }, history) {
	return {
		point,
		delta: subtractPoint(point, lastDevicePoint(history)),
		offset: subtractPoint(point, startDevicePoint(history)),
		velocity: getVelocity(history, .1)
	};
}
function startDevicePoint(history) {
	return history[0];
}
function lastDevicePoint(history) {
	return history[history.length - 1];
}
function getVelocity(history, timeDelta) {
	if (history.length < 2) return {
		x: 0,
		y: 0
	};
	let i = history.length - 1;
	let timestampedPoint = null;
	const lastPoint = lastDevicePoint(history);
	while (i >= 0) {
		timestampedPoint = history[i];
		if (lastPoint.timestamp - timestampedPoint.timestamp > secondsToMilliseconds(timeDelta)) break;
		i--;
	}
	if (!timestampedPoint) return {
		x: 0,
		y: 0
	};
	/**
	* If the selected point is the pointer-down origin (history[0]),
	* there are better movement points available, and the time gap
	* is suspiciously large (>2x timeDelta), use the next point instead.
	* This prevents stale pointer-down points from diluting velocity
	* in hold-then-flick gestures.
	*/
	if (timestampedPoint === history[0] && history.length > 2 && lastPoint.timestamp - timestampedPoint.timestamp > secondsToMilliseconds(timeDelta) * 2) timestampedPoint = history[1];
	const seconds = millisecondsToSeconds(lastPoint.timestamp - timestampedPoint.timestamp);
	if (seconds === 0) return {
		x: 0,
		y: 0
	};
	const currentVelocity = {
		x: (lastPoint.x - timestampedPoint.x) / seconds,
		y: (lastPoint.y - timestampedPoint.y) / seconds
	};
	if (currentVelocity.x === Infinity) currentVelocity.x = 0;
	if (currentVelocity.y === Infinity) currentVelocity.y = 0;
	return currentVelocity;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/gestures/drag/utils/constraints.mjs
/**
* Apply constraints to a point. These constraints are both physical along an
* axis, and an elastic factor that determines how much to constrain the point
* by if it does lie outside the defined parameters.
*/
function applyConstraints(point, { min, max }, elastic) {
	if (min !== void 0 && point < min) point = elastic ? mixNumber(min, point, elastic.min) : Math.max(point, min);
	else if (max !== void 0 && point > max) point = elastic ? mixNumber(max, point, elastic.max) : Math.min(point, max);
	return point;
}
/**
* Calculate constraints in terms of the viewport when defined relatively to the
* measured axis. This is measured from the nearest edge, so a max constraint of 200
* on an axis with a max value of 300 would return a constraint of 500 - axis length
*/
function calcRelativeAxisConstraints(axis, min, max) {
	return {
		min: min !== void 0 ? axis.min + min : void 0,
		max: max !== void 0 ? axis.max + max - (axis.max - axis.min) : void 0
	};
}
/**
* Calculate constraints in terms of the viewport when
* defined relatively to the measured bounding box.
*/
function calcRelativeConstraints(layoutBox, { top, left, bottom, right }) {
	return {
		x: calcRelativeAxisConstraints(layoutBox.x, left, right),
		y: calcRelativeAxisConstraints(layoutBox.y, top, bottom)
	};
}
/**
* Calculate viewport constraints when defined as another viewport-relative axis
*/
function calcViewportAxisConstraints(layoutAxis, constraintsAxis) {
	let min = constraintsAxis.min - layoutAxis.min;
	let max = constraintsAxis.max - layoutAxis.max;
	if (constraintsAxis.max - constraintsAxis.min < layoutAxis.max - layoutAxis.min) [min, max] = [max, min];
	return {
		min,
		max
	};
}
/**
* Calculate viewport constraints when defined as another viewport-relative box
*/
function calcViewportConstraints(layoutBox, constraintsBox) {
	return {
		x: calcViewportAxisConstraints(layoutBox.x, constraintsBox.x),
		y: calcViewportAxisConstraints(layoutBox.y, constraintsBox.y)
	};
}
/**
* Calculate a transform origin relative to the source axis, between 0-1, that results
* in an aesthetically pleasing scale/transform needed to project from source to target.
*/
function calcOrigin(source, target) {
	let origin = .5;
	const sourceLength = calcLength(source);
	const targetLength = calcLength(target);
	if (targetLength > sourceLength) origin = progress(target.min, target.max - sourceLength, source.min);
	else if (sourceLength > targetLength) origin = progress(source.min, source.max - targetLength, target.min);
	return clamp(0, 1, origin);
}
/**
* Rebase the calculated viewport constraints relative to the layout.min point.
*/
function rebaseAxisConstraints(layout, constraints) {
	const relativeConstraints = {};
	if (constraints.min !== void 0) relativeConstraints.min = constraints.min - layout.min;
	if (constraints.max !== void 0) relativeConstraints.max = constraints.max - layout.min;
	return relativeConstraints;
}
var defaultElastic = .35;
/**
* Accepts a dragElastic prop and returns resolved elastic values for each axis.
*/
function resolveDragElastic(dragElastic = defaultElastic) {
	if (dragElastic === false) dragElastic = 0;
	else if (dragElastic === true) dragElastic = defaultElastic;
	return {
		x: resolveAxisElastic(dragElastic, "left", "right"),
		y: resolveAxisElastic(dragElastic, "top", "bottom")
	};
}
function resolveAxisElastic(dragElastic, minLabel, maxLabel) {
	return {
		min: resolvePointElastic(dragElastic, minLabel),
		max: resolvePointElastic(dragElastic, maxLabel)
	};
}
function resolvePointElastic(dragElastic, label) {
	return typeof dragElastic === "number" ? dragElastic : dragElastic[label] || 0;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/gestures/drag/VisualElementDragControls.mjs
var elementDragControls = /* @__PURE__ */ new WeakMap();
var VisualElementDragControls = class {
	constructor(visualElement) {
		this.openDragLock = null;
		this.isDragging = false;
		this.currentDirection = null;
		this.originPoint = {
			x: 0,
			y: 0
		};
		/**
		* The permitted boundaries of travel, in pixels.
		*/
		this.constraints = false;
		this.hasMutatedConstraints = false;
		/**
		* The per-axis resolved elastic values.
		*/
		this.elastic = createBox();
		/**
		* The latest pointer event. Used as fallback when the `cancel` and `stop` functions are called without arguments.
		*/
		this.latestPointerEvent = null;
		/**
		* The latest pan info. Used as fallback when the `cancel` and `stop` functions are called without arguments.
		*/
		this.latestPanInfo = null;
		this.visualElement = visualElement;
	}
	start(originEvent, { snapToCursor = false, distanceThreshold } = {}) {
		/**
		* Don't start dragging if this component is exiting
		*/
		const { presenceContext } = this.visualElement;
		if (presenceContext && presenceContext.isPresent === false) return;
		const onSessionStart = (event) => {
			if (snapToCursor) this.snapToCursor(event);
			this.stopAnimation();
		};
		const onStart = (event, info) => {
			const { drag, dragPropagation, onDragStart } = this.getProps();
			if (drag && !dragPropagation) {
				if (this.openDragLock) this.openDragLock();
				this.openDragLock = setDragLock(drag);
				if (!this.openDragLock) return;
			}
			this.latestPointerEvent = event;
			this.latestPanInfo = info;
			this.isDragging = true;
			this.currentDirection = null;
			this.resolveConstraints();
			if (this.visualElement.projection) {
				this.visualElement.projection.isAnimationBlocked = true;
				this.visualElement.projection.target = void 0;
			}
			/**
			* Record gesture origin and pointer offset
			*/
			eachAxis((axis) => {
				let current = this.getAxisMotionValue(axis).get() || 0;
				/**
				* If the MotionValue is a percentage value convert to px
				*/
				if (percent.test(current)) {
					const { projection } = this.visualElement;
					if (projection && projection.layout) {
						const measuredAxis = projection.layout.layoutBox[axis];
						if (measuredAxis) current = calcLength(measuredAxis) * (parseFloat(current) / 100);
					}
				}
				this.originPoint[axis] = current;
			});
			if (onDragStart) frame.update(() => onDragStart(event, info), false, true);
			addValueToWillChange(this.visualElement, "transform");
			const { animationState } = this.visualElement;
			animationState && animationState.setActive("whileDrag", true);
		};
		const onMove = (event, info) => {
			this.latestPointerEvent = event;
			this.latestPanInfo = info;
			const { dragPropagation, dragDirectionLock, onDirectionLock, onDrag } = this.getProps();
			if (!dragPropagation && !this.openDragLock) return;
			const { offset } = info;
			if (dragDirectionLock && this.currentDirection === null) {
				this.currentDirection = getCurrentDirection(offset);
				if (this.currentDirection !== null) onDirectionLock && onDirectionLock(this.currentDirection);
				return;
			}
			this.updateAxis("x", info.point, offset);
			this.updateAxis("y", info.point, offset);
			/**
			* Ideally we would leave the renderer to fire naturally at the end of
			* this frame but if the element is about to change layout as the result
			* of a re-render we want to ensure the browser can read the latest
			* bounding box to ensure the pointer and element don't fall out of sync.
			*/
			this.visualElement.render();
			/**
			* This must fire after the render call as it might trigger a state
			* change which itself might trigger a layout update.
			*/
			if (onDrag) frame.update(() => onDrag(event, info), false, true);
		};
		const onSessionEnd = (event, info) => {
			this.latestPointerEvent = event;
			this.latestPanInfo = info;
			this.stop(event, info);
			this.latestPointerEvent = null;
			this.latestPanInfo = null;
		};
		const resumeAnimation = () => {
			const { dragSnapToOrigin: snap } = this.getProps();
			if (snap || this.constraints) this.startAnimation({
				x: 0,
				y: 0
			});
		};
		const { dragSnapToOrigin } = this.getProps();
		this.panSession = new PanSession(originEvent, {
			onSessionStart,
			onStart,
			onMove,
			onSessionEnd,
			resumeAnimation
		}, {
			transformPagePoint: this.visualElement.getTransformPagePoint(),
			dragSnapToOrigin,
			distanceThreshold,
			contextWindow: getContextWindow(this.visualElement),
			element: this.visualElement.current
		});
	}
	/**
	* @internal
	*/
	stop(event, panInfo) {
		const finalEvent = event || this.latestPointerEvent;
		const finalPanInfo = panInfo || this.latestPanInfo;
		const isDragging = this.isDragging;
		this.cancel();
		if (!isDragging || !finalPanInfo || !finalEvent) return;
		const { velocity } = finalPanInfo;
		this.startAnimation(velocity);
		const { onDragEnd } = this.getProps();
		if (onDragEnd) frame.postRender(() => onDragEnd(finalEvent, finalPanInfo));
	}
	/**
	* @internal
	*/
	cancel() {
		this.isDragging = false;
		const { projection, animationState } = this.visualElement;
		if (projection) projection.isAnimationBlocked = false;
		this.endPanSession();
		const { dragPropagation } = this.getProps();
		if (!dragPropagation && this.openDragLock) {
			this.openDragLock();
			this.openDragLock = null;
		}
		animationState && animationState.setActive("whileDrag", false);
	}
	/**
	* Clean up the pan session without modifying other drag state.
	* This is used during unmount to ensure event listeners are removed
	* without affecting projection animations or drag locks.
	* @internal
	*/
	endPanSession() {
		this.panSession && this.panSession.end();
		this.panSession = void 0;
	}
	updateAxis(axis, _point, offset) {
		const { drag } = this.getProps();
		if (!offset || !shouldDrag(axis, drag, this.currentDirection)) return;
		const axisValue = this.getAxisMotionValue(axis);
		let next = this.originPoint[axis] + offset[axis];
		if (this.constraints && this.constraints[axis]) next = applyConstraints(next, this.constraints[axis], this.elastic[axis]);
		axisValue.set(next);
	}
	resolveConstraints() {
		const { dragConstraints, dragElastic } = this.getProps();
		const layout = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(false) : this.visualElement.projection?.layout;
		const prevConstraints = this.constraints;
		if (dragConstraints && isRefObject(dragConstraints)) {
			if (!this.constraints) this.constraints = this.resolveRefConstraints();
		} else if (dragConstraints && layout) this.constraints = calcRelativeConstraints(layout.layoutBox, dragConstraints);
		else this.constraints = false;
		this.elastic = resolveDragElastic(dragElastic);
		/**
		* If we're outputting to external MotionValues, we want to rebase the measured constraints
		* from viewport-relative to component-relative. This only applies to relative (non-ref)
		* constraints, as ref-based constraints from calcViewportConstraints are already in the
		* correct coordinate space for the motion value transform offset.
		*/
		if (prevConstraints !== this.constraints && !isRefObject(dragConstraints) && layout && this.constraints && !this.hasMutatedConstraints) eachAxis((axis) => {
			if (this.constraints !== false && this.getAxisMotionValue(axis)) this.constraints[axis] = rebaseAxisConstraints(layout.layoutBox[axis], this.constraints[axis]);
		});
	}
	resolveRefConstraints() {
		const { dragConstraints: constraints, onMeasureDragConstraints } = this.getProps();
		if (!constraints || !isRefObject(constraints)) return false;
		const constraintsElement = constraints.current;
		invariant(constraintsElement !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
		const { projection } = this.visualElement;
		if (!projection || !projection.layout) return false;
		/**
		* Refresh the root scroll offset so the constraint's viewport box
		* translates to correct page coordinates. The scroll captured at
		* drag mount can be stale if the document was scrolled afterwards —
		* e.g. via the browser restoring scroll on refresh, or an ancestor
		* layout effect running after this element's mount (#2829).
		*
		* Clear the cached scroll first so `updateScroll` bypasses its
		* per-animationId cache and re-reads the live value.
		*/
		if (projection.root) {
			projection.root.scroll = void 0;
			projection.root.updateScroll();
		}
		const constraintsBox = measurePageBox(constraintsElement, projection.root, this.visualElement.getTransformPagePoint());
		let measuredConstraints = calcViewportConstraints(projection.layout.layoutBox, constraintsBox);
		/**
		* If there's an onMeasureDragConstraints listener we call it and
		* if different constraints are returned, set constraints to that
		*/
		if (onMeasureDragConstraints) {
			const userConstraints = onMeasureDragConstraints(convertBoxToBoundingBox(measuredConstraints));
			this.hasMutatedConstraints = !!userConstraints;
			if (userConstraints) measuredConstraints = convertBoundingBoxToBox(userConstraints);
		}
		return measuredConstraints;
	}
	startAnimation(velocity) {
		const { drag, dragMomentum, dragElastic, dragTransition, dragSnapToOrigin, onDragTransitionEnd } = this.getProps();
		const constraints = this.constraints || {};
		const momentumAnimations = eachAxis((axis) => {
			if (!shouldDrag(axis, drag, this.currentDirection)) return;
			let transition = constraints && constraints[axis] || {};
			if (dragSnapToOrigin === true || dragSnapToOrigin === axis) transition = {
				min: 0,
				max: 0
			};
			/**
			* Overdamp the boundary spring if `dragElastic` is disabled. There's still a frame
			* of spring animations so we should look into adding a disable spring option to `inertia`.
			* We could do something here where we affect the `bounceStiffness` and `bounceDamping`
			* using the value of `dragElastic`.
			*/
			const bounceStiffness = dragElastic ? 200 : 1e6;
			const bounceDamping = dragElastic ? 40 : 1e7;
			const inertia = {
				type: "inertia",
				velocity: dragMomentum ? velocity[axis] : 0,
				bounceStiffness,
				bounceDamping,
				timeConstant: 750,
				restDelta: 1,
				restSpeed: 10,
				...dragTransition,
				...transition
			};
			return this.startAxisValueAnimation(axis, inertia);
		});
		return Promise.all(momentumAnimations).then(onDragTransitionEnd);
	}
	startAxisValueAnimation(axis, transition) {
		const axisValue = this.getAxisMotionValue(axis);
		addValueToWillChange(this.visualElement, axis);
		return axisValue.start(animateMotionValue(axis, axisValue, 0, transition, this.visualElement, false));
	}
	stopAnimation() {
		eachAxis((axis) => this.getAxisMotionValue(axis).stop());
	}
	/**
	* Drag works differently depending on which props are provided.
	*
	* - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
	* - Otherwise, we apply the delta to the x/y motion values.
	*/
	getAxisMotionValue(axis) {
		const dragKey = `_drag${axis.toUpperCase()}`;
		const externalMotionValue = this.visualElement.getProps()[dragKey];
		return externalMotionValue ? externalMotionValue : this.visualElement.getValue(axis, this.visualElement.latestValues[axis] ?? 0);
	}
	/**
	* Measure the live box - projection.layout may or may not include the
	* drag transform, depending on when it was measured.
	*/
	snapToCursor({ clientX, clientY }) {
		const { drag } = this.getProps();
		const point = {
			x: clientX,
			y: clientY
		};
		const cursor = this.visualElement.getTransformPagePoint()?.(point) || point;
		const box = this.visualElement.measureViewportBox();
		eachAxis((axis) => {
			if (!shouldDrag(axis, drag, this.currentDirection)) return;
			const axisValue = this.getAxisMotionValue(axis);
			const { min, max } = box[axis];
			axisValue.set((axisValue.get() || 0) + cursor[axis] - mixNumber(min, max, .5));
		});
	}
	/**
	* When the viewport resizes we want to check if the measured constraints
	* have changed and, if so, reposition the element within those new constraints
	* relative to where it was before the resize.
	*/
	scalePositionWithinConstraints() {
		if (!this.visualElement.current) return;
		const { drag, dragConstraints } = this.getProps();
		const { projection } = this.visualElement;
		if (!isRefObject(dragConstraints) || !projection || !this.constraints) return;
		/**
		* Stop current animations as there can be visual glitching if we try to do
		* this mid-animation
		*/
		this.stopAnimation();
		/**
		* Record the relative position of the dragged element relative to the
		* constraints box and save as a progress value.
		*/
		const constraints = this.constraints;
		const boxProgress = {
			x: 0,
			y: 0
		};
		eachAxis((axis) => {
			const latest = this.getAxisMotionValue(axis).get();
			boxProgress[axis] = calcOrigin({
				min: latest,
				max: latest
			}, constraints[axis]);
		});
		/**
		* Update the layout of this element and resolve the latest drag constraints
		*/
		const { transformTemplate } = this.visualElement.getProps();
		this.visualElement.current.style.transform = transformTemplate ? transformTemplate({}, "") : "none";
		projection.root && projection.root.updateScroll();
		projection.updateLayout();
		/**
		* Reset constraints so resolveConstraints() will recalculate them
		* with the freshly measured layout rather than returning the cached value.
		*/
		this.constraints = false;
		this.resolveConstraints();
		/**
		* For each axis, calculate the current progress of the layout axis
		* within the new constraints.
		*/
		eachAxis((axis) => {
			const axisValue = this.getAxisMotionValue(axis);
			/**
			* An element resting at its origin has no offset to preserve,
			* and re-projecting 0 into the new constraints would move it.
			*/
			if (!shouldDrag(axis, drag, null) || !axisValue.get()) return;
			/**
			* Calculate a new transform based on the previous box progress
			*/
			const { min, max } = this.constraints[axis];
			axisValue.set(mixNumber(min, max, boxProgress[axis]));
		});
		/**
		* Flush the updated transform to the DOM synchronously to prevent
		* a visual flash at the element's CSS layout position (0,0) when
		* the transform was stripped for measurement.
		*/
		this.visualElement.render();
	}
	addListeners() {
		if (!this.visualElement.current) return;
		elementDragControls.set(this.visualElement, this);
		const element = this.visualElement.current;
		/**
		* Attach a pointerdown event listener on this DOM element to initiate drag tracking.
		*/
		const stopPointerListener = addPointerEvent(element, "pointerdown", (event) => {
			const { drag, dragListener = true } = this.getProps();
			const target = event.target;
			/**
			* Only block drag if clicking on a text input child element
			* (input, textarea, select, contenteditable) where users might
			* want to select text or interact with the control.
			*
			* Buttons and links don't block drag since they don't have
			* click-and-move actions of their own.
			*/
			const isClickingTextInputChild = target !== element && isElementTextInput(target);
			if (drag && dragListener && !isClickingTextInputChild) this.start(event);
		});
		/**
		* If using ref-based constraints, observe both the draggable element
		* and the constraint container for size changes via ResizeObserver.
		* Setup is deferred because dragConstraints.current is null when
		* addListeners first runs (React hasn't committed the ref yet).
		*/
		let stopResizeObservers;
		const measureDragConstraints = () => {
			const { dragConstraints } = this.getProps();
			if (isRefObject(dragConstraints) && dragConstraints.current) {
				this.constraints = this.resolveRefConstraints();
				if (!stopResizeObservers) stopResizeObservers = startResizeObservers(element, dragConstraints.current, () => this.scalePositionWithinConstraints());
			}
		};
		const { projection } = this.visualElement;
		const stopMeasureLayoutListener = projection.addEventListener("measure", measureDragConstraints);
		if (projection && !projection.layout) {
			projection.root && projection.root.updateScroll();
			projection.updateLayout();
		}
		frame.read(measureDragConstraints);
		/**
		* Attach a window resize listener to scale the draggable target within its defined
		* constraints as the window resizes.
		*/
		const stopResizeListener = addDomEvent(window, "resize", () => this.scalePositionWithinConstraints());
		/**
		* If the element's layout changes, calculate the delta and apply that to
		* the drag gesture's origin point.
		*/
		const stopLayoutUpdateListener = projection.addEventListener("didUpdate", (({ delta, hasLayoutChanged }) => {
			if (this.isDragging && hasLayoutChanged) {
				eachAxis((axis) => {
					const motionValue = this.getAxisMotionValue(axis);
					if (!motionValue) return;
					this.originPoint[axis] += delta[axis].translate;
					motionValue.set(motionValue.get() + delta[axis].translate);
				});
				this.visualElement.render();
			}
		}));
		return () => {
			stopResizeListener();
			stopPointerListener();
			stopMeasureLayoutListener();
			stopLayoutUpdateListener && stopLayoutUpdateListener();
			stopResizeObservers && stopResizeObservers();
		};
	}
	getProps() {
		const props = this.visualElement.getProps();
		const { drag = false, dragDirectionLock = false, dragPropagation = false, dragConstraints = false, dragElastic = defaultElastic, dragMomentum = true } = props;
		return {
			...props,
			drag,
			dragDirectionLock,
			dragPropagation,
			dragConstraints,
			dragElastic,
			dragMomentum
		};
	}
};
function skipFirstCall(callback) {
	let isFirst = true;
	return () => {
		if (isFirst) {
			isFirst = false;
			return;
		}
		callback();
	};
}
function startResizeObservers(element, constraintsElement, onResize) {
	const stopElement = resize(element, skipFirstCall(onResize));
	const stopContainer = resize(constraintsElement, skipFirstCall(onResize));
	return () => {
		stopElement();
		stopContainer();
	};
}
function shouldDrag(direction, drag, currentDirection) {
	return (drag === true || drag === direction) && (currentDirection === null || currentDirection === direction);
}
/**
* Based on an x/y offset determine the current drag direction. If both axis' offsets are lower
* than the provided threshold, return `null`.
*
* @param offset - The x/y offset from origin.
* @param lockThreshold - (Optional) - the minimum absolute offset before we can determine a drag direction.
*/
function getCurrentDirection(offset, lockThreshold = 10) {
	let direction = null;
	if (Math.abs(offset.y) > lockThreshold) direction = "y";
	else if (Math.abs(offset.x) > lockThreshold) direction = "x";
	return direction;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/gestures/drag/index.mjs
var DragGesture = class extends Feature {
	constructor(node) {
		super(node);
		this.removeGroupControls = noop;
		this.removeListeners = noop;
		this.controls = new VisualElementDragControls(node);
	}
	mount() {
		const { dragControls } = this.node.getProps();
		if (dragControls) this.removeGroupControls = dragControls.subscribe(this.controls);
		this.removeListeners = this.controls.addListeners() || noop;
	}
	update() {
		const { dragControls } = this.node.getProps();
		const { dragControls: prevDragControls } = this.node.prevProps || {};
		if (dragControls !== prevDragControls) {
			this.removeGroupControls();
			if (dragControls) this.removeGroupControls = dragControls.subscribe(this.controls);
		}
	}
	unmount() {
		this.removeGroupControls();
		this.removeListeners();
		/**
		* In React 19, during list reorder reconciliation, components may
		* briefly unmount and remount while the drag is still active. If we're
		* actively dragging, we should NOT end the pan session - it will
		* continue tracking pointer events via its window-level listeners.
		*
		* The pan session will be properly cleaned up when:
		* 1. The drag ends naturally (pointerup/pointercancel)
		* 2. The component is truly removed from the DOM
		*/
		if (!this.controls.isDragging) this.controls.endPanSession();
	}
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/gestures/pan/index.mjs
var asyncHandler = (handler) => (event, info) => {
	if (handler) frame.update(() => handler(event, info), false, true);
};
var PanGesture = class extends Feature {
	constructor() {
		super(...arguments);
		this.removePointerDownListener = noop;
	}
	onPointerDown(pointerDownEvent) {
		this.session = new PanSession(pointerDownEvent, this.createPanHandlers(), {
			transformPagePoint: this.node.getTransformPagePoint(),
			contextWindow: getContextWindow(this.node)
		});
	}
	createPanHandlers() {
		const { onPanSessionStart, onPanStart, onPan, onPanEnd } = this.node.getProps();
		return {
			onSessionStart: asyncHandler(onPanSessionStart),
			onStart: asyncHandler(onPanStart),
			onMove: asyncHandler(onPan),
			onEnd: (event, info) => {
				delete this.session;
				if (onPanEnd) frame.postRender(() => onPanEnd(event, info));
			}
		};
	}
	mount() {
		this.removePointerDownListener = addPointerEvent(this.node.current, "pointerdown", (event) => this.onPointerDown(event));
	}
	update() {
		this.session && this.session.updateHandlers(this.createPanHandlers());
	}
	unmount() {
		this.removePointerDownListener();
		this.session && this.session.end();
	}
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/layout/MeasureLayout.mjs
/**
* Track whether we've taken any snapshots yet. If not,
* we can safely skip notification of didUpdate.
*
* Difficult to capture in a test but to prevent flickering
* we must set this to true either on update or unmount.
* Running `next-env/layout-id` in Safari will show this behaviour if broken.
*/
var hasTakenAnySnapshot = false;
var MeasureLayoutWithContext = class extends import_react.Component {
	/**
	* This only mounts projection nodes for components that
	* need measuring, we might want to do it for all components
	* in order to incorporate transforms
	*/
	componentDidMount() {
		const { visualElement, layoutGroup, switchLayoutGroup, layoutId } = this.props;
		const { projection } = visualElement;
		if (projection) {
			if (layoutGroup.group) layoutGroup.group.add(projection);
			if (switchLayoutGroup && switchLayoutGroup.register && layoutId) switchLayoutGroup.register(projection);
			if (hasTakenAnySnapshot) projection.root.didUpdate();
			projection.addEventListener("animationComplete", () => {
				this.safeToRemove();
			});
			projection.setOptions({
				...projection.options,
				layoutDependency: this.props.layoutDependency,
				onExitComplete: () => this.safeToRemove()
			});
		}
		globalProjectionState.hasEverUpdated = true;
	}
	getSnapshotBeforeUpdate(prevProps) {
		const { layoutDependency, visualElement, drag, isPresent } = this.props;
		const { projection } = visualElement;
		if (!projection) return null;
		/**
		* TODO: We use this data in relegate to determine whether to
		* promote a previous element. There's no guarantee its presence data
		* will have updated by this point - if a bug like this arises it will
		* have to be that we markForRelegation and then find a new lead some other way,
		* perhaps in didUpdate
		*/
		projection.isPresent = isPresent;
		if (prevProps.layoutDependency !== layoutDependency) projection.setOptions({
			...projection.options,
			layoutDependency
		});
		hasTakenAnySnapshot = true;
		if (drag || prevProps.layoutDependency !== layoutDependency || layoutDependency === void 0 || prevProps.isPresent !== isPresent) projection.willUpdate();
		else this.safeToRemove();
		if (prevProps.isPresent !== isPresent) {
			if (isPresent) projection.promote();
			else if (!projection.relegate())
 /**
			* If there's another stack member taking over from this one,
			* it's in charge of the exit animation and therefore should
			* be in charge of the safe to remove. Otherwise we call it here.
			*/
			frame.postRender(() => {
				const stack = projection.getStack();
				if (!stack || !stack.members.length) this.safeToRemove();
			});
		}
		return null;
	}
	componentDidUpdate() {
		const { visualElement, layoutAnchor } = this.props;
		const { projection } = visualElement;
		if (projection) {
			projection.options.layoutAnchor = layoutAnchor;
			projection.root.didUpdate();
			microtask.postRender(() => {
				if (!projection.currentAnimation && projection.isLead()) this.safeToRemove();
			});
		}
	}
	componentWillUnmount() {
		const { visualElement, layoutGroup, switchLayoutGroup: promoteContext } = this.props;
		const { projection } = visualElement;
		hasTakenAnySnapshot = true;
		if (projection) {
			projection.scheduleCheckAfterUnmount();
			if (layoutGroup && layoutGroup.group) layoutGroup.group.remove(projection);
			if (promoteContext && promoteContext.deregister) promoteContext.deregister(projection);
		}
	}
	safeToRemove() {
		const { safeToRemove } = this.props;
		safeToRemove && safeToRemove();
	}
	render() {
		return null;
	}
};
function MeasureLayout(props) {
	const [isPresent, safeToRemove] = usePresence();
	const layoutGroup = (0, import_react.useContext)(LayoutGroupContext);
	return (0, import_jsx_runtime.jsx)(MeasureLayoutWithContext, {
		...props,
		layoutGroup,
		switchLayoutGroup: (0, import_react.useContext)(SwitchLayoutGroupContext),
		isPresent,
		safeToRemove
	});
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/drag.mjs
var drag = {
	pan: { Feature: PanGesture },
	drag: {
		Feature: DragGesture,
		ProjectionNode: HTMLProjectionNode,
		MeasureLayout
	}
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/gestures/hover.mjs
function handleHoverEvent(node, event, lifecycle) {
	const { props } = node;
	if (node.animationState && props.whileHover) node.animationState.setActive("whileHover", lifecycle === "Start");
	const callback = props["onHover" + lifecycle];
	if (callback) frame.postRender(() => callback(event, extractEventInfo(event)));
}
var HoverGesture = class extends Feature {
	mount() {
		const { current } = this.node;
		if (!current) return;
		this.unmount = hover(current, (_element, startEvent) => {
			handleHoverEvent(this.node, startEvent, "Start");
			return (endEvent) => handleHoverEvent(this.node, endEvent, "End");
		});
	}
	unmount() {}
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/gestures/focus.mjs
var FocusGesture = class extends Feature {
	constructor() {
		super(...arguments);
		this.isActive = false;
	}
	onFocus() {
		let isFocusVisible = false;
		/**
		* If this element doesn't match focus-visible then don't
		* apply whileHover. But, if matches throws that focus-visible
		* is not a valid selector then in that browser outline styles will be applied
		* to the element by default and we want to match that behaviour with whileFocus.
		*/
		try {
			isFocusVisible = this.node.current.matches(":focus-visible");
		} catch (e) {
			isFocusVisible = true;
		}
		if (!isFocusVisible || !this.node.animationState) return;
		this.node.animationState.setActive("whileFocus", true);
		this.isActive = true;
	}
	onBlur() {
		if (!this.isActive || !this.node.animationState) return;
		this.node.animationState.setActive("whileFocus", false);
		this.isActive = false;
	}
	mount() {
		this.unmount = pipe(addDomEvent(this.node.current, "focus", () => this.onFocus()), addDomEvent(this.node.current, "blur", () => this.onBlur()));
	}
	unmount() {}
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/gestures/press.mjs
function handlePressEvent(node, event, lifecycle) {
	const { props } = node;
	if (node.current instanceof HTMLButtonElement && node.current.disabled) return;
	if (node.animationState && props.whileTap) node.animationState.setActive("whileTap", lifecycle === "Start");
	const callback = props["onTap" + (lifecycle === "End" ? "" : lifecycle)];
	if (callback) frame.postRender(() => callback(event, extractEventInfo(event)));
}
var PressGesture = class extends Feature {
	mount() {
		const { current } = this.node;
		if (!current) return;
		const { globalTapTarget, propagate } = this.node.props;
		this.unmount = press(current, (_element, startEvent) => {
			handlePressEvent(this.node, startEvent, "Start");
			return (endEvent, { success }) => handlePressEvent(this.node, endEvent, success ? "End" : "Cancel");
		}, {
			useGlobalTarget: globalTapTarget,
			stopPropagation: propagate?.tap === false
		});
	}
	unmount() {}
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/viewport/observers.mjs
/**
* Map an IntersectionHandler callback to an element. We only ever make one handler for one
* element, so even though these handlers might all be triggered by different
* observers, we can keep them in the same map.
*/
var observerCallbacks = /* @__PURE__ */ new WeakMap();
/**
* Multiple observers can be created for multiple element/document roots. Each with
* different settings. So here we store dictionaries of observers to each root,
* using serialised settings (threshold/margin) as lookup keys.
*/
var observers = /* @__PURE__ */ new WeakMap();
var fireObserverCallback = (entry) => {
	const callback = observerCallbacks.get(entry.target);
	callback && callback(entry);
};
var fireAllObserverCallbacks = (entries) => {
	entries.forEach(fireObserverCallback);
};
function initIntersectionObserver({ root, ...options }) {
	const lookupRoot = root || document;
	/**
	* If we don't have an observer lookup map for this root, create one.
	*/
	if (!observers.has(lookupRoot)) observers.set(lookupRoot, {});
	const rootObservers = observers.get(lookupRoot);
	const key = JSON.stringify(options);
	/**
	* If we don't have an observer for this combination of root and settings,
	* create one.
	*/
	if (!rootObservers[key]) rootObservers[key] = new IntersectionObserver(fireAllObserverCallbacks, {
		root,
		...options
	});
	return rootObservers[key];
}
function observeIntersection(element, options, callback) {
	const rootInteresectionObserver = initIntersectionObserver(options);
	observerCallbacks.set(element, callback);
	rootInteresectionObserver.observe(element);
	return () => {
		observerCallbacks.delete(element);
		rootInteresectionObserver.unobserve(element);
	};
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/viewport/index.mjs
var thresholdNames = {
	some: 0,
	all: 1
};
var InViewFeature = class extends Feature {
	constructor() {
		super(...arguments);
		this.hasEnteredView = false;
		this.isInView = false;
	}
	startObserver() {
		this.stopObserver?.();
		const { viewport = {} } = this.node.getProps();
		const { root, margin: rootMargin, amount = "some", once } = viewport;
		const options = {
			root: root ? root.current : void 0,
			rootMargin,
			threshold: typeof amount === "number" ? amount : thresholdNames[amount]
		};
		const onIntersectionUpdate = (entry) => {
			const { isIntersecting } = entry;
			/**
			* If there's been no change in the viewport state, early return.
			*/
			if (this.isInView === isIntersecting) return;
			this.isInView = isIntersecting;
			/**
			* Handle hasEnteredView. If this is only meant to run once, and
			* element isn't visible, early return. Otherwise set hasEnteredView to true.
			*/
			if (once && !isIntersecting && this.hasEnteredView) return;
			else if (isIntersecting) this.hasEnteredView = true;
			if (this.node.animationState) this.node.animationState.setActive("whileInView", isIntersecting);
			/**
			* Use the latest committed props rather than the ones in scope
			* when this observer is created
			*/
			const { onViewportEnter, onViewportLeave } = this.node.getProps();
			const callback = isIntersecting ? onViewportEnter : onViewportLeave;
			callback && callback(entry);
		};
		this.stopObserver = observeIntersection(this.node.current, options, onIntersectionUpdate);
	}
	mount() {
		this.startObserver();
	}
	update() {
		if (typeof IntersectionObserver === "undefined") return;
		const { props, prevProps } = this.node;
		if ([
			"amount",
			"margin",
			"root"
		].some(hasViewportOptionChanged(props, prevProps))) this.startObserver();
	}
	unmount() {
		this.stopObserver?.();
		this.hasEnteredView = false;
		this.isInView = false;
	}
};
function hasViewportOptionChanged({ viewport = {} }, { viewport: prevViewport = {} } = {}) {
	return (name) => viewport[name] !== prevViewport[name];
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/gestures.mjs
var gestureAnimations = {
	inView: { Feature: InViewFeature },
	tap: { Feature: PressGesture },
	focus: { Feature: FocusGesture },
	hover: { Feature: HoverGesture }
};
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/motion/features/layout.mjs
var layout = { layout: {
	ProjectionNode: HTMLProjectionNode,
	MeasureLayout
} };
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs
var motion$1 = /*@__PURE__*/ createMotionProxy({
	...animations,
	...gestureAnimations,
	...drag,
	...layout
}, createDomVisualElement);
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/use-motion-value-event.mjs
function useMotionValueEvent(value, event, callback) {
	/**
	* useInsertionEffect will create subscriptions before any other
	* effects will run. Effects run upwards through the tree so it
	* can be that binding a useLayoutEffect higher up the tree can
	* miss changes from lower down the tree.
	*/
	(0, import_react.useInsertionEffect)(() => value.on(event, callback), [
		value,
		event,
		callback
	]);
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/value/use-motion-value.mjs
/**
* Creates a `MotionValue` to track the state and velocity of a value.
*
* Usually, these are created automatically. For advanced use-cases, like use with `useTransform`, you can create `MotionValue`s externally and pass them into the animated component via the `style` prop.
*
* ```jsx
* export const MyComponent = () => {
*   const scale = useMotionValue(1)
*
*   return <motion.div style={{ scale }} />
* }
* ```
*
* @param initial - The initial state.
*
* @public
*/
function useMotionValue(initial) {
	const value = useConstant(() => motionValue(initial));
	/**
	* If this motion value is being used in static mode, like on
	* the Framer canvas, force components to rerender when the motion
	* value is updated.
	*/
	const { isStatic } = (0, import_react.useContext)(MotionConfigContext);
	if (isStatic) {
		const [, setLatest] = (0, import_react.useState)(initial);
		(0, import_react.useEffect)(() => value.on("change", setLatest), []);
	}
	return value;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/value/use-combine-values.mjs
function useCombineMotionValues(values, combineValues) {
	/**
	* Initialise the returned motion value. This remains the same between renders.
	*/
	const value = useMotionValue(combineValues());
	/**
	* Create a function that will update the template motion value with the latest values.
	* This is pre-bound so whenever a motion value updates it can schedule its
	* execution in Framesync. If it's already been scheduled it won't be fired twice
	* in a single frame.
	*/
	const updateValue = () => value.set(combineValues());
	/**
	* Synchronously update the motion value with the latest values during the render.
	* This ensures that within a React render, the styles applied to the DOM are up-to-date.
	*/
	updateValue();
	/**
	* Subscribe to all motion values found within the template. Whenever any of them change,
	* schedule an update.
	*/
	useIsomorphicLayoutEffect(() => {
		const scheduleUpdate = () => frame.preRender(updateValue, false, true);
		const subscriptions = values.map((v) => v.on("change", scheduleUpdate));
		/**
		* Catch up on changes made while unsubscribed. A source can change
		* between render and this subscription (e.g. in a child's layout
		* effect), and Strict Mode or <Activity> can re-run this effect
		* without a render after the cleanup cancelled a scheduled update.
		*/
		updateValue();
		return () => {
			subscriptions.forEach((unsubscribe) => unsubscribe());
			cancelFrame(updateValue);
		};
	});
	return value;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/value/use-computed.mjs
function useComputed(compute) {
	/**
	* Open session of collectMotionValues. Any MotionValue that calls get()
	* will be saved into this array.
	*/
	collectMotionValues.current = [];
	compute();
	const value = useCombineMotionValues(collectMotionValues.current, compute);
	/**
	* Synchronously close session of collectMotionValues.
	*/
	collectMotionValues.current = void 0;
	return value;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/value/use-transform.mjs
function useTransform(input, inputRangeOrTransformer, outputRangeOrMap, options) {
	if (typeof input === "function") return useComputed(input);
	if (outputRangeOrMap !== void 0 && !Array.isArray(outputRangeOrMap) && typeof inputRangeOrTransformer !== "function") return useMapTransform(input, inputRangeOrTransformer, outputRangeOrMap, options);
	const transformer = typeof inputRangeOrTransformer === "function" ? inputRangeOrTransformer : transform(inputRangeOrTransformer, outputRangeOrMap, options);
	const result = Array.isArray(input) ? useListTransform(input, transformer) : useListTransform([input], ([latest]) => transformer(latest));
	const inputAccelerate = !Array.isArray(input) ? input.accelerate : void 0;
	if (inputAccelerate && !inputAccelerate.isTransformed && typeof inputRangeOrTransformer !== "function" && Array.isArray(outputRangeOrMap) && options?.clamp !== false) {
		const ease = options?.ease;
		/**
		* WAAPI fills missing 0 and 1 offsets with the underlying value, so
		* hold the end values to match the clamped transform.
		*/
		result.accelerate = {
			...inputAccelerate,
			times: [
				0,
				...inputRangeOrTransformer,
				1
			],
			keyframes: [
				outputRangeOrMap[0],
				...outputRangeOrMap,
				outputRangeOrMap[outputRangeOrMap.length - 1]
			],
			isTransformed: true,
			...ease ? { ease: Array.isArray(ease) ? [ease[0], ...ease] : ease } : {}
		};
	}
	return result;
}
function useListTransform(values, transformer) {
	const latest = useConstant(() => []);
	return useCombineMotionValues(values, () => {
		latest.length = 0;
		const numValues = values.length;
		for (let i = 0; i < numValues; i++) latest[i] = values[i].get();
		return transformer(latest);
	});
}
function useMapTransform(inputValue, inputRange, outputMap, options) {
	/**
	* Capture keys once to ensure hooks are called in consistent order.
	*/
	const keys = useConstant(() => Object.keys(outputMap));
	const output = useConstant(() => ({}));
	for (const key of keys) output[key] = useTransform(inputValue, inputRange, outputMap[key], options);
	return output;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/value/use-follow-value.mjs
function useFollow(source, options, attach) {
	const { isStatic } = (0, import_react.useContext)(MotionConfigContext);
	const getFromSource = () => isMotionValue(source) ? source.get() : source;
	if (isStatic) return useTransform(getFromSource);
	const value = useMotionValue(getFromSource());
	(0, import_react.useInsertionEffect)(() => {
		return attach(value, source, options);
	}, [value, JSON.stringify(options)]);
	return value;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/value/use-spring.mjs
function useSpring(source, options = {}) {
	return useFollow(source, options, attachSpring);
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/use-animation-frame.mjs
function useAnimationFrame(callback) {
	const initialTimestamp = (0, import_react.useRef)(0);
	const { isStatic } = (0, import_react.useContext)(MotionConfigContext);
	(0, import_react.useEffect)(() => {
		if (isStatic) return;
		const provideTimeSinceStart = ({ timestamp, delta }) => {
			if (!initialTimestamp.current) initialTimestamp.current = timestamp;
			callback(timestamp - initialTimestamp.current, delta);
		};
		frame.update(provideTimeSinceStart, true);
		return () => cancelFrame(provideTimeSinceStart);
	}, [callback]);
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs
/**
* A hook that returns `true` if we should be using reduced motion based on the current device's Reduced Motion setting.
*
* This can be used to implement changes to your UI based on Reduced Motion. For instance, replacing motion-sickness inducing
* `x`/`y` animations with `opacity`, disabling the autoplay of background videos, or turning off parallax motion.
*
* It will actively respond to changes and re-render your components with the latest setting.
*
* ```jsx
* export function Sidebar({ isOpen }) {
*   const shouldReduceMotion = useReducedMotion()
*   const closedX = shouldReduceMotion ? 0 : "-100%"
*
*   return (
*     <motion.div animate={{
*       opacity: isOpen ? 1 : 0,
*       x: isOpen ? 0 : closedX
*     }} />
*   )
* }
* ```
*
* @return boolean
*
* @public
*/
function useReducedMotion() {
	/**
	* Lazy initialisation of prefersReducedMotion
	*/
	!hasReducedMotionListener.current && initPrefersReducedMotion();
	const [shouldReduceMotion] = (0, import_react.useState)(prefersReducedMotion$1.current);
	warnOnce(shouldReduceMotion !== true, "You have Reduced Motion enabled on your device. Animations may not appear as expected.", "reduced-motion-disabled");
	/**
	* TODO See if people miss automatically updating shouldReduceMotion setting
	*/
	return shouldReduceMotion;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/use-in-view.mjs
function useInView(ref, { root, margin, amount, once = false, initial = false } = {}) {
	const [isInView, setInView] = (0, import_react.useState)(initial);
	(0, import_react.useEffect)(() => {
		if (!ref.current || once && isInView) return;
		const onEnter = () => {
			setInView(true);
			return once ? void 0 : () => setInView(false);
		};
		const options = {
			root: root && root.current || void 0,
			margin,
			amount
		};
		return inView(ref.current, onEnter, options);
	}, [
		root,
		ref,
		margin,
		once,
		amount
	]);
	return isInView;
}
//#endregion
//#region ets-grid-site/node_modules/framer-motion/dist/es/utils/use-page-in-view.mjs
function usePageInView() {
	const [isInView, setIsInView] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const handleVisibilityChange = () => setIsInView(!document.hidden);
		if (document.hidden) handleVisibilityChange();
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);
	return isInView;
}
//#endregion
//#region ets-grid-site/node_modules/motion/dist/es/react.mjs
var motion = motion$1;
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/get-cursor-size.mjs
var DEFAULT_SIZE = 17;
var POINTER_SIZE = 31;
var TEXT_WIDTH = 4;
var TEXT_HEIGHT = 20;
function withDefaultSize(width, height, style) {
	return {
		width: style?.width ?? width,
		height: style?.height ?? height
	};
}
function getCursorSize({ type, state, hasChildren, style, isMagnetic, magneticOptions, matchTextSize }) {
	const shouldMatchTargetSize = isMagnetic && state.targetBoundingBox;
	if (hasChildren && !shouldMatchTargetSize) return withDefaultSize("auto", "auto", style);
	switch (type) {
		case "pointer":
			const { padding, morph } = magneticOptions;
			if (isMagnetic && morph && state.targetBoundingBox) {
				const { width, height } = state.targetBoundingBox;
				return {
					width: width + padding * 2,
					height: height + padding * 2
				};
			}
			return withDefaultSize(POINTER_SIZE, POINTER_SIZE, style);
		case "text":
			if (matchTextSize && state.fontSize) return {
				width: TEXT_WIDTH,
				height: state.fontSize
			};
			return withDefaultSize(TEXT_WIDTH, TEXT_HEIGHT, style);
		default: return withDefaultSize(DEFAULT_SIZE, DEFAULT_SIZE, style);
	}
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/hooks/use-body-portal.mjs
var import_react_dom = require_react_dom();
function useBodyPortal(children) {
	const [hostElement, setHostElement] = (0, import_react.useState)(null);
	(0, import_react.useLayoutEffect)(() => {
		setHostElement(document.body);
	}, []);
	return hostElement ? (0, import_react_dom.createPortal)(children, hostElement) : null;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/hooks/use-cursor-in-view.mjs
var listener$1 = null;
function startInViewListener() {
	const listeners = /* @__PURE__ */ new Set();
	function showCursor() {
		listeners.forEach((listener) => listener.show());
	}
	function hideCursor() {
		listeners.forEach((listener) => listener.hide());
	}
	function addEventListeners() {
		document.body.addEventListener("mouseenter", showCursor);
		document.body.addEventListener("mouseleave", hideCursor);
	}
	function removeEventListeners() {
		document.body.removeEventListener("mouseenter", showCursor);
		document.body.removeEventListener("mouseleave", hideCursor);
	}
	return { on: (callbacks) => {
		if (!listeners.size) addEventListeners();
		listeners.add(callbacks);
		return () => {
			listeners.delete(callbacks);
			if (listeners.size === 0) removeEventListeners();
		};
	} };
}
function getInViewListener() {
	if (!listener$1) listener$1 = startInViewListener();
	return listener$1;
}
function useCursorIsInView(resetSpring) {
	const [isVisible, setIsVisible] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		return getInViewListener().on({
			show: () => {
				if (isVisible) return;
				resetSpring();
				setIsVisible(true);
			},
			hide: () => setIsVisible(false)
		});
	}, [isVisible]);
	return isVisible;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/hooks/utils/only-mouse-events.mjs
function onlyMouse(callback) {
	return (event) => {
		if (event.pointerType === "mouse") callback(event);
	};
}
function onlyLeftClicks(callback) {
	return onlyMouse((event) => {
		if (event.button === 0) callback(event);
	});
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/hooks/use-cursor-state/find-target.mjs
function findCustomTarget(target) {
	return target.closest("[data-cursor]");
}
function findPointerTarget(element) {
	return element.closest("a, button, input[type=\"button\"]:not(:disabled)");
}
function findTextTarget(element) {
	if (window.getComputedStyle(element).userSelect === "none") return null;
	return element.closest("p, textarea:not(:disabled), input[type='text']:not(:disabled), h1, h2, h3, h4, h5, h6");
}
function findTarget(eventTarget) {
	let target = findCustomTarget(eventTarget);
	if (target) return [target.dataset.cursor, target];
	target = findPointerTarget(eventTarget);
	if (target) return ["pointer", target];
	target = findTextTarget(eventTarget);
	if (target) return ["text", target];
	return ["default", null];
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/hooks/use-cursor-state/index.mjs
var listener = null;
var state = {
	type: "default",
	isPressed: false,
	fontSize: null,
	targetBoundingBox: null,
	target: null,
	zone: null
};
function getZone(target) {
	let zone = null;
	if ("closest" in target) {
		const zoneElement = target.closest("[data-cursor-zone]");
		if (zoneElement instanceof HTMLElement) zone = zoneElement.dataset.cursorZone || null;
	}
	return zone;
}
function startPointerOverListener() {
	const listeners = /* @__PURE__ */ new Set();
	function updateState(newState) {
		state = {
			...state,
			...newState
		};
		listeners.forEach((listener) => listener(state));
	}
	const handlePointerDown = onlyLeftClicks(() => {
		if (!state.isPressed) updateState({ isPressed: true });
	});
	const handlePointerUp = onlyLeftClicks(() => {
		if (state.isPressed) updateState({ isPressed: false });
	});
	const handlePointerOver = onlyMouse(({ target }) => {
		if (!target) return;
		const [type, cursorTarget] = findTarget(target);
		let hasUpdated = false;
		let newState = {
			target: cursorTarget,
			zone: getZone(target)
		};
		if (type !== state.type) {
			newState.type = type;
			hasUpdated = true;
		}
		if (newState.zone !== state.zone) {
			newState.zone = newState.zone;
			hasUpdated = true;
		}
		const size = type === "pointer" && cursorTarget ? cursorTarget.getBoundingClientRect() : null;
		if (size !== state.targetBoundingBox) {
			newState.targetBoundingBox = size;
			hasUpdated = true;
		}
		if (type === "text") {
			const { fontSize: computedFontSize } = window.getComputedStyle(target);
			const newFontSize = computedFontSize ? parseInt(computedFontSize) : null;
			if (newFontSize !== state.fontSize) {
				newState.fontSize = newFontSize;
				hasUpdated = true;
			}
		} else if (state.fontSize) {
			newState.fontSize = null;
			hasUpdated = true;
		}
		if (hasUpdated) updateState(newState);
	});
	function addEventListeners() {
		window.addEventListener("pointerover", handlePointerOver);
		window.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("pointerup", handlePointerUp);
	}
	function removeEventListeners() {
		window.removeEventListener("pointerover", handlePointerOver);
		window.removeEventListener("pointerdown", handlePointerDown);
		window.removeEventListener("pointerup", handlePointerUp);
	}
	return { onChange: (callback) => {
		if (!listeners.size) addEventListeners();
		listeners.add(callback);
		return () => {
			listeners.delete(callback);
			if (!listeners.size) removeEventListeners();
		};
	} };
}
function getPointerOverListener() {
	if (!listener) listener = startPointerOverListener();
	return listener;
}
function useCursorState() {
	const [latestState, setLatestState] = (0, import_react.useState)({ ...state });
	(0, import_react.useEffect)(() => {
		return getPointerOverListener().onChange((newState) => {
			setLatestState(newState);
		});
	}, [latestState]);
	return latestState;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/hooks/use-has-pointer-moved.mjs
function useHasPointerMoved({ x, y }, resetSpring) {
	const [pointerHasMoved, setPointerHasMoved] = (0, import_react.useState)(x.prev !== void 0 || y.prev !== void 0);
	(0, import_react.useInsertionEffect)(() => {
		if (pointerHasMoved) return;
		const setHasMoved = () => {
			setPointerHasMoved(true);
			resetSpring();
			stop();
		};
		const stop = pipe(x.on("change", setHasMoved), y.on("change", setHasMoved));
		return () => stop();
	}, [
		x,
		y,
		pointerHasMoved
	]);
	return pointerHasMoved;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/hooks/use-offset.mjs
function useOffset$1(position, offset) {
	return {
		x: useTransform(() => position.x.get() + offset.x),
		y: useTransform(() => position.y.get() + offset.y)
	};
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/hooks/use-pointer-position.mjs
var x;
var y;
function initPointerTracking() {
	x = motionValue(0);
	y = motionValue(0);
	let pointerX = 0;
	let pointerY = 0;
	function updatePointer() {
		x.set(pointerX);
		y.set(pointerY);
	}
	if (typeof window !== "undefined") {
		window.addEventListener("pointermove", onlyMouse((event) => {
			pointerX = event.clientX;
			pointerY = event.clientY;
			/**
			* Don't update pointer until the next render frame to
			* avoid
			*
			* TODO: Update motion values to cache rendered value
			* and use that in projection measurements
			* instead of using this approach
			*/
			frame.update(updatePointer);
		}));
		window.addEventListener("dragover", (event) => {
			pointerX = event.clientX;
			pointerY = event.clientY;
			frame.update(updatePointer);
		});
	}
}
function usePointerPosition() {
	if (!x) initPointerTracking();
	return {
		x,
		y
	};
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/hooks/use-mixed.mjs
function useMixed(a, b, p) {
	return useTransform(() => mix(a.get(), b.get(), p.get()));
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/hooks/use-snapped-value.mjs
function useSnappedValue(pointer, snap, target) {
	const snapped = useSpring(0, {
		stiffness: 600,
		damping: 50
	});
	const crossfade = useMotionValue(0);
	const mixed = useMixed(pointer, snapped, crossfade);
	const prevTarget = (0, import_react.useRef)(target);
	useIsomorphicLayoutEffect(() => {
		if (target) {
			if (!prevTarget.current && !crossfade.isAnimating()) snapped.jump(target);
			else snapped.set(target);
			animate(crossfade, snap);
		} else animate(crossfade, 0);
		prevTarget.current = target;
	}, [target]);
	return mixed;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/magnetic/use-magnetic-target.mjs
function useMagneticTarget(pointer, isEnabled, state, snap) {
	const x = useSnappedValue(pointer.x, snap, state.targetBoundingBox ? state.targetBoundingBox.left + state.targetBoundingBox.width / 2 : void 0);
	const y = useSnappedValue(pointer.y, snap, state.targetBoundingBox ? state.targetBoundingBox.top + state.targetBoundingBox.height / 2 : void 0);
	return isEnabled ? {
		x,
		y
	} : pointer;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/use-cursor-styles.mjs
function makeStyles() {
	const style = document.createElement("style");
	style.textContent = `
      * {
          cursor: none !important;
      }
          
      [data-motion-cursor="pointer"] {
          background-color: #333;
      }
    `;
	document.head.appendChild(style);
	return () => {
		document.head.removeChild(style);
	};
}
function useCursorStyles(isCursor) {
	(0, import_react.useInsertionEffect)(isCursor ? makeStyles : noop, [isCursor]);
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/index.mjs
var topLeftPoint = {
	x: 0,
	y: 0
};
var centerPoint = {
	x: .5,
	y: .5
};
var skipTransition = { duration: 0 };
var defaults = {
	followSpring: {
		stiffness: 1e3,
		damping: 100
	},
	magneticOptions: {
		morph: true,
		padding: 5,
		snap: .8
	}
};
function Cursor({ follow = false, center = follow ? topLeftPoint : centerPoint, offset: offsetPoint = topLeftPoint, spring = follow ? defaults.followSpring : false, magnetic = false, matchTextSize = true, children, style, ...props }) {
	const shouldReduceMotion = useReducedMotion();
	useCursorStyles(!shouldReduceMotion && !follow);
	const position = usePointerPosition();
	const offset = useOffset$1(position, offsetPoint);
	const springX = useSpring(offset.x, spring || void 0);
	const springY = useSpring(offset.y, spring || void 0);
	const magneticOptions = typeof magnetic === "object" ? {
		...defaults.magneticOptions,
		...magnetic
	} : defaults.magneticOptions;
	const resetSpring = () => {
		const removeX = offset.x.on("change", (v) => {
			springX.jump(v);
			removeX();
		});
		const removeY = offset.y.on("change", (v) => {
			springY.jump(v);
			removeY();
		});
	};
	const state = useCursorState();
	const isInView = useCursorIsInView(resetSpring);
	const { x, y } = useMagneticTarget(spring ? {
		x: springX,
		y: springY
	} : position, Boolean(magnetic), state, magneticOptions.snap);
	const { width, height } = getCursorSize({
		type: state.type,
		state,
		hasChildren: Boolean(children),
		style,
		isMagnetic: Boolean(magnetic),
		magneticOptions,
		matchTextSize
	});
	return useBodyPortal(useHasPointerMoved(position, resetSpring) ? (0, import_jsx_runtime.jsx)(LayoutGroup, { children: (0, import_jsx_runtime.jsx)(MotionConfig, {
		transition: shouldReduceMotion ? skipTransition : props.transition || defaultTransition$1,
		children: (0, import_jsx_runtime.jsx)(motion.div, {
			layout: true,
			"data-motion-cursor": follow ? "follow" : "pointer",
			"data-framer-portal-id": "motion-cursor",
			initial: "exit",
			exit: "exit",
			...props,
			variants: {
				pressed: follow ? {} : { scale: .9 },
				...props.variants,
				default: {
					opacity: 1,
					scale: 1,
					...props.variants?.default
				},
				exit: {
					opacity: 0,
					scale: 0,
					...props.variants?.exit
				}
			},
			animate: [
				"default",
				state.type,
				magnetic && state.targetBoundingBox ? "magnetic" : "",
				!isInView ? "exit" : state.isPressed ? "pressed" : ""
			],
			transformTemplate: positionTransform(center),
			style: {
				borderRadius: follow ? 0 : 20,
				zIndex: follow ? 99998 : 99999,
				willChange: "transform",
				contain: "layout",
				originX: center.x,
				originY: center.y,
				...style,
				width,
				height,
				x,
				y,
				top: 0,
				left: 0,
				position: "fixed",
				pointerEvents: "none"
			},
			children: (0, import_jsx_runtime.jsx)(AnimatePresence, { children })
		})
	}) }) : null);
}
function positionTransform(origin) {
	return (_, generated) => `translate(-${origin.x * 100}%, -${origin.y * 100}%) ${generated}`;
}
var defaultTransition$1 = {
	duration: .15,
	ease: [
		.38,
		.12,
		.29,
		1
	]
};
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Cursor/magnetic/use-magnetic-pull.mjs
function useOffset(pointer, pull, target) {
	const rest = useMotionValue(0);
	const offset = useMotionValue(0);
	const crossfade = useMotionValue(0);
	(0, import_react.useEffect)(() => {
		if (typeof target === "number") {
			animate(crossfade, 1);
			const updateOffset = () => {
				offset.set(pull * (pointer.get() - target));
			};
			updateOffset();
			return pointer.on("change", updateOffset);
		} else animate(crossfade, 0);
	}, [target]);
	return useTransform(() => mix(rest.get(), offset.get(), crossfade.get()));
}
function useMagneticPull(ref, pull = .1) {
	const state = useCursorState();
	const pointer = usePointerPosition();
	const isActive = (0, import_react.useMemo)(() => {
		return state.targetBoundingBox && state.target === ref.current;
	}, [
		state.targetBoundingBox,
		state.target,
		ref.current
	]);
	return {
		x: useOffset(pointer.x, pull, isActive ? state.targetBoundingBox.left + state.targetBoundingBox.width / 2 : void 0),
		y: useOffset(pointer.y, pull, isActive ? state.targetBoundingBox.top + state.targetBoundingBox.height / 2 : void 0)
	};
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateNumber/Mask.mjs
var maskHeight = "var(--mask-height, 0.15em)";
var maskWidth = "var(--mask-width, 0.5em)";
var cornerGradient = `#000 0, transparent 71%`;
var mask = `linear-gradient(to right, transparent 0, #000 ${maskWidth}, #000 calc(100% - ${maskWidth}), transparent),linear-gradient(to bottom, transparent 0, #000 ${maskHeight}, #000 calc(100% - ${maskHeight}), transparent 100%),radial-gradient(at bottom right, ${cornerGradient}),radial-gradient(at bottom left, ${cornerGradient}), radial-gradient(at top left, ${cornerGradient}), radial-gradient(at top right, ${cornerGradient})`;
var maskSize = `100% calc(100% - ${maskHeight} * 2),calc(100% - ${maskWidth} * 2) 100%,${maskWidth} ${maskHeight},${maskWidth} ${maskHeight},${maskWidth} ${maskHeight},${maskWidth} ${maskHeight}`;
function Mask({ children }) {
	return (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": true,
		style: {
			display: "inline-flex",
			margin: `0 calc(-1*${maskWidth})`,
			padding: `calc(${maskHeight}/2) ${maskWidth}`,
			position: "relative",
			zIndex: -1,
			overflow: "clip",
			WebkitMaskImage: mask,
			WebkitMaskSize: maskSize,
			WebkitMaskPosition: "center, center, top left, top right, bottom right, bottom left",
			WebkitMaskRepeat: "no-repeat"
		},
		children
	});
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateNumber/hooks/use-is-initial-render.mjs
function useIsInitialRender() {
	/**
	* If `initial={false}` we only want to pass this to components in the first render.
	*/
	const isInitialRender = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		isInitialRender.current = false;
	}, []);
	return isInitialRender.current;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateNumber/utils/get-width-in-ems.mjs
function getWidthInEm(element) {
	const { width, fontSize } = getComputedStyle(element);
	return `${parseFloat(width) / parseFloat(fontSize)}em`;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateNumber/utils/target-widths.mjs
var targetWidths = /* @__PURE__ */ new WeakMap();
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateNumber/NumberDigit.mjs
function mod(n, m) {
	return (n % m + m) % m;
}
var NumberDigit = (0, import_react.forwardRef)(function NumberDigit({ value: _value, initialValue: _initialValue = _value, trend = 0, ...rest }, _ref) {
	const { transition } = (0, import_react.useContext)(MotionConfigContext);
	const initialValue = (0, import_react.useRef)(_initialValue).current;
	const isInitialRender = useIsInitialRender();
	const scope = (0, import_react.useRef)(null);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useImperativeHandle)(_ref, () => ref.current, []);
	const numberRefs = (0, import_react.useRef)(new Array(10));
	const isPresent = useIsPresent();
	const value = isPresent ? _value : 0;
	(0, import_react.useLayoutEffect)(() => {
		if (!scope.current || !numberRefs.current[initialValue]) return;
		scope.current.style.width = getWidthInEm(numberRefs.current[initialValue]);
	}, []);
	const prevValue = (0, import_react.useRef)(_initialValue);
	(0, import_react.useLayoutEffect)(() => {
		if (!scope.current || value === prevValue.current) return;
		const box = scope.current.getBoundingClientRect();
		const refBox = ref.current?.getBoundingClientRect();
		const oldVal = prevValue.current;
		let delta = value - oldVal;
		if (trend > 0 && value < oldVal) delta = 10 - oldVal + value;
		else if (trend < 0 && value > oldVal) delta = value - 10 - oldVal;
		const initialY = box.height * delta + (box.top - (refBox ? refBox.top || 0 : box.top));
		animate(scope.current, { y: [initialY, 0] }, transition);
		return () => {
			prevValue.current = value;
		};
	}, [value]);
	(0, import_react.useEffect)(() => {
		if (isInitialRender && initialValue === value) return;
		if (!numberRefs.current[value]) return;
		const w = getWidthInEm(numberRefs.current[value]);
		if (ref.current) targetWidths.set(ref.current, w);
		if (ref.current) animate(ref.current, { width: w }, transition);
	}, [value]);
	const renderNumber = (i) => (0, import_jsx_runtime.jsx)("span", {
		style: {
			display: "inline-block",
			padding: `calc(${maskHeight}/2) 0`
		},
		ref: (r) => void (numberRefs.current[i] = r),
		children: i
	}, i);
	const aboveDigits = [];
	const belowDigits = [];
	for (let offset = 9; offset >= 1; offset--) aboveDigits.push(mod(value - offset, 10));
	for (let offset = 1; offset <= 9; offset++) belowDigits.push(mod(value + offset, 10));
	return (0, import_jsx_runtime.jsx)(motion.span, {
		...rest,
		ref,
		"data-state": isPresent ? void 0 : "exiting",
		style: {
			display: "inline-flex",
			justifyContent: "center"
		},
		children: (0, import_jsx_runtime.jsxs)("span", {
			ref: scope,
			style: {
				display: "inline-flex",
				justifyContent: "center",
				flexDirection: "column",
				alignItems: "center",
				position: "relative"
			},
			children: [
				aboveDigits.length > 0 && (0, import_jsx_runtime.jsx)("span", {
					style: {
						...digitFillStyle,
						bottom: `100%`,
						left: 0
					},
					children: aboveDigits.map((d) => renderNumber(d))
				}),
				renderNumber(value),
				belowDigits.length > 0 && (0, import_jsx_runtime.jsx)("span", {
					style: {
						...digitFillStyle,
						top: `100%`,
						left: 0
					},
					children: belowDigits.map((d) => renderNumber(d))
				})
			]
		})
	});
});
var digitFillStyle = {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	position: "absolute",
	width: "100%"
};
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateNumber/SectionContext.mjs
var SectionContext = (0, import_react.createContext)({ justify: "left" });
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateNumber/NumberSymbol.mjs
var NumberSymbol = (0, import_react.forwardRef)(function NumberSymbol({ partKey, type, children, ...rest }, ref) {
	const isPresent = useIsPresent();
	const { justify } = (0, import_react.useContext)(SectionContext);
	return (0, import_jsx_runtime.jsx)(motion.span, {
		...rest,
		"data-state": isPresent ? void 0 : "exiting",
		style: {
			display: "inline-flex",
			justifyContent: justify,
			padding: `calc(${maskHeight}/2) 0`,
			position: "relative"
		},
		ref,
		children: (0, import_jsx_runtime.jsx)(AnimatePresence, {
			mode: "popLayout",
			anchorX: justify,
			initial: false,
			children: (0, import_jsx_runtime.jsx)(motion.span, {
				initial: { opacity: 0 },
				animate: { opacity: [null, 1] },
				exit: { opacity: [null, 0] },
				style: {
					display: "inline-block",
					whiteSpace: "pre"
				},
				children
			}, children)
		})
	});
});
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateNumber/NumberSection.mjs
var NumberSection = (0, import_react.forwardRef)(function NumberSection({ parts, justify = "left", mode, style, name, trend, ...rest }, _ref) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useImperativeHandle)(_ref, () => ref.current, []);
	const context = (0, import_react.useMemo)(() => ({ justify }), [justify]);
	const measuredRef = (0, import_react.useRef)(null);
	const isInitialRender = useIsInitialRender();
	const { transition } = (0, import_react.useContext)(MotionConfigContext);
	(0, import_react.useEffect)(() => {
		if (!measuredRef.current || !ref.current) return;
		if (isInitialRender) {
			ref.current.style.width = getWidthInEm(measuredRef.current);
			return;
		}
		const undos = Array.from(measuredRef.current.children).map((child) => {
			if (!(child instanceof HTMLElement)) return;
			if (child.dataset.state === "exiting") {
				const next = child.nextSibling;
				child.remove();
				return () => {
					if (measuredRef.current) measuredRef.current.insertBefore(child, next);
				};
			}
			const newWidth = targetWidths.get(child);
			if (!newWidth) return;
			const oldWidth = child.style.width;
			child.style.width = newWidth;
			return () => {
				child.style.width = oldWidth;
			};
		});
		const newWidth = getWidthInEm(measuredRef.current);
		for (let i = undos.length - 1; i >= 0; i--) {
			const undo = undos[i];
			if (undo) undo();
		}
		animate(ref.current, { width: newWidth }, transition);
	}, [parts.map((p) => p.value).join("")]);
	return (0, import_jsx_runtime.jsx)(SectionContext.Provider, {
		value: context,
		children: (0, import_jsx_runtime.jsx)("span", {
			...rest,
			ref,
			className: `number-section-${name}`,
			style: {
				...style,
				display: "inline-flex",
				justifyContent: justify
			},
			children: (0, import_jsx_runtime.jsxs)("span", {
				ref: measuredRef,
				style: {
					display: "inline-flex",
					justifyContent: "inherit",
					position: "relative"
				},
				children: ["​", (0, import_jsx_runtime.jsx)(AnimatePresence, {
					mode,
					anchorX: justify,
					initial: false,
					children: parts.map((part) => part.type === "integer" || part.type === "fraction" ? (0, import_jsx_runtime.jsx)(NumberDigit, {
						initial: { opacity: 0 },
						animate: { opacity: 1 },
						exit: { opacity: 0 },
						value: part.value,
						initialValue: isInitialRender ? void 0 : 0,
						trend
					}, part.key) : (0, import_jsx_runtime.jsx)(NumberSymbol, {
						type: part.type,
						partKey: part.key,
						initial: { opacity: 0 },
						animate: { opacity: 1 },
						exit: { opacity: 0 },
						children: part.value
					}, part.type === "literal" ? `${part.key}:${part.value}` : part.key))
				})]
			})
		})
	});
});
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateNumber/utils/format-parts.mjs
var formatToParts = (value, { locales, format }, prefix, suffix) => {
	const parts = new Intl.NumberFormat(locales, format).formatToParts(Number(value));
	if (prefix) parts.unshift({
		type: "prefix",
		value: prefix
	});
	if (suffix) parts.push({
		type: "suffix",
		value: suffix
	});
	const pre = [];
	const _integer = [];
	const fraction = [];
	const post = [];
	const counts = {};
	const generateKey = (type) => `${type}:${counts[type] = (counts[type] ?? -1) + 1}`;
	let formatted = "";
	let seenInteger = false, seenDecimal = false;
	for (const part of parts) {
		formatted += part.value;
		const type = part.type === "minusSign" || part.type === "plusSign" ? "sign" : part.type;
		switch (type) {
			case "integer":
				seenInteger = true;
				_integer.push(...part.value.split("").map((d) => ({
					type,
					value: parseInt(d)
				})));
				break;
			case "group":
				_integer.push({
					type,
					value: part.value
				});
				break;
			case "decimal":
				seenDecimal = true;
				fraction.push({
					type,
					value: part.value,
					key: generateKey(type)
				});
				break;
			case "fraction":
				fraction.push(...part.value.split("").map((d) => ({
					type,
					value: parseInt(d),
					key: generateKey(type)
				})));
				break;
			default: (seenInteger || seenDecimal ? post : pre).push({
				type,
				value: part.value,
				key: generateKey(type)
			});
		}
	}
	const integer = [];
	for (let i = _integer.length - 1; i >= 0; i--) integer.unshift({
		..._integer[i],
		key: generateKey(_integer[i].type)
	});
	return {
		pre,
		integer,
		fraction,
		post,
		formatted
	};
};
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateNumber/index.mjs
var DEFAULT_TRANSITION$1 = {
	opacity: {
		duration: 1,
		ease: easeOut
	},
	y: {
		type: "spring",
		duration: 1,
		bounce: 0
	},
	width: {
		type: "spring",
		duration: 1,
		bounce: 0
	}
};
var AnimateNumber = (0, import_react.forwardRef)(function AnimateNumber({ children: value, locales, format, transition, style, suffix, prefix, trend, ...rest }, ref) {
	const { pre, integer, fraction, post, formatted } = (0, import_react.useMemo)(() => formatToParts(value, {
		locales,
		format
	}, prefix, suffix), [
		value,
		locales,
		format,
		prefix,
		suffix
	]);
	const contextTransition = (0, import_react.useContext)(MotionConfigContext).transition;
	transition = transition ?? contextTransition ?? DEFAULT_TRANSITION$1;
	const numericValue = typeof value === "string" ? parseFloat(value) : Number(value);
	const prevValueRef = (0, import_react.useRef)(numericValue);
	const prevValue = prevValueRef.current;
	prevValueRef.current = numericValue;
	let resolvedTrend;
	if (typeof trend === "function") resolvedTrend = trend(prevValue, numericValue);
	else if (trend !== void 0) resolvedTrend = trend;
	else resolvedTrend = Math.sign(numericValue - prevValue);
	return (0, import_jsx_runtime.jsx)(MotionConfig, {
		transition,
		children: (0, import_jsx_runtime.jsx)(motion.span, {
			...rest,
			ref,
			style: {
				lineHeight: 1,
				...style,
				display: "inline-flex",
				isolation: "isolate",
				whiteSpace: "nowrap"
			},
			children: (0, import_jsx_runtime.jsxs)("span", {
				"aria-label": formatted,
				style: {
					display: "inline-flex",
					direction: "ltr",
					isolation: "isolate",
					position: "relative",
					zIndex: -1
				},
				children: [
					(0, import_jsx_runtime.jsx)(NumberSection, {
						style: { padding: `calc(${maskHeight}/2) 0` },
						"aria-hidden": true,
						justify: "right",
						mode: "popLayout",
						parts: pre,
						name: "pre",
						trend: resolvedTrend
					}),
					(0, import_jsx_runtime.jsxs)(Mask, { children: [(0, import_jsx_runtime.jsx)(NumberSection, {
						justify: "right",
						parts: integer,
						name: "integer",
						trend: resolvedTrend
					}), (0, import_jsx_runtime.jsx)(NumberSection, {
						parts: fraction,
						name: "fraction",
						trend: resolvedTrend
					})] }),
					(0, import_jsx_runtime.jsx)(NumberSection, {
						style: { padding: `calc(${maskHeight}/2) 0` },
						"aria-hidden": true,
						mode: "popLayout",
						parts: post,
						name: "post",
						trend: resolvedTrend
					})
				]
			})
		})
	});
});
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/AnimateText/index.mjs
var MotionFragment = motion.create(import_react.Fragment);
function splitText(text, { splitBy = " ", charClass = "split-char", wordClass = "split-word", variants, type } = {}) {
	const words = text.split(splitBy);
	const elements = [];
	const delimiter = splitBy === " " ? "\xA0" : splitBy;
	for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
		const word = words[wordIndex];
		const characterElements = [];
		const chars = Array.from(word);
		for (let charIndex = 0; charIndex < chars.length; charIndex++) {
			let char = chars[charIndex];
			if (wordIndex < words.length - 1 && charIndex === chars.length - 1) char += delimiter;
			const Component = type === "char" ? motion.span : "span";
			characterElements.push((0, import_jsx_runtime.jsx)(Component, {
				className: `${charClass} ${charClass}-${charIndex + 1}`,
				style: { display: "inline-block" },
				...type === "char" ? { variants } : {},
				children: char
			}, `${wordIndex}-${charIndex}`));
		}
		const WordComponent = type === "word" ? motion.span : "span";
		elements.push((0, import_jsx_runtime.jsx)(WordComponent, {
			className: `${wordClass} ${wordClass}-${wordIndex + 1}`,
			style: { display: "inline-block" },
			...type === "word" ? { variants } : {},
			children: characterElements
		}, `word-${wordIndex}`));
	}
	return elements;
}
function AnimateText({ children, splitBy = " ", charClass = "split-char", wordClass = "split-word", lineClass = "split-line", type = "char", variants, ...props }) {
	const elements = (0, import_react.useMemo)(() => {
		return splitText(children, {
			splitBy,
			charClass,
			wordClass,
			variants,
			type
		});
	}, [
		children,
		splitBy,
		charClass,
		wordClass
	]);
	return (0, import_jsx_runtime.jsx)(MotionFragment, {
		...props,
		children: elements
	});
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Carousel/utils/find-current-index.mjs
function findCurrentIndexFromInset(currentInset, itemPositions, wrapInset) {
	const iteration = Math.floor(currentInset / wrapInset);
	const transform = iteration * wrapInset;
	let itemIndex = 0;
	for (let i = 0; i < itemPositions.length; i++) {
		const { end } = itemPositions[i];
		itemIndex = i;
		if (end + transform > currentInset) break;
	}
	return itemIndex + iteration * itemPositions.length;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Carousel/utils/find-next-page.mjs
function findNextItemInset(currentInset, itemPositions, gap, targetInset) {
	if (itemPositions.length === 0) return 0;
	const wrapInset = itemPositions[itemPositions.length - 1].end + gap;
	const idealInset = targetInset ?? currentInset + (itemPositions[0]?.end ?? 0);
	let index = findCurrentIndexFromInset(currentInset, itemPositions, wrapInset) + 1;
	let nextItemInset = 0;
	let hasFoundNextInset = false;
	while (!hasFoundNextInset) {
		const { start, end } = itemPositions[wrap(0, itemPositions.length, index)];
		const transformInset = Math.floor(index / itemPositions.length) * wrapInset;
		nextItemInset = start + transformInset;
		if (end + transformInset > idealInset) hasFoundNextInset = true;
		else index++;
	}
	return nextItemInset;
}
function findNextPageInset(currentInset, containerLength, itemPositions, gap) {
	return findNextItemInset(currentInset, itemPositions, gap, currentInset + containerLength);
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Carousel/utils/find-prev-page.mjs
function findPrevItemInset(currentInset, itemPositions, gap, targetInset, containerLength) {
	if (itemPositions.length === 0) return 0;
	const wrapInset = itemPositions[itemPositions.length - 1].end + gap;
	const idealInset = targetInset ?? currentInset - (containerLength ?? 0);
	let index = findCurrentIndexFromInset(currentInset, itemPositions, wrapInset);
	let prevItemInset = currentInset;
	let hasFoundPrevInset = false;
	while (!hasFoundPrevInset) {
		const { start, end } = itemPositions[wrap(0, itemPositions.length, index)];
		const itemSize = end - start;
		const transformedStart = start + Math.floor(index / itemPositions.length) * wrapInset;
		if (idealInset <= transformedStart + gap || transformedStart >= currentInset) {
			prevItemInset = transformedStart;
			index--;
		} else if (idealInset <= transformedStart) {
			prevItemInset = transformedStart;
			hasFoundPrevInset = true;
		} else {
			if (containerLength && itemSize > containerLength || prevItemInset === currentInset && idealInset >= transformedStart) prevItemInset = transformedStart;
			hasFoundPrevInset = true;
		}
	}
	return prevItemInset;
}
function findPrevPageInset(currentInset, containerLength, itemPositions, gap) {
	return findPrevItemInset(currentInset, itemPositions, gap, currentInset - containerLength, containerLength);
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Ticker/context.mjs
var TickerContext = (0, import_react.createContext)(null);
function useTicker() {
	const context = (0, import_react.useContext)(TickerContext);
	invariant(Boolean(context), "useTicker must be used within a Ticker component");
	return context;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Ticker/TickerItemContext.mjs
var TickerItemContext = (0, import_react.createContext)(void 0);
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Ticker/use-ticker-item.mjs
function useTickerItem() {
	const itemContext = (0, import_react.useContext)(TickerItemContext);
	invariant(Boolean(itemContext), "useTickerItem must be used within a TickerItem");
	return itemContext;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Ticker/utils/layout-strategy.mjs
var ltrStrategy = (insetProp, lengthProp, viewportLengthProp, paddingStartProp, direction) => {
	return {
		sign: 1,
		direction,
		lengthProp,
		viewportLengthProp,
		paddingStartProp,
		measureItem: (item) => {
			return {
				start: item[insetProp],
				end: item[insetProp] + item[lengthProp]
			};
		},
		getCumulativeInset: (element) => {
			let offset = 0;
			let el = element;
			while (el) {
				offset += el[insetProp];
				el = el.offsetParent;
			}
			return offset;
		}
	};
};
var xStrategy = ltrStrategy("offsetLeft", "offsetWidth", "innerWidth", "paddingLeft", "right");
var yStrategy = ltrStrategy("offsetTop", "offsetHeight", "innerHeight", "paddingTop", "bottom");
function offsetRight(element, container) {
	return (container?.offsetWidth ?? window.innerWidth) - (element.offsetLeft + element.offsetWidth);
}
var xRtlStrategy = {
	...xStrategy,
	sign: -1,
	direction: "left",
	paddingStartProp: "paddingRight",
	measureItem: (item, container) => {
		const length = item.offsetWidth;
		const start = offsetRight(item, container);
		return {
			start,
			end: start + length
		};
	},
	getCumulativeInset: (element) => {
		let offset = 0;
		let el = element;
		while (el) {
			offset += offsetRight(el, el.offsetParent);
			el = el.offsetParent;
		}
		return offset;
	}
};
function getLayoutStrategy(axis, direction) {
	return axis === "y" ? yStrategy : direction === "ltr" ? xStrategy : xRtlStrategy;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Ticker/TickerItem.mjs
/**
* Represents an individual item within the Ticker.
*
* This component handles the logic for repositioning items to create the infinite scroll effect.
*
* @param offset - The current scroll offset of the ticker.
* @param axis - The scroll axis ("x" or "y").
* @param listSize - The total size of the list including all clones.
* @param itemIndex - The original index of the item.
* @param cloneIndex - The index of the clone, if this is a cloned item.
* @param props - HTML attributes to pass to the list item li element.
* @returns A ListItem React component.
*/
function TickerItemWrapper({ children, offset, axis, listSize = 0, numItems = 0, itemIndex, cloneIndex, bounds, alignItems, reproject = true, size = "auto", safeMargin }) {
	const { start, end } = bounds;
	const { visibleLength, direction, inset } = useTicker();
	const { sign } = getLayoutStrategy(axis, direction);
	const projection = useTransform(() => {
		if (!reproject) return 0;
		const currentOffset = offset.get();
		if (!start && !end || !listSize) return 0;
		if (currentOffset * sign + bounds.end <= -inset - safeMargin) return listSize * sign;
		/**
		* If we've defined a safeMargin, also project items backwards if they
		* fall outside the right boundary (+ margin). This fills-in the start area
		* without affecting the alignment of items.
		*/
		if (safeMargin > 0) {
			const rightBoundary = visibleLength - safeMargin - inset;
			if (currentOffset * sign + bounds.start >= rightBoundary) return -listSize * sign;
		}
		return 0;
	});
	const itemOffset = useTransform(() => {
		const currentOffset = offset.get();
		const currentTransform = projection.get();
		if (!start && !end || !listSize) return 0;
		return currentOffset * sign + start + currentTransform * sign;
	});
	const ariaProps = cloneIndex === void 0 ? {
		["aria-hidden"]: false,
		["aria-posinset"]: itemIndex + 1,
		["aria-setsize"]: numItems
	} : { ["aria-hidden"]: true };
	const isFill = size === "fill";
	const offAxisSize = alignItems === "stretch" ? "100%" : "fit-content";
	const props = {
		className: cloneIndex === void 0 ? "ticker-item" : "clone-item",
		style: {
			flexGrow: 0,
			flexShrink: 0,
			position: "relative",
			flexBasis: size === "fill" ? "100%" : void 0,
			display: isFill ? "grid" : void 0,
			gridTemplateColumns: isFill ? "1fr" : void 0,
			gridTemplateRows: isFill ? "1fr" : void 0,
			minWidth: isFill ? 0 : void 0,
			minHeight: isFill ? 0 : void 0,
			height: axis === "x" ? offAxisSize : void 0,
			width: axis === "y" ? offAxisSize : void 0,
			x: axis === "x" ? projection : 0,
			y: axis === "y" ? projection : 0
		},
		...ariaProps
	};
	return (0, import_jsx_runtime.jsx)(TickerItemContext.Provider, {
		value: {
			start,
			end,
			offset: itemOffset,
			projection,
			itemIndex,
			cloneIndex,
			props
		},
		children: size === "manual" ? children : (0, import_jsx_runtime.jsx)(DefaultTickerItem, { children })
	});
}
function DefaultTickerItem({ children }) {
	const { props } = useTickerItem();
	return (0, import_jsx_runtime.jsx)(motion.li, {
		...props,
		children
	});
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Ticker/use-focus-navigation.mjs
function useFocusNavigation(containerRef, axis, focusOffset, offset, setHasFocus) {
	const isFocusTrapped = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const container = containerRef.current;
		if (!container) return;
		let detectionEnabled = false;
		const abortController = new AbortController();
		const eventOptions = { signal: abortController.signal };
		const eventOptionsWithCapture = {
			...eventOptions,
			capture: true
		};
		const scrollProp = axis === "x" ? "scrollLeft" : "scrollTop";
		const offsetProp = axis === "x" ? "offsetLeft" : "offsetTop";
		const leftKey = axis === "x" ? "ArrowLeft" : "ArrowUp";
		const rightKey = axis === "x" ? "ArrowRight" : "ArrowDown";
		let focusableElements = [];
		let focusIndex = 0;
		const applyFocusOffset = () => {
			const nextFocusableElement = focusableElements[focusIndex];
			if (!nextFocusableElement) return;
			nextFocusableElement.focus({ preventScroll: true });
			focusOffset.set(-nextFocusableElement[offsetProp]);
			container[scrollProp] = 0;
			frame.render(() => {
				container[scrollProp] = 0;
			});
		};
		const handleFocusNavigation = (event) => {
			if (event.key === "Tab") {
				event.preventDefault();
				endFocusTrap();
				const allFocusableElements = Array.from(document.querySelectorAll("a, button, input, textarea, select, [tabindex]:not([tabindex=\"-1\"]), [contenteditable=\"true\"]")).filter(isHTMLElement);
				allFocusableElements.sort(compareTabIndexes);
				const lastFocusableElement = allFocusableElements[event.shiftKey ? 0 : allFocusableElements.length - 1];
				const initialIndex = event.shiftKey ? allFocusableElements.length - 1 : 0;
				/**
				* If the last focusable element in the DOM is inside the container
				* then we want to set focus on the first DOM element
				*/
				if (container.contains(lastFocusableElement)) {
					allFocusableElements[initialIndex].focus();
					return;
				} else {
					const indexOfCurrentElement = allFocusableElements.indexOf(focusableElements[focusIndex]);
					const delta = event.shiftKey ? -1 : 1;
					for (let i = indexOfCurrentElement; i < allFocusableElements.length && i >= 0; i += delta) {
						const element = allFocusableElements[i];
						if (!container.contains(element)) {
							element.focus();
							return;
						}
					}
				}
				return;
			} else if (event.key === leftKey) focusIndex--;
			else if (event.key === rightKey) focusIndex++;
			focusIndex = wrap(0, focusableElements.length, focusIndex);
			applyFocusOffset();
		};
		const startFocusTrap = () => {
			if (isFocusTrapped.current) return;
			focusableElements = Array.from(container.querySelectorAll(".ticker-item a, .ticker-item button, .ticker-item input, .ticker-item textarea, .ticker-item select, .ticker-item [tabindex]:not([tabindex=\"-1\"]), .ticker-item [contenteditable=\"true\"]")).filter(isHTMLElement);
			focusIndex = 0;
			if (!focusableElements.length) return;
			setHasFocus(true);
			isFocusTrapped.current = true;
			applyFocusOffset();
			window.addEventListener("focus", detectTrapEnd, eventOptionsWithCapture);
			window.addEventListener("blur", detectTrapEnd, eventOptionsWithCapture);
			container.addEventListener("keydown", handleFocusNavigation, eventOptions);
		};
		const detectTrapEnd = (event) => {
			if (!event.target || !(event.target instanceof HTMLElement) || !container.contains(event.target)) endFocusTrap();
		};
		const endFocusTrap = () => {
			if (!isFocusTrapped.current) return;
			isFocusTrapped.current = false;
			setHasFocus(false);
			offset.set(focusOffset.get());
			window.removeEventListener("focus", detectTrapEnd);
			window.removeEventListener("blur", detectTrapEnd);
			container.removeEventListener("keydown", handleFocusNavigation);
		};
		const handleFocus = (event) => {
			const { target } = event;
			if (!isHTMLElement(target)) return;
			if (!isFocusTrapped.current) startFocusTrap();
		};
		const detectFocusTrapEnable = () => {
			if (detectionEnabled) return;
			detectionEnabled = true;
			container.addEventListener("focus", handleFocus, eventOptionsWithCapture);
			window.addEventListener("pointermove", handlePointerMove, eventOptions);
		};
		const handlePointerMove = () => {
			if (!detectionEnabled) return;
			detectionEnabled = false;
			container.removeEventListener("focus", handleFocus, true);
			window.removeEventListener("pointermove", handlePointerMove, eventOptions);
		};
		const handleAriaHiddenClicks = (event) => {
			let ariaHiddenAncestor = event.target.closest("[aria-hidden=\"true\"]");
			if (ariaHiddenAncestor) ariaHiddenAncestor.removeAttribute("aria-hidden");
		};
		const resetScroll = () => {
			container.scrollLeft = 0;
			container.scrollTop = 0;
		};
		window.addEventListener("keydown", detectFocusTrapEnable, eventOptions);
		container.addEventListener("pointerdown", handleAriaHiddenClicks, eventOptions);
		container.addEventListener("scroll", resetScroll, eventOptions);
		return () => {
			abortController.abort();
			endFocusTrap();
		};
	}, []);
}
function compareTabIndexes(a, b) {
	if (a.tabIndex >= 1 && b.tabIndex >= 1) return a.tabIndex - b.tabIndex;
	if (a.tabIndex >= 1 && b.tabIndex <= 0) return -1;
	if (b.tabIndex >= 1 && a.tabIndex <= 0) return 1;
	return 0;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Ticker/utils/calc-total-item-length.mjs
function calcItemLength(itemPosition) {
	return itemPosition.end - itemPosition.start;
}
function calcTotalItemLength(itemPositions) {
	return itemPositions[itemPositions.length - 1].end - itemPositions[0].start;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Ticker/utils/calc-num-clones.mjs
function calcNumClones(visibleLength, itemPositions, gap) {
	const totalItemLength = calcTotalItemLength(itemPositions);
	const maxItemLength = Math.max(...itemPositions.map(calcItemLength));
	let count = 0;
	/**
	* A length where the largest item is out of the visible area.
	*/
	let safeFillLength = 0;
	while (safeFillLength < visibleLength) {
		safeFillLength = (totalItemLength + gap) * (count + 1) - maxItemLength;
		count++;
	}
	return Math.max(count - 1, 0);
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Ticker/index.mjs
var alignAlias = {
	start: "flex-start",
	end: "flex-end"
};
/**
* A performant, accessible, and infinitely scrolling ticker component.
*/
function TickerComponent({ items, velocity = 50, hoverFactor = 1, gap = 10, axis = "x", align = "center", offset, isStatic = false, itemSize = "auto", overflow = false, loop = true, children, as = "div", snap, safeMargin = 0, fade = 0, fadeTransition, pageTransition, ...props }, ref) {
	const internalContainerRef = (0, import_react.useRef)(null);
	const containerRef = useComposedRefs(ref, internalContainerRef);
	const listRef = (0, import_react.useRef)(null);
	const [state, setState] = (0, import_react.useState)({
		direction: "ltr",
		visibleLength: 0,
		inset: 0,
		totalItemLength: 0,
		containerLength: 0,
		itemPositions: [],
		isMeasured: false,
		maxInset: null
	});
	const alignItems = alignAlias[align] || align;
	const { sign } = getLayoutStrategy(axis, state.direction);
	if (isStatic) {
		const renderedOffset = useMotionValue(0);
		return (0, import_jsx_runtime.jsx)(TickerContext.Provider, {
			value: {
				...state,
				gap,
				clampOffset: noop,
				offset: renderedOffset,
				renderedOffset
			},
			children: (0, import_jsx_runtime.jsx)(ListView, {
				containerProps: props,
				containerRef,
				children,
				gap,
				axis,
				alignItems,
				offset: renderedOffset,
				renderedOffset,
				items,
				itemSize,
				state,
				overflow,
				safeMargin,
				isStatic: true,
				as,
				fade,
				sign
			})
		});
	}
	const [hasFocus, setHasFocus] = (0, import_react.useState)(false);
	const velocityFactor = useMotionValue(1);
	const defaultOffset = useMotionValue(0);
	offset ?? (offset = defaultOffset);
	const wrappedOffset = useTransform(() => {
		if (state.direction === "rtl" && axis === "x") return wrap(state.totalItemLength + gap + state.inset, state.inset, offset.get());
		return wrap(-state.totalItemLength - gap - state.inset, -state.inset, offset.get());
	});
	const focusOffset = useMotionValue(0);
	const renderedOffset = hasFocus ? focusOffset : loop ? wrappedOffset : offset;
	const isInViewport = useInView(internalContainerRef, { margin: "100px" });
	const isPageInView = usePageInView();
	const isInView = isInViewport && isPageInView;
	const isReducedMotion = useReducedMotion();
	const updateMeasurements = () => {
		if (!internalContainerRef.current || !listRef.current) return;
		const direction = window.getComputedStyle(internalContainerRef.current).direction;
		const { measureItem, lengthProp, viewportLengthProp, getCumulativeInset } = getLayoutStrategy(axis, direction);
		const paddingStartProp = axis === "x" ? "paddingLeft" : "paddingTop";
		const paddingEndProp = axis === "x" ? "paddingRight" : "paddingBottom";
		const container = internalContainerRef.current;
		const allItems = listRef.current.querySelectorAll(".ticker-item");
		if (!allItems.length) return;
		let hasItemSizeChanged = false;
		const itemPositions = [];
		for (let i = 0; i < allItems.length; i++) {
			const size = measureItem(allItems[i], container);
			itemPositions.push(size);
			const prevSize = state.itemPositions[i];
			if (!prevSize || size.start !== prevSize.start || size.end !== prevSize.end) hasItemSizeChanged = true;
		}
		/**
		* Cap to viewport size to prevent infinite or wasteful cloning in the event that the
		* container width is reactive to the number of children rendered within it.
		*/
		const containerLength = Math.min(container[lengthProp], window[viewportLengthProp]);
		let visibleLength = overflow ? window[viewportLengthProp] : containerLength;
		if (safeMargin > 0) visibleLength += safeMargin * 2;
		const totalItemLength = calcTotalItemLength(itemPositions);
		const computedContainerStyle = window.getComputedStyle(container);
		const containerPaddingStart = parseInt(computedContainerStyle[paddingStartProp] ?? 0);
		const containerPaddingEnd = parseInt(computedContainerStyle[paddingEndProp] ?? 0);
		const inset = overflow ? getCumulativeInset(allItems[0]) : containerPaddingStart;
		const maxInset = loop === false ? Math.max(0, totalItemLength - containerLength + containerPaddingStart + containerPaddingEnd) : null;
		if (visibleLength !== state.visibleLength || totalItemLength !== state.totalItemLength || inset !== state.inset || state.itemPositions.length !== itemPositions.length || hasItemSizeChanged) setState({
			direction,
			visibleLength,
			itemPositions,
			totalItemLength,
			inset,
			containerLength,
			maxInset,
			isMeasured: true
		});
	};
	useIsomorphicLayoutEffect(() => {
		if (!isInView || !internalContainerRef.current) return;
		updateMeasurements();
		const trackViewport = overflow ? resize(updateMeasurements) : void 0;
		const trackContainer = resize(internalContainerRef.current, updateMeasurements);
		return () => {
			trackViewport?.();
			trackContainer();
		};
	}, [
		items,
		isInView,
		overflow
	]);
	const isMeasured = state.totalItemLength > 0;
	useAnimationFrame(isMeasured && isInView && offset === defaultOffset && !isReducedMotion ? (_, delta) => {
		const frameOffset = delta / 1e3 * (velocity * sign * velocityFactor.get());
		offset.set(offset.get() - frameOffset);
	} : noop);
	const cloneCount = (0, import_react.useMemo)(() => {
		if (!isMeasured || !state.visibleLength) return 0;
		return calcNumClones(state.visibleLength, state.itemPositions, gap);
	}, [isMeasured, state]);
	const totalListSize = state.totalItemLength === 0 ? 0 : (state.totalItemLength + gap) * (cloneCount + 1);
	const clonedItemGroups = [];
	if (loop) for (let i = 0; i < cloneCount; i++) {
		const clonedItems = [];
		items.forEach((item, itemIndex) => {
			const originalBounds = state.itemPositions[itemIndex];
			const cloneOffset = (state.totalItemLength + gap) * (i + 1);
			const cloneBounds = originalBounds ? {
				start: originalBounds.start + cloneOffset,
				end: originalBounds.end + cloneOffset
			} : defaultBounds;
			clonedItems.push((0, import_jsx_runtime.jsx)(TickerItemWrapper, {
				offset: renderedOffset,
				axis,
				listSize: totalListSize,
				itemIndex,
				cloneIndex: itemIndex,
				bounds: cloneBounds,
				alignItems,
				size: itemSize,
				safeMargin,
				numItems: items.length,
				children: item
			}, `clone-${i}-${itemIndex}`));
		});
		const id = `ticker-group-${i}`;
		clonedItemGroups.push((0, import_jsx_runtime.jsx)(LayoutGroup, {
			id,
			children: clonedItems
		}, id));
	}
	useFocusNavigation(internalContainerRef, axis, focusOffset, offset, setHasFocus);
	const clampOffset = (0, import_react.useCallback)((offset) => {
		return state.maxInset !== null ? clamp(-state.maxInset, 0, offset) : offset;
	}, [state.maxInset]);
	return (0, import_jsx_runtime.jsx)(TickerContext.Provider, {
		value: {
			...state,
			gap,
			clampOffset,
			offset,
			renderedOffset
		},
		children: (0, import_jsx_runtime.jsx)(ListView, {
			containerProps: props,
			children,
			containerRef,
			listRef,
			gap,
			axis,
			alignItems,
			isMeasured,
			isInView,
			offset,
			renderedOffset,
			items,
			itemSize,
			clonedItems: clonedItemGroups,
			clampOffset,
			snap,
			safeMargin,
			onPointerEnter: () => {
				animate(velocityFactor, hoverFactor);
			},
			onPointerLeave: () => {
				animate(velocityFactor, 1);
			},
			totalListSize,
			state,
			overflow,
			loop,
			as,
			fade,
			sign,
			fadeTransition,
			pageTransition
		})
	});
}
var Ticker = (0, import_react.forwardRef)(TickerComponent);
function ListView({ children, containerProps, containerRef, listRef, gap, axis, alignItems, isMeasured, isInView, isStatic, items, offset, clonedItems, clampOffset, renderedOffset, onPointerEnter, onPointerLeave, totalListSize, itemSize, overflow, state, safeMargin, snap, loop, as, fade, sign, fadeTransition = defaultFadeTransition, pageTransition }) {
	const MotionComponent = (0, import_react.useMemo)(() => motion.create(as), [as]);
	/**
	* Derive drag constraints based on measurements.
	*/
	let dragConstraints = {};
	const { maxInset } = state;
	if (maxInset !== null) {
		if (axis === "x") dragConstraints = sign > 0 ? {
			left: maxInset * -1,
			right: 0
		} : {
			right: maxInset,
			left: 0
		};
		else dragConstraints = {
			top: maxInset * -1,
			bottom: 0
		};
	}
	let { drag, _dragX, _dragY, dragMomentum = false, onDragEnd, onPointerDown, ...remainingProps } = containerProps;
	const dragMotionValue = axis === "x" ? _dragX : _dragY;
	const dragMomentumAnimation = (0, import_react.useRef)(null);
	/**
	* TODO: This should probably be accomplished with dragMotionValue.jump()
	* in the onPointerDown handler but investigate why this isn't working.
	*/
	const stopDragMomentumAnimation = () => {
		if (!dragMomentumAnimation.current) return;
		dragMomentumAnimation.current.stop();
		dragMomentumAnimation.current = null;
	};
	if (!onDragEnd && drag && dragMotionValue) {
		onPointerDown = () => {
			dragMotionValue.jump(offset.get());
			stopDragMomentumAnimation();
		};
		onDragEnd = (_e, { velocity }) => {
			const current = offset.get();
			stopDragMomentumAnimation();
			frame.postRender(() => {
				let target = current + velocity[axis] * (snap ? .3 : .8);
				if (snap) {
					if (velocity[axis] < 0) target = -findNextItemInset(-current, state.itemPositions, gap, -target);
					else if (velocity[axis] > 0) target = -findPrevItemInset(-current, state.itemPositions, gap, -target, state.containerLength);
					else {
						const closestNext = -findNextItemInset(-current, state.itemPositions, gap, -current);
						const closestPrev = -findPrevItemInset(-current, state.itemPositions, gap, -current, state.containerLength);
						target = Math.abs(current - closestNext) < Math.abs(current - closestPrev) ? closestNext : closestPrev;
					}
				}
				const constraints = loop ? {} : sign > 0 ? {
					max: 0,
					min: dragConstraints[axis === "x" ? "left" : "top"]
				} : {
					min: 0,
					max: dragConstraints.right
				};
				dragMomentumAnimation.current = animate(dragMotionValue, clampOffset(target * sign) * sign, snap ? pageTransition : {
					type: "inertia",
					velocity: velocity[axis],
					modifyTarget: () => target,
					bounceDamping: 40,
					bounceStiffness: 400,
					...constraints
				});
			});
		};
	}
	/**
	* Create mask image to fade edges out
	*/
	const fadeStartOpacity = useMotionValue(loop ? 0 : 1);
	const fadeEndOpacity = useMotionValue(0);
	const strategy = getLayoutStrategy(axis, state.direction);
	const unit = typeof fade === "number" ? "px" : "";
	const maskImage = useTransform(() => {
		return `linear-gradient(to ${strategy.direction}, rgba(0,0,0,${fadeStartOpacity.get()}) 0px, black ${fade}${unit}, black calc(100% - ${fade}${unit}), rgba(0,0,0,${fadeEndOpacity.get()}) 100%)`;
	});
	const fadeStyles = fade ? {
		maskImage,
		WebkitMaskImage: maskImage
	} : {};
	const isAtLimits = (0, import_react.useRef)({
		start: true,
		end: false
	});
	useMotionValueEvent(renderedOffset, "change", (value) => {
		if (maxInset === null) return;
		const maxOffset = maxInset * -1;
		value *= sign;
		if (value < 0) {
			if (isAtLimits.current.start) {
				animate(fadeStartOpacity, 0, fadeTransition);
				isAtLimits.current.start = false;
			}
		} else if (!isAtLimits.current.start) {
			animate(fadeStartOpacity, 1, fadeTransition);
			isAtLimits.current.start = true;
		}
		if (value > maxOffset) {
			if (isAtLimits.current.end) {
				animate(fadeEndOpacity, 0, fadeTransition);
				isAtLimits.current.end = false;
			}
		} else if (!isAtLimits.current.end) {
			animate(fadeEndOpacity, 1, fadeTransition);
			isAtLimits.current.end = true;
		}
	});
	return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		(0, import_jsx_runtime.jsx)(MotionComponent, {
			...remainingProps,
			ref: containerRef,
			style: {
				overflowX: !overflow && axis === "x" ? "clip" : void 0,
				overflowY: !overflow && axis === "y" ? "clip" : void 0,
				...containerStyle,
				...containerProps.style,
				...fadeStyles
			},
			onPointerEnter,
			onPointerLeave,
			drag,
			_dragX,
			_dragY,
			dragConstraints,
			dragMomentum,
			onPointerDown,
			onDragEnd,
			children: (0, import_jsx_runtime.jsxs)(motion.ul, {
				ref: listRef,
				style: {
					...listStyle,
					flexDirection: axis === "x" ? "row" : "column",
					gap: `${gap}px`,
					x: axis === "x" ? renderedOffset : 0,
					y: axis === "y" ? renderedOffset : 0,
					opacity: isMeasured || isStatic ? 1 : 0,
					alignItems,
					willChange: isMeasured && isInView ? "transform" : void 0,
					width: "100%",
					height: "100%",
					maxHeight: "100%",
					maxWidth: "100%"
				},
				children: [items.map((item, index) => (0, import_jsx_runtime.jsx)(TickerItemWrapper, {
					axis,
					offset: renderedOffset,
					listSize: totalListSize,
					itemIndex: index,
					bounds: state.itemPositions[index] ?? defaultBounds,
					alignItems,
					size: itemSize,
					reproject: loop,
					safeMargin,
					numItems: items.length,
					children: item
				}, "original-" + index)), clonedItems || null]
			})
		}),
		" ",
		children
	] });
}
var defaultBounds = {
	start: 0,
	end: 0
};
var containerStyle = {
	display: "flex",
	position: "relative"
};
var listStyle = {
	display: "flex",
	position: "relative",
	willChange: "transform",
	listStyleType: "none",
	padding: 0,
	margin: 0,
	justifyContent: "flex-start"
};
var defaultFadeTransition = {
	duration: .2,
	ease: "linear"
};
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Typewriter/types.mjs
var TYPING_SPEEDS = {
	slow: 130,
	normal: 75,
	fast: 30
};
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Typewriter/index.mjs
var Typewriter = (0, import_react.forwardRef)(function Typewriter({ children: text = "", as, speed = "normal", variance = "natural", cursorClassName = "motion-typewriter-cursor", cursorStyle, cursorBlinkDuration = .5, cursorBlinkRepeat = Infinity, onComplete, onChange, play = true, "aria-label": ariaLabel, textClassName, textStyle, replace = "type", backspace = "character", backspaceFactor = .2, ...props }, ref) {
	const Component = as || "span";
	const targetText = (0, import_react.useRef)(text);
	const displayText = useMotionValue("");
	const cancelDelay = (0, import_react.useRef)(null);
	const cursorBlinkAnimation = (0, import_react.useRef)(null);
	const cursorRef = (0, import_react.useRef)(null);
	const interval = typeof speed === "number" ? speed : TYPING_SPEEDS[speed];
	const clearDelay = () => {
		cancelDelay.current?.();
		cancelDelay.current = null;
	};
	const startCursorBlinkAnimation = () => {
		cursorBlinkAnimation.current = animate(cursorRef.current, { opacity: [
			1,
			1,
			0,
			0
		] }, {
			duration: cursorBlinkDuration,
			times: [
				0,
				.5,
				.5,
				1
			],
			ease: "linear",
			repeat: Math.max(0, cursorBlinkRepeat) * 2,
			repeatType: "reverse"
		});
		cursorBlinkAnimation.current.finished.then(() => {
			cursorBlinkAnimation.current?.cancel();
		});
	};
	(0, import_react.useEffect)(() => {
		/**
		* If we're using replace: "all" and the text changes, we can instantly
		* reset the displayed text.
		*/
		if (replace === "all" && text !== targetText.current) displayText.set("");
		targetText.current = text;
	}, [text, replace]);
	(0, import_react.useEffect)(() => {
		if (!play) {
			startCursorBlinkAnimation();
			clearDelay();
			return;
		}
		cursorBlinkAnimation.current?.cancel();
		const nextCharacter = () => {
			const previousText = displayText.get();
			const nextText = getNextText(previousText, text, replace, backspace);
			displayText.set(nextText);
			if (onChange) {
				const isBackspace = nextText.length < previousText.length;
				onChange({
					text: nextText,
					character: isBackspace ? previousText.slice(nextText.length) : nextText.slice(previousText.length),
					isBackspace
				});
			}
			if (nextText !== text) scheduleNextCharacter();
			else {
				startCursorBlinkAnimation();
				onComplete?.();
			}
		};
		const scheduleNextCharacter = () => {
			cancelDelay.current = delay(nextCharacter, getTypewriterDelay(text, displayText.get(), interval, variance, backspaceFactor));
		};
		if (!cancelDelay.current) scheduleNextCharacter();
		return clearDelay;
	}, [
		play,
		onComplete,
		onChange,
		text,
		interval,
		variance,
		backspaceFactor,
		backspace
	]);
	return (0, import_jsx_runtime.jsxs)(Component, {
		ref,
		...props,
		"aria-label": ariaLabel || text,
		children: [(0, import_jsx_runtime.jsx)(motion.span, {
			className: textClassName,
			style: textStyle,
			children: displayText
		}), (0, import_jsx_runtime.jsx)(motion.span, {
			ref: cursorRef,
			className: cursorClassName,
			style: {
				display: "inline-block",
				width: "2px",
				height: "1em",
				backgroundColor: "currentColor",
				position: "relative",
				top: "0.1em",
				left: "0.2em",
				...cursorStyle
			}
		})]
	});
});
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/ScrambleText/index.mjs
function getMotionComponent(as) {
	return motion[as || "span"] || motion.span;
}
var ScrambleText = (0, import_react.forwardRef)(function ScrambleText({ children: text = "", as, active = true, delay, duration, interval, chars, onComplete, ...props }, ref) {
	const MotionComponent = getMotionComponent(as);
	const displayText = useMotionValue(text);
	const controlsRef = (0, import_react.useRef)(null);
	const onCompleteRef = (0, import_react.useRef)(onComplete);
	useIsomorphicLayoutEffect(() => {
		onCompleteRef.current = onComplete;
	});
	useIsomorphicLayoutEffect(() => {
		displayText.set(text);
	}, [text]);
	useIsomorphicLayoutEffect(() => {
		controlsRef.current?.stop();
		controlsRef.current = scrambleText(displayText, {
			delay,
			duration,
			interval,
			chars,
			onComplete: () => onCompleteRef.current?.()
		});
		if (!active) controlsRef.current.finish();
		return () => controlsRef.current?.stop();
	}, [
		active,
		text,
		delay,
		duration,
		interval,
		chars
	]);
	return (0, import_jsx_runtime.jsx)(MotionComponent, {
		ref,
		...props,
		children: displayText
	});
});
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Carousel/context.mjs
var CarouselContext = (0, import_react.createContext)(null);
function useCarousel() {
	const context = (0, import_react.useContext)(CarouselContext);
	invariant(Boolean(context), "useCarousel must be used within a Carousel component");
	return context;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Carousel/utils/calc-current-page.mjs
function calcCurrentPage(targetOffset, pageInsets, wrapInset, maxInset) {
	const targetInset = -targetOffset;
	const iteration = maxInset === null ? Math.floor(targetInset / wrapInset) : 0;
	const transformInset = iteration * wrapInset;
	for (let i = pageInsets.length - 1; i >= 0; i--) {
		const inset = pageInsets[i] + transformInset;
		const prevIndex = wrap(0, pageInsets.length, i - 1);
		const prevTransformInset = (i === 0 ? iteration - 1 : iteration) * wrapInset;
		const prevInset = pageInsets[prevIndex] + prevTransformInset;
		const halfDistanceToPrev = (inset - prevInset) / 2;
		const nextIndex = wrap(0, pageInsets.length, i + 1);
		const nextTransformInset = (i === pageInsets.length - 1 ? iteration + 1 : iteration) * wrapInset;
		const nextInset = pageInsets[nextIndex] + nextTransformInset;
		if (targetInset < nextInset - (nextInset - inset) / 2 && targetInset >= prevInset + halfDistanceToPrev) return i;
	}
	return 0;
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Carousel/utils/calc-page-insets.mjs
function calcPageInsets(itemPositions, containerLength, maxInset, allowRescale = true) {
	const pageInsetData = {
		insets: [],
		visibleLength: containerLength
	};
	if (itemPositions.length === 0) return pageInsetData;
	const insets = [itemPositions[0].start];
	/**
	* Loop through items and decide whether they've passed the
	* threshold of a new page.
	*/
	for (let i = 1; i < itemPositions.length; i++) {
		const { start, end } = itemPositions[i];
		/**
		* If the end of this item is greater than the last
		* page inset plus the container length, we need to
		* add a new page inset.
		*/
		if (insets[insets.length - 1] + containerLength < end) {
			/**
			* If we have a maxInset, it means looping is disabled and
			* therefore we need bail if the we're beyond the maxInset
			* (as this will align the final item with the end of the container)
			*/
			if (maxInset !== null) {
				if (start <= maxInset) insets.push(start);
				else {
					insets.push(maxInset);
					break;
				}
			} else insets.push(start);
		}
	}
	/**
	* If we're not looping, we want to check the size of the final page vs
	* the average page size. If the final page is less than half the average,
	* we attempt to redistribute by using a shorter container length.
	*/
	if (allowRescale && maxInset !== null && insets.length > 1) {
		const originalLastInset = insets[insets.length - 1];
		const pageSizes = [];
		for (let i = 0; i < insets.length - 1; i++) pageSizes.push(insets[i + 1] - insets[i]);
		const averagePageSize = pageSizes.reduce((sum, size) => sum + size, 0) / pageSizes.length;
		if (maxInset - originalLastInset < averagePageSize * .5) {
			const scaledPagination = calcPageInsets(itemPositions, containerLength * .75, maxInset, false);
			if (scaledPagination.insets.length === insets.length) return scaledPagination;
		}
	}
	return {
		insets,
		visibleLength: containerLength
	};
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/components/Carousel/index.mjs
function CarouselView({ children, offset, targetOffset, tugOffset, loop = true, transition, tickerRef, axis = "x", snap = "page", page, wheelSwipeThreshold }) {
	/**
	* When this boolean is true, the rendered offset will be "attached" to
	* the target offset, allowing for direct manipulation. When it's false,
	* we're animating the offset to the target offset. This allows things
	* like pagination and pagination progress to be optionally coupled to
	* the target offset.
	*/
	const isOffsetAttachedToTarget = (0, import_react.useRef)(true);
	/**
	* Calculate pagination and inset limits based on the measured
	* ticker and item dimensions.
	*/
	const { clampOffset, totalItemLength, itemPositions, containerLength, gap, maxInset, direction, isMeasured } = useTicker();
	const wrapInset = totalItemLength + gap;
	const pagination = calcPageInsets(itemPositions, containerLength, maxInset);
	const totalPages = pagination.insets.length;
	const { sign } = getLayoutStrategy(axis, direction);
	/**
	* Set page offset when page prop is provided and measurements are ready.
	* Responds to changes in the page prop.
	*/
	const lastPageRef = (0, import_react.useRef)(void 0);
	const hasInitialized = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (page === void 0 || !isMeasured || totalPages === 0) return;
		const pageIndex = clamp(0, totalPages - 1, page);
		const newOffset = -pagination.insets[pageIndex] * sign;
		if (!hasInitialized.current) {
			hasInitialized.current = true;
			lastPageRef.current = page;
			targetOffset.jump(newOffset);
			offset.jump(newOffset);
		} else if (lastPageRef.current !== page) {
			lastPageRef.current = page;
			targetOffset.jump(newOffset);
			offset.jump(newOffset);
		}
	}, [
		isMeasured,
		totalPages,
		page,
		sign,
		targetOffset,
		offset,
		pagination.insets
	]);
	/**
	* Helper function to calculate pagination state based on target offset
	*/
	const calculatePaginationState = (targetOffsetValue) => {
		return {
			current: calcCurrentPage(targetOffsetValue * sign, pagination.insets, wrapInset, maxInset),
			isNextActive: loop ? true : targetOffsetValue * -sign < maxInset,
			isPrevActive: loop ? true : targetOffsetValue * -sign > 0
		};
	};
	const [paginationState, setPaginationState] = (0, import_react.useState)(() => calculatePaginationState(targetOffset.get()));
	(0, import_react.useEffect)(() => {
		updatePaginationState();
	}, [containerLength, totalItemLength]);
	const updatePaginationState = () => {
		/**
		* We derive the current page from the target offset, not the currently-rendered
		* offset. This ensures that if we're paginating discretely, the page indicator
		* updates immediately, and if we're jumping many pages that any indicator like a dots
		* indicator doesn't appear to animate through many dots as the carousel animates.
		*/
		const newPaginationState = calculatePaginationState(targetOffset.get());
		if (newPaginationState.current !== paginationState.current || newPaginationState.isNextActive !== paginationState.isNextActive || newPaginationState.isPrevActive !== paginationState.isPrevActive) setPaginationState(newPaginationState);
	};
	/**
	* Handle changes to the target offset.
	* - Update the rendered offset.
	* - Update pagination state.
	*/
	useMotionValueEvent(targetOffset, "change", (latest) => {
		offset.set(latest);
		updatePaginationState();
	});
	/**
	* Attach the rendered offset to the target offset.
	*/
	const currentAnimation = (0, import_react.useRef)(null);
	const stopOffsetAnimation = () => {
		if (!currentAnimation.current) return;
		currentAnimation.current.stop();
		currentAnimation.current = null;
	};
	/**
	* Add a custom handler to the offset motion value. We link offset to targetOffset
	* and only update targetOffset from pagination/gestures. When offset is attached
	* to targetOffset, changes are passed straight through to offset. When it's not
	* attached, we animate offset to the latest targetOffset value.
	*/
	(0, import_react.useEffect)(() => {
		offset.attach((v, onUpdate) => {
			stopOffsetAnimation();
			if (isOffsetAttachedToTarget.current) onUpdate(v);
			else currentAnimation.current = new JSAnimation({
				keyframes: [offset.get(), v],
				velocity: clamp(-2e3, 2e3, offset.getVelocity()),
				...transition,
				onUpdate,
				onComplete: () => {
					currentAnimation.current = null;
				}
			});
			isOffsetAttachedToTarget.current = true;
		}, stopOffsetAnimation);
	}, []);
	/**
	* Discrete pagination. Support (and pass via context) next/prev/goto
	* functions.
	*/
	const stepOffset = (newOffset) => {
		const clampedOffset = clampOffset(newOffset);
		targetOffset.stop();
		isOffsetAttachedToTarget.current = false;
		targetOffset.set(clampedOffset * sign);
	};
	const paginate = (findPageInset, direction) => {
		const offset = -findPageInset(-targetOffset.get() * sign, pagination.visibleLength, itemPositions, gap);
		const clamped = clampOffset(offset);
		if (clamped * sign === targetOffset.get()) animate(tugOffset, 0, {
			velocity: direction * sign * 400,
			...limitSpring
		});
		else stepOffset(clamped);
	};
	const nextPage = () => paginate(findNextPageInset, -1);
	const prevPage = () => paginate(findPrevPageInset, 1);
	const gotoPage = (i) => {
		const iteration = loop ? Math.floor(-targetOffset.get() * sign / wrapInset) : 0;
		console.log({ iteration });
		const transformOffset = iteration * -wrapInset;
		stepOffset(-pagination.insets[i] + transformOffset);
	};
	/**
	* Wheel input. Support direct wheel manipulation and, when snap is
	* enabled, swipe pagination.
	*/
	const wheelCallbacks = (0, import_react.useRef)({
		nextPage,
		prevPage,
		clampOffset
	});
	(0, import_react.useEffect)(() => {
		wheelCallbacks.current = {
			nextPage,
			prevPage,
			clampOffset
		};
	}, [
		nextPage,
		prevPage,
		clampOffset
	]);
	(0, import_react.useEffect)(() => {
		const element = tickerRef.current;
		if (!element) return;
		return wheel(element, {
			axis,
			swipeThreshold: wheelSwipeThreshold,
			onSwipe: snap ? (direction) => {
				const { nextPage, prevPage } = wheelCallbacks.current;
				direction * sign === 1 ? nextPage() : prevPage();
			} : void 0,
			onWheel: (delta) => {
				const { clampOffset } = wheelCallbacks.current;
				const newOffset = offset.get() + delta;
				const clampedOffset = sign > 0 ? clampOffset(newOffset) : clamp(0, maxInset, newOffset);
				targetOffset.jump(maxInset ? clampedOffset : newOffset);
			}
		});
	}, [
		axis,
		snap,
		offset,
		sign
	]);
	return (0, import_jsx_runtime.jsx)(CarouselContext.Provider, {
		value: {
			currentPage: paginationState.current,
			isNextActive: paginationState.isNextActive,
			isPrevActive: paginationState.isPrevActive,
			totalPages,
			nextPage,
			prevPage,
			gotoPage,
			offset,
			targetOffset
		},
		children
	});
}
function Carousel({ children, loop = true, transition = defaultTransition, axis = "x", snap = "page", page, wheelSwipeThreshold, ...props }) {
	const ref = (0, import_react.useRef)(null);
	const targetOffset = useMotionValue(0);
	const offset = useMotionValue(0);
	const tugOffset = useMotionValue(0);
	const renderedOffset = useTransform(() => tugOffset.get() + offset.get());
	return (0, import_jsx_runtime.jsx)(Ticker, {
		role: "region",
		"aria-roledescription": "carousel",
		offset: renderedOffset,
		loop,
		ref,
		axis,
		drag: axis,
		_dragX: axis === "x" ? targetOffset : false,
		_dragY: axis === "y" ? targetOffset : false,
		snap,
		pageTransition: transition,
		...props,
		children: (0, import_jsx_runtime.jsx)(CarouselView, {
			tickerRef: ref,
			loop,
			offset,
			tugOffset,
			targetOffset,
			transition,
			snap,
			axis,
			page,
			wheelSwipeThreshold,
			children
		})
	});
}
var defaultTransition = {
	type: "spring",
	stiffness: 200,
	damping: 40
};
var limitSpring = {
	type: "spring",
	stiffness: 80,
	damping: 10
};
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/motion-plus-dom/dist/es/curtains.mjs
/**
* Class on the overlay container. Target it to position/theme the curtain
* host (e.g. `.motion-curtains { z-index: 999 }`).
*/
var CONTAINER_CLASS = "motion-curtains";
/**
* Class on every covering element (panel, tile, strip, door). Target it to
* style the curtain's fill — `.motion-curtain { background: ... }`. A default
* dark fill is injected at the top of <head>, so author styles override it.
*/
var ELEMENT_CLASS = "motion-curtain";
/** Default fill applied to `.motion-curtain` unless overridden by author CSS. */
var DEFAULT_FILL = "#0b0b0c";
var STYLE_ID = "motion-curtains-style";
var ATTR = "data-motion-curtains";
/**
* Inject the one-time defaults: the curtain's fallback fill (overridable via
* `.motion-curtain` author CSS) and a transparent popover backdrop. Inserted
* at the top of <head> so author styles win the cascade.
*/
function injectStyle() {
	if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
	const style = document.createElement("style");
	style.id = STYLE_ID;
	style.textContent = `.${ELEMENT_CLASS}{background:${DEFAULT_FILL};}[${ATTR}]::backdrop{background:transparent;}`;
	document.head.insertBefore(style, document.head.firstChild);
}
function createOverlay(styles) {
	injectStyle();
	const element = document.createElement("div");
	element.className = CONTAINER_CLASS;
	element.setAttribute(ATTR, "");
	element.setAttribute("aria-hidden", "true");
	Object.assign(element.style, styles);
	return element;
}
/**
* Viewport overlay: a `<div>` promoted to the top layer via the Popover API,
* above all page content without trapping focus or inerting the page (unlike
* a modal dialog). Falls back to a max-z overlay where popovers aren't
* supported (jsdom, older browsers).
*/
function createContainer() {
	const element = createOverlay({
		position: "fixed",
		margin: "0",
		padding: "0",
		border: "0",
		inset: "0",
		width: "100vw",
		height: "100vh",
		maxWidth: "none",
		maxHeight: "none",
		background: "transparent",
		overflow: "hidden"
	});
	element.setAttribute("popover", "manual");
	document.body.appendChild(element);
	try {
		element.showPopover();
	} catch {
		element.style.zIndex = "2147483647";
	}
	return {
		element,
		remove() {
			try {
				element.hidePopover();
			} catch {}
			element.remove();
		}
	};
}
/**
* Element-scoped overlay: a `position: absolute; inset: 0` `<div>` mounted
* inside `scope`, so it covers and tracks that element (following scroll and
* resizing with the box) instead of the viewport. No top layer needed.
*/
function createScopedContainer(scope) {
	warning(typeof getComputedStyle !== "function" || getComputedStyle(scope).position !== "static", "curtains: the `scope` element should be positioned (e.g. position: relative) so the overlay covers it");
	const element = createOverlay({
		position: "absolute",
		inset: "0",
		overflow: "hidden",
		zIndex: "999999"
	});
	scope.appendChild(element);
	return {
		element,
		remove() {
			element.remove();
		}
	};
}
/**
* Timing that snaps straight to the covered state with no animation — used to
* hand a mixed reveal effect its starting cover. `delay: 0` also cancels the
* tile stagger so every element of a grid/strip effect covers at once.
*/
var INSTANT = {
	duration: 0,
	delay: 0
};
/** Map key for the viewport (undefined-scope) slot, distinct from any element. */
var VIEWPORT = Symbol();
/**
* Live cycles, keyed per scope so independent regions never block each other.
* Entries are deleted the moment a scope goes idle, so this never retains a
* scope element past its last transition.
*/
var scopes = /* @__PURE__ */ new Map();
function resolveJob(job) {
	if (job.settled) return;
	job.settled = true;
	job.resolve();
}
function rejectJob(job, reason) {
	if (job.settled) return;
	job.settled = true;
	job.reject(reason);
}
/**
* Queue a job against its scope. A fresh scope starts a cycle immediately; an
* occluded scope coalesces the job into the in-flight batch; a revealing scope
* defers it to the next cycle. Synchronous up to the cover starting, so a second
* call in the same tick reliably sees the first scope's state.
*/
function schedule(scope, job) {
	const key = scope ?? VIEWPORT;
	const existing = scopes.get(key);
	if (!existing) {
		const state = {
			phase: "covering",
			batch: [job],
			pending: []
		};
		scopes.set(key, state);
		runCycle(scope, state);
		return;
	}
	if (existing.phase === "covering") existing.batch.push(job);
	else existing.pending.push(job);
}
/**
* Run one cover → drain → reveal cycle for a scope, then chain straight into the
* next cycle if calls queued during the reveal, or go idle. Never rejects: every
* job is settled (resolved or rejected) before this returns.
*/
async function runCycle(scope, state) {
	let container;
	try {
		const coverEffect = state.batch[0].inEffect;
		const coverTransition = state.batch[0].coverTransition;
		container = scope ? createScopedContainer(scope) : createContainer();
		let box;
		if (scope) {
			const rect = container.element.getBoundingClientRect();
			box = {
				width: rect.width,
				height: rect.height
			};
		}
		const host = container.element;
		coverEffect.setup(host, box);
		await coverEffect.cover(coverTransition).finished;
		for (let i = 0; i < state.batch.length; i++) {
			const job = state.batch[i];
			try {
				await job.callback();
			} catch (error) {
				rejectJob(job, error);
			}
		}
		state.phase = "revealing";
		const survivors = state.batch.filter((job) => !job.settled);
		if (survivors.length) {
			const last = survivors[survivors.length - 1];
			const outEffect = last.outEffect;
			if (outEffect !== coverEffect) {
				const covering = Array.from(host.children);
				outEffect.setup(host, box);
				await outEffect.cover(INSTANT).finished;
				for (const node of covering) node.remove();
			}
			await outEffect.reveal(last.revealTransition).finished;
			for (const job of survivors) resolveJob(job);
		}
	} catch (error) {
		for (const job of state.batch) rejectJob(job, error);
	} finally {
		container?.remove();
	}
	if (state.pending.length) {
		state.batch = state.pending;
		state.pending = [];
		state.phase = "covering";
		runCycle(scope, state);
	} else scopes.delete(scope ?? VIEWPORT);
}
var DEFAULT_TRANSITION = {
	duration: .5,
	ease: [
		.76,
		0,
		.24,
		1
	]
};
/** Merge the user's transition over curtains' defaults (user wins). */
function resolveTransition(transition) {
	return {
		...DEFAULT_TRANSITION,
		...transition
	};
}
/** An absolutely-positioned, targetable panel filling its container. */
function createPanel(willChange = "transform") {
	const panel = document.createElement("div");
	panel.className = ELEMENT_CLASS;
	const s = panel.style;
	s.position = "absolute";
	s.inset = "0";
	s.width = "100%";
	s.height = "100%";
	s.willChange = willChange;
	return panel;
}
/** A solid panel that fades in, hides the swap, then fades back out. */
function fade() {
	let panel;
	return {
		setup(container) {
			panel = createPanel("opacity");
			panel.style.opacity = "0";
			container.appendChild(panel);
		},
		cover(transition) {
			return animateMini(panel, { opacity: [0, 1] }, resolveTransition(transition));
		},
		reveal(transition) {
			return animateMini(panel, { opacity: [1, 0] }, resolveTransition(transition));
		}
	};
}
/**
* Whether the user has asked to minimise motion. Curtains honours this by
* swapping content with no transition at all.
*/
function prefersReducedMotion() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function resolveEffect(effect) {
	if (!effect) return fade();
	return typeof effect === "function" ? effect() : effect;
}
/**
* Split a `value | [cover, reveal]` option into its two phases: a scalar
* applies to both, a `[cover, reveal]` tuple sets each — the same scalar-or-
* tuple shape as the `direction` option. `T` must be a non-array type (an
* array value is read as the tuple).
*/
function resolvePair(value) {
	return Array.isArray(value) ? [value[0], value[1]] : [value, value];
}
/**
* Resolve the cover/reveal effect pair. A scalar effect (or a tuple whose two
* entries are the same reference) collapses to a single shared instance, so
* `inEffect === outEffect` — which is precisely what gates the mixed-effect
* handoff in the coordinator. Two different effects resolve to two instances.
*/
function resolveEffects(effect) {
	const [inOption, outOption] = resolvePair(effect);
	const inEffect = resolveEffect(inOption);
	return [inEffect, outOption === inOption ? inEffect : resolveEffect(outOption)];
}
/**
* Run a page transition between two views, stage-curtain style: cover the
* viewport, run `callback` to swap content while it's hidden, then reveal.
*
* ```ts
* await curtains(
*     async () => {
*         await downloadFonts()
*         updateDOM()
*     },
*     { effect: wipe({ direction: "left" }), transition: { duration: 0.2 } }
* )
* ```
*
* Pass a `[in, out]` tuple to `effect` (and optionally `transition`) to mix a
* different effect or timing for the reveal:
*
* ```ts
* await curtains(updateDOM, {
*     effect: [wipe({ direction: "left" }), iris()],
*     transition: [{ duration: 0.3 }, { duration: 0.5 }],
* })
* ```
*
* The promise resolves once the reveal completes. Respects
* `prefers-reduced-motion` by swapping with no transition.
*/
async function curtains(callback, options = {}) {
	if (prefersReducedMotion()) {
		await callback();
		return;
	}
	const [inEffect, outEffect] = resolveEffects(options.effect);
	const [coverTransition, revealTransition] = resolvePair(options.transition);
	return new Promise((resolve, reject) => {
		schedule(options.scope, {
			callback,
			inEffect,
			outEffect,
			coverTransition,
			revealTransition,
			resolve,
			reject,
			settled: false
		});
	});
}
//#endregion
//#region ets-grid-site/node_modules/@motionplus/core/dist/es/curtains/use-curtains.mjs
/**
* React binding for `curtains`. Returns `[curtains, isPending]`:
*
* - `curtains` has the **same signature** as the vanilla function, but runs
*   `callback` inside `startTransition` and holds the reveal until React has
*   committed the update (including any Suspense it triggered) and painted one
*   frame. This is what makes it correct for App Router navigation, where
*   `router.push()` resolves before the new route's content is ready.
* - `isPending` is `true` for the duration of the transition — use it to
*   disable nav/buttons so overlapping transitions can't start.
*
* ```tsx
* const [curtains, isPending] = useCurtains()
*
* // route change — reveal waits for the new route + its Suspense data:
* await curtains(() => router.push("/about"), { effect: wipe({ direction }) })
*
* // local state — no flushSync needed:
* await curtains(() => setIndex((i) => i + 1), { effect: iris() })
*
* // async work, then commit — the cover holds across the await:
* await curtains(async () => { await loadData(); setData(d) }, { effect: fade() })
* ```
*
* The effect/direction live at the call site, in `options` — exactly as in the
* vanilla API. `prefers-reduced-motion` is honoured by the underlying function
* (it skips the cover/reveal but still runs the callback); the commit-wait here
* is harmless in that case since there is no overlay to reveal.
*
* **Requires React 19.** The hook runs `callback` as a React async action so an
* `async` callback keeps the transition pending across its `await` — the cover
* stays up for the whole async span, not just the synchronous prefix. (React 18
* ignores an async action's promise, which would lift the cover early; it is no
* longer supported.)
*
* Resolution is deterministic — it keys off the `isPending` true→false edge
* (React has committed), never a timing guess. If `callback` schedules nothing
* of its own (a no-op, or a push to the current route), an explicit commit
* inside the transition guarantees that edge still fires. A throwing/rejecting
* callback rejects the returned promise and removes the overlay, mirroring the
* vanilla function. Re-entrant calls are forwarded straight to vanilla
* `curtains`, which coalesces them per scope — a call made while the cover is up
* runs its swap before the (shared) reveal; one made mid-reveal queues a fresh
* cycle. Because same-scope swaps drain sequentially there, the single in-flight
* reveal-gate below is never asked to track two transitions at once; one
* `useCurtains` instance is therefore meant to drive one scope at a time (its
* `isPending` is a single boolean — use a separate instance per concurrent
* region).
*/
function useCurtains() {
	const [isPending, startTransition] = (0, import_react.useTransition)();
	const [, commit] = (0, import_react.useReducer)((n) => n + 1, 0);
	const inFlight = (0, import_react.useRef)(null);
	const wasPending = (0, import_react.useRef)(isPending);
	const mounted = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			inFlight.current?.resolve();
			inFlight.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const settled = wasPending.current && !isPending;
		wasPending.current = isPending;
		if (settled && inFlight.current) {
			const { resolve } = inFlight.current;
			inFlight.current = null;
			frame.postRender(() => resolve());
		}
	}, [isPending]);
	return [(0, import_react.useCallback)((callback, options) => {
		const wrapped = () => new Promise((resolve, reject) => {
			if (!mounted.current) {
				resolve();
				return;
			}
			inFlight.current = {
				resolve,
				reject
			};
			startTransition(async () => {
				try {
					await callback();
				} catch (error) {
					inFlight.current = null;
					reject(error);
					return;
				}
				commit();
			});
		});
		return curtains(wrapped, options).finally(() => {
			inFlight.current = null;
		});
	}, [startTransition]), isPending];
}
//#endregion
export { AnimateNumber, AnimateText, Carousel, Cursor, ScrambleText, Ticker, Typewriter, useCarousel, useCursorIsInView, useCursorState, useCurtains, useMagneticPull, usePointerPosition, useTicker, useTickerItem };
