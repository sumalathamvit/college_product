import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import DisplayText from "../../component/FormField/DisplayText";
import ScreenTitle from "../../component/common/ScreenTitle";
import CommonApi from "../../component/common/CommonApi";

import blankProfile from "../../assests/png/blank-profile-picture.png";

import string from "../../string";
import { useSelector } from "react-redux";
import AuthContext from "../../auth/context";

function ViewSchoolStudent() {
  //#region const
  const RENAME = useSelector((state) => state.web.rename);
  const { userRole } = useContext(AuthContext);
  console.log("userRole", userRole);

  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [qualificationHistory, setQualificationHistory] = useState();
  const [studentNumber, setStudentNumber] = useState();
  const [studentList, setStudentList] = useState([]);
  const [staffData, setStaffData] = useState();
  const [siblingData, setSiblingData] = useState();
  //#endregion

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
  };

  const viewStudent = async (id) => {
    console.log("RENAME", RENAME);
    try {
      setLoad(true);
      setData([]);
      if (id) {
        const viewStudent = await StudentApi.studentDetailById(id.toString());
        console.log("---viewStudent", viewStudent);
        setData(viewStudent.data.message.data);
        setQualificationHistory(
          viewStudent?.data?.message?.data?.qualifiedExam[0]
        );
        setStaffData(viewStudent?.data?.message?.data?.staff_data[0]);
        setSiblingData(viewStudent?.data?.message?.data?.sibling_data[0]);

        const studList = await CommonApi.searchStudent(
          viewStudent?.data?.message?.data?.student?.enrollNo
        );
        setStudentList(studList);
        setStudentNumber(studList[0]);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (location?.state && location?.state?.id) {
      console.log("id", location.state.id);
      viewStudent(location.state.id);
    }
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report mt-1">
        <ScreenTitle titleClass={"page-heading-position"} />
        <div className="col-xl-8 col-lg-9 mt-2">
          <ReactSelectField
            label="Student No. / Name"
            labelSize={3}
            tabIndex={1}
            autoFocus
            id="student"
            mandatory={1}
            maxlength={40}
            value={studentNumber}
            options={studentList}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            onInputChange={(inputValue) => {
              searchStudent(inputValue);
            }}
            onChange={(text) => {
              setStudentNumber(text);
              viewStudent(text?.id);
            }}
          />
        </div>
        {studentNumber && userRole == "Admin" ? (
          <div className="col-lg-3 ps-3">
            <Button
              tabIndex={2}
              className={"btn-green"}
              type="button"
              frmButton={false}
              text={"Edit"}
              onClick={() =>
                navigate("/add-school-student", {
                  // state: { enrollNumber: studentNumber },
                  state: { id: studentNumber?.id },
                })
              }
            />
          </div>
        ) : null}
        {studentNumber && (
          <div className="row no-gutters px-3">
            <div className="subhead-row">
              <div className="subhead">Personal Detail</div>
              <div className="col line-div"></div>
            </div>
            <div className="row no-gutters pt-2">
              <div className="col-lg-9 pe-2">
                <DisplayText label="Student Name" value={data?.student?.name} />
                <DisplayText
                  label="Father Name"
                  value={data?.student?.fatherName}
                />
                <DisplayText
                  label="Date of Birth"
                  value={moment(data?.student?.dob).format("DD-MM-YYYY")}
                />
                <DisplayText label="Gender" value={data?.student?.gender} />
                <DisplayText
                  label="Student Mobile Number"
                  value={data?.student?.studentMobile}
                />
                <DisplayText
                  label="Student Email ID"
                  value={data?.student?.email}
                />
                {data?.student?.bloodGroup ? (
                  <DisplayText
                    label="Blood Group"
                    value={data?.student?.bloodGroup}
                  />
                ) : null}
                <DisplayText
                  label="Aadhaar Number"
                  value={data?.student?.aadhaar}
                />
                <DisplayText
                  label="Nationality"
                  value={data?.student?.nationality}
                />
                <DisplayText label="Religion" value={data?.student?.religion} />
                {data?.student?.community ? (
                  <DisplayText
                    label="Community"
                    value={data?.student?.community}
                  />
                ) : null}
                {data?.student?.medicalHistory ? (
                  <DisplayText
                    label="Medical Details"
                    value={data?.student?.medicalHistory}
                  />
                ) : null}
              </div>
              <div className="col-lg-3 ps-2 mt-2">
                <img
                  src={
                    data?.student?.photo
                      ? string.FILEURL + data?.student?.photo
                      : blankProfile
                  }
                  alt=""
                  width="100%"
                  style={{ border: "0" }}
                />
              </div>
            </div>
            <>
              <div className="subhead-row">
                <div className="subhead">Application Detail </div>
                <div className="col line-div"></div>
              </div>
              <div className="row no-gutters pt-2">
                <div className="col-lg-9 pe-2">
                  {data?.student?.applicationNo ? (
                    <DisplayText
                      label="Application Number"
                      value={data?.student?.applicationNo}
                    />
                  ) : null}
                  <DisplayText
                    label={RENAME?.course}
                    value={data?.student?.courseName}
                  />

                  <DisplayText
                    label={RENAME?.sem}
                    value={data?.student?.className}
                  />
                  {data?.student?.admissionType ? (
                    <DisplayText
                      label="Admission Type"
                      value={data?.student?.admissionType}
                    />
                  ) : null}
                </div>
              </div>
            </>

            {siblingData || staffData ? (
              <>
                <div className="subhead-row">
                  <div className="subhead">Concession Detail</div>
                  <div className="col line-div"></div>
                </div>
                <div className="row no-gutters pt-2">
                  <div className="col-lg-9 pe-2">
                    {siblingData && (
                      <>
                        <DisplayText label="Sibling Concession" value={"Yes"} />
                        <DisplayText
                          label="Sibling No. / Name"
                          value={
                            siblingData.enrollNo + " - " + siblingData.name
                          }
                        />
                      </>
                    )}
                    {staffData && (
                      <>
                        <DisplayText label="Staff Concession" value={"Yes"} />
                        <DisplayText
                          label="Employee No. / Name"
                          value={
                            staffData.custom_employeeid +
                            " - " +
                            staffData.employee_name
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : null}
            <div className="row no-gutters pt-2">
              <div className="subhead-row">
                <div className="subhead">Communication Detail </div>
                <div className="col line-div"></div>
              </div>
              <div className="row no-gutters pt-2">
                <div className="col-lg-9 pe-2">
                  {data?.student?.fatherEmail ? (
                    <DisplayText
                      label="Father Email ID"
                      value={data?.student?.fatherEmail}
                    />
                  ) : null}
                  <DisplayText
                    label="Father Mobile Number"
                    value={data?.student?.fatherMobile}
                  />
                  {data?.student?.fatherQualification ? (
                    <DisplayText
                      label="Father Qualification"
                      value={data?.student?.fatherQualification}
                    />
                  ) : null}
                  {data?.student?.fatherOccupation ? (
                    <DisplayText
                      label="Father Occupation"
                      value={data?.student?.fatherOccupation}
                    />
                  ) : null}
                  {data?.student?.fatherIncome ? (
                    <DisplayText
                      label="Father Income"
                      value={data?.student?.fatherIncome}
                    />
                  ) : null}
                  <DisplayText
                    label="Mother Name"
                    value={data?.student?.motherName}
                  />
                  {data?.student?.motherEmail ? (
                    <DisplayText
                      label="Mother Email ID"
                      value={data?.student?.motherEmail}
                    />
                  ) : null}
                  {data?.student?.motherMobile ? (
                    <DisplayText
                      label="Mother Mobile Number"
                      value={data?.student?.motherMobile}
                    />
                  ) : null}
                  {data?.student?.motherQualification ? (
                    <DisplayText
                      label="Mother Qualification"
                      value={data?.student?.motherQualification}
                    />
                  ) : null}
                  {data?.student?.motherOccupation ? (
                    <DisplayText
                      label="Mother Occupation"
                      value={data?.student?.motherOccupation}
                    />
                  ) : null}
                  {data?.student?.motherIncome ? (
                    <DisplayText
                      label="Mother Income"
                      value={data?.student?.motherIncome}
                    />
                  ) : null}
                  {data?.student?.guardianName ? (
                    <DisplayText
                      label="Guardian Name"
                      value={data?.student?.guardianName}
                    />
                  ) : null}
                  {data?.student?.guardianEmail ? (
                    <DisplayText
                      label="Guardian Email ID"
                      value={data?.student?.guardianEmail}
                    />
                  ) : null}
                  {data?.student?.guardianMobile ? (
                    <DisplayText
                      label="Guardian Mobile Number"
                      value={data?.student?.guardianMobile}
                    />
                  ) : null}
                  {data?.student?.guardianQualification ? (
                    <DisplayText
                      label="Guardian Qualification"
                      value={data?.student?.guardianQualification}
                    />
                  ) : null}
                  {data?.student?.guardianOccupation ? (
                    <DisplayText
                      label="Guardian Occupation"
                      value={data?.student?.guardianOccupation}
                    />
                  ) : null}
                  {data?.student?.guardianIncome ? (
                    <DisplayText
                      label="Guardian Income"
                      value={data?.student?.guardianIncome}
                    />
                  ) : null}
                </div>
              </div>
              <div className="subhead-row">
                <div className="subhead">Permanant Address Detail</div>
                <div className="col line-div"></div>
              </div>
              <div className="row no-gutters pt-2">
                <div className="col-lg-9 pe-2">
                  <DisplayText
                    label="Address Line 1"
                    value={data?.student?.address1}
                  />
                  {data?.student?.address2 ? (
                    <DisplayText
                      label="Address Line 2"
                      value={data?.student?.address2}
                    />
                  ) : null}
                  <DisplayText label="Place" value={data?.student?.place} />
                  <DisplayText label="State" value={data?.student?.state} />
                  <DisplayText
                    label="City/District"
                    value={data?.student?.city}
                  />
                  <DisplayText label="Pincode" value={data?.student?.pincode} />
                  <DisplayText label="Country" value={data?.student?.country} />
                </div>
              </div>
              <div className="subhead-row">
                <div className="subhead">Temporary Address Detail</div>
                <div className="col line-div"></div>
              </div>
              <div className="row no-gutters pt-2">
                <div className="col-lg-9 pe-2">
                  <DisplayText
                    label="Address Line 1"
                    value={data?.student?.taddress1}
                  />
                  {data?.student?.taddress2 ? (
                    <DisplayText
                      label="Address Line 2"
                      value={data?.student?.taddress2}
                    />
                  ) : null}
                  <DisplayText label="Place" value={data?.student?.tplace} />
                  <DisplayText label="State" value={data?.student?.tstate} />
                  <DisplayText
                    label="City/District"
                    value={data?.student?.tcity}
                  />
                  <DisplayText
                    label="Pincode"
                    value={data?.student?.tpincode}
                  />
                  <DisplayText
                    label="Country"
                    value={data?.student?.tcountry}
                  />
                </div>
              </div>
              {qualificationHistory ? (
                <>
                  <div className="subhead-row">
                    <div className="subhead">Previous Qualification Detail</div>
                    <div className="col line-div"></div>
                  </div>
                  <div className="row no-gutters pt-2">
                    <div className="col-lg-9 pe-2">
                      {qualificationHistory?.schoolCollegeName ? (
                        <DisplayText
                          label="Previous School Name"
                          value={qualificationHistory?.schoolCollegeName}
                        />
                      ) : null}
                      {qualificationHistory?.boardUniversity ? (
                        <DisplayText
                          label={"Previous " + RENAME?.course}
                          value={qualificationHistory?.boardUniversity}
                        />
                      ) : null}
                      {qualificationHistory?.tcNo ? (
                        <DisplayText
                          label="EMIS / UDISE Number"
                          value={qualificationHistory?.tcNo}
                        />
                      ) : null}
                      {qualificationHistory?.tcPath ? (
                        <DisplayText
                          label="Attach TC"
                          value={
                            <a
                              href=""
                              target="_blank"
                              onClick={(e) =>
                                window.open(
                                  string.FILEURL + qualificationHistory?.tcPath,
                                  "_blank"
                                )
                              }
                            >
                              View TC
                            </a>
                          }
                        />
                      ) : null}
                      {qualificationHistory?.academicNote ? (
                        <DisplayText
                          label="Academic Details"
                          value={qualificationHistory?.academicNote}
                        />
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewSchoolStudent;
