import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import moment from "moment";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";
import AcademicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import DateField from "../../component/FormFieldLibrary/DateField";
import ModalComponent from "../../component/ModalComponent";

import AuthContext from "../../auth/context";

function DateOfJoining() {
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [courseList, setCourseList] = useState([]);
  const [joiningDate, setJoiningDate] = useState("");
  const [joiningDateError, setJoiningDateError] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const [classList, setClassList] = useState([]);

  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);
  const { collegeId, collegeName } = useContext(AuthContext);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
    class:
      collegeConfig.institution_type == 1
        ? Yup.object().required("Please select " + RENAME?.sem)
        : Yup.mixed().notRequired(),
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

  const handleSave = async (values) => {
    if (load) return;
    console.log("values---->", values);
    if (
      joiningDate == "" ||
      joiningDate > moment().add(1, "months").format("YYYY-MM-DD") ||
      joiningDate < moment().subtract(1, "months").format("YYYY-MM-DD")
    ) {
      console.log("test");
      setJoiningDateError(true);
      document.getElementById("joiningDate").select();
      return;
    }
    let studentIdArr = [];
    const checkBoxes = document.querySelectorAll('input[type="checkbox"]');
    console.log("checkBoxes", checkBoxes);
    checkBoxes.forEach((checkBox) => {
      if (checkBox.id != "selectAll" && checkBox.checked) {
        studentIdArr.push(checkBox.value);
      }
    });
    if (studentIdArr.length == 0) {
      setModalMessage("Please select the student");
      setModalTitle("Select Student");
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }
    let studentIDsArray = studentIdArr.join(", ");
    console.log(
      "joinedString",
      studentIDsArray,
      moment(joiningDate).format("yyyy-MM-DD")
    );
    // return;

    try {
      setLoad(true);
      const dateJoiningRes = await StudentApi.courseDateOfJoining(
        studentIDsArray,
        joiningDate ? moment(joiningDate).format("yyyy-MM-DD") : null
      );
      console.log("dateJoiningRes---", dateJoiningRes);
      if (!dateJoiningRes.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(dateJoiningRes.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      } else {
        handleUnSavedChanges(0);
        toast.success(dateJoiningRes.data.message.message);
        setData([]);
        setJoiningDate("");
        if (collegeConfig.institution_type == 1) {
          values.class = "";
          document.getElementById("class")?.focus();
        } else {
          values.course = "";
          document.getElementById("course")?.focus();
        }
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
      console.log("values---", values);

      const dateOfJoining = await StudentApi.getDateOfJoining(
        collegeConfig.institution_type,
        collegeConfig.institution_type != 1 ? values.course.courseID : null,
        collegeConfig.institution_type == 1 ? values.class.semester : null
      );
      console.log("courseStudents-------", dateOfJoining);
      if (!dateOfJoining.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(dateOfJoining.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setData(dateOfJoining.data.message.data.student);
      if (dateOfJoining.data.message.data.student.length == 0) {
        setModalMessage(
          "No Students found in " + RENAME?.year + " 1 /" + RENAME?.sem + " 1"
        );
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      setLoad(false);
      console.log("error", error);
    }
  };

  const checkAll = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    if (document.getElementById("selectAll").checked) {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
    } else {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
    }
  };

  const getInitialList = async (collegeID) => {
    console.log("collegeID", collegeID);
    try {
      const masterList = await AcademicApi.getCourseList(collegeID);
      console.log("masterList", masterList);
      if (!masterList.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(masterList.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(masterList.data.message.data.course);
      if (masterList.data.message.data.course.length == 1) {
        formikRef.current.setFieldValue(
          "course",
          masterList.data.message.data.course[0]
        );
        getClassData(masterList.data.message.data.course[0]);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const getClassData = async (course) => {
    console.log("here---", course);
    const masterList = await StudentApi.getMaster(
      collegeConfig.institution_type == 1 ? 8 : 2,
      collegeId,
      course.courseID
    );
    console.log("masterList---", masterList);
    if (collegeConfig.institution_type !== 1) {
      setClassList(masterList.data.message.data.batch_data);
    } else {
      setClassList(masterList.data.message.data.semester_data);
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
              class: "",
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
                          // handleCourseData(text);
                          setFieldValue("course", "");
                          getInitialList(text.collegeID);
                          setData([]);
                        }}
                        style={{ width: "60%" }}
                      />
                    ) : null}
                    <SelectFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      label={RENAME.course}
                      labelSize={3}
                      id="course"
                      mandatory={1}
                      tabIndex={2}
                      options={courseList}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      onChange={(text) => {
                        setFieldValue("course", text);
                        getClassData(text);
                        setData([]);
                      }}
                      style={{ width: "70%" }}
                    />
                    {collegeConfig.institution_type === 1 ? (
                      <SelectFieldFormik
                        label={RENAME.sem}
                        labelSize={3}
                        id="class"
                        mandatory={1}
                        options={classList}
                        tabIndex={3}
                        style={{ width: "40%" }}
                        clear={false}
                        maxLength={10}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        onChange={(text) => {
                          setFieldValue("class", text);
                          handleUnSavedChanges(0);
                          setData([]);
                        }}
                      />
                    ) : null}
                    <Button
                      text="Show"
                      type="submit"
                      tabIndex={4}
                      onClick={() => preFunction.handleErrorFocus(errors)}
                    />

                    {data.length > 0 && values?.course ? (
                      <>
                        <div className="row no-gutters">
                          <div className="col-lg-10"></div>
                          <div className="col-lg-2">
                            <DateField
                              autoFocus
                              label="Joining Date"
                              id="joiningDate"
                              maxDate={moment().add(1, "months")}
                              minDate={moment().subtract(1, "months")}
                              mandatory={1}
                              value={joiningDate}
                              error={
                                joiningDateError
                                  ? "Please select Date from " +
                                    moment()
                                      .subtract(1, "months")
                                      .format("DD-MM-YYYY") +
                                    " to " +
                                    moment()
                                      .add(1, "months")
                                      .format("DD-MM-YYYY")
                                  : ""
                              }
                              touched={joiningDateError ? true : false}
                              onChange={(e) => {
                                setJoiningDate(e.target.value);
                                setJoiningDateError(false);
                                handleUnSavedChanges(1);
                              }}
                            />
                          </div>
                        </div>
                        <div className="row no-gutters">
                          <div className="subhead-row">
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
                                  <th width="10%">Date of Joining</th>
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
                                        {item.DOJ
                                          ? moment(item.DOJ).format(
                                              "DD-MM-YYYY"
                                            )
                                          : joiningDate
                                          ? moment(joiningDate).format(
                                              "DD-MM-yyyy"
                                            )
                                          : ""}
                                      </td>
                                      <td style={{ textAlign: "center" }}>
                                        <input
                                          type="checkbox"
                                          name="settle"
                                          id="settle"
                                          value={item.id}
                                          onChange={(e) => {
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
                          isTable={true}
                          text="F4 - Save"
                          id="save"
                          type="button"
                          onClick={() => {
                            handleSave(values);
                          }}
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

export default DateOfJoining;
