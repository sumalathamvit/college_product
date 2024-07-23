import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import HeadingIcon from "@mui/icons-material/RecentActors";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";

import academicApi from "../../../api/AcademicApi";

import { Formik } from "formik";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import DisplayText from "../../../component/FormField/DisplayText";
import { useDispatch, useSelector } from "react-redux";
import { webSliceActions } from "../../../store/web";
import AuthContext from "../../../auth/context";
import ScreenTitle from "../../../component/common/ScreenTitle";

function TimeTableList() {
  const RENAME = useSelector((state) => state.web.rename);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const clientData = useSelector((state) => state.web.timeTableList);
  const clientShow = useSelector((state) => state.web.timeTableListShow);
  const clientDataBatch = useSelector((state) => state.web.timeTableListBatch);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const [data, setData] = useState(clientData.data ? clientData.data : []);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState(
    clientDataBatch ? clientDataBatch : []
  );
  const [showRes, setShowRes] = useState(clientShow);
  const [selectedCollege, setSelectedCollege] = useState(clientData.college);
  const [selectedCourse, setSelectedCourse] = useState(clientData.course);
  const [selectedBatch, setSelectedBatch] = useState(clientData.batch);

  const FormSchema = Yup.object().shape({
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required("Please select " + RENAME?.sem),
    // college: collegeConfig.is_university
    //   ? Yup.object().required("Please select College")
    //   : Yup.mixed().notRequired(),
  });

  const formikRef = useRef();

  const handleShow = async (values) => {
    if (load) return;
    console.log("values--->", values);
    try {
      setLoad(true);
      setShowRes(true);
      const getLeaveEntryListRes = await academicApi.getTimeTableList(
        values.batch.batchID,
        values.course.courseID,
        values.batch.semester
      );
      console.log("getLeaveEntryListRes---", getLeaveEntryListRes);
      setData(getLeaveEntryListRes.data.message.data.all_time_table);
      dispatch(
        webSliceActions.replaceTimeTableList({
          college: values.college,
          course: values.course,
          batch: values.batch,
          data: getLeaveEntryListRes.data.message.data.all_time_table,
        })
      );
      dispatch(webSliceActions.replaceTimeTableListShow(true));

      setLoad(false);
    } catch (error) {
      setLoad(false);
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
            collegeId,
            "batch",
            text.courseID,
            null,
            null
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setBatchList(getMasterSubjectStaffRes.data.message.data.batch);
        dispatch(
          webSliceActions.replaceTimeTableListBatch(
            getMasterSubjectStaffRes.data.message.data.batch
          )
        );
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    }
  };

  const getCourseList = async (value) => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getCourseList(value);
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getCourseList(collegeId);

    // if (!collegeConfig.is_university) {
    //   getCourseList(collegeId);
    // }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: selectedCollege ? selectedCollege : "",
              course: selectedCourse ? selectedCourse : "",
              batch: selectedBatch ? selectedBatch : "",
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
                  <div className="col-lg-9">
                    {/* {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("college", text);
                          setSelectedCollege(text);
                          getCourseList(text.collegeID);
                          setFieldValue("course", "");
                          setFieldValue("batch", "");
                          setFieldTouched("course", false);
                          setFieldTouched("batch", false);
                        }}
                      />
                    )} */}

                    <SelectFieldFormik
                      tabIndex={2}
                      // autoFocus={!collegeConfig.is_university}
                      autoFocus
                      label={RENAME?.course}
                      id="course"
                      mandatory={1}
                      options={courseList}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setShowRes(false);
                        setFieldValue("course", text);
                        getBatchMaster(text);
                        setSelectedCourse(text);
                      }}
                    />
                    <>
                      <SelectFieldFormik
                        tabIndex={3}
                        label={RENAME?.sem}
                        id="batch"
                        mandatory={1}
                        maxlength={10}
                        options={batchList}
                        getOptionLabel={(option) =>
                          collegeConfig.institution_type !== 1
                            ? option.batch
                            : option.className
                        }
                        getOptionValue={(option) => option.semester}
                        style={{ width: "50%" }}
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("batch", text);
                          setSelectedBatch(text);
                        }}
                      />
                      {collegeConfig.institution_type !== 1 ? (
                        <DisplayText
                          label={RENAME?.sem}
                          id="semester"
                          mandatory={1}
                          maxlength={2}
                          value={
                            values.batch.semester ? values.batch.semester : "-"
                          }
                          style={{ width: "30%" }}
                        />
                      ) : null}
                    </>
                  </div>

                  <Button
                    tabIndex={4}
                    text={"Show"}
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
        <div className="row no-gutters mt-3">
          {showRes ? (
            <div className="table-responsive">
              <table className="table table-hover table-bordered ">
                <thead>
                  <tr>
                    <th width="1%">No</th>
                    {/* <th>Course</th> 
                   <th width="10%">Batch</th>
                    <th width="5%">Semester</th> */}
                    <th>Section</th>
                    <th width="10%">Edit</th>
                    <th width="10%">View</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colspan={9} align="center">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          {/* <td className="nowrapWhiteSpace">
                            {item.courseName}
                          </td>
                          <td className="nowrapWhiteSpace">{item.batch}</td>
                          <td className="nowrapWhiteSpace">{item.semester}</td> */}
                          <td className="nowrapWhiteSpace">{item.section}</td>

                          <td className="nowrapWhiteSpace">
                            <Button
                              className={"btn-3"}
                              text={"Edit"}
                              isCenter={false}
                              isTable={true}
                              onClick={() =>
                                navigate("/timetable-upload", {
                                  state: {
                                    item: {
                                      ...item,

                                      className:
                                        formikRef?.current?.values?.batch
                                          .className,
                                    },
                                  },
                                })
                              }
                            />
                          </td>
                          <td className="nowrapWhiteSpace">
                            <Button
                              isTable={true}
                              className={"btn-3"}
                              text={"View"}
                              frmButton={false}
                              isCenter={false}
                              onClick={() => {
                                console.log(
                                  item,
                                  formikRef?.current?.values?.batch.className,
                                  "item"
                                );
                                navigate("/view-timetable", {
                                  state: {
                                    item: {
                                      ...item,
                                      className:
                                        formikRef?.current?.values?.batch
                                          .className,
                                    },
                                  },
                                });
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export default TimeTableList;
