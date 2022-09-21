import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "./styles/app.css";
import React from "react";
import ReactDOM from "react-dom";
import Bdash from "../lib/Bdash";
import "./components/SplashScreen";
import App from "./pages/App";
import AppErrorBoundary from "./pages/App/AppErrorBoundary";

Bdash.initialize()
  .then(() => {
    ReactDOM.render(
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>,
      document.getElementById("app")
    );
  })
  .catch((err: Error) => {
    // TODO: process exit after close alert
    alert(err.message);
    throw err;
  });
