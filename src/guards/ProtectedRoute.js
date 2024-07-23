import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import storage from "../auth/storage";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkUserToken = async () => {
    try {
      const userToken = sessionStorage.getItem("token");
      if (!userToken || userToken === undefined) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error while checking user token:", error);
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  // useEffect(() => {
  //   checkUserToken();
  // }, []);

  return isLoggedIn ? <>{children}</> : <>{children}</>;
};

export default ProtectedRoute;
