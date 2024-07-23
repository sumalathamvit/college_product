import React from "react";
import string from "../string";
import blankProfile from "../assests/png/blank-profile-picture.png";
import { useSelector } from "react-redux";

function StudentCard({ studentInfo }) {
  const COLLEGECONFIG = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  return (
    <div className="row no-gutters">
      <div className="card">
        <div className="row no-gutters">
          <div className="col-lg-4 row no-gutters border-end">
            <div className="col-lg-3">
              <img
                src={
                  studentInfo?.photo && studentInfo?.photo != ""
                    ? string.FILEURL + studentInfo.photo
                    : blankProfile
                }
                className="image-size"
              />
            </div>
            <div className="col-lg-9">
              <div className="student-label mt-2">Student No. / Name</div>
              <div className="student-text">
                {studentInfo?.enrollNo} /{" "}
                {studentInfo?.studentName
                  ? studentInfo?.studentName
                  : studentInfo?.name}
              </div>
            </div>
          </div>
          <div className="col-lg-8 row no-gutters">
            <div className="col-lg-3 ps-2 border-end">
              <div className="student-label mt-2">Father Name</div>
              <div className="student-text">{studentInfo?.fatherName}</div>
            </div>
            {/* <div className="col-lg-2 ps-2  border-end">
              <div className="student-label mt-2">Batch</div>
              <div className="student-text">{studentInfo?.batch}</div>
            </div>
            <div className="col-lg-1 ps-2  border-end">
              <div className="student-label mt-2">Year</div>
              <div className="student-text">{studentInfo?.studyYear}</div>
            </div> */}
            {/* {collegeConfig.institution_type != 5 && ( */}
            <div className="col-lg-2 ps-2  border-end">
              <div className="student-label mt-2">{RENAME?.sem}</div>
              <div className="student-text">{studentInfo?.className}</div>
            </div>
            {/* )} */}
            <div className="col-lg-7 ps-2 ">
              <div className="student-label mt-2">{RENAME?.course}</div>
              <div className="student-text">
                {studentInfo?.courseName
                  ? studentInfo?.courseName
                  : studentInfo?.course + " - " + studentInfo?.department}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCard;
