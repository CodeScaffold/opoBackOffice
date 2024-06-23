import React, { createContext, useContext, useState } from "react";
import { API_URL } from "../../settings.ts";
import { Box, CircularProgress } from "@mui/material";

const getToken = async () => localStorage.getItem("token");

// Create context
const AuthContext = createContext({
  isAuth: false,
  token: null,
  login: async (details: any) => null,
  logout: () => {},
  userDetails: null,
  isLoading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

const loginRequest = async (details: any) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  });
  return await response.json();
};

//Lets make a function to send a requst to our endpoint with header

const checkLogin = async () => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/account`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};

export const AuthProvider = ({ children }: any) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsloading] = useState(true);
  //Check user is login
  React.useEffect(() => {
    if (localStorage.getItem("token")) {
      checkLogin().then((resp: any) => {
        if (resp.id) {
          setIsAuth(true);
          setUserDetails(resp);
        } else {
          setIsAuth(false);
          localStorage.removeItem("token");
          setError(resp.message);
        }
        setIsloading(false);
      });
    } else {
      setIsloading(false);
    }
  }, []);

  // Function to login the user
  const login = (details: any) => {
    loginRequest(details).then((resp: any) => {
      if (resp.token) {
        localStorage.setItem("token", resp.token);
        setIsAuth(true);
        setUserDetails(resp.user);
        setIsloading(false);
      } else {
        setError(resp.message);
      }
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
    setUserDetails(null);
    setIsloading(false);
  };

  const contextMemo = React.useMemo(
    () => ({ isAuth, userDetails, login, logout, error, isLoading }),
    [isAuth, userDetails, login, logout, error, isLoading],
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={contextMemo}>{children}</AuthContext.Provider>
  );
};
