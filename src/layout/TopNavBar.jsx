import React, { useContext, useEffect, useState } from "react";
import $ from "jquery";
import { useSelector } from "react-redux";

import SubMenu from "./Submenu";
import { useLocation, useNavigate } from "react-router-dom";
import storage from "../auth/storage";
import AuthContext from "../auth/context";
import string from "../string";
import StudentListModal from "../component/StudentListModal";
import Icon from "../component/Icon";
import moment from "moment";
import Dashboardapi from "../api/Dashboardapi";

function TopNavBar() {
  const [imageUrl, setImageUrl] = useState("");
  const [userCollegeName, setUserCollegeName] = useState("");
  let nextMonthDate = moment().add(1, "months").format("MM/YYYY");
  const [getActivityGroupsFeesDueAlert, setGetActivityGroupsFeesDueAlert] =
    useState([]);
  const navigate = useNavigate();
  const {
    setSubMenu,
    topMenuData,
    mainTitle,
    setMainTitle,
    setSubTitle,
    studentPhoto,
    studentName,
    role,
    token,
    collegeId,
    instituteArray,
    studentList,
  } = useContext(AuthContext);
  const menuData = topMenuData;
  const [studentListModal, setStudentListModal] = useState(false);
  const location = useLocation();

  const collegeConfig = useSelector((state) => state.web.college);
  const billAccess = sessionStorage.getItem("BILL_ACCESS");

  // console.log(studentPhoto, studentName, role, "studentPhoto, studentName,");

  const handleMainTitle = async (data, dataIndex) => {
    storage.storeMenuData([data]);
    setSubMenu([data]);

    setMainTitle(data.title);
    setSubTitle("");
    storage.storeMainTitle(data.title);
    storage.storeSubTitle("");
    navigate(data.link);
  };

  const handleSubTitle = async (main, sub) => {
    setMainTitle(main.title);
    setSubTitle(sub.subTitleID);
    storage.storeMainTitle(main.title);
    storage.storeSubTitle(sub.subTitleID);
  };

  const handleLogout = async () => {
    navigate("/logout");
  };

  // Function to get Activity Groups Fees Due Alert
  const getActivityGrpFeesDueAlert = async () => {
    try {
      const response = await Dashboardapi.getActivityGroupsFeesDueAlert();
      console.log("getActivityGroupsFeesDueAlert", response);
      setGetActivityGroupsFeesDueAlert(
        response.data.message.data.activityGroups
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    // moment().format("DD/MM/YYYY") // To get current date and plus next month
  };

  useEffect(() => {
    menuData.length > 0 && getActivityGrpFeesDueAlert();
  }, []);

  return (
    <>
      <div className="menu-bar">
        {!token || role === "student" ? (
          <>
            <div className="row justify-content-space-between">
              <div className="col-6 row">
                <div className="col-6 text-start">
                  <a href="/">
                    <img
                      src={
                        instituteArray.length > 0
                          ? (collegeConfig.common_cashier == 1 &&
                              billAccess == 1) ||
                            role == "SuperAdmin" ||
                            location.pathname === "/privacy-policy"
                            ? instituteArray.find((obj) => obj.collegeID == 0)
                                ?.header_logo
                            : instituteArray.find(
                                (obj) => obj.collegeID == collegeId
                              )?.header_logo
                          : require("../assests/png/header-logo.png")
                      }
                      alt={
                        instituteArray.length > 0
                          ? instituteArray.find(
                              (obj) => obj.collegeID == collegeId
                            )?.name
                          : string.INSTITUTE_NAME
                      }
                      // width={"200"}
                      width={250}
                    />
                  </a>
                </div>
              </div>
              {role === "student" ? (
                <div
                  className="col-6  cursor-pointer align-items-center display-flex-end mt-2"
                  onClick={() =>
                    studentList.length > 1 ? setStudentListModal(true) : null
                  }
                >
                  {studentPhoto ? (
                    <img
                      src={string.FILEURL + studentPhoto}
                      alt="student"
                      className="student-photo"
                    />
                  ) : null}
                  <text className="cursor-pointer ms-1 me-3">
                    {studentName}
                    {studentList.length > 1 ? (
                      <Icon iconName="ArrowDropDown" fontSize={"medium"} />
                    ) : null}
                  </text>
                  <a onClick={handleLogout}>Logout</a>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <ul>
            {menuData.length > 0 &&
              menuData.map((item, index) => {
                return (
                  <li>
                    <a
                      className={mainTitle === item.title ? "active-menu" : ""}
                      onClick={(e) => {
                        if (item.subMenu.length === 0) {
                          handleMainTitle(item, index);
                        }
                      }}
                    >
                      {item.title}
                    </a>

                    <SubMenu
                      data={item.subMenu}
                      onClick={(e) => {
                        handleSubTitle(item, item.subMenu[e]);
                      }}
                    />
                  </li>
                );
              })}
          </ul>
        )}
      </div>
      {getActivityGroupsFeesDueAlert.length > 0 ? (
        <marquee
          class="marq mb-3 p-2"
          // bgcolor="#2455b7"
          bgcolor="#ffc332"
          direction="left"
          loop=""
        >
          <div class="geek2" style={styles.textColor}>
            Activity Group{" "}
            {getActivityGroupsFeesDueAlert.map((item) => (
              <span>{item.activityGroupName + ",  "}</span>
            ))}
            fees will be calculated on {"01/" + nextMonthDate}. Please verify
            the student list.
          </div>
        </marquee>
      ) : null}
      <StudentListModal
        title={"Student List"}
        isOpen={studentListModal}
        okClick={() => setStudentListModal(false)}
        studentList={studentList}
      />
    </>
  );
}

const styles = {
  textColor: {
    color: "#2455b7",
  },
};

export default TopNavBar;
