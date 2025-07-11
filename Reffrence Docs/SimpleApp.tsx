import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const SimpleApp = () => {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px' }}>
        <h1>Huurly Application</h1>
        <Routes>
          <Route path="/" element={<div>Home Page - Please login</div>} />
          <Route path="/huurder-dashboard" element={<div>Huurder Dashboard - Login required</div>} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default SimpleApp;

