import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { DatabaseProvider } from "./contexts/DatabaseContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <DatabaseProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DatabaseProvider>
    </Provider>
  </React.StrictMode>
);
