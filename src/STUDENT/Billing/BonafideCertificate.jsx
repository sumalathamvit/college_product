import React, { useState } from "react";
import moment from "moment";
import { useSelector } from "react-redux";

import api from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import RupeeInWords from "../../component/common/RupeeInWords";
import PdfComponent from "../../component/common/PdfComponent";
import BonafideCertificatePDF from "../../component/BonafideCerticatePDF";
import ReactSelectField from "../../component/FormField/ReactSelectField";

import "../../Print.css";

function BonafideCertificate() {
  //#region const
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [showEnrollNo, setShowEnrollNo] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [pdfContent, setPdfContent] = useState("");
  const [pdfContentView, setPdfContentView] = useState("");
  const [enrollNumber, setEnrollNumber] = useState();
  const [studentList, setStudentList] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);
  console.log("collegeConfig", collegeConfig);
  //#endregion

  const handleReprint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 100);
  };

  const handleShow = async (value) => {
    console.log("value", value);
    try {
      setLoad(true);
      const getStudentDetail = await api.studentDetailById(value.id);
      console.log("getStudentDetail---", getStudentDetail);
      if (!getStudentDetail.data.message.success) {
        setModalMessage(getStudentDetail.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setShowEnrollNo(true);

      //batch and study year wise calculate academic year
      let academicYearStart =
        parseInt(
          getStudentDetail?.data?.message?.data?.student?.batch.split("-")[0]
        ) +
        parseInt(getStudentDetail?.data?.message?.data?.student?.studyYear) -
        1;
      let academicYearEnd = parseInt(academicYearStart) + 1;
      let academicYear = academicYearStart + " / " + academicYearEnd;
      console.log("academicYear", academicYear);
      getStudentDetail.data.message.data.student.academicYear = academicYear;

      console.log("getStudentDetail", getStudentDetail);
      const student = getStudentDetail?.data?.message?.data?.student;
      let pdfContent = (
        <BonafideCertificatePDF student={student} secondCopy={true} />
      );

      setPdfContent(pdfContent);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const searchStudent = async (value) => {
    console.log("value", value);
    setStudentList([]);
    if (value.length > 2) {
      try {
        const student = await api.searchStudent(value);
        console.log("res--", student);

        setStudentList(student.data.message.student);
      } catch (error) {
        console.log("error--", error);
      }
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
        <ScreenTitle titleClass="page-heading-position" />

        <div className="row no-gutters">
          {!showEnrollNo ? (
            <div className="row no-gutters">
              <div className="col-lg-10 mt-1">
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
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  onInputChange={(inputValue) => {
                    searchStudent(inputValue);
                  }}
                  onChange={(text) => {
                    setEnrollNumber(text);
                    // viewStudent(text?.id);
                    // checkDueAmount(text);
                    handleShow(text);
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
                &nbsp;&nbsp;
                <Button
                  tabIndex={2}
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
            handleClick={() => {
              setOpenModal(false);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default BonafideCertificate;
