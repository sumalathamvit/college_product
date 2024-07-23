import React, { useContext } from "react";
import { useSelector } from "react-redux";
import AuthContext from "../auth/context";
import blankProfile from "../../src/assests/png/blank-profile-picture.png";
import string from "../string";

function BusPassPDFDetail({ collegeName, studentData, year, address }) {
  console.log("BusPassPDFDetail", studentData);
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);
  const { instituteArray } = useContext(AuthContext);

  return (
    <>
      <div className="row p-0" style={{ backgroundColor: "#fff" }}>
        <div className="col-6 p-2 border border-2 border-dark mt-1">
          <div className="bus-pass-pdf-card">
            <div className="text-center my-1">
              <div
                style={{
                  color: "#30583e",
                  fontSize: "14px",
                }}
              >
                <div
                  style={{
                    zIndex: 1,
                    position: "absolute",
                    paddingLeft: 9,
                  }}
                  className="mt-1"
                >
                  <img
                    src={
                      instituteArray &&
                      instituteArray.find((obj) => obj.name === collegeName)
                        ?.logo
                    }
                    width={35}
                    height={35}
                  />
                </div>
                {instituteArray &&
                  instituteArray.find((obj) => obj.name === collegeName)?.name}
              </div>
              <div className="text-center" style={{ fontSize: "12px" }}>
                {address?.firstPart}
              </div>
              <div className="text-center" style={{ fontSize: "12px" }}>
                {address?.secondPart}
              </div>
            </div>
            <div className="border-top border-1 border-danger"></div>

            <div
              className="fw-bolder text-danger text-center mt-1"
              style={{ fontSize: "13px" }}
            >
              STUDENT BUS PASS
            </div>
            <div className="row mt-1">
              <table width={"100%"}>
                <tr>
                  <td
                    width={"85%"}
                    style={{ fontSize: "13px" }}
                    className="ps-2"
                  >
                    <tr>
                      <td>Pass No.</td>
                      <td>{" : " + " " + studentData?.passNo}</td>
                    </tr>
                    <tr>
                      <td>Name</td>
                      <td>{" : " + " " + studentData?.name?.substr(0, 25)}</td>
                    </tr>
                    <tr>
                      <td>Student No.</td>
                      <td>{" : " + " " + studentData?.enrollNo}</td>
                    </tr>
                    <tr>
                      <td>{RENAME.course + " / " + RENAME.year}</td>
                      <td>
                        {" : " +
                          " " +
                          studentData?.department?.substr(0, 25) +
                          " / " +
                          studentData?.studyYear}
                      </td>
                    </tr>
                    <tr>
                      <td>Boarding Place</td>
                      <td>
                        {" : " +
                          " " +
                          studentData?.boardingPlace?.substr(0, 25)}
                      </td>
                    </tr>
                    <tr>
                      <td>Amount</td>
                      <td>{" : " + " " + studentData?.amount}</td>
                    </tr>
                  </td>
                  <td width={"15%"} valign="top" className="text-right pe-2">
                    <img
                      src={
                        studentData?.photo
                          ? string.FILEURL + studentData?.photo
                          : blankProfile
                      }
                      alt=""
                      height="60"
                      width="60"
                    />
                  </td>
                </tr>
              </table>
              <div
                style={{
                  fontSize: "13px",
                }}
              >
                <div className="col-12 text-right pe-1 text-danger fw-bolder">
                  PRINCIPAL
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 p-2 border border-2 border-dark mt-1">
          <div className="bus-pass-pdf-card">
            <div className="row mt-2 mb-2">
              <div
                style={{
                  fontSize: "13px",
                }}
              >
                <div className="mt-2 fw-bolder text-primary">Address :</div>
                <div className="mt-2 text-primary">
                  {studentData?.name?.substr(0, 50)}
                  <br />
                  {studentData?.address1?.substr(0, 50)}
                  {studentData?.address2 ? <br /> : null}
                  {studentData?.address2?.substr(0, 50)}
                  <br />
                  {studentData?.place?.substr(0, 50)}
                  {" , "}
                  {studentData?.city?.substr(0, 50)}
                  <br />
                  {studentData?.state?.substr(0, 50)}
                  <br />
                  {studentData?.pincode}
                  <br />
                  {studentData?.address2 ? null : <br />}
                </div>
                <div
                  className="mt-3 text-danger fw-bolder text-center bg-warning"
                  style={{ fontSize: "13px" }}
                >
                  Validity : Upto - May {year}
                </div>
                <div
                  className="bonafide-completion-bold ms-2 text-success"
                  style={{ marginTop: "10%", fontSize: "11px" }}
                >
                  {collegeConfig.fifth_line?.substr(0, 50)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BusPassPDFDetail;
