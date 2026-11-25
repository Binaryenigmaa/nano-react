import NanoReact from "./nano-react.js";

function App() {
  const [todos, setTodos] = NanoReact.useState([
    { id: 1, text: "Build custom VDOM diffing engine", done: true },
    { id: 2, text: "Implement useState and useEffect hooks", done: false },
  ]);
  const [input, setInput] = NanoReact.useState("");
  const [seconds, setSeconds] = NanoReact.useState(0);

  NanoReact.useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div
      style={{
        fontFamily: "system-ui",
        maxWidth: "500px",
        margin: "2rem auto",
      }}
    >
      <h1>NanoReact VDOM Demo</h1>
      <p>
        Uptime (via custom useEffect): <strong>{seconds}s</strong>
      </p>

      <form
        onSubmit={addTodo}
        style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}
      >
        <input
          value={input}
          onInput={(e) => setInput(e.target.value)}
          placeholder="Add a task (focus persists across re-renders)..."
          style={{ flex: 1, padding: "8px" }}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            onClick={() => toggleTodo(todo.id)}
            style={{
              padding: "8px",
              cursor: "pointer",
              textDecoration: todo.done ? "line-through" : "none",
              borderBottom: "1px solid #eee",
            }}
          >
            {todo.done ? "✅" : "⬜"} {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

NanoReact.render(<App />, document.getElementById("app"));
