import React, { useEffect, useState, useRef, useContext } from "react";
import { toast } from "react-toastify";
import { Formik } from "formik";
import * as Yup from "yup";

import StudentApi from "../api/StudentApi";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ReactSelectField from "../component/FormField/ReactSelectField";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import TextAreaFieldFormik from "../component/FormField/TextareaFieldFormik";
import FileField from "../component/FormField/FileField";

import StudentCard from "../component/StudentCard";
import ScreenTitle from "../component/common/ScreenTitle";
import { allowedFileExtensions } from "../component/common/CommonArray";
import ModalComponent from "../component/ModalComponent";
import CommonApi from "../component/common/CommonApi";
import { useSelector } from "react-redux";
import AuthContext from "../auth/context";
import string from "../string";

function Acknowledgement() {
  //#region const
  const RENAME = useSelector((state) => state.web.rename);
  const { collegeId } = useContext(AuthContext);
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [studentInfo, setStudentInfo] = useState();
  const [feeDueList, setFeeDueList] = useState([]);
  const [documentProof, setDocumentProof] = useState();
  const [categoryList, setCategoryList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [fileType, setFileType] = useState(null);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  //#endregion

  const admissionType = Yup.object().required("Please select Admission Type");
  const batch = Yup.object().required("Please select " + RENAME?.batch);
  const course = Yup.object().required("Please select " + RENAME?.course);

  const FormSchema = Yup.object().shape({
    category: Yup.object().required("Please select Category"),
    refDoc: Yup.string().required("Please choose Document Proof"),
    note: Yup.string().required("Please enter Note"),
    course: Yup.object().when("category", (values, schema) => {
      if (values[0]?.id == 7) {
        return course;
      }
      return schema;
    }),
    batch: Yup.object().when("category", (values, schema) => {
      if (values[0]?.id == 7) {
        return batch;
      }
      return schema;
    }),
    admissionType: Yup.object().when("category", (values, schema) => {
      if (values[0]?.id == 6) {
        return admissionType;
      }
      return schema;
    }),
  });

  const handleFileUpload = (e) => {
    console.log(e.target.files[0]);
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      setModalErrorOpen(true);
      setModalMessage("Please choose file size less than 2MB");
      setModalTitle("File Size");
      return false;
    }

    if (!allowedFileExtensions.includes(e.target.files[0].name.split(".")[1])) {
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      setModalErrorOpen(true);
      setModalTitle("File Type");
      return false;
    }
    setFileType(e.target.files[0].name.split(".")[1]);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setDocumentProof(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    return true;
  };

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    try {
      setLoad(true);
      const modifiedBy = sessionStorage.getItem("email");
      const response = await StudentApi.uploadFile(
        "ack",
        fileType,
        documentProof.split(",")[1]
      );
      console.log("response--", response);
      let proofUrl = response.data.message.data.file_url;
      console.log("proofUrl--------", proofUrl);

      console.log(
        "values--------",
        studentInfo.studentID,
        values.category.id,
        values.category.studentCategory,
        values.batch.id ?? null,
        values.course.id ?? null,
        values.admissionType.id ?? null,
        values.refundAmount ?? null,
        values.note,
        proofUrl,
        modifiedBy
      );

      const addStudentAcknowedgementRes =
        await StudentApi.studentAcknowledgement(
          studentInfo.studentID,
          values.category.id,
          values.category.studentCategory,
          values.batch ? values.batch.id : null,
          values.course ? values.course.id : null,
          values.admissionType ? values.admissionType.id : null,
          null,
          null,
          values.refundAmount ? values.refundAmount : null,
          values.note,
          proofUrl,
          modifiedBy
        );
      console.log("addStudentAck---", addStudentAcknowedgementRes);
      setLoad(false);
      console.log("message", addStudentAcknowedgementRes.data.message.success);
      if (!addStudentAcknowedgementRes.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(addStudentAcknowedgementRes.data.message.message);
        setModalTitle("Error");
        setLoad(false);
        return;
      } else {
        toast.success(addStudentAcknowedgementRes.data.message.message);
        resetForm();
        setStudentInfo();
      }
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelectStudent = async (value) => {
    try {
      setLoad(true);
      if (value) {
        const getStudentDetail =
          await StudentApi.getStudentFeeModificationDetail(
            collegeId,
            value.id,
            1
          );
        console.log("getStudentDetail--", getStudentDetail);
        // setStudentInfo(getStudentDetail.data.message.data.student[0]);
        setStudentInfo(value);
        setFeeDueList(getStudentDetail.data.message.data.fees_detail);
        setCategoryList(getStudentDetail.data.message.data.student_category);
        const masterList = await StudentApi.getMaster(2, "");
        console.log("MasterList", masterList);
        setCourseList(masterList.data.message.data.course_data);
        setBatchList(masterList.data.message.data.batch_data);
        setAdmissionTypeList(masterList.data.message.data.admission_type_data);
      } else {
        setStudentInfo();
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const setReactSelectMaxlength = () => {
    document.getElementById("student") &&
      document.getElementById("student").setAttribute("maxlength", 30);
    document.getElementById("category") &&
      document.getElementById("category").setAttribute("maxlength", 20);
  };

  useEffect(() => {
    setLoad(false);
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
              category: "",
              course: "",
              batch: "",
              admissionType: "",
              refundAmount: "",
              refDoc: "",
              note: "",
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
                <form
                  onSubmit={handleSubmit}
                  onLoad={setReactSelectMaxlength()}
                  autoComplete="off"
                >
                  <div className="row no-gutters mt-1">
                    <div className="row no-gutters">
                      <div className="col-lg-9">
                        <ReactSelectField
                          label={"Student No. / Name"}
                          inputId="student"
                          mandatory={1}
                          value={values.studentId}
                          placeholder="Student No. / Name"
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.id}
                          options={studentList}
                          style={{ width: "70%" }}
                          onInputChange={(text) => {
                            searchStudent(text);
                          }}
                          onChange={(text) => {
                            setFieldValue("studentId", text);
                            setFieldValue("category", "");
                            setFieldValue("refundAmount", "");
                            setFieldValue("refDoc", "");
                            setFieldValue("note", "");
                            handleSelectStudent(text);
                          }}
                        />
                      </div>
                      {studentInfo && (
                        <>
                          <div className="row no-gutters">
                            <div className="subhead-row">
                              <div className="subhead">Student Detail </div>
                              <div className="col line-div"></div>
                            </div>
                          </div>
                          <StudentCard studentInfo={studentInfo} />
                          {feeDueList?.length > 0 ? (
                            <>
                              <div className="row p-0">
                                <div className="row no-gutters">
                                  <div className="subhead-row">
                                    <div className="subhead">Fees Detail </div>
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
                            </>
                          ) : (
                            <div className="error-message">No Due Found</div>
                          )}
                          <div className="row no-gutters">
                            <div className="subhead-row">
                              <div className="subhead">
                                Authorization Detail
                              </div>
                              <div className="col line-div"></div>
                            </div>
                          </div>
                          <div className="col-lg-9">
                            <SelectFieldFormik
                              label="Acknowledge For"
                              id="category"
                              mandatory={1}
                              options={categoryList}
                              getOptionLabel={(option) =>
                                option.studentCategory
                              }
                              getOptionValue={(option) => option.id}
                              style={{ width: "60%" }}
                              searchIcon={false}
                              onChange={(text) => {
                                setFieldValue("category", text);
                              }}
                            />
                            {values.category && values.category.id == 7 ? (
                              <>
                                <SelectFieldFormik
                                  label={RENAME?.course}
                                  id="course"
                                  mandatory={1}
                                  options={courseList}
                                  getOptionLabel={(option) => option.courseName}
                                  getOptionValue={(option) => option.id}
                                  onChange={(text) => {
                                    setFieldValue("course", text);
                                  }}
                                />

                                <SelectFieldFormik
                                  label={RENAME?.batch}
                                  id="batch"
                                  mandatory={1}
                                  options={batchList}
                                  style={{ width: "60%" }}
                                  getOptionLabel={(option) => option.batch}
                                  getOptionValue={(option) => option.id}
                                  onChange={(text) =>
                                    setFieldValue("batch", text)
                                  }
                                />
                              </>
                            ) : null}
                            {values.category && values.category.id == 6 ? (
                              <SelectFieldFormik
                                label="Admission Type"
                                id="admissionType"
                                mandatory={1}
                                options={admissionTypeList}
                                style={{ width: "60%" }}
                                getOptionLabel={(option) =>
                                  option.admissionType
                                }
                                getOptionValue={(option) => option.id}
                                onChange={(text) =>
                                  setFieldValue("admissionType", text)
                                }
                              />
                            ) : null}

                            <TextFieldFormik
                              maxlength={7}
                              isAmount={true}
                              id="refundAmount"
                              label="Refund Amount"
                              style={{ width: "30%" }}
                              onChange={(e) => {
                                if (
                                  preFunction.amountValidation(e.target.value)
                                )
                                  setFieldValue("refundAmount", e.target.value);
                              }}
                            />
                            <FileField
                              label="Attach Letter"
                              type="file"
                              id="refDoc"
                              error={errors.refDoc}
                              touched={touched.refDoc}
                              name="refDoc"
                              style={{ width: "80%" }}
                              accept=".pdf, image/*"
                              onChange={(event) => {
                                if (handleFileUpload(event))
                                  setFieldValue(
                                    "refDoc",
                                    event.target.files[0]
                                  );
                                else setFieldValue("refDoc", null);
                              }}
                            />
                            <TextAreaFieldFormik
                              maxlength={140}
                              id={`note`}
                              name="note"
                              label="Note"
                              placeholder="Note"
                              style={{ width: "80%" }}
                              value={values.note}
                              mandatory={1}
                              onChange={(e) => {
                                setFieldValue("note", e.target.value);
                              }}
                            />
                          </div>
                          <Button
                            text="Save"
                            type="submit"
                            onClick={(e) => {
                              preFunction.handleErrorFocus(errors);
                            }}
                          />
                        </>
                      )}
                    </div>
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

export default Acknowledgement;
