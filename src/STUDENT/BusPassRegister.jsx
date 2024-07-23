import React, { useState, useContext, useRef } from "react";
import { Modal } from "react-bootstrap";
import { Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import StudentApi from "../api/StudentApi";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import StudentCard from "../component/StudentCard";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import ScreenTitle from "../component/common/ScreenTitle";
import DisplayText from "./../component/FormField/DisplayText";
import ModalComponent from "./../component/ModalComponent";
import moment from "moment";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";
import CommonApi from "../component/common/CommonApi";

const FormSchema = Yup.object().shape({
  enrollNo: Yup.object().required("Please select Student No."),
  boardingPlace: Yup.object().required("Please select Boarding Place"),
});

function StudentBusPassRegister() {
  const [load, setLoad] = useState(false);
  const [boardingList, setBoardingList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [showError, setShowError] = useState(false);
  const [studentInfo, setStudentInfo] = useState();
  const [studentID, setStudentID] = useState();
  const [busPassDetail, setBusPassDetail] = useState([]);
  const [feeDueDetail, setFeeDueDetail] = useState([]);
  const [termArr, setTermArr] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { setUnSavedChanges } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const [openConfirmEmailModel, setOpenConfirmEmailModel] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [balance, setBalance] = useState(0);
  const formikRef = useRef();

  const handleTermDisplay = (text) => {
    console.log("text-->", text);
    let data = JSON.parse(text);
    let terms = [];
    for (const key in data) {
      console.log("------------", key); // Output: term1, term2, term3
      terms.push({
        key: key,
        value: data[key],
      });
    }
    console.log("terms-->", terms);
    setTermArr(terms);
  };

  const handleUnSavedChanges = (changed) => {
    if (changed === 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values-->", values, collegeConfig);

    try {
      setLoad(true);
      const addorUpdateBusPassRegisterRes =
        await StudentApi.addorUpdateBusPassRegister(
          busPassDetail.length > 0 ? busPassDetail[0].busPassRegisterID : null,
          termArr?.length,
          studentID,
          studentInfo.batchID,
          studentInfo.semester,
          studentInfo.studyYear,
          values.boardingPlace.id,
          values.boardingPlace.amount,
          values.boardingPlace.term,
          feeDueDetail.length > 0 ? feeDueDetail : null,
          collegeConfig.institution_type
        );
      console.log(
        "addorUpdateBusPassRegisterRes---",
        addorUpdateBusPassRegisterRes
      );
      if (!addorUpdateBusPassRegisterRes.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(addorUpdateBusPassRegisterRes.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      toast.success(addorUpdateBusPassRegisterRes.data.message.message);
      setBusPassDetail([]);
      setStudentInfo();
      setStudentID();
      resetForm();
      document.getElementById("enrollNo")?.focus();
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelectStudent = async (value) => {
    try {
      setLoad(true);
      setBoardingList([]);
      setBusPassDetail([]);
      setFeeDueDetail([]);
      setTermArr([]);
      setShowError(false);
      const busPassRegDetails = await StudentApi.getBusPassRegisterDetail(
        value.id,
        collegeConfig.institution_type
      );
      console.log("getBusPassRegisterDetail--", busPassRegDetails);
      if (!busPassRegDetails.data.message.success) {
        setModalMessage(busPassRegDetails.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setStudentID(busPassRegDetails.data.message.data.student[0].studentID);
      setStudentInfo(busPassRegDetails?.data?.message?.data.student[0]);
      setShowError(false);
      if (busPassRegDetails.data.message.data.busPassRegister.length > 0) {
        let boardingPlaceList =
          busPassRegDetails.data.message.data.boardingPlace.filter(
            (e) =>
              e.boardingPlace !==
              busPassRegDetails.data.message.data.busPassRegister[0]
                .boardingPlace
          );
        setBoardingList(boardingPlaceList);
        setBusPassDetail(busPassRegDetails.data.message.data.busPassRegister);
        setFeeDueDetail(busPassRegDetails.data.message.data.transportFeesDue);
        calculateTotalPaid(
          busPassRegDetails.data.message.data.transportFeesDue
        );
      } else {
        setBoardingList(busPassRegDetails.data.message.data.boardingPlace);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleCancelBusPass = async (values) => {
    try {
      setLoad(true);

      let str = "";
      for (let i = 0; i < feeDueDetail.length; i++) {
        str += feeDueDetail[i].feesDueID;
        if (i < feeDueDetail.length - 1) {
          str += ",";
        }
      }
      console.log("str--", str);

      const cancelBusPassRes = await StudentApi.cancelBusPassRegister(
        busPassDetail[0].busPassRegisterID,
        str
      );
      console.log("cancelBusPassRes--", cancelBusPassRes);
      if (!cancelBusPassRes.data.message.success) {
        setModalMessage(cancelBusPassRes.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      toast.success(cancelBusPassRes.data.message.message);
      setStudentInfo();
      setStudentID();
      setBusPassDetail([]);
      setFeeDueDetail([]);
      setBoardingList([]);
      setTermArr([]);
      handleUnSavedChanges(0);
      setShowError(true);
      values.enrollNo = "";

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const calculateTotalPaid = (data) => {
    let paid = 0;
    let balance = 0;
    for (let i = 0; i < data.length; i++) {
      paid += data[i].paid;
      balance += data[i].balance;
    }
    setTotalPaid(paid);
    setBalance(balance);
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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              enrollNo: "",
              boardingPlace: "",
            }}
            validationSchema={FormSchema}
            onSubmit={handleSave}
          >
            {({
              errors,
              values,
              touched,
              setFieldTouched,
              handleSubmit,
              handleChange,
              handleBlur,
              setFieldValue,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="row no-gutters">
                    <div className="col-lg-8 mt-1">
                      <SelectFieldFormik
                        autoFocus
                        label="Student No. / Name"
                        labelSize={3}
                        id="enrollNo"
                        mandatory={1}
                        tabIndex={1}
                        searchIcon={true}
                        options={studentList}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                        onInputChange={(inputValue) => {
                          searchStudent(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("enrollNo", text);
                          handleSelectStudent(text);
                          setFieldValue("boardingPlace", null);
                          handleUnSavedChanges(0);
                        }}
                      />
                    </div>
                    <div className="col-lg-4 text-right mt-2">
                      {busPassDetail.length > 0 ? (
                        <Button
                          text="Cancel Bus Pass"
                          frmButton={false}
                          isTable={true}
                          className={"btn-3"}
                          type="button"
                          onClick={() => {
                            // handleCancelBusPass(values);
                            setOpenConfirmEmailModel(true);
                          }}
                        />
                      ) : null}
                    </div>

                    {values.enrollNo ? (
                      <>
                        <div className="subhead-row">
                          <div className="subhead">Student Details</div>
                          <div className="col line-div"></div>
                        </div>
                        {studentInfo && (
                          <StudentCard studentInfo={studentInfo} />
                        )}
                        {busPassDetail.length > 0 ? (
                          <>
                            <div className="subhead-row">
                              <div className="subhead">
                                Bus Pass Register Details
                              </div>
                              <div className="col line-div"></div>
                            </div>
                            <div className="table-responsive mt-2 p-0">
                              <table className="table table-bordered">
                                <thead>
                                  <tr>
                                    <th width="1%">No.</th>
                                    <th width="5%">Pass No.</th>
                                    <th width="5%">Pass Register Date</th>
                                    <th width="5%">Expired Date</th>
                                    <th>Boarding Place</th>
                                    <th width="5%">Amount (₹)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {busPassDetail.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.passNo}</td>
                                        <td>
                                          {moment(item.passRegisterDate).format(
                                            "DD-MM-YYYY"
                                          )}
                                        </td>
                                        <td>
                                          {moment(item.expiredOn).format(
                                            "DD-MM-YYYY"
                                          )}
                                        </td>
                                        <td>{item.boardingPlace}</td>
                                        <td style={{ textAlign: "right" }}>
                                          {item.amount}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className="subhead-row">
                              <div className="subhead">Fees Due Details</div>
                              <div className="col line-div"></div>
                            </div>
                            <div className="table-responsive mt-2 p-0">
                              <table className="table table-bordered">
                                <thead>
                                  <tr>
                                    <th width="1%">No.</th>
                                    <th>Particular</th>
                                    <th width="5%">Opening Balance (₹)</th>
                                    <th width="5%">Paid Amount (₹)</th>
                                    <th width="5%">Balance (₹)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {feeDueDetail.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.particular}</td>
                                        <td style={{ textAlign: "right" }}>
                                          {item.openingBalance}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {item.paid}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {item.balance}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </>
                        ) : null}

                        {!showError ? (
                          <>
                            <div className="subhead-row">
                              <div className="subhead">
                                Boarding Place Details
                              </div>
                              <div className="col line-div"></div>
                            </div>
                            <div className="col-lg-8 mt-1">
                              <SelectFieldFormik
                                autoFocus
                                label="Boarding Place"
                                labelSize={3}
                                id="boardingPlace"
                                mandatory={1}
                                tabIndex={2}
                                style={{ width: "90%" }}
                                options={boardingList}
                                getOptionLabel={(option) =>
                                  option.boardingPlace
                                }
                                getOptionValue={(option) => option.id}
                                onChange={(text) => {
                                  setFieldValue("boardingPlace", text);
                                  handleUnSavedChanges(1);
                                  //string to json
                                  handleTermDisplay(text.term);
                                  console.log(
                                    "values-->",
                                    JSON.parse(text.term)
                                  );
                                }}
                              />
                              {termArr.length > 1 &&
                                termArr.map((item, index) => {
                                  return (
                                    <DisplayText
                                      key={index}
                                      label={
                                        preFunction.capitalizeFirst(item.key) +
                                        " (₹)"
                                      }
                                      labelSize={3}
                                      value={item.value}
                                    />
                                  );
                                })}
                              <DisplayText
                                label={"Amount (₹)"}
                                labelSize={3}
                                value={values?.boardingPlace?.amount ?? "-"}
                              />
                            </div>
                            <Button
                              tabIndex={3}
                              text="F4 - Save"
                              id="save"
                              onClick={() =>
                                preFunction.handleErrorFocus(errors)
                              }
                            />
                          </>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </form>
              );
            }}
          </Formik>
          <Modal
            show={openConfirmEmailModel}
            dialogClassName="my-modal"
            onEscapeKeyDown={(e) => setOpenConfirmEmailModel(false)}
          >
            <Modal.Header>
              <Modal.Title>Confirm Message</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {totalPaid == 0
                ? "Bus fees paid : ₹ " + totalPaid
                : "Bus fees of ₹ " + totalPaid + " already paid."}
              <br />
              {balance == 0
                ? "Remaining due amount : ₹ " + balance
                : "The remaining due amount of ₹ " +
                  balance +
                  " will be cancelled."}{" "}
              <br />
              <br />
              {"Would you like to cancel the bus pass?"}
            </Modal.Body>
            <Modal.Footer>
              <Button
                text="Yes"
                frmButton={false}
                onClick={() => {
                  setOpenConfirmEmailModel(false);
                  handleCancelBusPass(formikRef?.current?.values);
                  handleUnSavedChanges(0);
                }}
              />
              &nbsp;&nbsp;
              <Button
                autoFocus
                text="No"
                frmButton={false}
                onClick={() => {
                  setOpenConfirmEmailModel(false);
                }}
              />
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default StudentBusPassRegister;
