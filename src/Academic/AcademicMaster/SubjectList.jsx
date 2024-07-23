import React, { useEffect, useState, useRef, useContext } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Formik } from "formik";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";

import academicApi from "../../api/AcademicApi";
import { useNavigate } from "react-router";
import ModalComponent from "../../component/ModalComponent";
import { useSelector } from "react-redux";
import AuthContext from "../../auth/context";
import ScreenTitle from "../../component/common/ScreenTitle";

const SubjectFormSchema = Yup.object().shape({
  subject: Yup.object().required("Please select Subject"),
});

function SubjectList() {
  const [load, setLoad] = useState(false);
  const [subjectArr, setSubjectArr] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [oldSubjectArr, setOldSubjectArr] = useState([]);
  const [showSubjectError, setShowSubjectError] = useState(false);
  const [showSubject, setShowSubject] = useState(false);
  const [regulationList, setRegulationList] = useState([]);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);
  const navigate = useNavigate();

  const formikRef = useRef();
  const subjectFormikRef = useRef();

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    regulation: Yup.object().required("Please select Regulation"),
  });

  const handleAllocate = async (values) => {
    console.log("subjectArr---", subjectArr);
    if (subjectArr.length === 0) {
      setModalTitle("Subject ");
      setModalMessage("Please add atleast one Subject to Allocate");
      setModalErrorOpen(true);

      return;
    }
    try {
      setLoad(true);
      const assignBatchSubjectRes = await academicApi.assignBatchSubject(
        subjectArr
      );
      console.log("assignBatchSubjectRes---", assignBatchSubjectRes);
      if (assignBatchSubjectRes.data.message.success) {
        toast.success(assignBatchSubjectRes.data.message.message);
        setSubjectArr([]);
        handleShowAllocation(values);
      } else {
        setModalTitle("Message");
        setModalMessage(assignBatchSubjectRes.data.message.message);
        setModalErrorOpen(true);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const handleShowAllocation = async (values) => {
    try {
      setLoad(true);

      console.log("values---", values);
      setSubjectArr([]);

      const getBatchSubjectRes = await academicApi.getBatchSubject(
        values.course.courseID,
        values.batch.batchID,
        values.semester.semester
      );
      console.log("getBatchSubjectRes---", getBatchSubjectRes);
      setOldSubjectArr(getBatchSubjectRes.data.message.data);
      setShowSubject(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleDeleteSubject = (item) => {
    const deleteExp = subjectArr.filter((m) => m !== item);
    setSubjectArr(deleteExp);
  };

  const getSubjectMaster = async (values) => {
    console.log("regulation---", values);
    try {
      const getMasterSubjectRes = await academicApi.getAllSubjectsByRegulation(
        values.regulation.regulation,
        values.college ? values.college.collegeID : collegeId
      );
      console.log("getMasterSubjectRes---", getMasterSubjectRes);
      setSubjectList(getMasterSubjectRes.data.message.data.subjects);
      setShowSubject(true);
      formikRef.current.setFieldTouched("college", false);
      formikRef.current.setFieldTouched("regulation", false);
    } catch (error) {
      console.log(error);
    }
  };

  const getInitialList = async () => {
    try {
      const res = await academicApi.getAllColleges();
      console.log("response", res.data);
      const getAllRegulationRes = await academicApi.getAllRegulation();
      console.log("getAllRegulationRes---", getAllRegulationRes);
      setRegulationList(getAllRegulationRes.data.message.data.regulation);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (values, { resetForm }) => {
    setShowSubject(true);
    console.log("values---", values);
    setShowSubjectError(false);

    if (!values.subject) {
      setShowSubjectError(true);
      document.getElementById("subject").focus();
      return;
    }
    console.log("subjectArr--", subjectArr);
    let subarr = subjectArr;
    const obj = {
      subjectID: values.subject.subjectID,
      subjectName: values.subject.subjectName,
      courseID: formikRef.current.values.course.courseID,
      courseName: formikRef.current.values.course.courseName,
      batch: formikRef.current.values.batch.batch,
      batchID: formikRef.current.values.batch.batchID,
      semester: formikRef.current.values.semester.semester,
    };
    let err = false;
    for (let i = 0; i < subarr.length; i++) {
      if (
        subarr[i].subjectID == values.subject.subjectID &&
        subarr[i].courseID == formikRef.current.values.course.courseID &&
        subarr[i].batchID == formikRef.current.values.batch.batchID &&
        subarr[i].semester == formikRef.current.values.semester.semester
      ) {
        err = true;
        setModalTitle("Subject");
        setModalMessage("Subject allocation already added");
        setModalErrorOpen(true);
        return;
      }
    }
    if (!err) {
      subarr.push(obj);
      console.log("subarr---", subarr);
      setSubjectArr(subarr);
      resetForm();
    }
    return;
  };

  const setReactSelectMaxlength = () => {
    document.getElementById("course") &&
      document.getElementById("course").setAttribute("maxlength", 25);
    document.getElementById("batch") &&
      document.getElementById("batch").setAttribute("maxlength", 10);
    document.getElementById("semester") &&
      document.getElementById("semester").setAttribute("maxlength", 2);
    document.getElementById("regulation") &&
      document.getElementById("regulation").setAttribute("maxlength", 10);
    document.getElementById("subject") &&
      document.getElementById("subject").setAttribute("maxlength", 45);
  };

  useEffect(() => {
    getInitialList();
    setReactSelectMaxlength();
    document.getElementById("subject") &&
      document.getElementById("subject").setAttribute("maxlength", 20);
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
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: "",
              regulation: "",
            }}
            validationSchema={FormSchema}
            onSubmit={getSubjectMaster}
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
                <form
                  onSubmit={handleSubmit}
                  onLoad={setReactSelectMaxlength()}
                  autoComplete="off"
                >
                  <div className="col-lg-8">
                    {collegeConfig.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        id="college"
                        mandatory={1}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldTouched("college", false);
                          setFieldValue("regulation", "");
                        }}
                      />
                    ) : null}
                    <SelectFieldFormik
                      tabIndex={2}
                      label="Regulation"
                      id="regulation"
                      mandatory={1}
                      style={{ width: "50%" }}
                      getOptionLabel={(option) => option.regulation}
                      getOptionValue={(option) => option.regulation}
                      options={regulationList}
                      onChange={(text) => {
                        setShowSubject(false);
                        setFieldValue("regulation", text);
                      }}
                    />
                  </div>
                  <div class="mt-4">
                    <Button
                      tabIndex={3}
                      isTable={true}
                      text={"Show"}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                      }}
                    />
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
                subject: null,
              }}
              validationSchema={SubjectFormSchema}
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
                  <form
                    onSubmit={handleSubmit}
                    onLoad={setReactSelectMaxlength()}
                    autoComplete="off"
                  >
                    <>
                      <div className="subhead-row p-0">
                        <div className="subhead">Subject List</div>
                        <div className="col line-div"></div>
                      </div>
                      <div className="p-0 mb-2 text-right">
                        <Button
                          text={"Add Subject"}
                          className={"btn-green"}
                          frmButton={false}
                          type="button"
                          isTable={true}
                          onClick={(e) => {
                            navigate("/add-subject");
                          }}
                        />
                      </div>

                      <div className="row no-gutters mt-2">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              {/* <th width="1%">No.</th> */}
                              <th width="15%">Subject Type</th>
                              <th>Subject</th>
                              <th width="1%">
                                {collegeConfig.institution_type !== 1
                                  ? "Univ. Max Mark"
                                  : "Max Mark"}
                              </th>

                              <th width="1%">
                                {collegeConfig.institution_type !== 1
                                  ? "Univ. Min Mark"
                                  : "Min Mark"}
                              </th>
                              {collegeConfig.institution_type !== 1 ? (
                                <th width="1%">Credit Points</th>
                              ) : null}
                            </tr>
                          </thead>

                          <tbody>
                            {subjectList.length == 0 ? (
                              <tr>
                                <td colspan={9} align="center">
                                  No data found
                                </td>
                              </tr>
                            ) : (
                              subjectList.map((item, index) => {
                                return (
                                  <tr>
                                    {/* <td>{index + 1}</td> */}
                                    <td>{item.subjectType}</td>
                                    <td>{item.subjectName}</td>
                                    <td class="text-center">{item.maxMark}</td>
                                    <td class="text-center">{item.minMark}</td>
                                    {collegeConfig.institution_type !== 1 ? (
                                      <td class="text-center">
                                        {item.creditPoint}
                                      </td>
                                    ) : null}
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
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

export default SubjectList;
