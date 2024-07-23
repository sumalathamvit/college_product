import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";

import AuthContext from "../../auth/context";

import string from "../../string";

function FeeStructureList() {
  const navigate = useNavigate();
  const location = useLocation();
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [message, setMessage] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const collegeConfig = useSelector((state) => state?.web?.college);
  const { collegeId, collegeName } = useContext(AuthContext);
  const RENAME = useSelector((state) => state?.web?.rename);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.object().nullable(),
    course: Yup.object().required("Please select " + RENAME?.course),
    batch:
      collegeConfig.institution_type !== 1
        ? Yup.object().required("Please select  " + RENAME?.batch)
        : Yup.object().nullable(),
  });

  const getfeestructureList = async (values, showAll = 0) => {
    if (load) return;
    console.log("values--", values);
    try {
      setMessage(false);
      setShowRes(true);
      setLoad(true);
      setData([]);
      const allFeesStructures = await StudentApi.allFeesStructures(
        collegeConfig?.institution_type,
        values?.batch?.batchID ?? null,
        values?.batch?.semester ?? null,
        values?.course?.id ?? null,
        showAll
      );
      console.log("allFeesStructures---", allFeesStructures);
      if (!allFeesStructures?.data?.message?.success) {
        setModalMessage(allFeesStructures?.data?.message?.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      if (allFeesStructures?.data?.message?.data?.feesStructures.length > 0) {
        if (showAll) {
          setData(allFeesStructures?.data?.message?.data?.feesStructures);
          setShowAll(false);
        } else {
          setData(allFeesStructures?.data?.message?.data?.feesStructures);
          if (
            allFeesStructures?.data?.message?.data?.feesStructures.length >=
            string.PAGE_LIMIT
          )
            setShowAll(true);
        }
      } else {
        setData([]);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getFeesStructureDetails = async () => {
    try {
      setData([]);
      if (location?.state && location?.state?.id) {
        console.log("Location----", location?.state);
        setShowRes(true);
        setData([]);
        console.log("location.state---", location?.state);
        const getFeesStructures = await StudentApi.allFeesStructures(
          collegeConfig?.institution_type,
          location?.state?.batchID,
          location?.state?.semester,
          location?.state?.courseID
        );
        console.log("getFeesStructures---", getFeesStructures);
        if (!getFeesStructures?.data?.message?.success) {
          setModalMessage(getFeesStructures?.data?.message?.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        setData(getFeesStructures?.data?.message?.data?.feesStructures);
      }
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleCourse = async (values, course) => {
    formikRef.current.setFieldValue("batch", null);
    if (values) {
      let batchRes;
      if (collegeConfig.institution_type === 1) {
        batchRes = await StudentApi.getMaster(
          8,
          collegeConfig.is_university ? values.collegeID : collegeId,
          course.id
        );
        setBatchList(batchRes.data.message.data.semester_data);
      } else {
        batchRes = await StudentApi.getMaster(
          5,
          collegeConfig.is_university ? values.collegeID : collegeId,
          course.id
        );
        setBatchList(batchRes.data.message.data.batch_data);
      }
      console.log("batchRes----", batchRes);
    }
  };

  const getMasterList = async (college_id) => {
    try {
      let masterList;
      if (collegeConfig.institution_type === 1) {
        masterList = await StudentApi.getMaster(8, college_id);
      } else {
        masterList = await StudentApi.getMaster(5, college_id);
      }
      console.log("masterList", masterList);
      if (!masterList?.data?.message?.success) {
        setModalMessage(masterList?.data?.message?.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(masterList?.data?.message?.data?.course_data);

      if (masterList?.data?.message?.data?.course_data.length === 1) {
        formikRef?.current?.setFieldValue(
          "course",
          masterList?.data?.message?.data?.course_data[0]
        );
        handleCourse(
          formikRef.current.values,
          masterList?.data?.message?.data?.course_data[0]
        );
      }
      if (location?.state && location?.state?.id) {
        location?.state?.courseID &&
          formikRef?.current?.setFieldValue("course", {
            id: location?.state?.courseID,
            courseName: location?.state?.courseName,
          });
        if (collegeConfig?.institution_type === 1) {
          location?.state?.className &&
            formikRef.current.setFieldValue("batch", {
              semester: location?.state?.semester,
              className: location?.state?.className,
            });
        } else {
          location?.state?.batchID &&
            formikRef?.current?.setFieldValue("batch", {
              batchID: location?.state?.batchID,
              batch: location?.state?.batch,
              batchYear: location?.state?.batchYear,
            });
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  useEffect(() => {
    getFeesStructureDetails();
    if (!collegeConfig?.is_university) {
      getMasterList(collegeId);
    }
  }, [collegeConfig?.is_university]);

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
        <div className="row no-gutters mt-2">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: "",
              course: "",
              batch: null,
            }}
            validationSchema={FormSchema}
            onSubmit={getfeestructureList}
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
                  <div className="row no-gutters mb-1">
                    <div className="col-lg-2"></div>
                    <div className="col-lg-8 border p-3">
                      {collegeConfig?.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={0}
                          labelSize={2}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig?.collegeList}
                          getOptionLabel={(option) => option?.collegeName}
                          getOptionValue={(option) => option?.collegeID}
                          style={{ width: "80%" }}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            setFieldValue("course", null);
                            setFieldValue("batch", null);
                            getMasterList(text?.collegeID);
                          }}
                        />
                      ) : null}
                      <SelectFieldFormik
                        autoFocus={collegeConfig?.is_university ? false : true}
                        label={RENAME?.course}
                        labelSize={2}
                        tabIndex={1}
                        maxlength={40}
                        mandatory={1}
                        id="course"
                        matchFrom="start"
                        searchIcon={false}
                        options={courseList}
                        getOptionLabel={(option) => option?.courseName}
                        getOptionValue={(option) => option?.id}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setFieldValue("batch", "");
                          setShowRes(false);
                          handleCourse(values, text);
                        }}
                      />
                      {collegeConfig?.institution_type === 1 ? (
                        <SelectFieldFormik
                          label={RENAME?.sem}
                          labelSize={2}
                          id="batch"
                          tabIndex={2}
                          maxlength={10}
                          clear={true}
                          searchIcon={false}
                          options={batchList}
                          getOptionLabel={(option) => option?.className}
                          getOptionValue={(option) => option?.semester}
                          onChange={(text) => {
                            setFieldValue("batch", text);
                            setShowRes(false);
                          }}
                          error={message ? "Please select " + RENAME?.sem : ""}
                          style={{ width: "45%" }}
                        />
                      ) : (
                        <SelectFieldFormik
                          label={RENAME?.batch}
                          placeholder={" "}
                          labelSize={2}
                          id="batch"
                          tabIndex={2}
                          mandatory={1}
                          maxlength={10}
                          clear={false}
                          searchIcon={false}
                          options={batchList}
                          getOptionLabel={(option) => option?.batch}
                          getOptionValue={(option) => option?.batchID}
                          onChange={(text) => {
                            setFieldValue("batch", text);
                            setShowRes(false);
                          }}
                          error={
                            message ? "Please select " + RENAME?.batch : ""
                          }
                          style={{ width: "30%" }}
                        />
                      )}
                    </div>
                    <Button
                      text="Show"
                      tabIndex={3}
                      onClick={() => preFunction.handleErrorFocus(errors)}
                    />
                  </div>

                  {showRes ? (
                    <>
                      <div className="row no-gutters mt-4">
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover ">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th>{RENAME?.course}</th>
                                <th width="15%">{RENAME?.sem}</th>
                                <th width="15%">Admission Type</th>
                                <th width="5%">View</th>
                              </tr>
                            </thead>
                            {data?.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td colSpan={10} align="center">
                                    No records found
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {data?.map((item, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item?.courseName}</td>
                                    <td>{item?.className}</td>
                                    <td>{item?.admissionType}</td>
                                    <td>
                                      <Button
                                        isTable={true}
                                        className="btn-3"
                                        title="View"
                                        onClick={() => {
                                          console.log("-----------------", {
                                            id: item?.id,
                                            courseName:
                                              values?.course?.courseName,
                                            courseID: values?.course?.id,
                                            batch: values?.batch?.batch,
                                            batchID: values?.batch?.batchID,
                                            batchYear: values?.batch?.batchYear,
                                            semester: values?.batch?.semester,
                                            className: values?.batch?.className,
                                          });
                                          navigate("/view-fee-structure", {
                                            state: {
                                              id: item?.id,
                                              courseName:
                                                values?.course?.courseName,
                                              courseID: values?.course?.id,
                                              batch: values?.batch?.batch,
                                              batchID: values?.batch?.batchID,
                                              batchYear:
                                                values?.batch?.batchYear,
                                              semester: values?.batch?.semester,
                                              className:
                                                values?.batch?.className,
                                            },
                                          });
                                        }}
                                        text="View"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            )}
                          </table>
                          {showAll && (
                            <div className="row text-right">
                              <Button
                                text="ShowAll"
                                type="button"
                                isTable={true}
                                onClick={(e) => getfeestructureList(1)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : null}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default FeeStructureList;
