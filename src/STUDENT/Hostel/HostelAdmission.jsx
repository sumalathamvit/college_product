import React, { useEffect, useRef, useState, useContext } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { Formik } from "formik";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";
import EmployeeApi from "../../api/EmployeeApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import StudentCard from "../../component/StudentCard";
import TextAreaField from "../../component/FormField/TextareaField";
import ScreenTitle from "../../component/common/ScreenTitle";
import DisplayText from "../../component/FormField/DisplayText";
import EmployeeCard from "../../HRM/EmployeeCard";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";
import CommonApi from "../../component/common/CommonApi";

const FormSchema = Yup.object().shape({
  admissionDate: Yup.date().required("Please select Admission Date"),
  hostelOccupantType: Yup.object().required(
    "Please select Hostel Occupant Type"
  ),
  building: Yup.object().required("Please select Building"),
  roomCategory: Yup.object().required("Please select Room Category"),
  room: Yup.object().required("Please select Room"),
});

function HostelAdmission() {
  //#region const
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [transferReq, setTransferReq] = useState(false);
  const [vacate, setVacate] = useState(false);
  const [vacateDateError, setVacateDateError] = useState(false);
  const [vacateNoteError, setVacateNoteError] = useState(false);
  const [hostelDetail, setHostelDetail] = useState();
  const [studentList, setStudentList] = useState([]);
  const [studentInfo, setStudentInfo] = useState();
  const [buildingList, setBuildingList] = useState([]);
  const [occupantTypeList, setOccupantTypeList] = useState([]);
  const [roomCategoryList, setRoomCategoryList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [noRoomError, setNoRoomError] = useState(false);
  const [feeDueList, setFeeDueList] = useState([]);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [employeeDetail, setEmployeeDetail] = useState();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  //#endregion

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
  };

  const handleSelectStudent = async (text, student = 0) => {
    console.log("values----", student);
    try {
      setLoad(true);
      if (text) {
        setStudentInfo();
        setHostelDetail();
        setFeeDueList([]);

        const getHostelStudentRes =
          await StudentApi.getStudentHostelAdmissionDetail(text);
        console.log("getHostelStudenMasterRes---", getHostelStudentRes);
        if (getHostelStudentRes.data.message.hostel_admission.length > 0) {
          setHostelDetail(getHostelStudentRes.data.message.hostel_admission[0]);
          setFeeDueList(getHostelStudentRes.data.message.hostel_fees_due);
        }
        if (student == 1) {
          setStudentInfo(getHostelStudentRes.data.message.student[0]);
          let genderId = getHostelStudentRes.data.message.student[0].genderID;
          console.log("genderId---", genderId);

          const getMasterRes = await StudentApi.getHostelStudenMaster();
          console.log("getMasterRes---", getMasterRes);
          let buildingArr = [];
          for (
            let i = 0;
            i < getMasterRes.data.message.data.building.length;
            i++
          ) {
            if (
              getMasterRes.data.message.data.building[i].genderID == genderId
            ) {
              // set building based on genderID
              buildingArr.push(getMasterRes.data.message.data.building[i]);
              break;
            }
          }
          setBuildingList(buildingArr);
          console.log("buildingArr", buildingArr);
          if (buildingArr.length == 1) {
            console.log("building 0", buildingArr[0]);
            formikRef.current.setFieldValue("building", buildingArr[0]);
          }
        }
      } else {
        setStudentInfo();
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const searchEmployee = async (text) => {
    setEmpCodeList(await CommonApi.searchEmployee(text));
  };

  const getViewEmployee = async (emp) => {
    try {
      console.log("emp--", emp);
      if (emp) {
        setLoad(true);
        const getEmployee = await EmployeeApi.getEmployeeById(emp.name);
        console.log("getEmployee----", getEmployee);
        setEmployeeDetail(getEmployee.data.data);
        let gender = getEmployee.data.data.gender;
        console.log("gender---", gender);
        const getMasterRes = await StudentApi.getHostelStudenMaster();
        console.log("getMasterRes---", getMasterRes);
        setBuildingList(getMasterRes.data.message.data.building);
        // if (gender == "Male") {
        //   console.log("buildingList[i].building", buildingList[0]);
        //   formikRef.current.setFieldValue("building", buildingList[0]);
        // } else if (gender == "Female") {
        //   console.log("buildingList[i].building", buildingList[1]);
        //   formikRef.current.setFieldValue("building", buildingList[1]);
        // }
      } else {
        setEmployeeDetail();
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const handleClear = () => {
    setTransferReq(false);
    handleSelectStudent();
    setHostelDetail();
    setStudentList();
    setStudentInfo();
    setEmployeeDetail();
    setVacate(false);

    setVacateDateError(false);
    setVacateNoteError(false);
    setNoRoomError(false);
    formikRef.current.setFieldValue("admissionDate", "");
    formikRef.current.setFieldValue("building", "");
    formikRef.current.setFieldValue("roomCategory", "");
    formikRef.current.setFieldValue("room", "");
  };

  const handleVacate = async (values) => {
    if (load) return;
    console.log("values---", values);
    setVacateDateError(false);
    setVacateNoteError(false);

    let err = false;
    if (
      !values.vacateDate ||
      values.vacateDate > moment().format("YYYY-MM-DD") ||
      values.vacateDate < moment().subtract(1, "months").format("YYYY-MM-DD")
    ) {
      setVacateDateError(true);
      document.getElementById("vacateDate").select();
      err = true;
    }
    if (!values.vacateNote) {
      setVacateNoteError(true);
      err = true;
    }
    console.log("err--", vacateDateError);
    if (err) return;

    try {
      setLoad(true);
      const modifiedBy = sessionStorage.getItem("email");

      const vacateHostelRes = await StudentApi.addUpdateHostelAdmission(
        hostelDetail.hostelAdmissionID,
        values.hostelOccupantType.occupantType == "Student"
          ? values.studentId?.id
          : values.employeeCode.custom_employeeid,
        hostelDetail.roomID,
        hostelDetail.roomRent,
        null,
        null,
        null,
        null,
        null,
        values.hostelOccupantType.id,
        values.hostelOccupantType.occupantType,
        null,
        modifiedBy,
        true,
        moment(values.vacateDate).format("yyyy-MM-DD"),
        values.vacateNote
      );
      console.log("vacateHostelRes---", vacateHostelRes);
      if (!vacateHostelRes.data.message.success) {
        setModalMessage(vacateHostelRes.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      toast.success(vacateHostelRes.data.message.message);
      setTransferReq(false);
      setVacate(false);
      handleSelectStudent();
      getViewEmployee();
      setHostelDetail();
      getInitialList();
      formikRef.current.setFieldValue("employeeCode", "");
      formikRef.current.setFieldValue("studentId", "");
      document.getElementById("student")?.focus();
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values---->", values);

    try {
      setLoad(true);
      const modifiedBy = sessionStorage.getItem("email");
      console.log("values---", values);
      let occupantType = values.hostelOccupantType.occupantType;
      if (transferReq) {
        console.log("hostel det--", hostelDetail);
        const addHostelTransferRes = await StudentApi.addUpdateHostelAdmission(
          hostelDetail.hostelAdmissionID,
          occupantType == "Student"
            ? values.studentId?.id
            : values.employeeCode.custom_employeeid,
          values.room.id,
          occupantType == "Student"
            ? values.room.roomRent
            : occupantType == "Staff"
            ? values.room.staffRoomRent
            : 0,
          occupantType == "Student" ? studentInfo.semester : null,
          occupantType == "Student" ? studentInfo.batchID : null,
          occupantType == "Student" ? studentInfo.studyYear : 0,
          occupantType == "Student" ? feeDueList[0].id : null,
          occupantType == "Student" ? feeDueList[0].paid : null,
          values.hostelOccupantType.id,
          values.hostelOccupantType.occupantType,
          null,
          modifiedBy
        );
        console.log("addUpdateHostelAdmissionRes---", addHostelTransferRes);
        if (!addHostelTransferRes.data.message.success) {
          setModalMessage(addHostelTransferRes.data.message.message);
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
        handleUnSavedChanges(0);
        toast.success(addHostelTransferRes.data.message.message);
        setTransferReq(false);
        setVacate(false);
        handleSelectStudent();
        getViewEmployee();
        setHostelDetail();
        resetForm();
        getInitialList();
        document.getElementById("student")?.focus();
        formikRef.current.setFieldValue("employeeCode", "");
        formikRef.current.setFieldValue("studentId", "");
      } else {
        console.log("test");
        const addHostelAdmissionRes = await StudentApi.addUpdateHostelAdmission(
          null,
          occupantType == "Student"
            ? values.studentId?.id
            : values.employeeCode.custom_employeeid,
          values.room.id,
          occupantType == "Student"
            ? values.room.roomRent
            : occupantType == "Staff"
            ? values.room.staffRoomRent
            : 0,
          occupantType == "Student" ? studentInfo.semester : null,
          occupantType == "Student" ? studentInfo.batchID : null,
          occupantType == "Student" ? studentInfo.studyYear : null,
          null,
          null,
          values.hostelOccupantType.id,
          values.hostelOccupantType.occupantType,
          moment(values.admissionDate).format("yyyy-MM-DD"),
          modifiedBy
        );
        console.log("addUpdateHostelAdmissionRes---", addHostelAdmissionRes);
        if (!addHostelAdmissionRes.data.message.success) {
          setModalMessage(addHostelAdmissionRes.data.message.message);
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
        handleUnSavedChanges(0);
        toast.success(addHostelAdmissionRes.data.message.message);
        handleSelectStudent();
        getViewEmployee();
        setHostelDetail();
        resetForm();
        getInitialList();
        document.getElementById("student")?.focus();
        formikRef.current.setFieldValue("employeeCode", "");
        formikRef.current.setFieldValue("studentId", "");
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const getRoomDetail = async (building, roomCategory) => {
    console.log("building, roomCategory---", building, roomCategory);
    setRoomList([]);
    setNoRoomError(false);
    if (roomCategory && building) {
      const getRoomDetailRes = await StudentApi.getHostelStudenMaster(
        building.id,
        roomCategory.id
      );
      console.log("getRoomDetailRes---", getRoomDetailRes);
      if (getRoomDetailRes.data.message.data.length > 0)
        setRoomList(getRoomDetailRes.data.message.data);
      else setNoRoomError(true);
    }
  };

  const getInitialList = async () => {
    try {
      const getMasterRes = await StudentApi.getHostelStudenMaster();
      console.log("getMasterRes---", getMasterRes);
      setBuildingList(getMasterRes.data.message.data.building);
      setRoomCategoryList(getMasterRes.data.message.data.room_category);
      setOccupantTypeList(getMasterRes.data.message.data.occupant_type);

      for (
        let i = 0;
        i < getMasterRes.data.message.data.occupant_type.length;
        i++
      ) {
        if (
          getMasterRes.data.message.data.occupant_type[i].occupantType ==
          "Student"
        ) {
          formikRef.current.setFieldValue(
            "hostelOccupantType",
            getMasterRes.data.message.data.occupant_type[i]
          );
          break;
        }
      }
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    getInitialList();
  }, []);

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
              studentId: "",
              employeeCode: "",
              building: "",
              roomCategory: "",
              room: "",
              admissionDate: "",
              hostelOccupantType: "",
              vacateDate: "",
              vacateNote: "",
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
                  <div className="row no-gutters mt-1">
                    <div className="row no-gutters">
                      <div className="col-lg-9">
                        <SelectFieldFormik
                          id="hostelOccupantType"
                          label="Hostel Occupant Type"
                          labelSize={4}
                          tabIndex={1}
                          maxlength={25}
                          options={occupantTypeList}
                          getOptionLabel={(option) => option.occupantType}
                          getOptionValue={(option) => option.id}
                          mandatory={1}
                          clear={false}
                          style={{ width: "50%" }}
                          onChange={(text) => {
                            setFieldValue("hostelOccupantType", text);
                            setFieldValue("employeeCode", "");
                            setFieldValue("studentId", "");
                            handleClear();
                          }}
                        />
                      </div>
                      {hostelDetail && (
                        <>
                          {!transferReq &&
                            !vacate &&
                            !hostelDetail?.isVacate && (
                              <>
                                <div className="col-lg-1 text-right pe-2">
                                  <Button
                                    className={"btn-3"}
                                    type="button"
                                    isTable={true}
                                    isCenter={false}
                                    text={"Vacate"}
                                    onClick={() => {
                                      setVacate(true);
                                    }}
                                  />
                                </div>
                                {/* <div className="col-lg-2 text-right ps-2">
                                  <Button
                                    className={"btn-3"}
                                    type="button"
                                    isTable={true}
                                    isCenter={false}
                                    text={"Transfer"}
                                    onClick={(e) => {
                                      setFieldValue(
                                        "admissionDate",
                                        hostelDetail.admissionDate
                                      );
                                      setTransferReq(true);
                                    }}
                                  />
                                </div> */}
                              </>
                            )}
                        </>
                      )}
                    </div>
                    <div className="row no-gutters">
                      <div className="col-lg-9">
                        {values.hostelOccupantType &&
                        values.hostelOccupantType.occupantType != "Student" ? (
                          <ReactSelectField
                            label="Employee No. / Name"
                            id="employeeCode"
                            labelSize={4}
                            mandatory={1}
                            tabIndex={
                              values.hostelOccupantType.occupantType !=
                              "Student"
                                ? 2
                                : ""
                            }
                            style={{ width: "70%" }}
                            options={empCodeList}
                            value={values.employeeCode}
                            searchIcon={true}
                            getOptionLabel={(option) =>
                              option.custom_employeeid +
                              " - " +
                              option.employee_name
                            }
                            getOptionValue={(option) => option.name}
                            onInputChange={(inputValue) => {
                              searchEmployee(inputValue);
                            }}
                            onChange={(text) => {
                              setFieldValue("employeeCode", text);
                              getViewEmployee(text);
                              handleSelectStudent(text.custom_employeeid);
                              handleClear();
                            }}
                          />
                        ) : (
                          <ReactSelectField
                            autoFocus
                            label={"Student No. / Name"}
                            labelSize={4}
                            tabIndex={2}
                            id="student"
                            mandatory={1}
                            value={values.studentId}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                            options={studentList}
                            onInputChange={(text) => {
                              searchStudent(text);
                            }}
                            onChange={(etxt) => {
                              setFieldValue("studentId", etxt);
                              handleSelectStudent(etxt.id, 1);
                              handleClear();
                            }}
                          />
                        )}
                      </div>
                    </div>
                    {studentInfo || employeeDetail ? (
                      <>
                        {studentInfo ? (
                          <>
                            <div className="row no-gutters">
                              <div className="subhead-row">
                                <div className="subhead">Student Detail</div>
                                <div className="col line-div"></div>
                              </div>
                            </div>
                            <StudentCard studentInfo={studentInfo} />
                          </>
                        ) : (
                          <>
                            <div className="subhead-row">
                              <div className="subhead">Employee Detail</div>
                              <div className="col line-div"></div>
                            </div>

                            {employeeDetail && (
                              <EmployeeCard employeeInfo={employeeDetail} />
                            )}
                          </>
                        )}
                        {hostelDetail && (
                          <div className="row no-gutters mt-1">
                            <div className="subhead-row">
                              <div className="subhead">Admission Detail </div>
                              <div className="col line-div"></div>
                            </div>
                            <div className="col-lg-9">
                              <DisplayText
                                label="Admission Date"
                                labelSize={4}
                                value={moment(
                                  hostelDetail.admissionDate
                                ).format("DD-MM-yyyy")}
                              />
                              <DisplayText
                                label="Building"
                                labelSize={4}
                                value={hostelDetail.building}
                              />
                              <DisplayText
                                label="Room Category"
                                labelSize={4}
                                value={hostelDetail.roomCategory}
                              />
                              <DisplayText
                                label="Room Number"
                                labelSize={4}
                                value={hostelDetail.roomNo}
                              />
                              {values.hostelOccupantType &&
                              values.hostelOccupantType.occupantType ==
                                "Student" ? (
                                <DisplayText
                                  label="Room Rent (₹)"
                                  labelSize={4}
                                  value={hostelDetail.roomRent}
                                />
                              ) : null}
                              {values.hostelOccupantType &&
                              values.hostelOccupantType.occupantType ==
                                "Staff" ? (
                                <DisplayText
                                  label="Staff Room Rent (₹)"
                                  labelSize={4}
                                  value={hostelDetail.staffRoomRent}
                                />
                              ) : null}

                              {hostelDetail.vacateDate && (
                                <>
                                  <DisplayText
                                    label="Vacation Date"
                                    labelSize={4}
                                    value={moment(
                                      hostelDetail.vacateDate
                                    ).format("DD-MM-yyyy")}
                                  />
                                  <DisplayText
                                    label="Vacation Note"
                                    labelSize={4}
                                    value={hostelDetail.vacateNote}
                                  />
                                </>
                              )}
                            </div>
                            {feeDueList?.length > 0 && (
                              <div className="row p-0">
                                <div className="row no-gutters">
                                  <div className="subhead-row">
                                    <div className="subhead">
                                      Fee Due Detail
                                    </div>
                                    <div className="col line-div"></div>
                                  </div>
                                </div>
                                <div className="row p-0 mt-1">
                                  <div className="table-responsive row p-0">
                                    <table className="table table-bordered table-hover">
                                      <thead>
                                        <tr>
                                          <th width="1%">No.</th>
                                          <th>Particular</th>
                                          <th width="10%">Opening Bal (₹)</th>
                                          <th width="10%">
                                            Outstanding Bal (₹)
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {feeDueList.map((item, index) => {
                                          return (
                                            <tr>
                                              <td>{index + 1}</td>
                                              <td>{item.particular}</td>
                                              <td align="right">
                                                {item.openingBalance}
                                              </td>
                                              <td align="right">
                                                {item.balance}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {vacate ? (
                          <>
                            <div className="subhead-row">
                              <div className="subhead">Vacate Detail</div>
                              <div className="col line-div"></div>
                            </div>
                            <div className="col-lg-9">
                              <DateFieldFormik
                                autoFocus
                                label="Vacate Date"
                                labelSize={4}
                                tabIndex={vacate ? 3 : ""}
                                error={
                                  vacateDateError
                                    ? "Please select valid Date"
                                    : null
                                }
                                touched={vacateDateError}
                                id="vacateDate"
                                maxDate={new Date()}
                                style={{ width: "30%" }}
                                minDate={
                                  new Date(moment().subtract(1, "months"))
                                }
                                mandatory={1}
                                onChange={(e) => {
                                  setVacateDateError(false);
                                  setFieldValue("vacateDate", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <TextAreaField
                                maxlength={120}
                                id="vacateNote"
                                style={{ width: "70%" }}
                                label="Vacate Note"
                                tabIndex={vacate ? 4 : ""}
                                labelSize={4}
                                value={values.vacateNote}
                                error={
                                  vacateNoteError
                                    ? "Please enter Vacate Note"
                                    : null
                                }
                                touched={vacateNoteError}
                                mandatory={1}
                                onChange={(e) => {
                                  setVacateNoteError(false);
                                  setFieldValue("vacateNote", e.target.value);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </div>
                            <Button
                              text="F4 - Save"
                              type="button"
                              tabIndex={vacate ? 5 : ""}
                              onClick={(e) => {
                                handleVacate(values);
                              }}
                              id="save"
                            />
                          </>
                        ) : !hostelDetail || transferReq ? (
                          <div className="">
                            <div className="subhead-row">
                              <div className="subhead">Room Detail</div>
                              <div className="col line-div"></div>
                            </div>
                            <div className="col-lg-9">
                              {!transferReq && (
                                <>
                                  <DateFieldFormik
                                    label="Admission Date"
                                    labelSize={4}
                                    tabIndex={!transferReq ? 3 : ""}
                                    id="admissionDate"
                                    maxDate={new Date()}
                                    minDate={
                                      new Date(moment().subtract(1, "months"))
                                    }
                                    style={{ width: "30%" }}
                                    mandatory={1}
                                    onChange={(e) => {
                                      setFieldValue(
                                        "admissionDate",
                                        e.target.value
                                      );
                                      handleUnSavedChanges(1);
                                    }}
                                  />
                                </>
                              )}

                              <SelectFieldFormik
                                autoFocus={transferReq ? true : false}
                                id="building"
                                label="Building"
                                labelSize={4}
                                tabIndex={transferReq ? 3 : 4}
                                maxlength={25}
                                options={buildingList}
                                getOptionLabel={(option) => option.building}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                clear={false}
                                style={{ width: "50%" }}
                                onChange={(text) => {
                                  getRoomDetail(text, values.roomCategory);
                                  setFieldValue("building", text);
                                  handleUnSavedChanges(1);
                                }}
                              />
                              <SelectFieldFormik
                                id="roomCategory"
                                label="Room Category"
                                labelSize={4}
                                tabIndex={transferReq ? 4 : 5}
                                maxlength={20}
                                options={roomCategoryList}
                                getOptionLabel={(option) => option.roomCategory}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                clear={false}
                                style={{ width: "50%" }}
                                onChange={(text) => {
                                  getRoomDetail(values.building, text);
                                  setFieldValue("roomCategory", text);
                                  setFieldValue("room", "");
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </div>
                            <>
                              {noRoomError && (
                                <div className="row no-gutters error-message">
                                  <div className="col-lg-3"></div>
                                  <div className="col-lg-6 mt-1">
                                    No Rooms available
                                  </div>
                                </div>
                              )}
                              <>
                                <div className="col-lg-9">
                                  <SelectFieldFormik
                                    id="room"
                                    label="Room Number"
                                    labelSize={4}
                                    tabIndex={transferReq ? 5 : 6}
                                    maxlength={5}
                                    options={roomList}
                                    getOptionLabel={(option) => option.roomNo}
                                    getOptionValue={(option) => option.id}
                                    mandatory={1}
                                    style={{ width: "50%" }}
                                    onChange={(text) => {
                                      setFieldValue("room", text);
                                      handleUnSavedChanges(1);
                                    }}
                                  />
                                  <>
                                    {values.hostelOccupantType &&
                                    values.hostelOccupantType.occupantType ==
                                      "Student" ? (
                                      <DisplayText
                                        label="Room Rent (₹)"
                                        labelSize={4}
                                        value={values.room.roomRent ?? "-"}
                                      />
                                    ) : null}
                                    {values.hostelOccupantType &&
                                    values.hostelOccupantType.occupantType ==
                                      "Staff" ? (
                                      <DisplayText
                                        label="Staff Room Rent (₹)"
                                        labelSize={4}
                                        value={values.room.staffRoomRent ?? "-"}
                                      />
                                    ) : null}
                                    <DisplayText
                                      label="Room Capacity"
                                      labelSize={4}
                                      value={values.room.capacity ?? "-"}
                                    />
                                    <DisplayText
                                      label="Room Occupancy"
                                      labelSize={4}
                                      value={values.room.occupancy ?? "-"}
                                    />
                                  </>
                                </div>
                                <Button
                                  text={"F4 - Save"}
                                  tabIndex={transferReq ? 6 : 7}
                                  type="submit"
                                  onClick={(e) => {
                                    preFunction.handleErrorFocus(errors);
                                  }}
                                  id="save"
                                />
                              </>
                            </>
                          </div>
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

export default HostelAdmission;
