import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n/index"; // ← добавить перед App  
import App from "./App";
import { AppProvider } from "./context/AppContext";
import "./styles/globals.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
