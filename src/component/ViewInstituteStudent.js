import React from "react";
import moment from "moment";
import string from "../string";
import DisplayText from "./FormField/DisplayText";

import blankProfile from "../assests/png/blank-profile-picture.png";

function ViewInstituteStudent({ data }) {
  return (
    <div className="row no-gutters px-3">
      <div className="subhead-row">
        <div className="subhead">Personal Detail</div>
        <div className="col line-div"></div>
      </div>
      <div className="row no-gutters pt-2">
        <div className="col-lg-9 pe-2">
          <DisplayText
            label="Student Mobile No."
            value={data?.student?.studentMobile}
          />
          <DisplayText label="Student Name" value={data?.student?.name} />
          <DisplayText label="Father Name" value={data?.student?.fatherName} />
          <DisplayText
            label="Date of Birth"
            value={moment(data?.student?.dob).format("DD-MM-YYYY")}
          />
          <DisplayText label="Gender" value={data?.student?.gender} />
          <DisplayText label="Student Email ID" value={data?.student?.email} />
          {data?.student?.bloodGroup ? (
            <DisplayText
              label="Blood Group"
              value={data?.student?.bloodGroup}
            />
          ) : null}
          <DisplayText label="Aadhaar Number" value={data?.student?.aadhaar} />
          <DisplayText label="Nationality" value={data?.student?.nationality} />
          <DisplayText label="Religion" value={data?.student?.religion} />
          {data?.student?.motherTongue ? (
            <DisplayText
              label="Mother Tongue"
              value={data?.student?.motherTongue}
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
            height="200"
            width="200"
            style={{ border: "0" }}
          />
        </div>
      </div>

      <div className="row no-gutters pt-2">
        <div className="subhead-row">
          <div className="subhead">Communication </div>
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
          <div className="subhead">Permanant Address </div>
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
            <DisplayText label="City/District" value={data?.student?.city} />
            <DisplayText label="Pincode" value={data?.student?.pincode} />
            <DisplayText label="Country" value={data?.student?.country} />
          </div>
        </div>

        {data?.student_qualification?.length > 0 ? (
          <>
            <div className="subhead-row">
              <div className="subhead">Graduation</div>
              <div className="col line-div"></div>
            </div>
            <div className="row no-gutters pt-2">
              <div className="col-lg-9 pe-2">
                <DisplayText
                  label="Applicant Status"
                  value={data.student_qualification[0]?.employmentStatus}
                />
                <DisplayText
                  label="Qualification"
                  value={data.student_qualification[0]?.qualification}
                />
                <DisplayText
                  label="Subject"
                  value={data.student_qualification[0]?.qualificationSubject}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default ViewInstituteStudent;
