import React, { useContext } from "react";
import moment from "moment";
import { useSelector } from "react-redux";

import RupeeInWords from "./common/RupeeInWords";

import AuthContext from "../auth/context";

import string from "../string";

function PDFDetail({
  startNo = 0,
  feesCollectionDetail,
  feesCollection,
  secondCopy = false,
  finalPage = false,
  totalDueAmount = null,
  MISCBill = false,
  AOText = "Administrative Officer",
  hideAdmin = false,
}) {
  console.log("finalPage----", finalPage);
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  const { instituteArray } = useContext(AuthContext);

  console.log("feesCollection", feesCollection);
  console.log("feesCollectionDetail", feesCollectionDetail);
  console.log("collegeConfig", collegeConfig);

  return (
    <>
      {string.PRE_PRINT ? (
        <div className="row no-gutters p-3">
          <div className="row no-gutters p-4">
            <table className="table" style={{ marginBottom: "0px" }}>
              <tr>
                <td>
                  <div className="mt-1">&nbsp;</div>
                  <div className="mt-4"></div>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellPadding={1} cellSpacing={0} className="table">
                    <tr>
                      <td width="150px">&nbsp;</td>
                      <td colSpan={3}>
                        <div>
                          {instituteArray
                            .find(
                              (obj) =>
                                obj.collegeID == feesCollection?.collegeID
                            )
                            ?.name.toUpperCase()}
                        </div>
                      </td>
                      <td width={"50px"}></td>
                      <td className="nowrapWhiteSpace">
                        <div>
                          {moment(feesCollection?.billDate).format(
                            "DD-MM-YYYY"
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>
                        <div>{feesCollection?.name}</div>
                        <div>{feesCollection?.id}</div>
                      </td>
                      <td width={"320px"}></td>
                      <td className="nowrapWhiteSpace">
                        <div>{feesCollection?.enrollNo}</div>
                        <div>{feesCollection?.course}</div>
                      </td>
                      <td width={"100px"}></td>
                      <td>
                        <div>{feesCollection?.paymentMode}</div>
                        <div>{feesCollection?.studyYear}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td>
                  <table className="">
                    <thead>
                      <tr>
                        <td colSpan={3} height="30px" width="1%"></td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={3}
                          style={{ verticalAlign: "top", height: "150px" }}
                        >
                          <table width={"100%"}>
                            {feesCollectionDetail?.map((item, index) => {
                              return (
                                <tr key={index}>
                                  <td width={"5%"}>
                                    <div>{index + 1}</div>
                                  </td>
                                  <td>
                                    <div>{item.particular}</div>
                                  </td>
                                  <td width="7%" align="right">
                                    <div>{item.amount}</div>
                                  </td>
                                </tr>
                              );
                            })}
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td align="right"></td>
                        <td align="right" className="top-border">
                          {feesCollection?.totalAmount}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-2"></div>
                  <div>
                    <span style={{ paddingRight: "120px" }}></span>{" "}
                    <RupeeInWords number={feesCollection?.totalAmount} />
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="row no-gutters"
          style={{
            border: "1px solid #000",
          }}
        >
          <table>
            <tr>
              <td>
                <div className="row no-gutters">
                  <div className="col-1"></div>
                  <div className="col-10">
                    <div className="row no-gutters">
                      <div className="col-2 pt-3 text-center">
                        <img
                          src={
                            instituteArray.find(
                              (obj) =>
                                obj.collegeID == feesCollection?.collegeID
                            )?.logo ?? require("../assests/png/pdf_logo.png")
                          }
                          className="print-logo"
                        />
                      </div>
                      <div className="col-8 text-center">
                        <div className="college-name">
                          {instituteArray &&
                            instituteArray
                              .find(
                                (obj) =>
                                  obj.collegeID == feesCollection?.collegeID
                              )
                              ?.name.toUpperCase()}
                        </div>
                        {instituteArray.find(
                          (obj) => obj.collegeID == feesCollection?.collegeID
                        )?.second_line != "" && (
                          <div className="second-line">
                            {
                              instituteArray.find(
                                (obj) =>
                                  obj.collegeID == feesCollection?.collegeID
                              )?.second_line
                            }
                          </div>
                        )}
                        {instituteArray.find(
                          (obj) => obj.collegeID == feesCollection?.collegeID
                        )?.third_line != "" && (
                          <div className="third-line">
                            {
                              instituteArray.find(
                                (obj) =>
                                  obj.collegeID == feesCollection?.collegeID
                              )?.third_line
                            }
                          </div>
                        )}
                        {instituteArray.find(
                          (obj) => obj.collegeID == feesCollection?.collegeID
                        )?.fourth_line != "" && (
                          <div className="address-line">
                            {
                              instituteArray.find(
                                (obj) =>
                                  obj.collegeID == feesCollection?.collegeID
                              )?.fourth_line
                            }
                          </div>
                        )}
                        {instituteArray.find(
                          (obj) => obj.collegeID == feesCollection?.collegeID
                        )?.fifth_line != "" && (
                          <div className="address-line">
                            {
                              instituteArray.find(
                                (obj) =>
                                  obj.collegeID == feesCollection?.collegeID
                              )?.fifth_line
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="receipt-copy">
                  <div className="line" style={{ marginTop: "-1px" }}></div>
                  <div className="line" style={{ marginTop: "2px" }}></div>
                  <div className="receipt-text">RECEIPT</div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="px-4 pb-1">
                <table width={"100%"} cellPadding={1} cellSpacing={0}>
                  <tr>
                    <td width={"9%"} className="label-bold">
                      {MISCBill ? "Name" : "Student No."}
                    </td>
                    <td>
                      <div>
                        {MISCBill
                          ? " : " + feesCollection?.name
                          : " : " + feesCollection?.enrollNo}
                      </div>
                    </td>
                    <td width={"9%"} className="label-bold">
                      Bill No.
                    </td>
                    <td className="nowrapWhiteSpace">: {feesCollection?.id}</td>
                  </tr>
                  <tr>
                    <td className="label-bold">
                      {MISCBill ? "" : "Student Name"}
                    </td>
                    <td className="nowrapWhiteSpace">
                      {MISCBill ? "" : " : " + feesCollection?.name}
                    </td>
                    <td width={"5%"} className="label-bold">
                      Date
                    </td>
                    <td width={"10%"} className="nowrapWhiteSpace">
                      : {moment(feesCollection?.billDate).format("DD-MM-YYYY")}
                    </td>
                  </tr>
                  {!MISCBill && (
                    <tr>
                      <td className="label-bold">{RENAME?.course}</td>
                      <td className="nowrapWhiteSpace">
                        {" : " + feesCollection?.courseName}
                      </td>
                      <td className="label-bold">{"Father Name"}</td>
                      <td className="nowrapWhiteSpace">
                        : {feesCollection?.fatherName}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="label-bold">
                      {MISCBill ? "" : RENAME?.sem}
                    </td>
                    <td className="nowrapWhiteSpace">
                      {MISCBill ? "" : ": " + feesCollection?.className}
                    </td>
                    <td className="label-bold">Mode</td>
                    <td className="nowrapWhiteSpace">
                      : {feesCollection?.paymentMode}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td>
                <table className="with-design-print-table">
                  <thead>
                    <tr>
                      <th
                        width="5%"
                        style={{
                          borderRight: "1px solid #000",
                        }}
                      >
                        No.
                      </th>
                      <th
                        style={{
                          borderRight: "1px solid #000",
                        }}
                      >
                        Particulars
                      </th>
                      <th width="5%">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        height={"150px"}
                        style={{
                          borderRight: "1px solid #000",
                          textAlign: "center",
                        }}
                      >
                        {feesCollectionDetail?.map((item, index) => {
                          return <div>{startNo + index + 1}</div>;
                        })}
                      </td>
                      <td
                        style={{
                          borderRight: "1px solid #000",
                        }}
                      >
                        {feesCollectionDetail?.map((item, index) => {
                          return <div>{item.particular}</div>;
                        })}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {feesCollectionDetail?.map((item, index) => {
                          return <div>{item.amount}</div>;
                        })}
                      </td>
                    </tr>
                    {finalPage ? (
                      <tr
                        style={{
                          borderTop: "1px solid #000",
                          borderBottom: "1px solid #000",
                        }}
                      >
                        <td
                          colSpan={2}
                          align="right"
                          className="label-bold"
                          style={{
                            borderRight: "1px solid #000",
                          }}
                        >
                          <span style={{ float: "left" }}>
                            <b>Rupees in words :</b>
                            <RupeeInWords
                              number={feesCollection?.totalAmount}
                            />
                          </span>
                          <span style={{ float: "right" }}>Total</span>
                        </td>
                        <td align="right" className="top-border">
                          {feesCollection?.totalAmount}
                        </td>
                      </tr>
                    ) : (
                      <tr
                        style={{
                          borderTop: "1px solid #000",
                          borderBottom: "1px solid #000",
                        }}
                      >
                        <td
                          colSpan={3}
                          style={{
                            borderTop: "1px solid #000",
                            textAlign: "right",
                          }}
                        >
                          To be continued...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                {totalDueAmount ? (
                  <div className="label-bold text-center">
                    Due Amount (₹) : {totalDueAmount}
                  </div>
                ) : null}
                <div
                  className={`row no-gutters label-bold mt-4 mb-1 ${
                    !totalDueAmount ? "pt-4" : ""
                  }`}
                >
                  <div className="col-6 text-center">
                    Cashier ({feesCollection.cashierName})
                  </div>
                  {hideAdmin ? null : (
                    <div
                      className="col-6 text-center"
                      id="cadministrativeOfficer"
                    >
                      {AOText}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </table>
        </div>
      )}
    </>
  );
}

export default PDFDetail;
