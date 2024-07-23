import React from "react";
import moment from "moment";
import { useSelector } from "react-redux";

import string from "../string";

import DisplayText from "./FormField/DisplayText";

import blankProfile from "../assests/png/blank-profile-picture.png";

function ViewCollegeStudent({ data }) {
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  return (
    <div className="row no-gutters px-3">
      <div className="subhead-row">
        <div className="subhead">Personal</div>
        <div className="col line-div"></div>
      </div>
      <div className="row no-gutters pt-2">
        <div className="col-lg-10 pe-2">
          <DisplayText label="Student Name" value={data?.student?.name} />
          <DisplayText
            label="Father Name"
            labelSize={5}
            value={data?.student?.fatherName}
          />
          <DisplayText
            label="Date of Birth"
            labelSize={5}
            value={moment(data?.student?.dob).format("DD-MM-YYYY")}
          />
          <DisplayText
            label="Gender"
            labelSize={5}
            value={data?.student?.gender}
          />
          <DisplayText
            label="Student Mobile No."
            labelSize={5}
            value={data?.student?.studentMobile}
          />
          <DisplayText
            label="Student Email ID"
            labelSize={5}
            value={data?.student?.email}
          />
          {data?.student?.bloodGroup && (
            <DisplayText
              label="Blood Group"
              labelSize={5}
              value={data?.student?.bloodGroup}
            />
          )}
          <DisplayText
            label="Aadhaar No."
            labelSize={5}
            value={data?.student?.aadhaar}
          />
          {data?.student?.pan && (
            <DisplayText label="PAN" labelSize={5} value={data?.student?.pan} />
          )}
          <DisplayText
            label="Nationality"
            labelSize={5}
            value={data?.student?.nationality}
          />
          <DisplayText
            label="Religion"
            labelSize={5}
            value={data?.student?.religion}
          />
          {data?.student?.community && (
            <DisplayText
              label="Community"
              labelSize={5}
              value={data?.student?.community}
            />
          )}
        </div>
        <div className="col-lg-2 ps-2 mt-2">
          <img
            src={
              data?.student?.photo
                ? string.FILEURL + data?.student?.photo
                : blankProfile
            }
            alt=""
            height="150"
            width="150"
            style={{ border: "0" }}
          />
        </div>
      </div>
      {data?.student?.applicationNo ||
      data?.student?.registrationNo ||
      data?.student?.counsellingReferenceNo ? (
        <>
          <div className="subhead-row">
            <div className="subhead">Application </div>
            <div className="col line-div"></div>
          </div>
          <div className="row no-gutters pt-2">
            <div className="col-lg-9 pe-2">
              {data?.student?.applicationNo && (
                <DisplayText
                  label="Application No."
                  labelSize={5}
                  value={data?.student?.applicationNo}
                />
              )}
              {data?.student?.registrationNo && (
                <DisplayText
                  label="Registration No."
                  labelSize={5}
                  value={data?.student?.registrationNo}
                />
              )}
              {data?.student?.counsellingReferenceNo && (
                <DisplayText
                  label="Counselling Ref. No."
                  labelSize={5}
                  value={data?.student?.counsellingReferenceNo}
                />
              )}
            </div>
          </div>
        </>
      ) : null}
      <div className="row no-gutters pt-2">
        <div className="subhead-row">
          <div className="subhead">Academic </div>
          <div className="col line-div"></div>
        </div>
        <div className="row no-gutters mt-1">
          <div className="col-lg-9 ">
            {collegeConfig.is_university && (
              <DisplayText
                label="College"
                labelSize={5}
                value={data?.student?.college}
                style={{ whiteSpace: "nowrap" }}
              />
            )}
            <DisplayText
              label={RENAME?.course}
              labelSize={5}
              value={data?.student?.courseName}
              style={{ whiteSpace: "nowrap" }}
            />
            <DisplayText
              label={RENAME?.batch}
              labelSize={5}
              value={data?.student?.batch}
            />
            <DisplayText
              label="Studying Year"
              labelSize={5}
              value={data?.student?.studyYear}
            />
            <DisplayText
              label={RENAME?.sem}
              labelSize={5}
              value={data?.student?.semester}
            />
            <DisplayText
              label={RENAME?.section}
              labelSize={5}
              value={data?.student?.section}
            />
            <DisplayText
              label="Medium"
              labelSize={5}
              value={data?.student?.medium}
            />
            <DisplayText
              label="Mode of Admission"
              labelSize={5}
              value={data?.student?.admissionMode}
            />
            <DisplayText
              label="Admission Type"
              labelSize={5}
              value={data?.student?.admissionType}
            />
            {data?.student?.scholarshipScheme && (
              <DisplayText
                label="Scholarship Scheme"
                labelSize={5}
                value={data?.student?.scholarshipScheme}
              />
            )}
            <DisplayText
              label="First Graduate"
              labelSize={5}
              value={data?.student?.isFirstGraduate ? "Yes" : "No"}
            />
          </div>
        </div>
        <div className="subhead-row">
          <div className="subhead">Communication </div>
          <div className="col line-div"></div>
        </div>
        <div className="row no-gutters pt-2">
          <div className="col-lg-9 pe-2">
            {data?.student?.fatherEmail && (
              <DisplayText
                label="Father Email ID"
                labelSize={5}
                value={data?.student?.fatherEmail}
              />
            )}
            <DisplayText
              label="Father Mobile No."
              labelSize={5}
              value={data?.student?.fatherMobile}
            />
            <DisplayText
              label="Mother Name"
              labelSize={5}
              value={data?.student?.motherName}
            />
            {data?.student?.motherEmail && (
              <DisplayText
                label="Mother Email ID"
                labelSize={5}
                value={data?.student?.motherEmail}
              />
            )}
            {data?.student?.motherMobile && (
              <DisplayText
                label="Mother Mobile No."
                labelSize={5}
                value={data?.student?.motherMobile}
              />
            )}
            {data?.student?.guardianName && (
              <DisplayText
                label="Guardian Name"
                labelSize={5}
                value={data?.student?.guardianName}
              />
            )}
            {data?.student?.guardianEmail && (
              <DisplayText
                label="Guardian Email ID"
                labelSize={5}
                value={data?.student?.guardianEmail}
              />
            )}
            {data?.student?.guardianMobile && (
              <DisplayText
                label="Guardian Mobile No."
                labelSize={5}
                value={data?.student?.guardianMobile}
              />
            )}
          </div>
        </div>
        <div className="subhead-row">
          <div className="subhead">Permanant Address </div>
          <div className="col line-div"></div>
        </div>
        <div className="row no-gutters pt-2">
          <div className="col-lg-9 pe-2">
            <DisplayText
              label="Address Line 1"
              labelSize={5}
              value={data?.student?.address1}
            />
            {data?.student?.address2 && (
              <DisplayText
                label="Address Line 2"
                labelSize={5}
                value={data?.student?.address2}
              />
            )}
            <DisplayText label="Place" value={data?.student?.place} />
            <DisplayText
              label="City/District"
              labelSize={5}
              value={data?.student?.city}
            />
            <DisplayText
              label="State"
              labelSize={5}
              value={data?.student?.state}
            />
            <DisplayText
              label="Country"
              labelSize={5}
              value={data?.student?.country}
            />
            <DisplayText
              label="Pincode"
              labelSize={5}
              value={data?.student?.pincode}
            />
          </div>
        </div>
        <div className="subhead-row">
          <div className="subhead">Temporary Address </div>
          <div className="col line-div"></div>
        </div>
        <div className="row no-gutters pt-2">
          <div className="col-lg-9 pe-2">
            <DisplayText
              label="Address Line 1"
              labelSize={5}
              value={data?.student?.taddress1}
            />
            {data?.student?.taddress2 && (
              <DisplayText
                label="Address Line 2"
                labelSize={5}
                value={data?.student?.taddress2}
              />
            )}
            <DisplayText
              label="Place"
              labelSize={5}
              value={data?.student?.tplace}
            />
            <DisplayText
              label="City/District"
              labelSize={5}
              value={data?.student?.tcity}
            />
            <DisplayText
              label="State"
              labelSize={5}
              value={data?.student?.tstate}
            />
            <DisplayText
              label="Country"
              labelSize={5}
              value={data?.student?.tcountry}
            />
            <DisplayText
              label="Pincode"
              labelSize={5}
              value={data?.student?.tpincode}
            />
          </div>
        </div>

        {data?.qualifiedExam?.length > 0 && (
          <>
            <div className="subhead-row">
              <div className="subhead">Qualification </div>
              <div className="col line-div"></div>
            </div>

            <div className="row no-gutters mt-3">
              <div className="table-responsive  p-0">
                <table className="table table-bordered ">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Qualified Exam</th>
                      <th>School/College Name</th>
                      <th>Board/University</th>
                      <th>Year/Sem/Subject</th>
                      <th>Max Mark</th>
                      <th>Mark Obtained</th>
                      <th>Mark(%)</th>
                      <th>Month/Year of Passing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.qualifiedExam?.map((item, index) => {
                      return (
                        <tr>
                          <td>{index + 1}</td>
                          <td>{item.qualifiedExam}</td>
                          <td>{item.schoolCollegeName}</td>
                          <td>{item.boardUniversity}</td>
                          <td>{item.yearSemSubject}</td>
                          <td>{item.maximumMark}</td>
                          <td>{item.markObtained}</td>
                          <td>{item.markPercentage}</td>
                          <td>{item.monthYear}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ViewCollegeStudent;
