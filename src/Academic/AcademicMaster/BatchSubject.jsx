import React, { useEffect, useState, useRef, useContext } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import $ from "jquery";

import AuthContext from "../../auth/context";
import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import ErrorMessage from "../../component/common/ErrorMessage";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import TextField from "../../component/FormField/TextField";

function BatchSubject() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [subjectArr, setSubjectArr] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [oldSubjectArr, setOldSubjectArr] = useState([]);
  const [showSubject, setShowSubject] = useState(false);
  const [regulationError, setRegulationError] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState();
  const [selectedGeneral, setSelectedGeneral] = useState();
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorView, setErrorView] = useState(false);
  const [previousSubject, setPreviousSubject] = useState([]);

  const { setUnSavedChanges, collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  let finalTabIndex = 5;
  const formikRef = useRef();
  const subjectFormikRef = useRef();

  const subjectgeneral = [
    { id: 1, name: "Common" },
    { id: 2, name: "Elective" },
  ];

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: $("#course").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#course").attr("alt") ?? RENAME?.course}`
        ),
    semester: $("#semester").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#semester").attr("alt") ?? RENAME?.sem}`
        ),
  });

  const handleAllocate = async (values, subjectArr) => {
    if (load) return;
    setUnSavedChanges(false);
    setErrorView(false);

    if (subjectArr.length === 0) {
      setModalErrorOpen(true);
      setModalTitle("Subject");
      setModalMessage("Please add atleast one subject to allocate");
      return;
    }
    const allTrue = subjectArr.every((obj) => obj.printOrder);
    if (!allTrue) {
      // setModalErrorOpen(true);
      // setModalTitle("Print Order");
      // setModalMessage("Please enter print order for all subjects");
      setErrorMessage("Please enter print order for all subjects");
      setErrorView(true);
      return;
    }
    let obj = {};
    console.log("subjectArr---", selectedSubject);
    // selectedSubject print order validation
    if (selectedSubject) {
      const printOrder = subjectArr.map((obj) => obj.printOrder);

      if (!values.general) {
        // setModalErrorOpen(true);
        // setModalTitle("Type");
        // setModalMessage("Please select Type(Common/Elective)");
        setErrorMessage("Please select Type(Common/Elective)");
        setErrorView(true);
        return;
      } else if (!values.print) {
        // setModalErrorOpen(true);
        // setModalTitle("Print Order");
        // setModalMessage("Please enter Print Order");
        setErrorMessage("Please enter Print Order");
        setErrorView(true);
        return;
      } else if (printOrder.includes(values.print)) {
        // setModalErrorOpen(true);
        // setModalTitle("Print Order");
        // setModalMessage("Print Order Already Exist");
        setErrorMessage("Print Order Already Exist");
        setErrorView(true);
        return;
      } else if (
        subjectArr.some((obj) => obj.subjectID === values.subject.subjectID)
      ) {
        // setModalErrorOpen(true);
        // setModalTitle("Subject");
        // setModalMessage("Subject allocation already added");
        setErrorMessage("Subject allocation already added");
        setErrorView(true);
        return;
      } else {
        obj = {
          subjectID: values.subject.subjectID,
          isMandatory: values.general.name === "Common" ? 1 : 0,
          printOrder: values.print,
        };
      }
    }
    // if (selectedSubject) {
    //   obj = {
    //     subjectID: values.subject.subjectID,
    //     isMandatory: values.general.name === "Common" ? 1 : 0,
    //     printOrder: values.print,
    //   };
    // }
    subjectArr.forEach((obj) => {
      delete obj.subjectName;
      delete obj.subjectgeneral;
      delete obj.subjectType;
    });

    // return; //return for testing
    try {
      setLoad(true);
      const assignSemesterSubjectRes = await academicApi.assignBatchSubject(
        formikRef.current.values.course.courseID,
        formikRef.current.values.semester.batchID,
        formikRef.current.values.semester.semester,
        selectedSubject ? [...subjectArr, obj] : subjectArr
      );
      console.log("assignSemesterSubjectRes---", assignSemesterSubjectRes);
      // return;
      if (assignSemesterSubjectRes.data.message.success) {
        toast.success(assignSemesterSubjectRes.data.message.message);
        setSubjectArr([]);
        handleShowAllocation(formikRef.current.values);
      } else {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage(assignSemesterSubjectRes.data.message.message);
      }
      setSelectedGeneral(null);
      setSelectedSubject(null);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const handleShowAllocation = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      console.log("values---", values);
      setSelectedGeneral(null);
      setSelectedSubject(null);
      setSubjectList([]);
      setOldSubjectArr([]);
      setSubjectArr([]);
      setPreviousSubject([]);

      const getSemesterSubjectRes = await academicApi.getallSubjectwithCourse(
        values.course.courseID,
        values.semester.batchID,
        values.semester.semester,
        values.semester.batch,
        values.semester.regulation
      );
      console.log("getSemesterSubjectRes---", getSemesterSubjectRes);
      setShowSubject(true);
      if (getSemesterSubjectRes.data.message.data) {
        if (getSemesterSubjectRes.data.message.data.fromPreviousBatch === 0) {
          setOldSubjectArr(getSemesterSubjectRes.data.message.data.subjects);
        } else {
          setPreviousSubject(getSemesterSubjectRes.data.message.data.subjects);
          // setSubjectArr(getSemesterSubjectRes.data.message.data.subjects);
        }
      }
      const getMasterSubjectRes = await academicApi.getAllSubjectsByRegulation(
        values.semester.regulation,
        collegeConfig.is_university ? values?.college?.collegeID : collegeId
      );
      console.log("getMasterSubjectRes---", getMasterSubjectRes);

      setSubjectList(getMasterSubjectRes.data.message.data.subjects);
      setShowSubject(true);
      setLoad(false);
      formikRef.current.setFieldTouched("course", false);
      formikRef.current.setFieldTouched("semester", false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleDeleteSubject = (item) => {
    const deleteExp = subjectArr.filter((m) => m !== item);
    setSubjectArr(deleteExp);
    setErrorView(false);
  };
  const handleDeletePrevSubject = (item) => {
    setErrorView(false);

    const deleteExp = previousSubject.filter((m) => m !== item);
    setPreviousSubject(deleteExp);
  };

  const getSemesterMaster = async (course) => {
    console.log("course---", course);
    formikRef.current.setFieldTouched("course", false);
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("subject", "");

    console.log("text---", course);
    setSemesterList([]);
    if (course) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "batch",
            course.courseID
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSemesterList(getMasterSubjectStaffRes.data.message.data.batch);
      } catch (error) {
        console.log("error", error);
        setLoad(false);
      }
    }
  };

  const handleSave = async (values, { resetForm }) => {
    setShowSubject(true);
    console.log("values checking---", values);
    setErrorView(false);

    if (!values.subject) {
      document.getElementById("subject").focus();
      setErrorMessage("Please select Subject");
      setErrorView(true);
      return;
    }

    if (!values.general) {
      document.getElementById("general").focus();
      setErrorMessage("Please select Subject Type");
      setErrorView(true);
      return;
    }

    if (!values.print) {
      document.getElementById("print").focus();
      setErrorMessage("Please enter Print Order");
      setErrorView(true);
      return;
    }

    console.log("subjectArr--", subjectArr);
    let subarr = subjectArr;
    const obj = {
      subjectID: values.subject.subjectID,
      subjectName: values.subject.subjectName,
      subjectgeneral: values.general.name,
      subjectType: values.subject.subjectType,
      isMandatory: values.general.name === "Common" ? 1 : 0,
      printOrder: values.print,
    };
    let err = false;
    let subjectArray = [...oldSubjectArr, ...previousSubject];

    for (let i = 0; i < subjectArray.length; i++) {
      console.log(
        subjectArray[i].printOrder,
        values.subject.subjectID,
        values.print,
        "checkingarray"
      );
      if (subjectArray[i].printOrder == values.print) {
        err = true;
        setErrorMessage("Print Order Already Exist");
        setErrorView(true);

        return;
      }
      if (subjectArray[i].subjectID == values.subject.subjectID) {
        err = true;
        setErrorMessage("Subject allocation already added");
        setErrorView(true);
        return;
      }
    }
    for (let i = 0; i < subarr.length; i++) {
      console.log(subarr[i].subjectID, values.subject.subjectID, "checking");
      if (subarr[i].subjectID == values.subject.subjectID) {
        err = true;
        // setModalErrorOpen(true);
        // setModalTitle("Subject");
        // setModalMessage("Subject allocation already added");
        setErrorMessage("Subject allocation already added");
        setErrorView(true);
        return;
      }
      if (subarr[i].printOrder == values.print) {
        err = true;
        // setModalErrorOpen(true);
        // setModalTitle("Subject");
        // setModalMessage("Print Order Already Exist");
        setErrorMessage("Print Order Already Exist");
        setErrorView(true);
        return;
      }
    }
    if (!err) {
      subarr.push(obj);
      console.log("subarr---", subarr);
      setSubjectArr(subarr);
      subjectFormikRef.current.setFieldValue("print", "");
      setSelectedGeneral(null);
      setSelectedSubject(null);
    }
    return;
  };

  const getCourseList = async (value) => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getCourseList(value);
      console.log(
        "getMasterSubjectStaffRes---",
        getMasterSubjectStaffRes,
        getMasterSubjectStaffRes.data.message.data.semester
      );
      if (!getMasterSubjectStaffRes.data.message.success) {
        setModalMessage(getMasterSubjectStaffRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getCourseList(collegeId);
    }
    document.getElementById("subject") &&
      document.getElementById("subject").setAttribute("maxlength", 20);
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
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
        <div className="row no-gutters">
          <ScreenTitle titleClass="page-heading-position-report" />
          {/* <div className="p-0 mb-2 text-right">
            <Button
              text={"Previous Load"}
              className={"btn-green"}
              type="button"
              frmButton={false}
              isTable={true}
              onClick={(e) => {
                handlepreviousAllocation();
              }}
            />
          </div> */}
        </div>
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: null,
              course: null,
              semester: null,
              regulation: null,
            }}
            validationSchema={FormSchema}
            onSubmit={handleShowAllocation}
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
                  <div className="row col-lg-12">
                    {collegeConfig.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        labelSize={3}
                        id="college"
                        mandatory={1}
                        style={{ width: "60%" }}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldTouched("college", false);
                          setFieldValue("course", "");
                          getCourseList(text.collegeID);
                          setUnSavedChanges(true);
                          setErrorView(false);
                          setSemesterList([]);
                          setFieldValue("semester", "");
                        }}
                      />
                    ) : null}
                    <SelectFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      tabIndex={2}
                      label={RENAME?.course}
                      labelSize={3}
                      id="course"
                      mandatory={1}
                      // maxlength={10}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      options={courseList}
                      style={{ width: "60%" }}
                      onChange={(text) => {
                        setShowSubject(false);
                        setFieldValue("course", text);
                        getSemesterMaster(text);
                        setErrorView(false);
                      }}
                    />

                    <>
                      <SelectFieldFormik
                        tabIndex={3}
                        label={RENAME?.sem}
                        id="semester"
                        mandatory={1}
                        maxlength={10}
                        labelSize={3}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        options={semesterList}
                        style={{ width: "25%" }}
                        onChange={(text) => {
                          console.log("text---", text);
                          setShowSubject(false);
                          setFieldValue("semester", text);
                          setErrorView(false);

                          text && text.regulation == null
                            ? setRegulationError(true)
                            : setRegulationError(false);
                        }}
                      />

                      <div className="col-lg-10 ms-4  text-center">
                        <ErrorMessage
                          Message={
                            "Please assign regulation for the given " +
                            RENAME?.sem +
                            " and " +
                            RENAME?.course
                          }
                          view={regulationError}
                        />
                      </div>
                      <>
                        <DisplayText
                          labelSize={3}
                          label="Regulation"
                          value={
                            values.semester ? values.semester?.regulation : "-"
                          }
                        />
                        <Button
                          tabIndex={5}
                          isTable={true}
                          text={"Show"}
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                        />
                      </>
                      {/* ) : null} */}
                    </>
                    {/* )} */}
                  </div>
                </form>
              );
            }}
          </Formik>
          {showSubject && (
            <Formik
              enableReinitialize={true}
              innerRef={subjectFormikRef}
              initialValues={{
                subject: selectedSubject,
                general: selectedGeneral,
                print: "",
              }}
              // validationSchema={SubjectFormSchema}
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
                    <>
                      <div className="subhead-row p-0">
                        <div className="subhead">
                          Subject Allocation Details
                        </div>
                        <div className="col line-div"></div>
                      </div>
                      <div className="row no-gutters mt-2">
                        <table className="table table-bordered" width={"100%"}>
                          <thead>
                            <tr>
                              <th>Subject</th>
                              <th width="20%">
                                Subject Type <br />
                                (Theory/Practical)
                              </th>
                              <th width="5%">
                                Type <br />
                                (Common/Elective)
                              </th>
                              <th width="1%">Print Order</th>
                              <th width="1%"></th>
                            </tr>
                          </thead>

                          <tbody>
                            {oldSubjectArr.map((item, index) => {
                              return (
                                <tr>
                                  <td>{item.subjectName}</td>
                                  <td>{item.subjectType}</td>
                                  <td>
                                    {item.isMandatory === 1
                                      ? "Common"
                                      : "Elective"}
                                  </td>
                                  <td>{item.printOrder}</td>
                                  <td></td>
                                </tr>
                              );
                            })}
                            {previousSubject.length > 0 &&
                              previousSubject.map((item, index) => {
                                let tabIndex = 7 + index;
                                finalTabIndex = tabIndex;
                                return (
                                  <tr>
                                    <td>{item.subjectName}</td>
                                    <td>{item.subjectType}</td>
                                    <td>
                                      {item.isMandatory === 1
                                        ? "Common"
                                        : "Elective"}
                                    </td>
                                    <td>
                                      <TextField
                                        id={`print${index}`}
                                        mandatory={1}
                                        maxlength={2}
                                        inputValue={item.printOrder}
                                        value={item.printOrder}
                                        tabIndex={tabIndex}
                                        onChange={(e) => {
                                          setErrorView(false);
                                          if (
                                            !isNaN(e.target.value) &&
                                            !e.target.value.includes(" ")
                                          ) {
                                            // check print order already exist

                                            item.printOrder = e.target.value;
                                            setPreviousSubject([
                                              ...previousSubject,
                                            ]);
                                            setUnSavedChanges(true);
                                          }
                                        }}
                                        onBlur={
                                          //check print order already exist current item is same remove value ,same index no check
                                          (e) => {
                                            setErrorView(false);

                                            console.log(
                                              "e.target.value---",
                                              e.target.value
                                            );
                                            let printOrder =
                                              previousSubject.map(
                                                (obj) => obj.printOrder
                                              );
                                            console.log(
                                              "printOrder---",
                                              printOrder
                                            );
                                            let index1 = printOrder.indexOf(
                                              e.target.value
                                            );
                                            console.log("index---", index);
                                            if (
                                              printOrder.includes(
                                                e.target.value
                                              ) &&
                                              index !== index1 &&
                                              e.target.value
                                            ) {
                                              // setModalErrorOpen(true);
                                              // setModalTitle("Print Order");
                                              // setModalMessage(
                                              //   "Print Order Already Exist"
                                              // );
                                              setErrorMessage(
                                                "Print Order Already Exist"
                                              );
                                              setErrorView(true);
                                              item.printOrder = "";
                                              return;
                                            }
                                          }
                                        }
                                      />
                                    </td>
                                    <td>
                                      <Button
                                        isTable={true}
                                        className="plus-button"
                                        type="button"
                                        text="-"
                                        onClick={() => {
                                          handleDeletePrevSubject(item);
                                        }}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}

                            {subjectArr.map((item, index) => {
                              return (
                                <tr>
                                  <td>{item.subjectName}</td>
                                  <td>{item.subjectType}</td>
                                  <td>
                                    {item.isMandatory === 1
                                      ? "Common"
                                      : "Elective"}
                                  </td>
                                  <td>{item.printOrder}</td>
                                  <td>
                                    <Button
                                      isTable={true}
                                      className="plus-button"
                                      type="button"
                                      text="-"
                                      onClick={() => {
                                        handleDeleteSubject(item);
                                      }}
                                    />
                                  </td>
                                </tr>
                              );
                            })}

                            <tr>
                              <td>
                                <SelectFieldFormik
                                  id="subject"
                                  placeholder="Subject"
                                  tabIndex={finalTabIndex + 1}
                                  mandatory={1}
                                  getOptionLabel={(option) =>
                                    option.subjectName
                                  }
                                  getOptionValue={(option) => option.subjectID}
                                  options={subjectList}
                                  searchIcon={false}
                                  onChange={(text) => {
                                    setFieldValue("subject", text);
                                    setSelectedSubject(text);
                                    setUnSavedChanges(true);
                                    setErrorView(false);
                                  }}
                                />
                              </td>
                              <td>
                                {selectedSubject
                                  ? selectedSubject.subjectType
                                  : "----"}
                              </td>
                              <td>
                                <SelectFieldFormik
                                  id="general"
                                  placeholder=" "
                                  mandatory={1}
                                  tabIndex={finalTabIndex + 2}
                                  style={{ width: "100%" }}
                                  getOptionLabel={(option) => option.name}
                                  getOptionValue={(option) => option.id}
                                  options={subjectgeneral}
                                  searchIcon={false}
                                  onChange={(text) => {
                                    setFieldValue("general", text);
                                    setSelectedGeneral(text);
                                    setUnSavedChanges(true);
                                    setErrorView(false);
                                  }}
                                />
                              </td>
                              <td>
                                <TextFieldFormik
                                  id="print"
                                  tabIndex={finalTabIndex + 3}
                                  mandatory={1}
                                  maxlength={2}
                                  onChange={(e) => {
                                    if (
                                      !isNaN(e.target.value) &&
                                      !e.target.value.includes(" ")
                                    ) {
                                      setFieldValue("print", e.target.value);
                                    }
                                    setErrorView(false);
                                  }}
                                />
                              </td>
                              <td>
                                <Button
                                  tabIndex={finalTabIndex + 4}
                                  isTable={true}
                                  className="plus-button"
                                  text="+"
                                  onClick={() => {
                                    preFunction.handleErrorFocus(errors);
                                  }}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <ErrorMessage Message={errorMessage} view={errorView} />
                      </div>
                      {showSubject && subjectList.length == 0 ? (
                        <div colSpan="10" className="text-center ">
                          No Subject found
                        </div>
                      ) : null}
                      {subjectArr.length > 0 || previousSubject.length > 0 ? (
                        <Button
                          tabIndex={finalTabIndex + 5}
                          text="F4 - Save"
                          id="save"
                          type="button"
                          isTable={true}
                          onClick={(e) => {
                            handleAllocate(values, [
                              ...subjectArr,
                              ...previousSubject,
                            ]);
                          }}
                        />
                      ) : null}
                    </>
                  </form>
                );
              }}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
}

export default BatchSubject;
