import { useState } from "react";
import Home from "./views/Home";
import Merge from "./views/Merge";
import Split from "./views/Split";

export default function App() {
  const [view, setView] = useState("home");

  if (view === "merge") return <Merge onBack={() => setView("home")} />;
  if (view === "split") return <Split onBack={() => setView("home")} />;
  return <Home onSelect={setView} />;
}
