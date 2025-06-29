import { useState, useEffect, useCallback } from "react";

let logoutTimer;

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);
  const [employeeID, setEmployeeID] = useState(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState(null);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      const { token } = data;
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(decoded.exp * 1000);
      
      setIsLoggedIn(true);
      setToken(token);
      setEmployeeID(decoded.employeeID);
      setUserId(decoded.sub);
      setRole(decoded.role || "employee");
      setName(decoded.name || "User");
      setTokenExpirationDate(expirationDate);
      
      localStorage.setItem(
        "userData",
        JSON.stringify({
          userId: decoded.sub,
          token,
          employeeID: decoded.employeeID,
          role: decoded.role,
          name: decoded.name,
          expiration: expirationDate.toISOString(),
        })
      );
      
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }
      
      return true;
    } catch (err) {
      console.error("Registration error:", err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setToken(null);
    setUserId(null);
    setRole(null);
    setName(null);
    setTokenExpirationDate(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedData = JSON.parse(localStorage.getItem("userData"));
        if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
          setIsLoggedIn(true);
          setToken(storedData.token);
          setUserId(storedData.userId);
          setRole(storedData.role);
          setName(storedData.name);
          setEmployeeID(storedData.employeeID);
          setTokenExpirationDate(new Date(storedData.expiration));
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    isLoading,
    isLoggedIn,
    userId,
    token,
    employeeID,
    role,
    name,
    login,
    logout,
    register,
  };
};