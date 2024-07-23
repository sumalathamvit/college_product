import React from "react";
import string from "../string";
import blankProfile from "../assests/png/blank-profile-picture.png";

function EmployeeCard({ employeeInfo }) {
  return (
    <div className="row no-gutters">
      <div className="card">
        <div className="row no-gutters">
          <div className="col-lg-3 row no-gutters border-end">
            <div className="col-lg-3">
              <img
                src={
                  employeeInfo?.image && employeeInfo?.image != ""
                    ? string.TESTBASEURL + employeeInfo.image
                    : blankProfile
                }
                className="image-size"
              />
            </div>
            <div className="col-lg-9">
              <div className="student-label mt-2">Employee Name</div>
              <div className="student-text">{employeeInfo?.employee_name}</div>
            </div>
          </div>
          <div className="col-lg-9 row no-gutters">
            <div className="col-lg-3 ps-2 border-end">
              <div className="student-label mt-2">Employee No.</div>
              <div className="student-text">
                {employeeInfo?.custom_employeeid}
              </div>
            </div>
            <div className="col-lg-3 ps-2  border-end">
              <div className="student-label mt-2">Designation</div>
              <div className="student-text">{employeeInfo?.designation}</div>
            </div>
            <div className="col-lg-6 ps-2 ">
              <div className="student-label mt-2">Department</div>
              <div className="student-text">
                {employeeInfo?.department?.split("-")[0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeCard;
