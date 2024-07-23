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
import AuthContext from "../../../auth/context";
import { useDispatch, useSelector } from "react-redux";
import { webSliceActions } from "../../../store/web";
import ScreenTitle from "../../../component/common/ScreenTitle";

const FormSchema = Yup.object().shape({
  regulation: Yup.object().required("Please select Regulation"),
});

function SyllabusList() {
  const RENAME = useSelector((state) => state.web.rename);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const clientData = useSelector((state) => state.web.syllabusList);
  const clientShow = useSelector((state) => state.web.syllabusListShow);

  const [load, setLoad] = useState(false);

  const [data, setData] = useState(clientData.data ? clientData.data : []);
  const [regulationList, setRegulationList] = useState([]);
  const [selectedRegulation, setSelectedRegulation] = useState(
    clientData.regulation ? clientData.regulation : null
  );
  const [showList, setShowList] = useState(clientShow);

  const formikRef = useRef();

  const handleShowSyllabus = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      // console.log("values---", values);
      const getSyllabusListRes = await academicApi.getSyllabusList(
        selectedRegulation.regulation
      );
      console.log("getSyllabusListRes--", getSyllabusListRes);
      setShowList(true);
      setData(getSyllabusListRes.data.message.data.syllabus);
      dispatch(
        webSliceActions.replaceSyllabusListShow({
          payload: true,
        })
      );
      dispatch(
        webSliceActions.replaceSyllabusList({
          regulation: selectedRegulation,
          data: getSyllabusListRes.data.message.data.syllabus,
        })
      );

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
    // getInitialList();
    // if (selectedRegulation && selectedRegulation.regulation)
    //   handleShowSyllabus();
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
            }}
            validationSchema={FormSchema}
            onSubmit={handleShowSyllabus}
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
                      autoFocus
                      tabIndex={1}
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
                        setShowList(false);

                        setSelectedRegulation(text);
                        // retainState.regulation = text;
                      }}
                    />
                  </div>
                  <Button
                    tabIndex={2}
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
                            Subject Syllabus Details
                          </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="p-0 mb-2 text-right">
                          <Button
                            text={"Add Syllabus"}
                            className={"btn-green"}
                            frmButton={false}
                            type="button"
                            isTable={true}
                            onClick={(e) => {
                              navigate("/syllabus-upload");
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
                                            console.log(item, "item");
                                            // return;

                                            navigate("/syllabus-upload", {
                                              state: { item: item },
                                            });
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <Button
                                          isTable={true}
                                          type="button"
                                          className="btn-3"
                                          text="View"
                                          onClick={() => {
                                            navigate("/file-view", {
                                              state: {
                                                item: item,
                                                view: "Syllabus",
                                                regulation:
                                                  values.regulation.regulation,
                                                subjectName: item.subjectName,
                                                // courseName:
                                                //   values.course.courseName,
                                                // batch: values.batch.batch,
                                                // semester:
                                                //   values.semester.semester,
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

export default SyllabusList;
