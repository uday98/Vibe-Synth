import React from "react";
import { createRoot } from "react-dom/client";

/**
 * Replace the contents of this App component with your app code.
 * This file both exports the App component and mounts it if it is used
 * directly as the entry module (as index.html imports /src/App.jsx).
 */
export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', padding: 20 }}>
      <h1>Vibe Synth</h1>
      <p>Replace this placeholder with your application code (paste your App component here).</p>
    </main>
  );
}

// If this file is used as the entry module, mount the app into #root.
const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
