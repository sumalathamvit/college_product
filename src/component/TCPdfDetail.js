import React, { useContext } from "react";
import moment from "moment";
import { useSelector } from "react-redux";

import AuthContext from "../auth/context";

import preFunction from "./common/CommonFunction";
import RupeeInWords from "./common/RupeeInWords";

function TCPdfDetail({ viewTCdetails }) {
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeName, instituteArray } = useContext(AuthContext);
  const RENAME = useSelector((state) => state.web.rename);

  console.log("viewTCdetails", viewTCdetails);

  return (
    <>
      <div className="row no-gutters p-2">
        <div
          className="row no-gutters"
          style={{
            border: "1px solid #000",
          }}
        >
          <div className="row no-gutters p-3">
            <div className="col-2"></div>
            <div className="col-8 row no-gutters">
              <div className="col-2 pt-3 text-center">
                <img
                  src={
                    instituteArray.find(
                      (obj) =>
                        obj.collegeID ==
                        viewTCdetails?.data?.message?.data
                          .transfer_certificate[0]?.collegeID
                    )?.logo ?? require("../assests/png/pdf_logo.png")
                  }
                  className="print-logo"
                />
              </div>
              <div className="col-8">
                <div className="college-name">
                  {instituteArray
                    .find(
                      (obj) =>
                        obj.collegeID ==
                        viewTCdetails?.data?.message?.data
                          .transfer_certificate[0]?.collegeID
                    )
                    ?.name.toUpperCase()}
                </div>
                {instituteArray.find(
                  (obj) =>
                    obj.collegeID ==
                    viewTCdetails?.data?.message?.data.transfer_certificate[0]
                      ?.collegeID
                )?.second_line != "" && (
                  <div className="second-line">
                    {
                      instituteArray.find(
                        (obj) =>
                          obj.collegeID ==
                          viewTCdetails?.data?.message?.data
                            .transfer_certificate[0]?.collegeID
                      )?.second_line
                    }
                  </div>
                )}
                {instituteArray.find(
                  (obj) =>
                    obj.collegeID ==
                    viewTCdetails?.data?.message?.data.transfer_certificate[0]
                      ?.collegeID
                )?.third_line != "" && (
                  <div className="third-line">
                    {
                      instituteArray.find(
                        (obj) =>
                          obj.collegeID ==
                          viewTCdetails?.data?.message?.data
                            .transfer_certificate[0]?.collegeID
                      )?.third_line
                    }
                  </div>
                )}
                {instituteArray.find(
                  (obj) =>
                    obj.collegeID ==
                    viewTCdetails?.data?.message?.data.transfer_certificate[0]
                      ?.collegeID
                )?.fourth_line != "" && (
                  <div className="address-line">
                    {
                      instituteArray.find(
                        (obj) =>
                          obj.collegeID ==
                          viewTCdetails?.data?.message?.data
                            .transfer_certificate[0]?.collegeID
                      )?.fourth_line
                    }
                  </div>
                )}
                {instituteArray.find(
                  (obj) =>
                    obj.collegeID ==
                    viewTCdetails?.data?.message?.data.transfer_certificate[0]
                      ?.collegeID
                )?.fifth_line != "" && (
                  <div className="address-line">
                    {
                      instituteArray.find(
                        (obj) =>
                          obj.collegeID ==
                          viewTCdetails?.data?.message?.data
                            .transfer_certificate[0]?.collegeID
                      )?.fifth_line
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="row no-gutters mt-3 mb-3">
              <div className="col-4 ps-3">
                <text className="text-bold">Student No. :</text>
                <text className="ps-3 text-bold">
                  {
                    viewTCdetails?.data?.message?.data.transfer_certificate[0]
                      ?.enrollNo
                  }
                </text>
              </div>
              <div className="col-3"></div>
              <div className="col-3 text-right">
                <text className="text-bold">T.C. No. :</text>
                <text className="ps-3 text-bold">
                  {
                    viewTCdetails?.data?.message?.data?.transfer_certificate[0]
                      .TCNO
                  }
                </text>
              </div>
            </div>
            <div className="receipt-copy text-center mb-3">
              <div
                className="tc-text text-bold p-2"
                style={{
                  boxShadow: "none",
                  borderTop: "7px solid #000",
                  borderRight: "7px solid #000",
                }}
              >
                TRANSFER CERTIFICATE
              </div>
            </div>
          </div>
          <div className="row no-gutters px-5 mt-5 pt-2">
            <table width={"100%"} className="tc-table">
              <tr>
                <td width={"4%"} align="right" className="pe-3">
                  1.
                </td>
                <td width={"45%"}>Name of the Student</td>
                <td width={"5%"}>:</td>
                <td>
                  <b>
                    {viewTCdetails?.data?.message?.data.transfer_certificate[0]?.name?.toUpperCase()}
                  </b>
                </td>
              </tr>
              <tr>
                <td align="right" className="pe-3">
                  2.
                </td>
                <td>Name of the Parent / Guardian</td>
                <td>:</td>
                <td>
                  <b>
                    {viewTCdetails?.data?.message?.data.transfer_certificate[0]?.fatherName?.toUpperCase()}
                  </b>
                </td>
              </tr>
              <tr>
                <td align="right" className="pe-3">
                  3.
                </td>
                <td>Nationality, Religion</td>
                <td>:</td>
                <td>
                  <b>
                    {viewTCdetails?.data?.message?.data.transfer_certificate[0]?.nationality?.toUpperCase() +
                      ", " +
                      viewTCdetails?.data?.message?.data.transfer_certificate[0].religion?.toUpperCase()}
                  </b>
                </td>
              </tr>
              <tr>
                <td align="right" className="pe-3">
                  4.
                </td>
                <td>Date of Birth(In words)</td>
                <td>:</td>
                <td>
                  <b>
                    {moment(
                      viewTCdetails?.data?.message?.data.transfer_certificate[0]
                        ?.DOB
                    ).format("DD/MM/YYYY")}{" "}
                    {" ("}
                    {preFunction.numberToWordsWithOrdinal(
                      moment(
                        viewTCdetails?.data?.message?.data
                          .transfer_certificate[0]?.DOB
                      ).format("DD")
                    )}
                    {"  "}
                    {moment(
                      viewTCdetails?.data?.message?.data.transfer_certificate[0]
                        ?.DOB
                    )
                      .format("MMMM")
                      .toUpperCase() + " - "}{" "}
                    <RupeeInWords
                      number={moment(
                        viewTCdetails?.data?.message?.data
                          .transfer_certificate[0]?.DOB
                      ).format("YYYY")}
                      needOnly={true}
                    />
                    {")"}
                  </b>
                </td>
              </tr>
              <tr>
                <td align="right" className="pe-3">
                  5.
                </td>
                <td>
                  {RENAME?.sem} in which the Student was studying at the time of
                  leaving
                </td>
                <td>:</td>
                {collegeConfig.institution_type === 1 ? (
                  <td>
                    <b>
                      {viewTCdetails?.data?.message?.data.transfer_certificate[0]?.className?.toUpperCase()}
                    </b>
                  </td>
                ) : (
                  <td>
                    <b>
                      {viewTCdetails?.data?.message?.data.transfer_certificate[0]?.courseName?.toUpperCase()}
                    </b>
                  </td>
                )}
              </tr>
              <tr>
                <td align="right" className="pe-3">
                  6.
                </td>
                <td>Date of Admission</td>
                <td>:</td>
                <td>
                  <b>
                    {moment(
                      viewTCdetails?.data?.message?.data.transfer_certificate[0]
                        ?.applicationDate
                    ).format("DD/MM/YYYY")}
                  </b>
                </td>
              </tr>
              <tr>
                <td align="right" className="pe-3">
                  7.
                </td>
                <td>
                  Whether He/She is qualified for promotion to the next higher
                  class
                </td>
                <td>:</td>
                <td>
                  <b>REFER TO MARK SHEETS</b>
                </td>
              </tr>
              <tr>
                <td align="right" className="pe-3">
                  8.
                </td>
                <td>Reason for leaving the Institution</td>
                <td>:</td>
                <td>
                  <b>
                    {viewTCdetails?.data?.message?.data.transfer_certificate[0]
                      ?.leavingReason
                      ? viewTCdetails?.data?.message?.data.transfer_certificate[0]?.leavingReason?.toUpperCase()
                      : ""}
                  </b>
                </td>
              </tr>
              <tr>
                <td align="right" className="pe-3">
                  9.
                </td>
                <td>Date on which the student actually left the Institution</td>
                <td>:</td>
                <td>
                  <b>
                    {viewTCdetails?.data?.message?.data.transfer_certificate[0]
                      ?.dateofLeaving
                      ? moment(
                          viewTCdetails?.data?.message?.data
                            .transfer_certificate[0]?.dateofLeaving
                        ).format("DD/MM/YYYY")
                      : ""}
                  </b>
                </td>
              </tr>
              <tr>
                <td align="right" className="pe-3">
                  10.
                </td>
                <td>Date of issue Transfer Certificate</td>
                <td>:</td>
                <td>
                  <b>
                    {viewTCdetails?.data?.message?.data.transfer_certificate[0]
                      ?.issueDate
                      ? moment(
                          viewTCdetails?.data?.message?.data
                            .transfer_certificate[0]?.issueDate
                        ).format("DD/MM/YYYY")
                      : ""}
                  </b>
                </td>
              </tr>
              <tr>
                <td align="right" className="pe-3">
                  11.
                </td>
                <td>Conduct and Character</td>
                <td>:</td>
                <td>
                  <b>GOOD</b>
                </td>
              </tr>
            </table>
          </div>
          <div className="row no-gutters text-bold mt-5 mb-5">
            <div className="col-1"></div>
            <div className="col-3">
              <text className="text-bold">Date :</text>
              <text className="text-bold ps-3">
                {viewTCdetails?.data?.message?.data.transfer_certificate[0]
                  ?.issueDate
                  ? moment(
                      viewTCdetails?.data?.message?.data.transfer_certificate[0]
                        ?.issueDate
                    ).format("DD/MM/YYYY")
                  : ""}
              </text>
            </div>
            <div className="col-5"></div>
            <div className="col-3 text-bold ps-3">PRINCIPAL</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TCPdfDetail;
