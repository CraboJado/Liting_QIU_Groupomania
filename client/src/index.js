import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

export const GlobleContext = React.createContext()


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  //   <App/>
  // </React.StrictMode>
   <App/>

);


