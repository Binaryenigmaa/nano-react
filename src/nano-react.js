const TEXT_ELEMENT = "TEXT_ELEMENT";

// Global state for rendering & hooks
let rootContainer = null;
let rootComponent = null;
let currentVNodeTree = null;

let hooks = [];
let hookIndex = 0;

/**
 * 1. JSX Factory: Converts JSX syntax into Virtual DOM nodes
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children
        .flat()
        .filter(
          (child) => child !== null && child !== undefined && child !== false,
        )
        .map((child) =>
          typeof child === "object" ? child : createTextElement(child),
        ),
    },
  };
}

function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: String(text),
      children: [],
    },
  };
}

function Fragment(props) {
  return props.children;
}

/**
 * 2. Hooks Implementation (useState & useEffect)
 */
function useState(initialValue) {
  const currentIndex = hookIndex;
  const oldHook = hooks[currentIndex];

  const state = oldHook ? oldHook.state : initialValue;

  const setState = (action) => {
    const nextState =
      typeof action === "function" ? action(hooks[currentIndex].state) : action;

    if (Object.is(hooks[currentIndex].state, nextState)) return;

    hooks[currentIndex].state = nextState;
    rerender();
  };

  hooks[currentIndex] = { state };
  hookIndex++;

  return [state, setState];
}

function useEffect(callback, deps) {
  const currentIndex = hookIndex;
  const oldHook = hooks[currentIndex];

  const hasChanged =
    !oldHook ||
    !deps ||
    deps.some((dep, i) => !Object.is(dep, oldHook.deps[i]));

  if (hasChanged) {
    // Run asynchronously after DOM commit phase
    queueMicrotask(() => {
      if (oldHook && typeof oldHook.cleanup === "function") {
        oldHook.cleanup();
      }
      const cleanup = callback();
      hooks[currentIndex].cleanup = cleanup;
    });
  }

  hooks[currentIndex] = { deps, cleanup: oldHook?.cleanup };
  hookIndex++;
}

/**
 * 3. DOM Creation & Property Reconciliation
 */
const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);

function createDomNode(vnode) {
  const dom =
    vnode.type === TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(vnode.type);

  updateDomProperties(dom, {}, vnode.props);
  return dom;
}

function updateDomProperties(dom, prevProps, nextProps) {
  // Remove old event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || prevProps[key] !== nextProps[key])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter((key) => !(key in nextProps))
    .forEach((name) => {
      if (name === "className") dom.removeAttribute("class");
      else dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter((key) => prevProps[key] !== nextProps[key])
    .forEach((name) => {
      if (name === "className") {
        dom.setAttribute("class", nextProps[name]);
      } else if (name === "style" && typeof nextProps[name] === "object") {
        Object.assign(dom.style, nextProps[name]);
      } else {
        dom[name] = nextProps[name];
      }
    });

  // Add new event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter((key) => prevProps[key] !== nextProps[key])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

/**
 * 4. Reconciliation / Diffing Engine
 */
function expandFunctionalComponents(vnode) {
  if (!vnode) return null;

  if (typeof vnode.type === "function") {
    const rendered = vnode.type(vnode.props);
    // Handle Fragments returning arrays
    if (Array.isArray(rendered)) {
      return rendered.map(expandFunctionalComponents);
    }
    return expandFunctionalComponents(rendered);
  }

  if (vnode.props && vnode.props.children) {
    vnode.props.children = vnode.props.children
      .flatMap(expandFunctionalComponents)
      .filter(Boolean);
  }

  return vnode;
}

function reconcile(parentDom, oldVNode, newVNode, index = 0) {
  const existingDom = parentDom.childNodes[index];

  // Case 1: Node removed
  if (!newVNode && oldVNode) {
    if (existingDom) parentDom.removeChild(existingDom);
    return;
  }

  // Case 2: Node added
  if (newVNode && !oldVNode) {
    const newDom = createDomNode(newVNode);
    newVNode._dom = newDom;
    newVNode.props.children.forEach((child, i) =>
      reconcile(newDom, null, child, i),
    );
    parentDom.appendChild(newDom);
    return;
  }

  // Case 3: Node replaced (different tag/type)
  if (oldVNode.type !== newVNode.type) {
    const newDom = createDomNode(newVNode);
    newVNode._dom = newDom;
    newVNode.props.children.forEach((child, i) =>
      reconcile(newDom, null, child, i),
    );
    parentDom.replaceChild(newDom, existingDom);
    return;
  }

  // Case 4: Same node type -> Update in place
  const dom = (newVNode._dom = oldVNode._dom || existingDom);
  updateDomProperties(dom, oldVNode.props, newVNode.props);

  const oldChildren = oldVNode.props.children || [];
  const newChildren = newVNode.props.children || [];
  const maxLen = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLen; i++) {
    reconcile(dom, oldChildren[i], newChildren[i], i);
  }
}

/**
 * 5. Entry Point & Render Loop
 */
function render(element, container) {
  rootContainer = container;
  rootComponent = element;
  rerender();
}

function rerender() {
  hookIndex = 0;
  const rawTree =
    typeof rootComponent.type === "function"
      ? rootComponent.type(rootComponent.props)
      : rootComponent;

  const nextVNodeTree = expandFunctionalComponents(rawTree);
  reconcile(rootContainer, currentVNodeTree, nextVNodeTree, 0);
  currentVNodeTree = nextVNodeTree;
}

export const NanoReact = {
  createElement,
  Fragment,
  useState,
  useEffect,
  render,
};

export default NanoReact;
