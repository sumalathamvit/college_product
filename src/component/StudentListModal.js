import React, { useContext, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Button from "./FormField/Button";
import storage from "../auth/storage";
import string from "../string";
import Icon from "./Icon";
import useAuth from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/context";

const StudentListModal = ({
  isOpen = true,
  yesClick,
  noClick,
  okClick,
  yesClickButtonTitle = "Yes",
  noClickButtonTitle = "No",
  studentList,
}) => {
  const authLogin = useAuth();
  const navigate = useNavigate();
  const { setTopMenuData, setRole } = useContext(AuthContext);

  const handleLogin = async (item) => {
    authLogin.studentLogIn(
      item[0].name,
      item[0].email,
      item[0].studentID || item[0].studentID === 0
        ? item[0].studentID.toString()
        : "",
      item[0].registrationNo || item[0].registrationNo === 0
        ? item[0].registrationNo.toString()
        : "",
      item[0].enrollNo || item[0].enrollNo === 0
        ? item[0].enrollNo.toString()
        : "",
      item[0].classID || item[0].classID === 0
        ? item[0].classID.toString()
        : "",
      item[0].batch_id || item[0].batch_id === 0
        ? item[0].batch_id.toString()
        : "",
      item[0].courseID || item[0].courseID === 0
        ? item[0].courseID.toString()
        : "",
      item[0].collegeID || item[0].collegeID === 0
        ? item[0].collegeID.toString()
        : "",
      item[0].semester || item[0].semester === 0
        ? item[0].semester.toString()
        : "",
      new Date().toString(),
      item[0].photo ? item[0].photo : "",
      item[0].className ? item[0].className : "",
      item[0].token ? item[0].token : "",
      item[0].studyYear || item[0].studyYear === 0
        ? item[0].studyYear.toString()
        : ""
    );
    setRole("student");
    storage.storeRole("student");
    let newMenuArr = [
      {
        title: "LMS Dashboard",
        class: "",
        subMenu: [],
        icon: "Home",
        link: "/lms-my-course",
        mainTitleID: 1,
        subTitleID: 1,
      },
    ];

    storage.storeTopMenuData(newMenuArr);

    setTopMenuData(newMenuArr);
    navigate("/");
  };

  return (
    <Modal show={isOpen} onEscapeKeyDown={okClick}>
      <Modal.Header>
        <Modal.Title>Student List</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div
          style={{
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          {studentList.map((student, index) => (
            <div
              key={index}
              className="col-12 cursor-pointer"
              onClick={() => {
                handleLogin([student]);
                okClick();
              }}
            >
              <div className="row border-bottom p-2 align-items-center">
                <div className="col-2">
                  {student.photo ? (
                    <img
                      src={string.FILEURL + student.photo}
                      alt="profile"
                      className="image-size "
                    />
                  ) : (
                    <Icon
                      iconName="AccountCircle"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        color: "#0669ad",
                        marginRight: "10px",
                      }}
                    />
                  )}
                </div>
                <div className="col-10">
                  <div className="student-text">{student.name}</div>
                  {/* <div> {student.enrollNo}</div> */}
                  <div>Class : {student.className}</div>
                  {/* <div>{student.email}</div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="d-flex flex-row justify-content-center">
          {okClick && (
            <Button autoFocus isTable={true} text={"Close"} onClick={okClick} />
          )}
          {noClick && <Button text={noClickButtonTitle} onClick={noClick} />}
          {yesClick && <Button text={yesClickButtonTitle} onClick={yesClick} />}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default StudentListModal;
