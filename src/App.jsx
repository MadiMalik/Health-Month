import { Routes, Route, NavLink } from "react-router-dom";
import Journal from "./pages/Journal.jsx";
import Summary from "./pages/Summary.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <h1 className="logo">Health Month</h1>
          <nav className="flex items-center gap-2">
            <Tab to="/">Journal</Tab>
            <Tab to="/summary">Summary</Tab>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-6 grow">
        <Routes>
          <Route path="/" element={<Journal />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      </main>

      <footer className="border-t border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-4 text-xs text-gray-500">
          Educational demo only — not medical advice. Data stored locally in your browser.
        </div>
      </footer>
    </div>
  );
}

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-1.5 text-sm ${
          isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}