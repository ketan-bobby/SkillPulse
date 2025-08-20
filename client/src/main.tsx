import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/modern-clean.css";
import "./styles/fix-clickability.css";
import "./styles/unified-design.css";

createRoot(document.getElementById("root")!).render(<App />);
