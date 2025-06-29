import { createContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  employeeID:null,
  role: null,
  name: null,
  login: () => {},
  logout: () => {},
});
