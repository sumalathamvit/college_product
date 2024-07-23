import React, { useState } from "react";

import api from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import PdfComponent from "../../component/common/PdfComponent";
import TCPdfDetail from "../../component/TCPdfDetail";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import CommonApi from "../../component/common/CommonApi";

import "../../Print.css";

function ViewTranferCertificate() {
  //#region const
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [showEnrollNo, setShowEnrollNo] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [pdfContent, setPdfContent] = useState("");
  const [enrollNumber, setEnrollNumber] = useState();
  const [studentList, setStudentList] = useState([]);
  //#endregion

  const handleReprint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 100);
  };

  const handleShowTC = async (value) => {
    console.log("value", value);
    try {
      setLoad(true);
      const getTC = await api.getTransferCertificate(value.id);
      console.log("getTC---", getTC);
      if (!getTC.data.message.success) {
        setModalMessage(getTC.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setShowEnrollNo(true);
      let pdfContent = <TCPdfDetail viewTCdetails={getTC} />;
      setPdfContent(pdfContent);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
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
          {!showEnrollNo ? (
            <div className="row no-gutters">
              <div className="col-lg-12 mt-1">
                <ReactSelectField
                  label="Student No. / Name"
                  labelSize={3}
                  tabIndex={1}
                  autoFocus
                  id="student"
                  mandatory={1}
                  maxlength={40}
                  value={enrollNumber}
                  options={studentList}
                  style={{ width: "90%" }}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  onInputChange={(inputValue) => {
                    searchStudent(inputValue);
                  }}
                  onChange={(text) => {
                    setEnrollNumber(text);
                    handleShowTC(text);
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {pdfContent}

              <div className="text-center">
                <Button
                  frmButton={false}
                  tabIndex={1}
                  type="button"
                  onClick={() => handleReprint()}
                  text="RePrint"
                />
                <Button
                  tabIndex={2}
                  className={"btn ms-2"}
                  frmButton={false}
                  text={"View Another Student"}
                  onClick={() => {
                    setEnrollNumber("");
                    setShowEnrollNo(false);
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
            paperSize="a4"
            orientation="portrait"
            handleClick={() => {
              setOpenModal(false);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default ViewTranferCertificate;
