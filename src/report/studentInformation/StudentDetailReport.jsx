import React, { useEffect, useState, useContext, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { useSelector } from "react-redux";

import AuthContext from "../../auth/context";

import StudentApi from "../../api/StudentApi";

import string from "../../string";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormFieldLibrary/DateFieldFormik";
import SelectFieldFormik from "../../component/FormFieldLibrary/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import ErrorMessage from "../../component/common/ErrorMessage";
import { boldStyle, topLineStyle } from "../../component/common/CommonArray";

function StudentDetailReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
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
    course:
      collegeConfig.institution_type === 1
        ? Yup.object().required("Please select  " + RENAME?.course)
        : Yup.mixed().notRequired(),

    batch:
      collegeConfig.institution_type !== 1
        ? Yup.object().required("Please select " + RENAME?.batch)
        : Yup.mixed().notRequired(),
  });

  const handleCSVData = async (exportData, type, values) => {
    console.log("exportData", exportData);
    try {
      setLoad(true);

      var pdfData = [];

      if (type == 2) {
        pdfData.push([
          "No.",
          "App No.",
          "Student No.",
          "Student Name",
          "Parent/Guardian",
          "DOB",
          "Religion",
          "Community",
          "Adm. Date",
          "Address",
        ]);
      } else {
        var filterContent = [];

        filterContent.push([
          {
            content: `${
              values.course
                ? RENAME?.course + " : " + values.course.courseName
                : "" + values.batch
                ? collegeConfig.institution_type === 1
                  ? "  " + RENAME?.sem + " : " + values.batch.className
                  : RENAME?.batch + " : " + values.batch.batch
                : ""
            } `,
            styles: boldStyle,
          },
        ]);

        (values.section || values.gender || values.community) &&
          filterContent.push([
            {
              content:
                (values.section ? `Section : ${values.section.section}` : "") +
                (values.gender ? `   Gender : ${values.gender.gender}` : "") +
                (values.community
                  ? `   Community : ${values.community.community}`
                  : ""),
              styles: boldStyle,
            },
          ]);

        (values.religion || values.modeOfAdmission) &&
          filterContent.push([
            {
              content:
                (values.religion
                  ? `Religion : ${values.religion.religion}`
                  : "") +
                (values.modeOfAdmission
                  ? `   Mode of Admission : ${values.modeOfAdmission.admissionMode}`
                  : ""),
              styles: boldStyle,
            },
          ]);

        (values.admissionType || values.enrollNo) &&
          filterContent.push([
            {
              content:
                (values.admissionType
                  ? `Admission Type : ${values.admissionType.admissionType}`
                  : "") +
                (values.enrollNo
                  ? `   Student No./Name : ${values.enrollNo.enrollNo}`
                  : ""),
              styles: boldStyle,
            },
          ]);

        (values.category || values.fromDate || values.toDate) &&
          filterContent.push([
            {
              content:
                (values.category
                  ? `Category : ${values.category.studentCategory} `
                  : "") +
                (values.fromDate
                  ? `   Adm. Date From : ${moment(values.fromDate).format(
                      "DD-MM-yyyy"
                    )}`
                  : "") +
                (values.toDate
                  ? `   Adm. Date To : ${moment(values.toDate).format(
                      "DD-MM-yyyy"
                    )}`
                  : ""),
              styles: boldStyle,
            },
          ]);

        var head1 = [
          [
            { content: "No.", styles: topLineStyle },
            { content: "App No.", styles: topLineStyle },
            { content: "Student No.", styles: topLineStyle },
            { content: "Student Name", styles: topLineStyle },
            { content: "Parent/Guardian", styles: topLineStyle },
            { content: "DOB", styles: topLineStyle },
            { content: "Religion", styles: topLineStyle },
            { content: "Community", styles: topLineStyle },
            { content: "Adm. Date", styles: topLineStyle },
            { content: "Address", styles: topLineStyle },
          ],
        ];
      }

      // let totalAmt = 0;
      exportData.map((item, index) => {
        console.log("item", item);
        if (index === 0) {
          if (type === 1) {
            pdfData.push([
              {
                content: `${
                  collegeConfig.institution_type === 1
                    ? RENAME?.course + " : " + item.courseName
                    : RENAME?.batch + " : " + item.batch
                } `,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 10,
              },
            ]);
          } else {
            pdfData.push([
              collegeConfig.institution_type === 1
                ? RENAME?.course + " : " + item.courseName
                : RENAME?.batch + " : " + item.batch + ", , , , , , , , ,",
            ]);
          }
        }
        if (
          index === 0 ||
          (collegeConfig.institution_type !== 1
            ? exportData[index - 1].courseName !== item.courseName
            : exportData[index - 1].className !== item.className)
        ) {
          if (type === 1) {
            pdfData.push([
              {
                content: `${
                  collegeConfig.institution_type === 1
                    ? RENAME?.sem + " : " + item.className
                    : RENAME?.course + " : " + item.courseName
                } `,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 10,
              },
            ]);
          } else {
            pdfData.push([
              collegeConfig.institution_type === 1
                ? RENAME?.sem + " : " + item.className
                : RENAME?.course +
                  " : " +
                  item.courseName +
                  ", , , , , , , , ,",
            ]);
          }
        }

        pdfData.push([
          index + 1,
          item.applicationNo,
          item.enrollNo,
          item.name,
          item.fatherName,
          moment(item.DOB).format("DD-MM-yyyy"),
          item.religion,
          item.community,
          item.applicationDate
            ? moment(item.applicationDate).format("DD-MM-yyyy")
            : null,
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
        ]);
      });

      if (type === 2) {
        preFunction.downloadCSV(pdfData, "Student Detail Report.csv");
      } else {
        let pdfHeadToPass = [[], [...head1]];
        let pdfDataToPass = [filterContent, [...pdfData]];

        var columnWidth = [5, 6, 8, 16, 12, 8, 7, 8, 8, 22];

        let colWidthToPass = [[], [...columnWidth]];

        preFunction.generatePDFContent(
          values.college ? values.college.collegeName : collegeName,
          "Student Detail Report",
          pdfHeadToPass,
          pdfDataToPass,
          colWidthToPass,
          "Portrait",
          "a3"
        );
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
      (values.fromDate !== "" && values.fromDate) ||
      (values.toDate !== "" && values.toDate)
    ) {
      console.log("from to-------------");
      if (
        values.fromDate === "" ||
        !values.fromDate ||
        values.toDate === "" ||
        !values.toDate
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
        "student_detail",
        values.course ? values.course.id : null,
        collegeConfig.institution_type !== 1 && values.batch
          ? values.batch.batchID
          : null,
        collegeConfig.institution_type === 1 && values.batch
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
        showAll === 1 ? 1 : 0
      );

      console.log("studentRes", studentRes);

      if (report) {
        handleCSVData(
          studentRes.data.message.data.studentDetail,
          report,
          values
        );
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

  const getAllList = async (collegeId, course) => {
    try {
      const masterList = await StudentApi.getMaster(
        5,
        collegeId,
        course ? course.id : null
      );
      console.log("MasterList5", masterList);
      setCourseList(masterList.data.message.data.course_data);
      if (masterList.data.message.data.course_data.length === 1) {
        handleCourse(masterList.data.message.data.course_data[0]);
        formikRef.current.setFieldValue(
          "course",
          masterList.data.message.data.course_data[0]
        );
      }
      setCategoryList(masterList.data.message.data.category);
      setAdmissionTypeList(masterList.data.message.data.admission_type_data);
      console.log("collegeConfig---", collegeConfig);
      if (collegeConfig.institution_type !== 1) {
        masterList.data.message.data.all_batch_data.splice(0, 0, {
          batchID: null,
          batch: "All Current " + RENAME?.batch,
        });
        setBatchList(masterList.data.message.data.all_batch_data);
        formikRef.current.setFieldValue(
          "batch",
          masterList.data.message.data.all_batch_data[0]
        );
      }

      const masterRes = await StudentApi.getMaster(1, collegeId);
      console.log("MasterList1", masterRes);

      setGenderList(masterRes.data.message.data.gender_data);
      setReligionList(masterRes.data.message.data.religion_data);
      setCommunityList(masterRes.data.message.data.community_data);

      const masterRes2 = await StudentApi.getMaster(2, collegeId);
      console.log("MasterList2", masterRes2);

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

  const handleCourse = async (course) => {
    setBatchList([]);
    if (course) {
      let yearList = [];
      for (let i = 0; i < course.duration; i++) {
        let year = i + 1;
        yearList.push({ label: year, value: year });
      }
      console.log("yearList", yearList);
      // setYearList(yearList);

      const classRes = await StudentApi.getMaster(8, collegeId, course.id);
      console.log("classRes", classRes);
      setBatchList(classRes.data.message.data.semester_data);
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
    console.log("collegeId", collegeId);
    console.log("collegeConfig.is_university", collegeConfig.is_university);
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
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
            innerRef={formikRef}
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
                            getAllList(
                              text ? text.collegeID : null,
                              values.course
                            );
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
                            mandatory={
                              collegeConfig.institution_type === 1 ? 1 : 0
                            }
                            clear={
                              collegeConfig.institution_type === 1
                                ? false
                                : true
                            }
                            searchIcon={false}
                            options={courseList}
                            getOptionLabel={(option) => option.courseName}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("course", text);
                              if (collegeConfig.institution_type !== 1) {
                                getAllList(
                                  values.college
                                    ? values.college.collegeID
                                    : collegeId,
                                  text
                                );
                              } else {
                                handleCourse(text);
                              }
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
                              maxlength={15}
                              mandatory={0}
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
                        <div className="row">
                          <div className="col-lg-6 p-0 pe-2">
                            <SelectFieldFormik
                              label="Mode of Admission"
                              tabIndex={13}
                              id="modeOfAdmission"
                              maxlength={15}
                              options={modeOfAdmissionList}
                              getOptionLabel={(option) => option.admissionMode}
                              getOptionValue={(option) => option.id}
                              onChange={(text) => {
                                setFieldValue("modeOfAdmission", text);
                              }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="col-lg-6 ps-2">
                      <div className="row">
                        <div className="col-lg-6 p-0 pe-2">
                          <SelectFieldFormik
                            tabIndex={8}
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
                            tabIndex={9}
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
                              tabIndex={10}
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
                              tabIndex={11}
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
                              tabIndex={12}
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
                        tabIndex={
                          collegeConfig.institution_type === 1 ? 13 : 14
                        }
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
                            // id="pdf-table"
                          >
                            <thead>
                              <tr>
                                <th width="5%">No.</th>
                                <th width="8%">App No.</th>
                                <th width="5%">Student No.</th>
                                <th width="20%">Student Name</th>
                                <th width="20%">Parent/Guardian</th>
                                <th width="10%">DOB</th>
                                <th width="6%">Religion</th>
                                <th width="6%">Community</th>
                                <th width="10%">Adm. Date</th>
                                <th>Address</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr>
                                  <td align="center" colSpan={10}>
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                data.map((item, index) => {
                                  return (
                                    <>
                                      {index === 0 ? (
                                        <tr>
                                          <td
                                            colSpan={10}
                                            className="table-total"
                                          >
                                            {collegeConfig.institution_type ===
                                            1
                                              ? RENAME?.course +
                                                " : " +
                                                item.courseName
                                              : RENAME?.batch +
                                                " : " +
                                                item.batch}
                                          </td>
                                        </tr>
                                      ) : null}

                                      {index === 0 ||
                                      (collegeConfig.institution_type === 1
                                        ? data[index - 1].className !==
                                          item.className
                                        : data[index - 1].courseName !==
                                          item.courseName) ? (
                                        <tr>
                                          <td
                                            colSpan={10}
                                            className="table-total"
                                          >
                                            {
                                              "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                                            }
                                            {collegeConfig.institution_type ===
                                            1
                                              ? RENAME?.sem +
                                                " : " +
                                                item.className
                                              : RENAME?.course +
                                                " : " +
                                                item.courseName}
                                          </td>
                                        </tr>
                                      ) : null}
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.applicationNo}</td>
                                        <td>{item.enrollNo}</td>
                                        <td>{item.name}</td>
                                        <td>{item.fatherName}</td>
                                        <td>
                                          {moment(item.DOB).format(
                                            "DD-MM-yyyy"
                                          )}
                                        </td>
                                        <td>{item.religion}</td>
                                        <td>{item.community}</td>
                                        <td>
                                          {item.applicationDate
                                            ? moment(
                                                item.applicationDate
                                              ).format("DD-MM-yyyy")
                                            : null}
                                        </td>
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
                                      </tr>
                                    </>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                        {showLoadMore && (
                          <div className="row text-right">
                            <Button
                              text="Show All"
                              type="button"
                              onClick={(e) => handleShow(values, 1)}
                            />
                          </div>
                        )}
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
export default StudentDetailReport;
