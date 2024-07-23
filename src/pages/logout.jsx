import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/context";
import useAuth from "../auth/useAuth";
import storage from "../auth/storage";

function Logout() {
  //#region const
  const navigate = useNavigate();
  const {
    setToken,
    setSubMenu,
    setRole,
    setEmployeeId,
    setUnSavedChanges,
    setCollegeId,
    setDepartment,
    setTopMenuData,
  } = useContext(AuthContext);

  const auth = useAuth();
  //#endregion

  const getHomePage = async () => {
    try {
      await auth.studentLogout();
      await auth.logOut();
      await sessionStorage.clear();
      await localStorage.clear();
      setToken(null);
      setSubMenu(null);
      setRole(null);
      setEmployeeId(null);
      setUnSavedChanges(null);
      setCollegeId(null);
      setDepartment(null);
      setTopMenuData([]);
      storage.storeCacheClear(true);
      navigate("/");
    } catch (error) {}
  };
  useEffect(() => {
    getHomePage();
  }, []);
}

export default Logout;
