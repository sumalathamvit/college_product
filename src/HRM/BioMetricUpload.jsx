import React, { useState, useEffect, useContext, useRef } from "react";
import { toast } from "react-toastify";
import CSVReader from "react-csv-reader";
import moment from "moment";
import HeadingIcon from "@mui/icons-material/Fingerprint";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ErrorMessage from "../component/common/ErrorMessage";

import employeeApi from "../api/EmployeeApi";
import attendanceApi from "../api/attendanceapi";

import string from "../string";
import Button from "../component/FormField/Button";
import { useNavigate } from "react-router-dom";
import ModalComponent from "../component/ModalComponent";
import AuthContext from "../auth/context";
import ScreenTitle from "../component/common/ScreenTitle";

function BioMetricUpload() {
  const fileInputRef = useRef();
  const [load, setLoad] = useState(false);
  const [csvImportErroroad, setCsvImportError] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvDataErr, setCsvDataErr] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const { setUnSavedChanges } = useContext(AuthContext);

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage?.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage?.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleCsvUpload = (data) => {
    handleUnSavedChanges(1);
    setCsvData([]);
    setCsvDataErr("");
    setCsvImportError(false);
    console.log("data---", data);
    if (!data[0].Employee || !data[0].Time || !data[0].Device) {
      setCsvDataErr(`Please choose csv file with "Employee", "Time", "Device"`);
      setCsvImportError(true);
      return;
    }
    setLoad(true);
    setCsvData(data);
    setLoad(false);
  };

  const handleSubmit = async () => {
    setLoad(true);
    let err = [];

    const getAllEmployeeRes = await employeeApi.getAllEmployee();
    console.log("getAllEmployeeRes---", getAllEmployeeRes);
    let empArr = [];
    for (let i = 0; i < getAllEmployeeRes.data.data.length; i++) {
      empArr.push(getAllEmployeeRes.data.data[i].name);
    }
    console.log("empArr---", empArr);
    let checkinArr = [];
    let errEmp = [];
    for (let i = 0; i < csvData.length; i++) {
      if (
        csvData[i].Employee != "" &&
        csvData[i].Time != "" &&
        csvData[i].Device != ""
      ) {
        if (empArr.includes(csvData[i].Employee)) checkinArr.push(csvData[i]);
        else {
          if (!errEmp.includes(csvData[i].Employee))
            errEmp.push(csvData[i].Employee);
        }
      }
    }
    if (errEmp.length > 0) {
      setModalMessage(`Employee ${errEmp.join(", ")} not found`);
      setModalTitle("Error");
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }
    checkinArr.sort((a, b) => a.Employee.localeCompare(b.Employee));
    console.log("checkinArr---", checkinArr);
    let thisdate = "";

    for (let i = 0; i < checkinArr.length; i++) {
      let dt = checkinArr[i].Time.split(" ")[0].split("-");
      thisdate =
        dt[2] +
        "-" +
        dt[1] +
        "-" +
        dt[0] +
        " " +
        checkinArr[i].Time.split(" ")[1];
      console.log("thisdate--", thisdate);

      const res = await employeeApi.createCheckIn(
        checkinArr[i].Employee,
        thisdate,
        checkinArr[i].Device,
        0
      );
      console.log("res----", res);

      if (!res.ok) {
        console.log(res.data._server_messages);
        err.push(
          checkinArr[i].Employee +
            " - " +
            checkinArr[i].Time +
            " - " +
            " - " +
            JSON.parse(JSON.parse(res.data._server_messages)[0]).message.split(
              "<Br>"
            )[0]
        );
      }
    }
    setCsvData([]);
    handleUnSavedChanges(0);
    document.getElementById("react-csv-reader-input").value = "";

    if (err.length > 0) {
      setModalMessage(
        err.join("<br />") + "<br />" + "Other Check ins Imported successfully"
      );
      setModalTitle("Message");
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }

    //get all checkins by from date and to date
    toast.success("Check ins Imported successfully");
    setLoad(false);
  };

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => setModalErrorOpen(false)}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className={"row no-gutters"}>
          <div className={"col-lg-9 row"}>
            <div className="col-lg-5 text-right pe-3 mt-2">
              <label> Biometric File(CSV)</label>
            </div>
            <div className={"col-lg-6"}>
              <CSVReader
                ref={fileInputRef}
                tabindex={1}
                cssInputClass="form-control"
                onFileLoaded={handleCsvUpload}
                parserOptions={{
                  header: true,
                }}
              />
              <div className="mt-2">
                <a href="./Employee_Checkin_Sample.csv" target="_blank">
                  Download Sample CSV
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <ErrorMessage Message={csvDataErr} view={csvImportErroroad} />
        </div>
        {csvData.length > 0 ? (
          <>
            <div className="row mt-3 no-gutters">
              <table className="table table-bordered table-hover">
                <tr>
                  <th>Employee</th>
                  <th>Time</th>
                  <th>Device</th>
                </tr>
                {csvData.map((item, index) => (
                  <tr>
                    <td>{item.Employee}</td>
                    <td>{item.Time}</td>
                    <td>{item.Device}</td>
                  </tr>
                ))}
              </table>
            </div>
            <div className="text-center">
              <Button
                type="button"
                frmButton={false}
                tabindex={2}
                isTable={true}
                onClick={() => {
                  handleSubmit();
                }}
                text="Upload"
              />
              &nbsp;&nbsp;
              <Button
                autoFocus
                tabindex={3}
                type="button"
                frmButton={false}
                isTable={true}
                onClick={() => {
                  handleUnSavedChanges(0);
                  setCsvData([]);
                  setCsvDataErr("");
                  setCsvImportError(false);
                  fileInputRef.current.value = "";
                }}
                text="Clear"
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default BioMetricUpload;
