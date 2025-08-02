import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ApiContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  lastRequest: any;
  setLastRequest: (request: any) => void;
  lastResponse: any;
  setLastResponse: (response: any) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);

  const value: ApiContextType = {
    loading,
    setLoading,
    lastRequest,
    setLastRequest,
    lastResponse,
    setLastResponse,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};