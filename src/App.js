import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import $ from "jquery";
import { Modal } from "react-bootstrap";
import { IdleTimerProvider, useIdleTimer } from "react-idle-timer";

import { webSliceActions } from "./store/web";

import string from "./string";

import ToastContainerComponent from "./component/ToastContainer";
import ModalComponent from "./component/ModalComponent";
import { authNotNeedPaths } from "./component/common/CommonArray";
import Button from "./component/FormField/Button";

import AuthContext from "./auth/context";
import storage from "./auth/storage";

import login from "./api/login";
import libraryapi from "./api/libraryapi";
import AcademicApi from "./api/AcademicApi";
import StudentApi from "./api/StudentApi";

import TopNavBar from "./layout/TopNavBar";
import SubNavBar from "./layout/SubNavBar";
import Navigator from "./layout/Navigator";
import StudentNavigator from "./layout/StudentNavigator";

import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

function App() {
  //#region const
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [load, setLoad] = useState(false);
  const [token, setToken] = useState();
  const [subMenu, setSubMenu] = useState([]);
  const [role, setRole] = useState();
  const [userRole, setUserRole] = useState();
  const [employeeId, setEmployeeId] = useState();
  const [unSavedChanges, setUnSavedChanges] = useState(false);
  const [collegeId, setCollegeId] = useState();
  const [collegeName, setCollegeName] = useState();
  const [department, setDepartment] = useState();
  const [employeeName, setEmployeeName] = useState();
  const [topMenuData, setTopMenuData] = useState([]);
  const [mainTitle, setMainTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentRegisterNumber, setStudentRegisterNumber] = useState("");
  const [studentEnrollNumber, setStudentEnrollNumber] = useState("");
  const [studentClassId, setStudentClassId] = useState("");
  const [studentBatchId, setStudentBatchId] = useState("");
  const [studentCourseId, setStudentCourseId] = useState("");
  const [studentCollegeId, setStudentCollegeId] = useState("");
  const [studentSemester, setStudentSemester] = useState("");
  const [studentDate, setStudentDate] = useState("");
  const [studentPhoto, setStudentPhoto] = useState("");
  const [studentClassName, setStudentClassName] = useState("");
  const [studentToken, setStudentToken] = useState("");
  const [studentStudyYear, setStudentStudyYear] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [currentPageConfig, setCurrentPageConfig] = useState();
  const [instituteArray, setInstituteArray] = useState([]);
  const [studentList, setStudentList] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  //#endregion

  const checkAdminLog = async () => {
    try {
      const email = sessionStorage.getItem("email");
      const role = storage.getRole();
      const userRole = storage.getUserRole();
      const token = storage.getToken();
      const employeeId = storage.getEmployeeId();
      const collegeId = storage.getCollegeId();
      const department = storage.getDepartmentId();
      const topMenuData = storage.getTopMenuData();
      const mainTitle = storage.getMainTitle();
      const subTitle = storage.getSubTitle();
      const collegeName = storage.getCompany();
      const studentName = storage.getStudentName();
      const studentEmail = storage.getStudentEmail();
      const studentId = storage.getStudentId();
      const studentRegisterNumber = storage.getStudentRegisterNumber();
      const studentEnrollNumber = storage.getStudentEnrollNumber();
      const studentClassId = storage.getStudentClassId();
      const studentBatchId = storage.getStudentBatchId();
      const studentCourseId = storage.getStudentCourseId();
      const studentCollegeId = storage.getStudentCollegeId();
      const studentSemester = storage.getStudentSemester();
      const studentDate = storage.getStudentDate();
      const studentPhoto = storage.getStudentPhoto();
      const studentClassName = storage.getStudentClassName();
      const studentToken = storage.getStudentToken();
      const studentStudyYear = storage.getStudentStudyYear();
      const instituteArray = storage.getInstituteArray();
      const studentList = storage.getStudentList();

      if (token) setToken(token);
      if (employeeId) setEmployeeId(employeeId);
      if (collegeId) setCollegeId(collegeId);
      if (department) setDepartment(department);
      if (employeeName) setEmployeeName(employeeName);
      if (topMenuData) setTopMenuData(topMenuData);
      if (role) setRole(role);
      if (userRole) setUserRole(userRole);
      if (mainTitle) setMainTitle(mainTitle);
      if (subTitle) setSubTitle(subTitle);
      if (collegeName) setCollegeName(collegeName);

      if (studentName) setStudentName(studentName);
      if (studentEmail) setStudentEmail(studentEmail);
      if (studentId) setStudentId(studentId);
      if (studentRegisterNumber)
        setStudentRegisterNumber(studentRegisterNumber);
      if (studentEnrollNumber) setStudentEnrollNumber(studentEnrollNumber);
      if (studentClassId) setStudentClassId(studentClassId);
      if (studentBatchId) setStudentBatchId(studentBatchId);
      if (studentCourseId) setStudentCourseId(studentCourseId);
      if (studentCollegeId) setStudentCollegeId(studentCollegeId);
      if (studentSemester) setStudentSemester(studentSemester);
      if (studentDate) setStudentDate(studentDate);
      if (studentPhoto) setStudentPhoto(studentPhoto);
      if (studentClassName) setStudentClassName(studentClassName);
      if (studentToken) setStudentToken(studentToken);
      if (studentStudyYear) setStudentStudyYear(studentStudyYear);
      if (instituteName) setInstituteName(instituteName);
      if (instituteArray) setInstituteArray(instituteArray);
      if (studentList) setStudentList(studentList);
      setLoad(true);

      const subMenuData = storage.getMenuData();
      setSubMenu(subMenuData);

      setToken(token);
      sessionStorage.setItem("NO_OF_PERIOD", string.NO_OF_PERIOD);
      // console.log("studentEmail---", studentEmail);
      setLoad(true);
    } catch (error) {
      setLoad(true);
    }
  };

  // console.log = function () {};

  const handleKeyPress = (evt) => {
    if (evt.keyCode == 13) {
      evt.preventDefault();
      const itype = $(evt.target).prop("type");
      // console.log("itype---", itype);
      if (itype == "submit" || itype == "button") {
        return;
      }

      const currentTabindex = $(evt.target).attr("tabindex");
      // console.log("currentTabindex---", currentTabindex);
      if (currentTabindex) {
        const nextInput = $(
          'input[tabindex^="' +
            (parseInt(currentTabindex) + 1) +
            '"], button[tabindex^="' +
            (parseInt(currentTabindex) + 1) +
            '"], textarea[tabindex^="' +
            (parseInt(currentTabindex) + 1) +
            '"]'
        );
        if (nextInput.length) {
          nextInput[0].focus();
          return false;
        }
      }
    }
  };

  // const handleSessionExpire = () => {
  //   setModalErrorOpen(false);
  //   navigate("/logout");
  // };

  const checkAuthentication = async () => {
    // console.log("role---", role, storage.getRole());
    if (
      sessionStorage?.getItem("ROLE")?.toUpperCase() !=
        string.SUPER_ADMIN_ROLE &&
      sessionStorage?.getItem("ROLE")?.toLowerCase() != "student" &&
      sessionStorage?.getItem("ROLE")?.toUpperCase() !=
        string.MANAGEMENT_ROLE &&
      location.pathname != "/privacy-policy"
    ) {
      if (authNotNeedPaths.indexOf(location.pathname) == -1) {
        const authenticateRes = await libraryapi.authenticate(
          sessionStorage.getItem("email"),
          location.pathname.substring(1)
        );
        // console.log("authenticateRes------------------", authenticateRes);
        if (
          !authenticateRes.data.message.result ||
          authenticateRes?.data?.message?.data?.rView === 0
        ) {
          setModalErrorOpen(true);
          setModalTitle("Access Denied");
          setModalMessage("You are not authorized to access this page.");
          navigate("/logout");
        }
      }
    }
  };

  // let timer;
  // const resetSessionTimer = () => {
  //   clearTimeout(timer);
  //   timer = setTimeout(() => {
  //     setModalErrorOpen(true);
  //     setModalTitle("Session Expired");
  //     setModalMessage("Your session has expired. Please log in again.");
  //     sessionStorage.clear();
  //   }, 360000);
  // };

  // const handleUserActivity = () => {
  //   if (sessionStorage?.getItem("SESSION")) {
  //     resetSessionTimer();
  //   }
  // };

  const handleKeyDown = (event) => {
    // console.log("event.key---", event.key);
    if (event.key == "F4") {
      event.preventDefault(); // Prevent default action of F4 key
      $("#save:first").click(); // Trigger button click
    }
  };

  const getConfig = async () => {
    try {
      const collegeId = storage.getCollegeId();
      if (collegeId) {
        const res = await AcademicApi.getConfig(collegeId);
        console.log("res---", res);
        console.log("role---", role);
        dispatch(
          webSliceActions.replaceCollege({
            institution_type:
              res.data.message.data.config_data.institution_type,
            is_semester: res.data.message.data.config_data.is_sem,
            is_university:
              res.data.message.data.config_data.institution_type === 4
                ? true
                : false,
            // is_university: false,
            collegeList: res.data.message.data.config_data.college_detail,
            validity: res.data.message.data.config_data.validity,
            address: res.data.message.data.config_data.address,
            second_line: res.data.message.data.config_data.second_line,
            third_line: res.data.message.data.config_data.third_line,
            fourth_line: res.data.message.data.config_data.fourth_line,
            fifth_line: res.data.message.data.config_data.fifth_line,
            phone: res.data.message.data.config_data.phone,
            fax: res.data.message.data.config_data.fax,
            print_email: res.data.message.data.config_data.print_email,
            logo: string.TESTBASEURL + res.data.message.data.config_data.logo,
            no_of_term: res.data.message.data.config_data.no_of_term,
            common_cashier: res.data.message.data.config_data.common_cashier,
            common_logo: res.data.message.data.config_data.common_logo,
          })
        );
      }
    } catch (error) {
      // // setOpenModal(false);
      console.log("Exception---", error);
    }
  };

  const handlePageConfig = async () => {
    // console.log("handlePageConfig---");
    const pageConfigData = storage.getPageConfig();
    // console.log("pageConfigData---", pageConfigData);
    if (pageConfigData.length == 0) return;
    pageConfigData.forEach((item) => {
      item.link = item.link.replace(/\s/g, "");
      if ("/" + item.link == location.pathname) {
        const currentPageConfig = JSON.parse(item.config);
        for (let i = 0; i < currentPageConfig?.length; i++) {
          if (currentPageConfig[i].type === "text") {
            for (let key in currentPageConfig[i].attribute) {
              $("#" + currentPageConfig[i].id).attr(
                key,
                currentPageConfig[i].attribute[key]
              );
            }
          } else {
            for (let key in currentPageConfig[i].attribute) {
              if (key === "placeholder") {
                $("#" + currentPageConfig[i].id)
                  ?.parent()
                  ?.prev()
                  ?.html(currentPageConfig[i].attribute["placeholder"]);
              } else if (
                currentPageConfig[i].attribute[key] == "non-mandatory-input"
              ) {
                $("#" + currentPageConfig[i].id).addClass("non-mandatory");
                $("#" + currentPageConfig[i].id)
                  ?.parent()
                  ?.parent()
                  ?.parent()
                  ?.attr("style", "background-color: " + string.MANDATORYCOLOR);
              } else {
                $("#" + currentPageConfig[i].id).attr(
                  key,
                  currentPageConfig[i].attribute[key]
                );
              }
            }
          }
        }
      }
    });

    const formElements = document.querySelectorAll(
      "input, select, textarea, button"
    );
    let tIndex = 0;
    formElements.forEach((element) => {
      document.getElementById("c" + element.id)?.style?.display != "none" &&
      document.getElementById(element.id)?.type != "file"
        ? element.setAttribute("tabindex", tIndex++)
        : element.setAttribute("tabindex", null);
    });
  };

  const initialPath = async () => {
    // console.log("location.pathname---", location);
    const topMenuData = storage.getTopMenuData();

    if (topMenuData.length > 0) {
      if (location.pathname === "/") {
        setMainTitle(topMenuData[0].title);
        setSubTitle("");
        storage.storeMainTitle(topMenuData[0].title);
        storage.storeSubTitle("");
        storage.storeMenuData([topMenuData[0]]);
        setSubMenu([topMenuData[0]]);
      } else {
        topMenuData.forEach(async (item) => {
          if (item.link === location.pathname) {
            setMainTitle(item.title);
            setSubTitle("");
            storage.storeMainTitle(item.title);
            storage.storeSubTitle("");
            storage.storeMenuData([item]);
            setSubMenu([item]);
          } else {
            item.subMenu.forEach(async (subItem) => {
              subItem.subData.forEach(async (subDataItem) => {
                if (subDataItem.link === location.pathname) {
                  setMainTitle(item.title);
                  setSubTitle(subItem.subTitleID);
                  storage.storeMainTitle(item.title);
                  storage.storeSubTitle(subItem.subTitleID);
                  storage.storeMenuData(subItem.subData);
                  setSubMenu(subItem.subData);
                }
              });
            });
          }
        });
      }
    }
  };

  const getAdminToken = async () => {
    try {
      const getTokenRes = await login.getToken(
        string.testEmail,
        string.testPassword
      );
      console.log("getTokenRes----", getTokenRes);
      if (getTokenRes.data.message.result) {
        // console.log(res.data.message.data, "res.data.message.data");
        storage.storeAdminToken(getTokenRes.data.message.data);
      }

      // getRenameConfigRes
      const getRenameConfigRes = await libraryapi.getRenameConfig();
      console.log("getRenameConfigRes---", getRenameConfigRes);

      dispatch(
        webSliceActions.replaceRename(getRenameConfigRes.data.message.data)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const setInstituteDetail = async () => {
    try {
      const getLogoDetailsRes = await StudentApi.getLogoDetails();
      console.log("getLogoDetailsRes---", getLogoDetailsRes);
      if (!getLogoDetailsRes.ok) {
        return;
      }
      // let defaultArray = [];
      let collegeArray = [];

      for (
        let i = 0;
        i < getLogoDetailsRes?.data?.message?.data?.config_data.length;
        i++
      ) {
        if (
          getLogoDetailsRes?.data?.message?.data?.config_data[i].collegeID == 0
        ) {
          collegeArray.push(
            getLogoDetailsRes?.data?.message?.data?.config_data[i]
          );
        } else {
          const collegeConfigRes = await libraryapi.getCollegeConfigData(
            getLogoDetailsRes?.data?.message?.data?.config_data[i].collegeID,
            "HRMS_DATA"
          );
          // console.log("collegeConfigRes", collegeConfigRes);
          if (collegeConfigRes?.data?.message?.success) {
            getLogoDetailsRes.data.message.data.config_data[i].PAYROLL_DATE =
              JSON.parse(
                collegeConfigRes.data.message.data.config_data[0].value
              ).PAYROLL_DATE;
          }

          collegeArray.push(
            getLogoDetailsRes?.data?.message?.data?.config_data[i]
          );
        }
      }

      // console.log("defaultArray---", defaultArray);
      // console.log("collegeArray---", collegeArray);

      // if (defaultArray) {
      //   sessionStorage.setItem("HEADER_LOGO", defaultArray[0]?.header_logo);
      //   setInstituteName(defaultArray[0]?.name);
      //   sessionStorage.setItem("INSTITUTE_NAME", defaultArray[0]?.name);
      //   sessionStorage.setItem("ROUND_LOGO", defaultArray[0]?.logo);
      //   sessionStorage.setItem("LOGO_BASE64", defaultArray[0]?.base64);
      // }
      setInstituteName(collegeArray.find((obj) => obj.collegeID == 0)?.name);
      const arrayString = JSON.stringify(collegeArray);
      // console.log("arrayString---", arrayString);
      sessionStorage.setItem("INSTITUTE_ARR", arrayString);
      setInstituteArray(collegeArray);
    } catch (error) {
      console.log("error---", error);
    }
  };

  const getWebVersion = async () => {
    const res = await login.getVersionData();
    // console.log("version---", res);
    if (res.data.message.success) {
      if (res.data.message.version != string.VERSION) {
        clearCacheData();
        // console.log(string.VERSION, res.data.message.version, "version");
      } else {
        storage.removeCacheClear();
      }
    }
  };

  const clearCacheData = async () => {
    let cache = storage.getCacheClear();
    // console.log(cache, "cache");
    if (window.caches) {
      storage.storeCacheClear(true);
      caches.keys().then(function (names) {
        // console.log(names, "name");
        for (let name of names) caches.delete(name);
      });
    }
    // console.log("reload", cache);

    if (!cache) {
      storage.storeCacheClear(true);
      window.location.reload(true);
    }
    // if (token) {
    //   navigate("/logout");
    // }
  };

  useEffect(() => {
    setInstituteDetail();
  }, [sessionStorage.getItem("email")]);

  useEffect(() => {
    checkAdminLog();
    getAdminToken();
    sessionStorage.setItem("unSavedChanges", false);
    setUnSavedChanges(false);
    const handleBeforeUnload = (event) => {
      if (JSON.parse(sessionStorage.getItem("unSavedChanges"))) {
        event.preventDefault();
        return null;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keyup", handleKeyDown);
    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keyup", handleKeyDown);
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (unSavedChanges) {
      sessionStorage.setItem("unSavedChanges", true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
    }
  }, [unSavedChanges]);

  useEffect(() => {
    getWebVersion();
    initialPath();
    checkAuthentication();
  }, [location.pathname]);

  useEffect(() => {
    if (token) {
      getConfig();
    }
  }, [token]);

  useEffect(() => {
    if (load) handlePageConfig();
  }, [location.pathname, load]);

  useEffect(() => {
    setInstituteDetail();
  }, [sessionStorage.getItem("email")]);

  const handleOnIdle = () => {
    // console.log("idle");
    navigate("/logout");
    setOpenModal(true);
    // setEnable(false);
  };

  return (
    <>
      {location.pathname != "/" &&
        location.pathname != "/login" &&
        location.pathname != "/logout" && (
          <IdleTimerProvider
            timeout={600000}
            onIdle={handleOnIdle}
          ></IdleTimerProvider>
        )}
      <ToastContainerComponent />
      <ModalComponent
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => setModalErrorOpen(false)}
      />
      {load ? (
        <>
          <AuthContext.Provider
            value={{
              subMenu,
              setSubMenu,
              role,
              setRole,
              userRole,
              setUserRole,
              employeeId,
              setEmployeeId,
              unSavedChanges,
              setUnSavedChanges,
              collegeId,
              setCollegeId,
              department,
              setDepartment,
              employeeName,
              setEmployeeName,
              token,
              setToken,
              topMenuData,
              setTopMenuData,
              mainTitle,
              setMainTitle,
              subTitle,
              setSubTitle,
              collegeName,
              setCollegeName,
              studentName,
              setStudentName,
              studentEmail,
              setStudentEmail,
              studentId,
              setStudentId,
              studentRegisterNumber,
              setStudentRegisterNumber,
              studentEnrollNumber,
              setStudentEnrollNumber,
              studentClassId,
              setStudentClassId,
              studentBatchId,
              setStudentBatchId,
              studentCourseId,
              setStudentCourseId,
              studentCollegeId,
              setStudentCollegeId,
              studentSemester,
              setStudentSemester,
              studentDate,
              setStudentDate,
              studentPhoto,
              setStudentPhoto,
              studentClassName,
              setStudentClassName,
              studentToken,
              setStudentToken,
              studentStudyYear,
              setStudentStudyYear,
              instituteName,
              setInstituteName,
              currentPageConfig,
              setCurrentPageConfig,
              instituteArray,
              setInstituteArray,
              studentList,
              setStudentList,
            }}
          >
            <section>
              <div className="row no-gutters">
                {role !== "student" && token ? (
                  <div className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 p-0">
                    <SubNavBar />
                  </div>
                ) : null}
                <div
                  className={`${
                    role === "student"
                      ? "col-lg-12"
                      : token
                      ? "col-xxl-10 col-xl-9 col-lg-9 col-md-8"
                      : "col-lg-12"
                  } p-0`}
                >
                  {token ? (
                    <div
                      className={`row no-gutters`}
                      style={{
                        position: "fixed",
                        width: "100%",
                        zIndex: 100,
                      }}
                    >
                      <TopNavBar />
                    </div>
                  ) : location.pathname === "/institutereg" ||
                    location.pathname === "/registration" ||
                    location.pathname === "/institute-confirmation" ||
                    location.pathname === "/privacy-policy" ||
                    role === "student" ? (
                    <div
                      className={`row no-gutters`}
                      style={{
                        position: "fixed",
                        width: "100%",
                        zIndex: 100,
                      }}
                    >
                      <TopNavBar />
                    </div>
                  ) : null}
                  {role === "student" ? <StudentNavigator /> : <Navigator />}
                </div>
              </div>
            </section>
          </AuthContext.Provider>
        </>
      ) : null}
      <Modal
        show={openModal}
        dialogClassName="my-modal"
        onEscapeKeyDown={(e) => setOpenModal(false)}
      >
        <Modal.Header>
          <Modal.Title>In Active</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="">To ensure data security, please log in again.</div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            autoFocus
            text="Close"
            frmButton={false}
            onClick={() => {
              setOpenModal(false);
            }}
          />
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default App;
