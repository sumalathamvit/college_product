import React, { useContext } from "react";
import moment from "moment";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";

function CourseCompletionPDFDetail({ student, secondCopy = false }) {
  const { instituteArray } = useContext(AuthContext);

  console.log("student", student);

  return (
    <>
      <div className="row no-gutters">
        <div
          className="row no-gutters"
          style={{
            border: "2px solid #6c6599",
            borderRadius: "10px",
          }}
        >
          <div className="row no-gutters py-1">
            <div className="col-1"></div>
            <div className="col-10 row no-gutters">
              <div className="col-2 pt-3 text-center">
                <img
                  src={
                    instituteArray.find(
                      (obj) => obj.collegeID == student?.collegeID
                    )?.logo ?? require("../assests/png/pdf_logo.png")
                  }
                  className="print-logo"
                />
              </div>
              <div className="col-8 text-center">
                <div className="college-name">
                  {instituteArray
                    .find((obj) => obj.collegeID == student?.collegeID)
                    ?.name.toUpperCase()}
                </div>
                {/* <div className="address-line">
                  (Approved by AICTE, New Delhi, Affiliated to Anna University -
                  Chennai)
                </div>
                <div className="address-line">
                  E-mail: mec@mailamengg.com Website: www.mailamengg.com
                </div>
                <div className="address-line">
                  Phone: 04147-241551, 241515 Fx: 04147 - 241552
                </div>
                <div className="course-completion-label-bold ">
                  A Tcs Accredited College
                </div> */}
                {instituteArray.find(
                  (obj) => obj.collegeID == student?.collegeID
                )?.second_line != "" && (
                  <div className="second-line">
                    {
                      instituteArray.find(
                        (obj) => obj.collegeID == student?.collegeID
                      )?.second_line
                    }
                  </div>
                )}
                {instituteArray.find(
                  (obj) => obj.collegeID == student?.collegeID
                )?.third_line != "" && (
                  <div className="third-line">
                    {
                      instituteArray.find(
                        (obj) => obj.collegeID == student?.collegeID
                      )?.third_line
                    }
                  </div>
                )}
                {instituteArray.find(
                  (obj) => obj.collegeID == student?.collegeID
                )?.fourth_line != "" && (
                  <div className="address-line">
                    {
                      instituteArray.find(
                        (obj) => obj.collegeID == student?.collegeID
                      )?.fourth_line
                    }
                  </div>
                )}
                {instituteArray.find(
                  (obj) => obj.collegeID == student?.collegeID
                )?.fifth_line != "" && (
                  <div className="address-line">
                    {
                      instituteArray.find(
                        (obj) => obj.collegeID == student?.collegeID
                      )?.fifth_line
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
          <table className="table" style={{ marginBottom: "0px" }}>
            <tr>
              <td>
                <div className="receipt-copy text-center">
                  <div className={"course-completion-receipt-text"}>
                    COURSE COMPLETION CERTIFICATE
                  </div>
                </div>
              </td>
            </tr>
            <div className="course-completion-content mt-4 pt-2">
              This is to certify that Mr./Ms.
              <span className="course-completion-print m-0 ps-2">
                {student?.name?.toUpperCase()} (En. Roll No. {student?.enrollNo}
                )
              </span>{" "}
              is a bonafide student of this college and he/she has completed the
              course as prescribed by the{" "}
              <span className="course-completion-label-bold ">Anna</span>{" "}
              <span className="course-completion-label-bold ">University,</span>{" "}
              <span className="course-completion-label-bold ">Chennai</span> for
              the award of B.E./B.Tech./M.E./M.B.A./M.C.A. Degree in
            </div>
            <div className="course-completion-print">
              {student?.courseName.split("-")[1]?.toUpperCase()}
            </div>
            <div className="course-completion-content">
              {
                "He/She has appeared for the final semester examination held during"
              }
              <span className="course-completion-print m-0 ps-2">
                {moment(student?.applicationDate)
                  .format("MMMM YYYY")
                  .toUpperCase()}
              </span>{" "}
              {"and the results are likely to be published in"}
              <span className="course-completion-print m-0 ps-1 ">
                {moment(student?.applicationDate)
                  .format("MMMM YYYY")
                  .toUpperCase()}
              </span>
            </div>
          </table>
          <div className="row no-gutters mt-5 mb-3">
            <div className="col-3 text-center">
              <text className="address-line">Date:</text>
              <text className="ps-3" style={{ color: "#000" }}>
                {moment().format("DD/MM/YYYY")}
              </text>
            </div>
            <div className="col-6 text-center address-line">Seal</div>
            <div className="col-3 text-center label-bold">PRINCIPAL</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseCompletionPDFDetail;
