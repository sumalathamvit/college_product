import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import HeadingIcon from "@mui/icons-material/School";
import { Formik } from "formik";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import academicApi from "../api/AcademicApi";
import DateRangeIcon from "@mui/icons-material/DateRange";
import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import TextField from "../component/FormField/TextField";
import DisplayText from "../component/FormField/DisplayText";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import ModalComponent from "../component/ModalComponent";
import AuthContext from "../auth/context";
import StudentApi from "../api/StudentApi";
import ScreenTitle from "../component/common/ScreenTitle";

function ExamFees() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [markError, setMarkError] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const formikRef = useRef();
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required("Please select " + RENAME?.batch),
    theory: Yup.number().required("Please enter Theory Fees"),
    practical: Yup.number().required("Please enter Practical Fees"),
  });

  const getInitialList = async () => {
    try {
      const getExamFeesDetail = await academicApi.getallExamFees();
      console.log("getAllfeesRes---", getExamFeesDetail);
      // return;
      if (getExamFeesDetail.data.message.data.exam_fees.length > 0)
        setData(getExamFeesDetail.data.message.data.exam_fees);
    } catch (error) {
      console.log(error);
    }
  };

  const getCourseList = async (collegeID) => {
    try {
      let getMasterRes;
      if (collegeConfig.institution_type === 1)
        getMasterRes = await StudentApi.getMaster(8, collegeID);
      else getMasterRes = await StudentApi.getMaster(2, collegeID);
      console.log("getMasterRes---", getMasterRes);
      if (getMasterRes.data.message.data.course_data.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          getMasterRes.data.message.data.course_data[0]
        );
      }
      setCourseList(getMasterRes.data.message.data.course_data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBatchMaster = async (text) => {
    console.log("text---", text);
    setBatchList([]);
    if (text) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.id
              : collegeId,
            "batch",
            text.id,
            null,
            null
          );
        console.log("List Response---", getMasterSubjectStaffRes);
        setBatchList(getMasterSubjectStaffRes.data.message.data.batch);
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    }
  };
  const handleAddTest = async (values, { resetForm }) => {
    if (load) return;
    console.log("values--->", values);

    try {
      setLoad(true);
      setData([]);
      // setShowRes(true);
      const getExamFeesDetail = await academicApi.getExamFeesReport(
        values.course.id,
        values.batch.batchID,
        values.theory ? values.theory : 0,
        values.practical ? values.practical : 0,
        values.project ? values.project : 0,
        values.others ? values.others : 0
      );
      console.log("Exam Fees Details---", getExamFeesDetail);
      if (getExamFeesDetail.data.message.success === true) {
        toast.success(getExamFeesDetail.data.message.message);
        getInitialList();
        setLoad(false);
        resetForm();
      } else {
        setModalTitle("Message");
        setModalMessage(getExamFeesDetail.data.message.message);
        setModalErrorOpen(true);

        getInitialList();
        setLoad(false);
        resetForm();
        return;
      }
    } catch (error) {
      console.log("error", error);
      setLoad(false);
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
        <div className="row no-gutters">
          <ScreenTitle titleClass="page-heading-position-report" />
          <div className="p-0 mt-2 text-right">
            <Button
              text={"Add Exam Fees"}
              className={"btn-green"}
              type="button"
              frmButton={false}
              isTable={true}
              onClick={(e) => {
                setOpenModal(true);
                if (!collegeConfig.is_university) {
                  getCourseList(collegeId);
                }
              }}
            />
          </div>
        </div>
        <div className="row no-gutters mt-1">
          <form autoComplete="off">
            {data.length > 0 ? (
              <div className="row">
                <div className="row no-gutters mt-3">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th>Department</th>
                        <th width="10%">Batch</th>
                        <th width="5%">Theory (र)</th>
                        <th width="5%">Practical (र)</th>
                        <th width="5%">Project Work (र)</th>
                        <th width="5%">Other Fees (र)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => {
                        return (
                          <tr>
                            <td>{index + 1}</td>
                            <td>{item.courseName}</td>

                            <td>{item.batch}</td>
                            <td class="text-right">{item.theory}</td>
                            <td class="text-right">{item.practical}</td>
                            <td class="text-right">{item.project}</td>
                            <td class="text-right">{item.otherFees}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="row no-gutters mt-3">
                <div className="card">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="1%">No</th>
                        <th>Department</th>
                        <th width="2%">Batch</th>
                        <th width="5%">Theory (र)</th>
                        <th width="5%">Practical (र)</th>
                        <th width="5%">Project Work (र)</th>
                        <th width="5%">Other Fees</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colspan={6} align="center">
                          No data found
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <Modal
              show={openModal}
              className="modal-dialog modal-lg"
              onEscapeKeyDown={() => setOpenModal(false)}
            >
              <Formik
                enableReinitialize={true}
                innerRef={formikRef}
                initialValues={{
                  college: "",
                  course: "",
                  batch: "",
                  theory: "",
                  practical: "",
                  project: "",
                  others: "",
                }}
                validationSchema={FormSchema}
                onSubmit={handleAddTest}
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
                      <Modal.Header>
                        <Modal.Title>Exam Fees</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <div className="row no-gutters p-3">
                          {collegeConfig.is_university ? (
                            <SelectFieldFormik
                              autoFocus
                              tabIndex={0}
                              labelSize={4}
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
                                getCourseList(text ? text.collegeID : null);
                              }}
                            />
                          ) : null}
                          <SelectFieldFormik
                            autoFocus={!collegeConfig.is_university}
                            tabIndex={1}
                            label={RENAME?.course}
                            labelSize={4}
                            id="course"
                            mandatory={1}
                            options={courseList}
                            getOptionLabel={(option) => option.courseName}
                            getOptionValue={(option) => option.id}
                            searchIcon={false}
                            clear={false}
                            onChange={(text) => {
                              setFieldValue("course", text);
                              setFieldValue("batch", "");
                              setFieldValue("section", "");
                              getBatchMaster(text);
                            }}
                          />
                          <SelectFieldFormik
                            tabIndex={2}
                            labelSize={4}
                            label={RENAME?.sem}
                            id="batch"
                            mandatory={1}
                            maxlength={10}
                            options={batchList}
                            getOptionLabel={(option) => option.className}
                            getOptionValue={(option) => option.semester}
                            style={{ width: "50%" }}
                            onChange={(text) => {
                              setFieldValue("batch", text);
                            }}
                          />
                          {/* {collegeConfig.institution_type !== 1 ? (
                            <DisplayText
                              labelSize={4}
                              label={RENAME?.year}
                              value={values.batch ? values.batch.year : "-"}
                            />
                          ) : null} */}
                          <div className="row no-gutters">
                            <TextFieldFormik
                              tabIndex={3}
                              labelSize={4}
                              id="theory"
                              label="Theory (Amount (₹)/Paper)"
                              mandatory={1}
                              maxlength={5}
                              style={{ width: "20%" }}
                              onChange={(e) => {
                                if (
                                  preFunction.amountValidation(e.target.value)
                                )
                                  setFieldValue("theory", e.target.value);
                              }}
                              placeholder="0"
                            />
                          </div>

                          <div className="row no-gutters">
                            <TextFieldFormik
                              tabIndex={4}
                              labelSize={4}
                              id="practical"
                              label="Practical (Amount (₹)/Paper)"
                              mandatory={1}
                              style={{ width: "20%" }}
                              onChange={(e) => {
                                if (
                                  preFunction.amountValidation(e.target.value)
                                )
                                  setFieldValue("practical", e.target.value);
                              }}
                              placeholder="0"
                            />
                          </div>
                          <TextFieldFormik
                            tabIndex={5}
                            labelSize={4}
                            id="project"
                            label="Project Work"
                            style={{ width: "20%" }}
                            onChange={(e) => {
                              if (preFunction.amountValidation(e.target.value))
                                setFieldValue("project", e.target.value);
                            }}
                            placeholder="0"
                          />
                          <TextFieldFormik
                            tabIndex={6}
                            id="others"
                            labelSize={4}
                            label="Other Fees"
                            style={{ width: "20%" }}
                            onChange={(e) => {
                              if (preFunction.amountValidation(e.target.value))
                                setFieldValue("others", e.target.value);
                            }}
                            placeholder="0"
                          />
                        </div>
                      </Modal.Body>
                      <Modal.Footer>
                        <div className="row ">
                          <div className="col-lg-6 d-flex justify-content-end">
                            <Button
                              type="Submit"
                              tabIndex={7}
                              isTable={true}
                              text="Add"
                              onClick={(e) => {
                                preFunction.handleErrorFocus(errors);
                              }}
                            />
                          </div>
                          <div className="col-lg-6 d-flex justify-content-start p-0">
                            <Button
                              tabIndex={8}
                              isTable={true}
                              text="Close"
                              type="button"
                              onClick={(e) => {
                                setOpenModal(false);
                                setFieldTouched(markError ? false : true);
                              }}
                            />
                          </div>
                        </div>
                      </Modal.Footer>
                    </form>
                  );
                }}
              </Formik>
            </Modal>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ExamFees;
