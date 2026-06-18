import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { HistoricalMinds } from "./components/historical-minds";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HistoricalMinds />
  </StrictMode>
);
