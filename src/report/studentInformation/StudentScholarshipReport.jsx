import React, { useEffect, useState, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";

import { useSelector } from "react-redux";

import AuthContext from "../../auth/context";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormFieldLibrary/DateFieldFormik";
import SelectFieldFormik from "../../component/FormFieldLibrary/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import ErrorMessage from "../../component/common/ErrorMessage";

import string from "../../string";

function StudentScholarshipReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [filterError, setFilterError] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);

  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [genderList, setGenderList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [enrollNumberList, setEnrollNumberList] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [modeOfAdmissionList, setModeOfAdmissionList] = useState([]);
  const [dateError, setDateError] = useState(false);
  const [sectionList, setSectionList] = useState([]);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    batch: Yup.object().required(
      `Please select ${
        collegeConfig.institution_type !== 1 ? RENAME?.batch : RENAME?.sem
      }`
    ),
  });

  const handleCSVData = async (values, type) => {
    console.log("values", values);
    try {
      setLoad(true);
      var csvData = [
        [
          "No.",
          "Student No.",
          "Student Name",
          "Father Name",
          "DOB",
          "DOA",
          RENAME?.course,
          RENAME?.year,
          "Adm. Type",
          "Community",
          "Address",
          "Contact No.",
        ],
      ];
      values.map((item, index) => {
        if (index === 0 || values[index - 1].courseName !== item.courseName) {
          if (type == 1) {
            csvData.push([
              {
                content: `${RENAME?.course}: ${item.courseName}`,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 5,
              },
            ]);
          } else {
            csvData.push([
              RENAME?.course +
                " : " +
                item.courseName?.split(" - ")[1] +
                ", , , ,",
            ]);
          }
        }
        csvData.push([
          index + 1,
          item.enrollNo,
          item.name,
          item.fatherName,
          item.DOB,
          item.DOJ,
          item.courseName,
          item.studyYear,
          item.admissionType,
          item.community,
          [
            item.address1,
            item.address2,
            item.place,
            item.city,
            item.state,
            item.country,
            item.pincode,
          ]

            .filter(
              (item) => item !== null && item !== undefined && item !== ""
            )
            .join(",")
            .replace(/,/g, type === 2 ? " / " : ","),
          item.studentMobile,
        ]);
      });
      var columnWidths = [3, 8, 10, 10, 8, 8, 10, 5, 9, 9, 11, 9];

      console.log("csvData", csvData);

      if (type == 1) {
        preFunction.generatePDF(
          collegeName,
          "Student Scholarship Report",
          csvData,
          columnWidths
        );
      } else {
        preFunction.downloadCSV(csvData, "Student Scholarship Report" + ".csv");
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleShow = async (values, showAll, report) => {
    if (load) return;
    console.log("values", values);
    if (
      !values.course &&
      !values.batch &&
      !values.section &&
      !values.gender &&
      !values.community &&
      !values.religion &&
      !values.modeOfAdmission &&
      !values.admissionType &&
      !values.enrollNo &&
      !values.category &&
      !values.fromDate &&
      !values.toDate
    ) {
      setFilterError(true);
      return;
    }

    if (
      (values.fromDate != "" && values.fromDate != null) ||
      (values.toDate != "" && values.toDate != null)
    ) {
      console.log("from to-------------");
      if (
        values.fromDate == "" ||
        values.fromDate == null ||
        values.toDate == "" ||
        values.toDate == null
      ) {
        setDateError(true);
        return;
      }
    }

    setShowRes(true);

    try {
      setLoad(true);
      setShowRes(true);

      const studentRes = await StudentApi.getStudentDetailReport(
        collegeConfig.institution_type,
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        "student_scholarship",
        values.course ? values.course.id : null,
        collegeConfig.institution_type !== 1 && values.batch
          ? values.batch.batchID
          : null,
        collegeConfig.institution_type == 1 && values.batch
          ? values.batch.semester
          : null,
        values.section ? values.section.classID : null,
        values.gender ? values.gender.id : null,
        values.community ? values.community.id : null,
        values.religion ? values.religion.id : null,
        values.modeOfAdmission ? values.modeOfAdmission.id : null,
        values.admissionType ? values.admissionType.id : null,
        values.enrollNo ? values.enrollNo.enrollNo : null,
        values.category ? values.category.id : null,
        values.fromDate ? values.fromDate : null,
        values.toDate ? values.toDate : null,
        showAll == 1 ? 1 : 0
      );

      console.log("studentRes", studentRes);

      if (report) {
        handleCSVData(studentRes.data.message.data.studentDetail, report);
      } else {
        setData(studentRes.data.message.data.studentDetail);
        setShowLoadMore(false);
        if (
          studentRes.data.message.data.studentDetail.length ===
          string.PAGE_LIMIT
        ) {
          setShowLoadMore(true);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async (collegeId) => {
    try {
      const masterList = await StudentApi.getMaster(5, collegeId);
      console.log("MasterList5", masterList);
      setCourseList(masterList.data.message.data.course_data);
      setCategoryList(masterList.data.message.data.category);
      setAdmissionTypeList(masterList.data.message.data.admission_type_data);
      collegeConfig.institution_type !== 1
        ? setBatchList(masterList.data.message.data.all_batch_data)
        : setBatchList(masterList.data.message.data.semester_data);

      const masterRes = await StudentApi.getMaster(1, collegeId);
      console.log("MasterList1", masterRes);

      setGenderList(masterRes.data.message.data.gender_data);
      setReligionList(masterRes.data.message.data.religion_data);
      setCommunityList(masterRes.data.message.data.community_data);

      const masterRes2 = await StudentApi.getMaster(2, collegeId);
      console.log("MasterList2", masterRes2);

      // const masterRes8 = await StudentApi.getMaster(8, collegeId);
      // console.log("MasterList8", masterRes8);

      setModeOfAdmissionList(masterRes2.data.message.data.admission_mode_data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSearchStudent = async (text, collegeID) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const searchStudentRes = await StudentApi.searchStudent(
          text,
          collegeID ? collegeID : collegeId
        );
        console.log("searchStudentRes--------", searchStudentRes);
        setEnrollNumberList(searchStudentRes.data.message.data.student);
      } catch (error) {
        console.log("error--", error);
      }
    } else {
      setEnrollNumberList([]);
    }
  };

  const handleSectionList = async (course, batch) => {
    console.log("course", course, batch);
    setSectionList([]);
    if (course && batch) {
      let batchRes;
      try {
        if (collegeConfig.institution_type === 1) {
          batchRes = await StudentApi.getMaster(
            8,
            collegeId,
            course.id,
            batch.semester
          );
          console.log("batchResSchool", batchRes);
          setSectionList(batchRes.data.message.data.class_data);
        } else {
          batchRes = await StudentApi.getSectionList(course.id, batch.batchID);
          console.log("batchRes", batchRes);
          setSectionList(batchRes.data.message);
        }
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const handleClear = () => {
    setData([]);
    setShowRes(false);
    setFilterError(false);
  };

  useEffect(() => {
    getAllList(!collegeConfig.is_university ? collegeId : null);
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            initialValues={{
              college: "",
              course: "",
              batch: "",
              section: "",
              gender: "",
              community: "",
              religion: "",
              modeOfAdmission: "",
              admissionType: "",
              enrollNo: "",
              category: "",
              fromDate: "",
              toDate: "",
            }}
            validationSchema={reportSchema}
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
              resetForm,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  {collegeConfig.institution_type !== 1 ? (
                    <>
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={1}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          style={{ width: "30%" }}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            getAllList(text ? text.collegeID : null);
                          }}
                        />
                      ) : null}
                    </>
                  ) : null}

                  <div className="row no-gutters">
                    <div className="col-lg-6 p-0 pe-2">
                      <div className="row">
                        <div className="col-lg-8 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={2}
                            id="course"
                            maxlength={15}
                            label={RENAME?.course}
                            clear={true}
                            searchIcon={false}
                            options={courseList}
                            getOptionLabel={(option) => option.courseName}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("course", text);
                              handleClear();
                              handleSectionList(text, values.batch);
                            }}
                          />
                        </div>
                        <div className="col-lg-4 p-0">
                          {collegeConfig.institution_type === 1 ? (
                            <SelectFieldFormik
                              tabIndex={3}
                              label={RENAME?.sem}
                              id="batch"
                              clear={true}
                              maxlength={15}
                              mandatory={1}
                              searchIcon={false}
                              options={batchList}
                              getOptionLabel={(option) => option.className}
                              getOptionValue={(option) => option.semester}
                              onChange={(text) => {
                                setFieldValue("batch", text);
                                setFieldTouched("batch", false);
                                handleClear();
                                handleSectionList(values.course, text);
                              }}
                            />
                          ) : (
                            <SelectFieldFormik
                              tabIndex={3}
                              label={RENAME?.batch}
                              id="batch"
                              clear={true}
                              maxlength={15}
                              mandatory={1}
                              searchIcon={false}
                              options={batchList}
                              getOptionLabel={(option) => option.batch}
                              getOptionValue={(option) => option.batchID}
                              onChange={(text) => {
                                setFieldValue("batch", text);
                                setFieldTouched("batch", false);
                                handleClear();
                                handleSectionList(values.course, text);
                              }}
                            />
                          )}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-lg-3 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={4}
                            id="section"
                            maxlength={15}
                            label={RENAME?.section}
                            searchIcon={false}
                            getOptionLabel={(option) => option.section}
                            getOptionValue={(option) => option.classID}
                            options={sectionList}
                            onChange={(text) => {
                              setFieldValue("section", text);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-3 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={5}
                            id="gender"
                            maxlength={15}
                            label="Gender"
                            searchIcon={false}
                            options={genderList}
                            getOptionLabel={(option) => option.gender}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("gender", text);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-3 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={6}
                            label="Community"
                            id="community"
                            maxlength={15}
                            matchFrom="start"
                            options={communityList}
                            getOptionLabel={(option) => option.community}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("community", text);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-3 p-0">
                          <SelectFieldFormik
                            tabIndex={7}
                            label="Religion"
                            id="religion"
                            matchFrom="start"
                            maxlength={15}
                            options={religionList}
                            getOptionLabel={(option) => option.religion}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("religion", text);
                              handleClear();
                            }}
                          />
                        </div>
                      </div>
                      {collegeConfig.institution_type !== 1 ? (
                        <>
                          <div className="row">
                            <div className="col-lg-6 p-0 pe-2">
                              <SelectFieldFormik
                                label="Mode of Admission"
                                tabIndex={8}
                                id="modeOfAdmission"
                                maxlength={15}
                                options={modeOfAdmissionList}
                                getOptionLabel={(option) =>
                                  option.admissionMode
                                }
                                getOptionValue={(option) => option.id}
                                onChange={(text) => {
                                  setFieldValue("modeOfAdmission", text);
                                }}
                              />
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div className="col-lg-6 ps-2">
                      <div className="row">
                        <div className="col-lg-6 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={9}
                            id="admissionType"
                            maxlength={15}
                            label="Admission Type"
                            searchIcon={false}
                            options={admissionTypeList}
                            getOptionLabel={(option) => option.admissionType}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("admissionType", text);
                              handleClear();
                            }}
                          />
                        </div>

                        <div className="col-lg-6 p-0">
                          <SelectFieldFormik
                            tabIndex={10}
                            id="enrollNo"
                            maxlength={15}
                            label="Student No./Name"
                            clear={true}
                            searchIcon={true}
                            options={enrollNumberList}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                            onInputChange={(inputValue) => {
                              handleSearchStudent(
                                inputValue,
                                values.college.collegeID
                              );
                            }}
                            onChange={(text) => {
                              setFieldValue("enrollNo", text);
                              handleClear();
                            }}
                          />
                        </div>
                      </div>

                      <div className="row">
                        {collegeConfig.institution_type !== 1 ? (
                          <div className=" row col-lg-6 p-0 pe-2">
                            <SelectFieldFormik
                              tabIndex={11}
                              id="category"
                              maxlength={15}
                              label="Category"
                              searchIcon={false}
                              options={categoryList}
                              getOptionLabel={(option) =>
                                option.studentCategory
                              }
                              getOptionValue={(option) => option.id}
                              onChange={(text) => {
                                setFieldValue("category", text);
                                handleClear();
                              }}
                            />
                          </div>
                        ) : null}
                        <div className="row col-lg-6 p-0">
                          <div className="col-lg-6 p-0 pe-2">
                            <DateFieldFormik
                              tabIndex={12}
                              id="fromDate"
                              label="Adm. Date From"
                              minDate={""}
                              maxDate={new Date()}
                              onChange={(e) => {
                                setFieldValue("fromDate", e.target.value);
                                setDateError(false);
                                handleClear();
                              }}
                            />
                          </div>
                          <div className="col-lg-6 p-0 ">
                            <DateFieldFormik
                              tabIndex={13}
                              id="toDate"
                              label="Adm. Date To"
                              minDate={""}
                              maxDate={new Date()}
                              labelSize={5}
                              onChange={(e) => {
                                setFieldValue("toDate", e.target.value);
                                setDateError(false);
                                handleClear();
                              }}
                            />
                          </div>
                          <div className="mt-1">
                            <ErrorMessage
                              Message={"Choose both Admission Date From & To"}
                              view={dateError}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {filterError && (
                    <div className="row no-gutters text-center mb-2 mt-1">
                      <ErrorMessage
                        Message={"Please apply atleast one filter"}
                        view={filterError}
                      />
                    </div>
                  )}
                  <div className="row no-gutters">
                    <div className="col-lg-6 text-right pe-1">
                      <Button
                        tabIndex={14}
                        type="submit"
                        text="Show"
                        isCenter={false}
                        onClick={(e) => preFunction.handleErrorFocus(errors)}
                      />
                    </div>
                    <div className="col-lg-5 ms-2">
                      <Button
                        type="button"
                        text="Clear"
                        isCenter={false}
                        onClick={() => {
                          resetForm();
                          handleClear();
                        }}
                      />
                    </div>
                  </div>

                  {showRes ? (
                    <>
                      <div className="row mt-4 border p-3">
                        <div className="row no-gutters">
                          <div className="col-lg-6"></div>
                          {data.length > 0 && (
                            <div className="col-lg-6">
                              <div className="text-right">
                                <Button
                                  frmButton={false}
                                  className={"btn me-3"}
                                  type="button"
                                  onClick={(e) => handleShow(values, 1, 2)}
                                  text="Export Excel"
                                />
                                <Button
                                  type="button"
                                  frmButton={false}
                                  onClick={(e) => {
                                    handleShow(values, 1, 1);
                                  }}
                                  text="Export PDF"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="table-responsive mt-4 p-0">
                          <table
                            className="table table-bordered report-table"
                            id="pdf-table"
                          >
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="5%">Student No.</th>
                                <th width="7%">Name</th>
                                <th width="7%">Father Name</th>
                                <th width="10%">DOB</th>
                                <th width="10%">DOA</th>
                                <th width="20%">Course</th>
                                <th width="3%">Year</th>
                                <th width="5%">Adm. Type</th>
                                <th width="5%">Community</th>
                                <th>Address</th>
                                <th width="5%">Contact No.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr>
                                  <td align="center" colSpan={13}>
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                data.map((item, index) => {
                                  return (
                                    <>
                                      {index === 0 ||
                                      data[index - 1].courseName !==
                                        item.courseName ? (
                                        <tr>
                                          <td
                                            colSpan={13}
                                            className="table-total"
                                          >
                                            {RENAME?.course} : {item.courseName}
                                          </td>
                                        </tr>
                                      ) : null}
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.enrollNo}</td>
                                        <td>{item.name}</td>
                                        <td>{item.fatherName}</td>
                                        <td>
                                          {item.DOB
                                            ? moment(item.DOB).format(
                                                "DD-MM-YYYY"
                                              )
                                            : null}
                                        </td>
                                        <td>
                                          {item.DOJ
                                            ? moment(item.DOJ).format(
                                                "DD-MM-YYYY"
                                              )
                                            : null}
                                        </td>
                                        <td>{item.courseName}</td>
                                        <td>{item.studyYear}</td>
                                        <td>{item.admissionType}</td>
                                        <td>{item.community}</td>
                                        <td>
                                          {[
                                            item.address1,
                                            item.address2,
                                            item.place,
                                            item.city,
                                            item.state,
                                            item.country,
                                            item.pincode,
                                          ]
                                            .filter(
                                              (item) =>
                                                item !== null &&
                                                item !== undefined &&
                                                item !== ""
                                            )
                                            .join(",")}
                                        </td>
                                        <td>{item.studentMobile}</td>
                                      </tr>
                                    </>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                          {showLoadMore && (
                            <div className="row text-right">
                              <Button
                                text="ShowAll"
                                type="button"
                                isTable={true}
                                onClick={(e) => handleShow(values, 1)}
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
export default StudentScholarshipReport;
