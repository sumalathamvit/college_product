import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import HeadingIcon from "@mui/icons-material/School";
import { Formik } from "formik";

import academicApi from "../../../api/AcademicApi";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import Spinner from "../../../component/Spinner";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import { useDispatch, useSelector } from "react-redux";
import { webSliceActions } from "../../../store/web";
import ScreenTitle from "../../../component/common/ScreenTitle";
import AuthContext from "../../../auth/context";

function MaterialList() {
  const RENAME = useSelector((state) => state.web.rename);
  const { collegeId } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const clientData = useSelector((state) => state.web.materialList);
  const clientShow = useSelector((state) => state.web.materialListShow);
  const clientDataSemester = useSelector(
    (state) => state.web.materialListSemester
  );

  const [load, setLoad] = useState(false);
  const [showList, setShowList] = useState(clientShow);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState(clientDataSemester);
  const [data, setData] = useState(clientData.data ? clientData.data : []);
  const [regulationList, setRegulationList] = useState([]);
  const [selectedRegulation, setSelectedRegulation] = useState(
    clientData.regulation
  );
  const [selectedCourse, setSelectedCourse] = useState(clientData.course);
  const [selectedSemester, setSelectedSemester] = useState(clientData.semester);
  const formikRef = useRef();
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    course: Yup.object().required("Please select " + RENAME?.course),
    regulation: Yup.object().required("Please select Regulation"),
    semester: Yup.object().required("Please select " + RENAME?.sem),
  });

  console.log("clientData---", clientData);

  const getBatchMaster = async (course) => {
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("subject", "");

    console.log("text---", course);
    setSemesterList([]);
    if (course) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "batch",
            course.courseID
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        if (collegeConfig.institution_type !== 1)
          setSemesterList(getMasterSubjectStaffRes.data.message.data.semester);
        else setSemesterList(getMasterSubjectStaffRes.data.message.data.batch);
        dispatch(
          webSliceActions.replaceMaterialListSemester(
            collegeConfig.institution_type !== 1
              ? getMasterSubjectStaffRes.data.message.data.semester
              : getMasterSubjectStaffRes.data.message.data.batch
          )
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getInitialList = async () => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeId,
        "course"
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowMaterial = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      console.log("values---", values);
      const getMaterialListRes = await academicApi.materialList(
        selectedCourse.courseID,
        selectedSemester.semester,
        selectedRegulation.regulation
      );
      console.log("getMaterialListRes--", getMaterialListRes);
      setShowList(true);
      setData(getMaterialListRes.data.message.data.subjectNotes);
      dispatch(
        webSliceActions.replaceMaterialList({
          course: selectedCourse,
          regulation: selectedRegulation,
          semester: selectedSemester,
          data: getMaterialListRes.data.message.data.subjectNotes,
        })
      );
      dispatch(webSliceActions.replaceMaterialListShow(true));

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const getAllRegulation = async () => {
    try {
      const res = await academicApi.getAllRegulation();
      setRegulationList(res.data.message.data.regulation);
    } catch (error) {}
  };

  useEffect(() => {
    // if (
    //   selectedRegulation.regulation &&
    //   selectedCourse.courseID &&
    //   selectedSemester.semester
    // )
    //   handleShowMaterial();

    getInitialList();
    getAllRegulation();
  }, []);

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
              regulation: selectedRegulation,
              course: selectedCourse,
              semester: selectedSemester,
            }}
            validationSchema={FormSchema}
            onSubmit={handleShowMaterial}
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
                  <div className="col-lg-8">
                    <SelectFieldFormik
                      tabIndex={1}
                      autoFocus
                      label={RENAME?.course}
                      id="course"
                      mandatory={1}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      options={courseList}
                      onChange={(text) => {
                        setShowList(false);
                        setFieldValue("course", text);
                        getBatchMaster(text);
                        setSelectedCourse(text);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={2}
                      label="Regulation"
                      id="regulation"
                      mandatory={1}
                      maxlength={10}
                      getOptionLabel={(option) => option.regulation}
                      getOptionValue={(option) => option.regulation}
                      options={regulationList}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setFieldValue("regulation", text);
                        setSelectedRegulation(text);
                        setShowList(false);
                      }}
                    />

                    <>
                      <SelectFieldFormik
                        tabIndex={3}
                        label={RENAME?.sem}
                        id="semester"
                        mandatory={1}
                        maxlength={2}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        options={semesterList}
                        style={{ width: "40%" }}
                        onChange={(text) => {
                          setShowList(false);
                          setFieldValue("semester", text);
                          setSelectedSemester(text);
                        }}
                      />
                    </>
                    {/* )} */}
                  </div>
                  <Button
                    tabIndex={4}
                    isTable={true}
                    text={"Show"}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />

                  {showList && (
                    <>
                      <div className="row">
                        <div className="subhead-row p-0">
                          <div className="subhead">
                            Subject Material Details
                          </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="p-0 mb-2 text-right">
                          <Button
                            text={"Add Material"}
                            className={"btn-green"}
                            frmButton={false}
                            type="button"
                            isTable={true}
                            onClick={(e) => {
                              navigate("/material-upload");
                            }}
                          />
                        </div>
                        <div className="row no-gutters mt-2">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="35%">Subject</th>
                                <th>Description</th>
                                <th width="5%">Edit</th>
                                <th width="5%">View</th>
                              </tr>
                            </thead>
                            {data.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td align="center" colSpan={5}>
                                    No records found
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{item.subjectName}</td>
                                      <td>{item.description}</td>
                                      <td>
                                        <Button
                                          isTable={true}
                                          type="button"
                                          className="btn-3"
                                          text="Edit"
                                          onClick={() => {
                                            navigate("/material-upload", {
                                              state: {
                                                item: item,
                                                courseName:
                                                  values.course.courseName,
                                                regulation:
                                                  values.regulation.regulation,
                                                semester:
                                                  values.semester.className,
                                              },
                                            });
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <Button
                                          isTable={true}
                                          className="btn-3"
                                          type="button"
                                          text="View"
                                          onClick={() => {
                                            navigate("/file-view", {
                                              state: {
                                                item: item,
                                                view: "Material",
                                                courseName:
                                                  values.course.courseName,
                                                regulation:
                                                  values.regulation.regulation,
                                                semester:
                                                  values.semester.className,
                                                subjectName: item.subjectName,
                                              },
                                            });
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            )}
                          </table>
                        </div>
                      </div>
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

export default MaterialList;
