
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { AppRoute, Employee } from './types';
import { getEmployees } from './utils/storage';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // On mount, load employees from local storage
  useEffect(() => {
    setEmployees(getEmployees());
    
    // Auto login check if desired, but here we require login every session for security
    const isLoggedIn = sessionStorage.getItem('xc3_auth') === 'true';
    if (isLoggedIn) {
      setRoute(AppRoute.DASHBOARD);
    }
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('xc3_auth', 'true');
    setRoute(AppRoute.DASHBOARD);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('xc3_auth');
    setRoute(AppRoute.LOGIN);
  };

  return (
    <div className="min-h-screen">
      {route === AppRoute.LOGIN ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard 
          employees={employees} 
          setEmployees={setEmployees}
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default App;
