import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-root">
      <AppRoutes />
    </div>
  );
}

export default App;
