import React, { useState } from "react";

import api from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import PdfComponent from "../../component/common/PdfComponent";
import CoursecompletionPDF from "../../component/CourseCompletionPDF";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import CommonApi from "../../component/common/CommonApi";

import "../../Print.css";

function ViewCourseCompletion() {
  //#region const
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [showEnrollNo, setShowEnrollNo] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [enrollNumber, setEnrollNumber] = useState();
  const [studentList, setStudentList] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
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
      const getStudentDetail = await api.getTransferCertificate(value.id);
      console.log("getTC---", getStudentDetail);
      if (!getStudentDetail.data.message.success) {
        setModalMessage(getStudentDetail.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setShowEnrollNo(true);
      const student =
        getStudentDetail?.data?.message?.data?.transfer_certificate[0];
      let pdfContent = (
        <CoursecompletionPDF student={student} secondCopy={true} />
      );

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
        <ScreenTitle titleClass="page-heading-position" />

        <div className="row no-gutters">
          {!showEnrollNo ? (
            <div className="row no-gutters">
              <div className="col-8 mt-1">
                <ReactSelectField
                  label="Student No. / Name"
                  labelSize={4}
                  tabIndex={1}
                  autoFocus
                  id="student"
                  mandatory={1}
                  maxlength={40}
                  value={enrollNumber}
                  options={studentList}
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

export default ViewCourseCompletion;
