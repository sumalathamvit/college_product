import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import moment from "moment";
import { toast } from "react-toastify";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";

import { useSelector } from "react-redux";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import DateField from "../../component/FormFieldLibrary/DateField";
import ModalComponent from "../../component/ModalComponent";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import AuthContext from "../../auth/context";

function CourseCompletion() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [completionDate, setCompletionDate] = useState("");

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [completionDateError, setCompletionDateError] = useState(false);
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
  });

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleSaveCompletion = async (values) => {
    if (load) return;
    console.log("values---->", values);
    console.log("data---->", data);
    if (
      completionDate == "" ||
      completionDate > moment().format("YYYY-MM-DD") ||
      completionDate < moment().subtract(1, "months").format("YYYY-MM-DD")
    ) {
      console.log("test");
      setCompletionDateError(true);
      document.getElementById("completionDate").select();
      return;
    }

    let courseCompleteArr = [];
    let enrollNoArr = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].checked == 1) {
        courseCompleteArr.push(data[i].id);
        enrollNoArr.push(data[i].enrollNo);
      }
    }
    console.log("courseCompleteArr", courseCompleteArr);
    console.log("enrollArr", enrollNoArr);

    if (courseCompleteArr.length === 0) {
      setModalMessage("Select atleast one student to add completion date");
      setModalTitle("Select Student");
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }
    let studentIdArray = courseCompleteArr.join(", ");
    console.log("joinedString", studentIdArray);

    let enrollNumberString = enrollNoArr.join(", ");
    console.log("enrollNumberString", enrollNumberString);
    try {
      setLoad(true);
      const courseCompletion = await StudentApi.courseCompletion(
        completionDate ? moment(completionDate).format("yyyy-MM-DD") : null,
        studentIdArray,
        enrollNumberString
      );
      console.log("courseCompletion---", courseCompletion);
      if (!courseCompletion.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(courseCompletion.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      } else {
        handleUnSavedChanges(0);
        toast.success(courseCompletion.data.message.message);
        setData([]);
        setCompletionDate("");
        values.course = "";
      }

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleShow = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      setData([]);
      console.log(
        "values---",
        values,
        values.course.id,
        values.course.duration * 2
      );

      const getStudentListRes = await StudentApi.getCourseCompletion(
        values.course.id,
        values.course.duration * 2
      );
      console.log("getStudentListRes-------", getStudentListRes);
      if (!getStudentListRes.data.message.success) {
        setModalMessage(getStudentListRes.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      if (getStudentListRes.data.message.course_completion.length == 0) {
        setModalMessage("Final year batch not available in the course");
        setModalTitle("No Students found");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      for (
        let i = 0;
        i < getStudentListRes.data.message.course_completion.length;
        i++
      ) {
        getStudentListRes.data.message.course_completion[i].checked = 0;
      }
      console.log("getStudentListRes-------", getStudentListRes);
      setData(getStudentListRes.data.message.course_completion);
      setShowRes(true);
      document?.getElementById("completionDate")?.focus();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const checkAll = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    if (document.getElementById("selectAll").checked) {
      for (let i = 0; i < data.length; i++) {
        data[i].checked = 1;
      }
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
      console.log("test", data);
    } else {
      for (let i = 0; i < data.length; i++) {
        data[i].checked = 0;
      }
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
      console.log("test", data);
    }
  };

  const getInitialList = async (college_id) => {
    try {
      const masterList = await StudentApi.getMaster(5, college_id);
      console.log("masterList", masterList);
      if (!masterList.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(masterList.data.message.message);
        setModalTitle("Message");
        return;
      }
      setCourseList(masterList.data.message.data.course_data);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getInitialList(collegeId);
    }
  }, [collegeConfig.is_university]);

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
              college: "",
              course: "",
            }}
            validationSchema={FormSchema}
            onSubmit={handleShow}
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
                    {collegeConfig.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        labelSize={3}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          handleUnSavedChanges(1);
                          getInitialList(text?.collegeID);
                          setFieldValue("course", "");
                        }}
                        style={{ width: "60%" }}
                      />
                    ) : null}
                    <SelectFieldFormik
                      label={RENAME?.course}
                      labelSize={3}
                      id="course"
                      mandatory={1}
                      tabIndex={2}
                      options={courseList}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.id}
                      onChange={(text) => {
                        setShowRes(false);
                        setFieldValue("course", text);
                      }}
                      style={{ width: "70%" }}
                    />

                    <Button
                      text="Show"
                      type="submit"
                      tabIndex={3}
                      onClick={() => preFunction.handleErrorFocus(errors)}
                    />
                    {showRes && data.length > 0 && values?.course ? (
                      <>
                        <div className="row no-gutters col-lg-12 mt-3">
                          <div className="col-lg-10"></div>
                          <div className="col-lg-2">
                            <DateField
                              label="Completion Date"
                              // labelSize={4}
                              id="completionDate"
                              maxDate={new Date()}
                              minDate={new Date(moment().subtract(1, "months"))}
                              mandatory={1}
                              value={completionDate}
                              // style={{ width: "50%" }}
                              error={
                                completionDateError
                                  ? "please select valid Date"
                                  : ""
                              }
                              touched={completionDateError ? true : false}
                              onChange={(e) => {
                                setCompletionDate(e.target.value);
                                setCompletionDateError(false);
                                handleUnSavedChanges(1);
                              }}
                            />
                          </div>
                        </div>
                        <div className="row no-gutters">
                          <div
                            className="subhead-row"
                            style={{ marginTop: "0rem" }}
                          >
                            <div className="subhead">Student Details</div>
                            <div className="col line-div"></div>
                          </div>

                          <div className="table-responsive mt-2 p-0">
                            <table className="table table-bordered table-hover">
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="10%">Student No.</th>
                                  <th>Student Name</th>
                                  <th width="10%">Completion Date</th>
                                  <th
                                    width="5%"
                                    style={{ textAlign: "center" }}
                                  >
                                    <input
                                      type="checkbox"
                                      name="selectAll"
                                      id="selectAll"
                                      onClick={(e) => checkAll()}
                                    />
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{item.enrollNo}</td>
                                      <td>{item.name}</td>
                                      <td>
                                        {item.dateofCompletion
                                          ? moment(
                                              item.dateofCompletion
                                            ).format("DD-MM-YYYY")
                                          : completionDate
                                          ? moment(completionDate).format(
                                              "DD-MM-yyyy"
                                            )
                                          : ""}
                                      </td>
                                      <td style={{ textAlign: "center" }}>
                                        <input
                                          type="checkbox"
                                          name="settle"
                                          id="settle"
                                          checked={item.checked}
                                          onChange={(e) => {
                                            data[index].checked =
                                              data[index].checked == 1 ? 0 : 1;
                                            setData([...data]);
                                            handleUnSavedChanges(1);
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <Button
                          type="button"
                          isTable={true}
                          onClick={() => {
                            handleSaveCompletion(values);
                          }}
                          text="F4 - Save"
                          id="save"
                        />
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

export default CourseCompletion;
