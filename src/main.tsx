import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n/index"; // ← добавить перед App  
import App from "./App";
import { AppProvider } from "./context/AppContext";
import "./styles/globals.css";
import "./styles/masamasa-fonts.css";
import "./styles/masamasa-light.css";
import "./styles/masamasa-themes.css";
import "./styles/masamasa-refinements.css";
import "./styles/masamasa-feedback.css";
import "./styles/masamasa-workspace.css";
import "./styles/masamasa-own-editor.css";
import "./theme/theme";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
