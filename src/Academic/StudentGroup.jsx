import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import DateRangeIcon from "@mui/icons-material/DateRange";
import moment from "moment";
import { toast } from "react-toastify";
import { Formik } from "formik";

import academicApi from "../api/AcademicApi";

import Button from "../component/FormField/Button";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import DisplayText from "../component/FormField/DisplayText";
import ModalComponent from "../component/ModalComponent";
import ScreenTitle from "../component/common/ScreenTitle";
import { useSelector } from "react-redux";
import AuthContext from "../auth/context";

function StudentGroup() {
  const RENAME = useSelector((state) => state.web.rename);
  const { collegeId } = useContext(AuthContext);
  const formikRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [semester, setSemester] = useState("");
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [subjectList, setSubjectList] = useState([]);

  const FormSchema = Yup.object().shape({
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required("Please select " + RENAME?.batch),
    section: Yup.object().required("Please select " + RENAME?.section),
    subject: Yup.object().required("Please select Subject"),
    groupName: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .matches(/^[A-Za-z0-9@. ]+$/, "Please enter valid Group Name")
      .required("Please enter Group Name")
      .trim(),
    toDate: Yup.date().required("Please select To Date"),
  });

  const handleSave = async (values) => {
    if (load) return;
    console.log("values--->", values);
    try {
      setLoad(true);
      const createStudentGroupRes = await academicApi.createStudentGroup(
        values.groupName,
        values.section.classID,
        values.subject.subjectID,
        moment(values.toDate).format("YYYY-MM-DD")
      );
      console.log("createStudentGroupRes--->", createStudentGroupRes);
      if (createStudentGroupRes.data.message.success == false) {
        setModalTitle("Message");
        setModalMessage(createStudentGroupRes.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      toast.success(createStudentGroupRes.data.message.message);
      values.groupName = "";
      values.subject = "";
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getSectionMaster = async (course, batch, semester) => {
    console.log("batch-semester---", course, batch, semester);
    setSectionList([]);
    if (batch && semester) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "subject",
            course,
            batch,
            semester,
            0
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSectionList(getMasterSubjectStaffRes.data.message.data.section);
        setSubjectList(getMasterSubjectStaffRes.data.message.data.subject);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getBatchMaster = async (text) => {
    console.log("text---", text);
    setBatchList([]);
    if (text) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "batch",
            text.courseID,
            null,
            null,
            null
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setBatchList(getMasterSubjectStaffRes.data.message.data.batch);
        // setSemesterList(getMasterSubjectStaffRes.data.message.data.semester);
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    }
  };

  const getInitialList = async () => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeId,
        "course",
        1
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      setLoad(false);
      console.log(error);
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
        <ScreenTitle titleClass="page-heading-position" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              course: "",
              batch: "",
              section: "",
              semester: "",
              subject: "",
              groupName: "",
              toDate: "",
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
                  <div className="col-lg-12">
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={1}
                      label={RENAME?.course}
                      id="course"
                      mandatory={1}
                      options={courseList}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      style={{ width: "70%" }}
                      labelSize={3}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setFieldValue("course", text);
                        getBatchMaster(text);
                        getSectionMaster(
                          text.courseID,
                          values.batch.batchID,
                          values.batch.semester
                        );
                      }}
                    />

                    {values.course ? (
                      <>
                        <SelectFieldFormik
                          tabIndex={2}
                          label={RENAME?.batch}
                          id="batch"
                          mandatory={1}
                          options={batchList}
                          getOptionLabel={(option) => option.batch}
                          getOptionValue={(option) => option.batchID}
                          style={{ width: "50%" }}
                          labelSize={3}
                          clear={false}
                          search={false}
                          onChange={(text) => {
                            setFieldValue("batch", text);
                            setSemester(text?.semester);
                            getSectionMaster(
                              values.course.courseID,
                              text.batchID,
                              text.semester
                            );
                          }}
                        />

                        {values.batch ? (
                          <>
                            <DisplayText
                              labelSize={3}
                              label={RENAME?.sem}
                              value={semester ? semester : "-"}
                            />

                            <SelectFieldFormik
                              tabIndex={3}
                              label={RENAME?.section}
                              id="section"
                              mandatory={1}
                              options={sectionList}
                              getOptionLabel={(option) => option.section}
                              getOptionValue={(option) => option.classID}
                              style={{ width: "30%" }}
                              labelSize={3}
                              search={false}
                              clear={false}
                              onChange={(text) => {
                                setFieldValue("section", text);
                              }}
                            />
                            <SelectFieldFormik
                              tabIndex={4}
                              label="Subject"
                              id="subject"
                              mandatory={1}
                              options={subjectList}
                              getOptionLabel={(option) => option.subjectName}
                              getOptionValue={(option) => option.subjectID}
                              // style={{ width: "70%" }}
                              labelSize={3}
                              search={false}
                              clear={false}
                              onChange={(text) => {
                                setFieldValue("subject", text);
                              }}
                            />
                          </>
                        ) : null}
                        <TextFieldFormik
                          tabIndex={5}
                          id="groupName"
                          label="Group Name"
                          onChange={handleChange}
                          style={{ width: "70%" }}
                          labelSize={3}
                          maxlength={120}
                          mandatory={1}
                        />
                        <DateFieldFormik
                          tabIndex={6}
                          label="To Date"
                          id="toDate"
                          maxDate={new Date(moment().add(10, "years"))}
                          minDate={new Date()}
                          style={{ width: "40%" }}
                          labelSize={3}
                          onChange={(e) => {
                            setFieldValue("toDate", e.target.value);
                          }}
                        />
                      </>
                    ) : null}
                  </div>
                  <Button
                    tabIndex={7}
                    id="save"
                    text="F4 - Save"
                    type="submit"
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default StudentGroup;
