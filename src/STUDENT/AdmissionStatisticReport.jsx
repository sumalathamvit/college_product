import React, { useContext, useEffect, useState } from "react";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import { Formik } from "formik";

import StudentApi from "../api/StudentApi";

import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";
import { toast } from "react-toastify";
import ModalComponent from "../component/ModalComponent";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";

function AdmissionStatisticReport() {
  //#region const
  const RENAME = useSelector((state) => state.web.rename);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [show, setShow] = useState(false);

  const [modalShow, setModalShow] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const { collegeName } = useContext(AuthContext);
  //#endregion

  const handleCSVData = async (report) => {
    let csvData = [
      ["No.", RENAME?.course, "Management", "Government", "Total"],
    ];
    data.map((item, index) => {
      csvData[index + 1] = [
        index + 1,
        item.courseName,
        item.managementCount,
        item.governmentCount,
        parseInt(item.managementCount) + parseInt(item.governmentCount),
      ];
    });
    if (report == 1) {
      preFunction.generatePDF(
        collegeName,
        "Admission Statistic Report",
        csvData
      );
    } else {
      preFunction.downloadCSV(csvData, "Admission Statistic Report.csv");
    }
  };

  const handleShow = async (values) => {
    if (load) return;
    try {
      console.log("values", values);
      setLoad(true);
      setShow(true);

      const studentListRes = await StudentApi.admissionStatisticReport(
        values.course.id ? values.course.id : null
      );
      console.log("studentListRes---", studentListRes);
      if (!studentListRes.data.message.success) {
        setModalMessage(studentListRes.data.message.message);
        setModalTitle("Message");
        setModalShow(true);

        setLoad(false);
        return;
      }
      setData(studentListRes.data.message.admission_statistic);
      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const getAllList = async () => {
    try {
      setLoad(true);
      const masterList = await StudentApi.getMaster(2, "");
      console.log("MasterList", masterList);
      if (!masterList.data.message.success) {
        setModalMessage(masterList.data.message.message);
        setModalTitle("Message");
        setModalShow(true);
        setLoad(false);
        return;
      }
      masterList.data.message.data.course_data.splice(0, 0, {
        courseName: "All",
        id: null,
      });
      setCourseList(masterList.data.message.data.course_data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const setReactSelectMaxlength = () => {
    document.getElementById("course") &&
      document.getElementById("course").setAttribute("maxlength", 40);
  };

  useEffect(() => {
    getAllList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        show={modalShow}
        onHide={() => setModalShow(false)}
        title={modalTitle}
        message={modalMessage}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position"} />
        <Formik
          enableReinitialize={true}
          initialValues={{
            course: { courseName: "All", id: "" },
          }}
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
              <form
                onSubmit={handleSubmit}
                onLoad={setReactSelectMaxlength()}
                autoComplete="off"
              >
                <div className="row no-gutters mb-1 mt-1">
                  <div className="col-lg-9">
                    <SelectFieldFormik
                      label={RENAME?.course}
                      id="course"
                      mandatory={1}
                      // style={{ width: "60%" }}
                      options={courseList}
                      clear={false}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.id}
                      onChange={(text) => {
                        setFieldValue("course", text);
                      }}
                    />
                  </div>
                  <Button text={"Show"} />
                </div>
              </form>
            );
          }}
        </Formik>
        {show && (
          <div className="row no-gutters border mt-2 px-3">
            <div className="row no-gutters totcntstyle mb-2">
              {data.length == 0 ? (
                <div className="col-lg-6">No Student(s) found</div>
              ) : (
                <>
                  <div className="col-lg-6"></div>
                  <div className="col-lg-6">
                    <div className="text-right">
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleCSVData(2)}
                      >
                        Export Excel
                      </button>
                      <button
                        type="button"
                        className="btn ms-3"
                        onClick={(e) => handleCSVData(1)}
                      >
                        Export PDF
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {data.length > 0 && (
              <>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th>Course</th>
                        <th width="5%">Management</th>
                        <th width="5%"> Government</th>
                        <th width="5%">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.courseName}</td>
                            <td align="right">{item.managementCount}</td>
                            <td align="right">{item.governmentCount}</td>
                            <td align="right">
                              {parseInt(item.managementCount) +
                                parseInt(item.governmentCount)}
                            </td>
                            {/* <td>{item.total}</td> */}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default AdmissionStatisticReport;
