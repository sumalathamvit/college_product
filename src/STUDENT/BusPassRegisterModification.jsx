import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { toast } from "react-toastify";
import moment from "moment";
import * as Yup from "yup";

import StudentApi from "../api/StudentApi";

import Button from "../component/FormField/Button";
import ErrorMessage from "../component/common/ErrorMessage";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import StudentCard from "../component/StudentCard";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import ScreenTitle from "../component/common/ScreenTitle";
import DisplayText from "../component/FormField/DisplayText";
import ModalComponent from "../component/ModalComponent";
import CommonApi from "../component/common/CommonApi";

const FormSchema = Yup.object().shape({
  enrollNo: Yup.object().required("Please select Student No."),
  boardingPlace: Yup.object().required("Please select Boarding Place"),
});

function StudentBusPassRegisterModification() {
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [boardingList, setBoardingList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [busPassDetail, setBusPassDetail] = useState([]);
  const [feeDueDetail, setFeeDueDetail] = useState([]);
  const [showError, setShowError] = useState(false);
  const [studentInfo, setStudentInfo] = useState();
  const [studentID, setStudentID] = useState();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values--->", values);
    console.log(
      "checking--->",
      busPassDetail[0].busPassRegisterID,
      studentID,
      values.boardingPlace.id,
      values.boardingPlace.amount
    );
    try {
      setLoad(true);
      const modifyBusPass = await StudentApi.addorUpdateBusPassRegister(
        busPassDetail[0].busPassRegisterID,
        studentID,
        values.boardingPlace.id,
        values.boardingPlace.amount
      );
      console.log("modifyBusPass---", modifyBusPass);
      if (!modifyBusPass.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(modifyBusPass.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(modifyBusPass.data.message.message);
      resetForm();
      setBusPassDetail([]);
      setStudentID();
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
      const busPassRegisterDetails = await StudentApi.getBusPassRegisterDetail(
        value.id
      );
      console.log("getBusPassRegisterDetail--", busPassRegisterDetails);
      if (!busPassRegisterDetails.data.message.success) {
        setModalMessage(busPassRegisterDetails.data.message.message);
        setModalTitle("Bus Pass Register");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setStudentID(
        busPassRegisterDetails.data.message.data.student[0].studentID
      );
      setStudentInfo(busPassRegisterDetails?.data?.message?.data.student[0]);
      setShowError(false);
      if (busPassRegisterDetails.data.message.data.busPassRegister[0]) {
        let boardingPlaceList =
          busPassRegisterDetails.data.message.data.boardingPlace.filter(
            (e) =>
              e.boardingPlace !=
              busPassRegisterDetails.data.message.data.busPassRegister[0]
                .boardingPlace
          );
        console.log("boardingPlaceList", boardingPlaceList);
        setBoardingList(boardingPlaceList);
        setBusPassDetail(
          busPassRegisterDetails.data.message.data.busPassRegister
        );
        setFeeDueDetail(
          busPassRegisterDetails.data.message.data.transportFeesDue
        );
      } else {
        setModalMessage("No Bus Pass found");
        setModalTitle("Bus Pass Register");
        setModalErrorOpen(true);
        setLoad(false);
        setShowError(true);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            initialValues={{
              enrollNo: "",
              boardingPlace: "",
              date: "",
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
                        id="enrollNo"
                        mandatory={1}
                        labelSize={3}
                        tabIndex={1}
                        style={{ width: "80%" }}
                        options={studentList}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                        onInputChange={(inputValue) => {
                          searchStudent(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("enrollNo", text);
                          handleSelectStudent(text);
                          setBusPassDetail([]);
                          setFieldValue("boardingPlace", null);
                        }}
                      />
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
                        <div className="mt-3">
                          <ErrorMessage
                            Message={"No Bus Pass found"}
                            view={showError}
                          />
                        </div>
                        {busPassDetail.length > 0 ? (
                          <>
                            <div className="subhead-row">
                              <div className="subhead">
                                Bus Pass Register Details
                              </div>
                              <div className="col line-div"></div>
                            </div>
                            {/* <div className="col-lg-8">
                              {busPassDetail?.passRegisterDate ? (
                                <DisplayText
                                  label={"Pass Register Date"}
                                  labelSize={3}
                                  value={moment(
                                    busPassDetail?.passRegisterDate
                                  ).format("DD-MM-YYYY")}
                                />
                              ) : null}
                              {busPassDetail?.boardingPlace ? (
                                <DisplayText
                                  label={"Boarding Place"}
                                  labelSize={3}
                                  value={busPassDetail?.boardingPlace}
                                />
                              ) : null}
                              {busPassDetail?.expiredOn ? (
                                <DisplayText
                                  label={"Expired Date"}
                                  labelSize={3}
                                  value={moment(
                                    busPassDetail?.expiredOn
                                  ).format("DD-MM-YYYY")}
                                />
                              ) : null}
                              {busPassDetail?.passNo ? (
                                <DisplayText
                                  label={"Pass No."}
                                  labelSize={3}
                                  value={busPassDetail?.passNo}
                                />
                              ) : null}
                            </div> */}
                            <div className="table-responsive mt-2 p-0">
                              <table className="table table-bordered table-hover">
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
                              <table className="table table-bordered table-hover">
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

                            <div className="subhead-row">
                              <div className="subhead">
                                Boarding Place Details
                              </div>
                              <div className="col line-div"></div>
                            </div>
                            <div className="col-lg-8 ">
                              <SelectFieldFormik
                                label="Boarding Place"
                                id="boardingPlace"
                                tabIndex={2}
                                mandatory={1}
                                labelSize={3}
                                style={{ width: "80%" }}
                                options={boardingList}
                                getOptionLabel={(option) =>
                                  option.boardingPlace
                                }
                                getOptionValue={(option) => option.id}
                                onChange={(text) =>
                                  setFieldValue("boardingPlace", text)
                                }
                              />
                              {values.boardingPlace &&
                              values.boardingPlace.amount ? (
                                <DisplayText
                                  label={"Amount (₹)"}
                                  labelSize={3}
                                  value={values.boardingPlace.amount}
                                />
                              ) : null}
                            </div>
                            <div className="col-lg-4"></div>
                            <Button
                              tabIndex={3}
                              type="submit"
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
        </div>
      </div>
    </div>
  );
}

export default StudentBusPassRegisterModification;
