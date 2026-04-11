import { createContext, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Persist user & token in localStorage so state survives page refresh
  const [user, setUserState] = useState(() => {
    try {
      const saved = localStorage.getItem("et_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessTokenState] = useState(
    () => localStorage.getItem("et_token") || null
  );

  const setUser = (userData) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem("et_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("et_user");
      localStorage.removeItem("et_token");
    }
  };

  const setAccessToken = (token) => {
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem("et_token", token);
    } else {
      localStorage.removeItem("et_token");
    }
  };

  // Delegate context: when acting on behalf of a principal
  const [delegateContext, setDelegateContext] = useState(null);
  // { principalId, principalName }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        delegateContext,
        setDelegateContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
