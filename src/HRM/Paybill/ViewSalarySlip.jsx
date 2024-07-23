import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import empApi from "../../api/EmployeeApi";
import attendanceApi from "../../api/attendanceapi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";
import PdfComponent from "../../component/common/PdfComponent";
import SalarySlipPDFDetail from "../../component/SalarySlipPDF";

function ViewSalarySlip() {
  const navigate = useNavigate();
  const location = useLocation();
  const [load, setLoad] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const handleReprint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 100);
  };

  const handleShowSalarySlip = async (values) => {
    try {
      console.log("id---", values);
      const getSalarySlipByIdRes = await attendanceApi.getSalarySlipById(
        values.id
      );
      console.log("getSalarySlipByIdRes---", getSalarySlipByIdRes);
      const salarySlip = getSalarySlipByIdRes?.data?.data;
      const getEmployeeByIdRes = await empApi.getEmployeeById(
        salarySlip?.employee
      );
      console.log("getEmployeeByIdRes---------------", getEmployeeByIdRes);
      const employee = getEmployeeByIdRes?.data?.data;

      let pdfContent = (
        <SalarySlipPDFDetail
          salarySlip={salarySlip}
          employee={employee}
          secondCopy={true}
        />
      );
      setPdfContent(pdfContent);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  useEffect(() => {
    handleShowSalarySlip(location.state);
    console.log("location.state---", location.state);
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{
          height: 100,
          alignSelf: "center",
        }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="mb-2">
          <Button
            autoFocus
            tabIndex={2}
            className={"btn-3"}
            frmButton={false}
            text={"Back"}
            onClick={() => {
              navigate("/salary-slip-list", {
                state: {
                  fromDate: location.state.fromDate,
                },
              });
            }}
          />
        </div>
        {pdfContent}
        <div className="text-center">
          <Button
            frmButton={false}
            tabIndex={1}
            type="button"
            onClick={() => handleReprint()}
            text="Print"
          />
        </div>
      </div>
      <div
        style={{
          display: "none",
        }}
      >
        {openModal ? (
          <PdfComponent
            printContent={pdfContent}
            paperSize="a5"
            orientation="landscape"
            handleClick={() => {
              setOpenModal(false);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
export default ViewSalarySlip;
