# NanoReact

NanoReact is a small educational React-style UI library built with JavaScript and JSX. It demonstrates the core ideas behind React: virtual DOM nodes, rendering, reconciliation, state hooks, effects, and DOM event handling.

The project runs with Vite and does not use React itself.

## Demo Features

- Todo/task creation
- Todo completion toggling
- A live uptime counter
- Custom `useState` implementation
- Custom `useEffect` implementation
- Custom JSX-to-virtual-DOM transformation
- DOM diffing and reconciliation
- Functional component expansion
- Fragment support
- Inline styles and DOM event listeners
- Automatic rerendering after state changes

## Getting Started

### Prerequisites

- Node.js
- npm

### Install Dependencies

```bash
npm install
```

### Start the Development Server

```bash
npm run dev
```

Vite will print the local development URL, usually:

```text
http://localhost:5173/
```

### Create a Production Build

```bash
npm run build
```

### Preview the Production Build

```bash
## Project Structure

nano-react/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── assets/
    │   ├── hero.png
    │   ├── javascript.svg
    │   └── vite.svg
    ├── counter.js
    ├── main.jsx
    ├── nano-react.js
    └── style.css
```

## How It Works

### Entry Point

`src/main.jsx` imports NanoReact and defines the demo `App` component.

The application is mounted with:

```jsx
NanoReact.render(<App />, document.getElementById("app"));
``>

Vite serves `index.html`, which contains the `<div id="app"></div>` mount point and loads `src/main.jsx`.

### JSX Configuration

`vite.config.js` configures Vite's JSX transformer to use NanoReact instead of React:

```js
pragma: "NanoReact.createElement"
pragmaFrag: "NanoReact.Fragment"
```

For example, JSX such as:

```jsx
<div className="container">
  <h1>Hello</h1>
</div>
```

is converted into a call to `NanoReact.createElement(...)`.

### Virtual DOM

`createElement()` converts JSX elements into plain JavaScript objects:

```js
{
  type: "div",
  props: {
    children: [...]
  }
}
```

Text values are converted into `TEXT_ELEMENT` nodes.

### State Management

NanoReact provides a small implementation of `useState`:

```js
const [seconds, setSeconds] = NanoReact.useState(0);
```

Hook state is stored in a module-level array. `hookIndex` determines which hook belongs to the component during each render.

State setters support both direct values and updater functions:

```js
setSeconds((seconds) => seconds + 1);
```

A state update reruns the root component and reconciles the resulting virtual DOM.

### Effects

NanoReact implements dependency-based `useEffect`:

```js
NanoReact.useEffect(() => {
  const timer = setInterval(() => setSeconds((value) => value + 1), 1000);

  return () => clearInterval(timer);
}, []);
```

Effects run asynchronously after the DOM commit using `queueMicrotask()`.

A cleanup function is executed before rerunning an effect when its dependencies change.

### Rendering and Reconciliation

The reconciliation process:

1. Expands functional components into regular virtual DOM nodes.
2. Creates DOM nodes for newly added elements.
3. Reuses DOM nodes when element types match.
4. Replaces nodes when element types differ.
5. Removes nodes that no longer exist.
6. Updates changed properties and event listeners.
7. Recursively reconciles child nodes.

Event properties such as `onClick`, `onSubmit`, and `onInput` are converted into native DOM event listeners.

### Todo Demo

The demo keeps three pieces of state:

- `todos`: The list of todo items
- `input`: The current text input value
- `seconds`: The elapsed uptime

Adding a todo:

- Prevents the form from refreshing the page
- Ignores empty or whitespace-only input
- Appends a new todo with a timestamp-based ID
- Clears the input field

Clicking a todo toggles its `done` property and updates its text decoration.

## Available API

```js
NanoReact.createElement(type, props, ...children)
NanoReact.Fragment(props)
NanoReact.useState(initialValue)
NanoReact.useEffect(callback, dependencies)
NanoReact.render(element, container)
```

## Existing but Unused Files

- `src/counter.js` contains a standalone vanilla JavaScript counter.
- `src/style.css` contains template-oriented styles and is not currently imported by `src/main.jsx`.
- `src/assets/` contains starter assets that are not required by the current demo.

## Important Limitations

This is an educational implementation, not a production React alternative.

Current limitations include:

- No component hook isolation
- No keyed diffing
- No fiber or concurrent rendering system
- No virtual DOM batching
- No context API
- No memoization API
- No error boundaries
- No server-side rendering
- No hydration
- No TypeScript definitions
- No JSX runtime support beyond the configured classic pragma

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the project for production |
| `npm run preview` | Previews the production build locally |

## Technology

- JavaScript ES modules
- JSX
- Vite
- DOM APIs
- Custom virtual DOM implementation
