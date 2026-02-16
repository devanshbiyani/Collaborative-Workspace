import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import App from "./App";
import "./styles.css";

const DocumentRedirect = () => {
  const documentId = React.useMemo(() => uuidv4(), []);
  return <Navigate replace to={`/documents/${documentId}`} />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocumentRedirect />} />
        <Route path="/documents/:id" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
