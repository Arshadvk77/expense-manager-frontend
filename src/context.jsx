import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [ccy, setCcy] = useState('AED');
  const [dark, setDark] = useState(false);
  return (
    <AppContext.Provider value={{ ccy, setCcy, dark, setDark }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
