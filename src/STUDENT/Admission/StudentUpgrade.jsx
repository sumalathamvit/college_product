import React, { useEffect, useRef, useState, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import moment from "moment";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";

import AuthContext from "../../auth/context";

function StudentUpgrade() {
  const [load, setLoad] = useState(false);

  const [showRes, setShowRes] = useState(false);
  const [semester, setSemester] = useState("");
  const [duration, setDuration] = useState("");
  const [updateSemester, setUpdateSemester] = useState("");

  const [data, setData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  const updateSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required("Please select semester"),
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

  const formikRef = useRef();

  const handleShow = async (values) => {
    if (load) return;
    console.log("Values----", values);

    try {
      setLoad(true);

      const studentRes = await StudentApi.getUpdateStudentPromotion(
        values.batch.batchID,
        values.course.id,
        values.course.duration,
        null,
        null,
        null
      );
      console.log("StudentRes----", studentRes);

      if (!studentRes.data.message.success) {
        setModalMessage(studentRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      if (studentRes.data.message.data.student.length > 0) {
        if (studentRes.data.message.data.student[0].semester === duration) {
          setModalMessage("Students were already in last semester");
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        } else {
          handleUnSavedChanges(0);
          setUpdateSemester(
            studentRes.data.message.data.student[0].semester + 1
          );
          setShowRes(true);
          setData(studentRes.data.message.data.student);
          setSemester(studentRes.data.message.data.student[0].semester);
        }
        document.getElementById("reOpenDate")?.focus();
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleUpgrade = async (values) => {
    if (load) return;
    console.log("Values----", values);

    try {
      if (values.reOpenDate === null || values.reOpenDate === "") {
        formikRef.current.setErrors({
          reOpenDate: "Please select Re-Open Date",
        });
        document.getElementById("reOpenDate")?.focus();
        return;
      }
      setLoad(true);

      const studentUpdateRes = await StudentApi.getUpdateStudentPromotion(
        values.batch.batchID,
        values.course.id,
        values.course.duration,
        values.course.feesPattern,
        updateSemester,
        moment(values.reOpenDate).format("yyyy-MM-DD")
      );
      console.log("studentUpdateRes----", studentUpdateRes);

      if (!studentUpdateRes.data.message.success) {
        setModalMessage(studentUpdateRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      toast.success(studentUpdateRes.data.message.message);
      setShowRes(false);
      setData([]);
      formikRef.current.setFieldValue("batch", "");
      formikRef.current.setFieldValue("course", "");
      formikRef.current.setFieldValue("reOpenDate", null);
      setSemester("");
      setDuration("");
      setUpdateSemester("");

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getCourseList = async (value) => {
    try {
      const masterList = await StudentApi.getMaster(2, value);
      console.log("masterList---", masterList);
      if (!masterList.data.message.success) {
        setModalMessage(masterList.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(masterList.data.message.data.course_data);
      // setBatchList(masterList.data.message.data.batch_data);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getBatch = async (value, course) => {
    try {
      formikRef.current.setFieldValue("reOpenDate", null);
      formikRef.current.setFieldValue("batch", "");
      setDuration(course.duration * 2);
      const masterList = await StudentApi.getMaster(2, value, course);
      console.log("masterList---", masterList);
      if (!masterList.data.message.success) {
        setModalMessage(masterList.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setBatchList(masterList.data.message.data.batch_data);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getCourseList(collegeId);
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
        <div className="row no-gutters mt-3">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: "",
              batch: "",
              course: "",
              reOpenDate: "",
            }}
            validationSchema={updateSchema}
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
                    <div className="col-lg-9">
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={0}
                          labelSize={2}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          style={{ width: "80%" }}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            setFieldValue("course", null);
                            setFieldValue("batch", null);
                            getCourseList(text?.collegeID);
                          }}
                        />
                      ) : null}
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        label={RENAME?.course}
                        labelSize={2}
                        id="course"
                        tabIndex="1"
                        options={courseList}
                        mandatory={1}
                        matchFrom="start"
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        style={{ width: "80%" }}
                        maxlength="40"
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setData([]);
                          setShowRes(false);
                          getBatch(values.college.collegeID, text?.id);
                        }}
                      />
                      <SelectFieldFormik
                        label={RENAME?.sem}
                        labelSize={2}
                        id="batch"
                        tabIndex="2"
                        options={batchList}
                        matchFrom="start"
                        maxlength="10"
                        getOptionLabel={(option) => option.semester}
                        getOptionValue={(option) => option.batchID}
                        mandatory={1}
                        style={{ width: "20%" }}
                        onChange={(text) => {
                          setFieldValue("reOpenDate", null);
                          setFieldValue("batch", text);
                          setData([]);
                          setShowRes(false);
                        }}
                      />
                      <DisplayText
                        label={RENAME?.batch}
                        labelSize={2}
                        value={values?.batch?.batch ?? "-"}
                      />
                    </div>
                  </div>

                  <Button
                    text="Show"
                    type="submit"
                    tabIndex="3"
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />
                  {showRes && (
                    <>
                      <div className="subhead-row">
                        <div className="subhead">Semester Detail </div>
                        <div className="col line-div"></div>
                      </div>
                      <div className="col-lg-9">
                        <DisplayText
                          label={"Current" + RENAME?.sem}
                          labelSize={2}
                          value={semester}
                        />
                        <DisplayText
                          label="Upgrade to"
                          labelSize={2}
                          value={updateSemester}
                        />

                        <DateFieldFormik
                          autoFocus
                          label="Re-Open Date"
                          labelSize={2}
                          tabIndex="3"
                          id="reOpenDate"
                          maxDate={new Date(moment().add(2, "months"))}
                          minDate={new Date()}
                          style={{ width: "20%" }}
                          onChange={(e) => {
                            setFieldValue("reOpenDate", e.target.value);
                            handleUnSavedChanges(1);
                          }}
                        />
                      </div>
                      <div className="subhead-row">
                        <div className="subhead">Student Detail </div>
                        <div className="col line-div"></div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3"></div>
                        <div className="col-lg-6">
                          {data.length > 0 && (
                            <>
                              <div className="table-responsive p-0">
                                <table className="table table-bordered table-hover">
                                  <thead>
                                    <tr>
                                      <th width="5%">No.</th>
                                      <th width="30%">Student No.</th>
                                      <th>Student Name</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {data.map((item, index) => {
                                      return (
                                        <tr>
                                          <td>{index + 1}</td>
                                          <td>{item.enrollNo}</td>
                                          <td>{item.name}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="col-lg-3"></div>
                      </div>
                      <Button
                        type="button"
                        text="F4 - Save"
                        tabIndex="4"
                        onClick={(e) => {
                          handleUpgrade(values);
                        }}
                        id="save"
                      />
                    </>
                  )}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default StudentUpgrade;
