import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Invoice from "./components/Invoice";
import InvoiceHistory from "./components/InvoiceHistory";
function App() {
  return (
    <Router>
      <Routes>
        {/* Route to Invoice */}
        <Route path="/" element={<Invoice />} />
<Route path="/history" element={<InvoiceHistory />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
