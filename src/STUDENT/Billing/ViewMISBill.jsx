import React, { useState, useContext } from "react";
import { useSelector } from "react-redux";
import $ from "jquery";

import api from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import TextField from "../../component/FormField/TextField";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import PdfComponent from "../../component/common/PdfComponent";
import PDFDetail from "../../component/PDFDetail";

import AuthContext from "../../auth/context";

import "../../Print.css";
import string from "../../string";
import storage from "../../auth/storage";
import { useLocation } from "react-router-dom";

function ViewMISBill() {
  //#region const
  const location = useLocation();
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [billNumber, setBillNumber] = useState();
  const [billNumberError, setBillNumberError] = useState(false);
  const [showBill, setShowBill] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [pdfContent, setPdfContent] = useState("");
  const [pdfContentView, setPdfContentView] = useState("");

  const collegeConfig = useSelector((state) => state.web.college);

  const { collegeId, role } = useContext(AuthContext);

  const handleReprint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 100);
  };

  const handleSelectBillNumber = async () => {
    try {
      setBillNumberError(false);

      if (!billNumber) {
        setBillNumberError(true);
        return;
      }
      setLoad(true);
      const MISBillDetailRes = await api.MISBillDetail(
        billNumber,
        collegeConfig.common_cashier == 1 || role == "SuperAdmin"
          ? null
          : collegeId
      );
      console.log("MISBillDetailRes---", MISBillDetailRes);
      if (!MISBillDetailRes.data.message.success) {
        setModalMessage(MISBillDetailRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Not Exists");
        setLoad(false);
        return;
      }

      setShowBill(true);
      let AOText = "Administrative Officer";
      let hideAdmin = false;
      const pageConfigData = storage.getPageConfig();
      if (pageConfigData.length == 0) return;
      pageConfigData.forEach((item) => {
        item.link = item.link.replace(/\s/g, "");
        if ("/" + item.link == location.pathname) {
          hideAdmin = true;
          const currentPageConfig = JSON.parse(item.config);
          console.log("currentPageConfig", currentPageConfig);
          for (let i = 0; i < currentPageConfig?.length; i++) {
            for (let key in currentPageConfig[i].attribute) {
              if (currentPageConfig[i].id == "cadministrativeOfficer") {
                $("#" + currentPageConfig[i].id).attr(
                  key,
                  currentPageConfig[i].attribute[key] +
                    ";justify-content:center;"
                );
              } else if (currentPageConfig[i].id == "administrativeOfficer") {
                AOText = currentPageConfig[i].attribute["alt"];
              }
            }
          }
        }
      });

      let pdfContent =
        MISBillDetailRes.data.message.data.feesCollectionDetail.map(
          (item, index) => {
            return index % string.PRINT_PER_PAGE === 0 ? (
              <PDFDetail
                startNo={index}
                hideAdmin={hideAdmin}
                AOText={AOText}
                feesCollectionDetail={MISBillDetailRes.data.message.data.feesCollectionDetail.slice(
                  index,
                  index + string.PRINT_PER_PAGE
                )}
                feesCollection={
                  MISBillDetailRes?.data?.message?.data.feesCollection[0]
                }
                secondCopy={true}
                finalPage={
                  parseInt(
                    MISBillDetailRes.data.message.data.feesCollectionDetail
                      .length / string.PRINT_PER_PAGE
                  ) *
                    string.PRINT_PER_PAGE ===
                  index
                }
                MISCBill={true}
              />
            ) : null;
          }
        );

      setPdfContent(pdfContent);
      let pdfContent11;
      let totalAmount = 0;
      console.log("collegeConfig---", collegeConfig);
      if (collegeConfig.institution_type === 1) pdfContent11 = pdfContent;
      else
        pdfContent11 =
          MISBillDetailRes.data.message.data.feesCollectionDetail.map(
            (item, index) => {
              return index % string.PRINT_PER_PAGE === 0 ? (
                <PDFDetail
                  startNo={index}
                  feesCollectionDetail={MISBillDetailRes.data.message.data.feesCollectionDetail.slice(
                    index,
                    index + string.PRINT_PER_PAGE
                  )}
                  feesCollection={
                    MISBillDetailRes?.data?.message?.data.feesCollection[0]
                  }
                  secondCopy={true}
                  finalPage={
                    parseInt(
                      MISBillDetailRes.data.message.data.feesCollectionDetail
                        .length / string.PRINT_PER_PAGE
                    ) *
                      string.PRINT_PER_PAGE ===
                    index
                  }
                  MISCBill={true}
                />
              ) : null;
            }
          );
      setPdfContent(pdfContent);
      setPdfContentView(pdfContent11);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
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

        <div className="row no-gutters">
          {!showBill ? (
            <div className="row no-gutters">
              <div className="col-lg-3 pe-2">
                <TextField
                  autoFocus
                  id="billNumber"
                  label="Bill No."
                  placeholder="Number"
                  value={billNumber}
                  error={billNumberError ? "Please enter Bill No." : ""}
                  touched={billNumberError ? true : false}
                  mandatory={1}
                  maxlength={5}
                  onChange={(e) => {
                    if (preFunction.amountValidation(e.target.value)) {
                      setBillNumber(e.target.value);
                    }
                  }}
                  onKeyUp={(e) =>
                    e.keyCode == 13 && handleSelectBillNumber(e.target.value)
                  }
                />
              </div>
              <div className="col-lg-3 ps-3 mt-1">
                <Button
                  text={"Show Bill"}
                  isCenter={false}
                  isTable={true}
                  frmButton={false}
                  onClick={(e) => {
                    handleSelectBillNumber(billNumber);
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="row no-gutters">{pdfContentView}</div>
              <div className="text-center">
                <Button
                  frmButton={false}
                  tabIndex={1}
                  type="button"
                  onClick={() => handleReprint()}
                  text="RePrint"
                />
                <Button
                  autoFocus
                  tabIndex={2}
                  className={"btn ms-2"}
                  frmButton={false}
                  text={"View Another Bill"}
                  onClick={() => {
                    setBillNumber();
                    setShowBill(false);
                  }}
                />
              </div>
            </>
          )}
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
            paperSize="A5"
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

export default ViewMISBill;
