import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GlobalContextProvider } from "./context";
import "./styles/reset.css";
import "./styles/index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GlobalContextProvider>
  </React.StrictMode>
)
