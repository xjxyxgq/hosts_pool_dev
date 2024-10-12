import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import 'antd/dist/antd.css'; // Uncomment this line for Antd 3.x version
import 'antd/dist/antd.css'; // Correct import for Antd 3.x

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
