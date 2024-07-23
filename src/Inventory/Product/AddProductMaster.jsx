import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import { Tab, Tabs } from "react-bootstrap";
import { toast } from "react-toastify";
import * as Yup from "yup";
import moment from "moment";

import StudentApi from "../../api/StudentApi";

import AuthContext from "../../auth/context";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import StudentFeesDetails from "../../component/StudentFeesDetails";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import { activityFeesTypeList } from "../../component/common/CommonArray";
import CheckboxField from "../../component/FormField/CheckboxField";
import DisplayText from "../../component/FormField/DisplayText";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";

function AddProduct() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [particularList, setParticularList] = useState([]);
  const [activityGroupList, setActivityGroupList] = useState([]);
  const [activityGroupStudentList, setActivityGroupStudentList] = useState([]);
  const [initialAmount, setInitialAmount] = useState("");
  const [amountError, setAmountError] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [showRes, setShowRes] = useState(false);
  const formikRef = useRef();
  const formikActivityRef = useRef();
  const collegeConfig = useSelector((state) => state.web.college);
  const [college, setCollege] = useState("");
  const { collegeId, setUnSavedChanges } = useContext(AuthContext);
  const RENAME = useSelector((state) => state.web.rename);

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required("Please select  " + RENAME?.sem),
    particular: Yup.object().required("Please select Particular"),
    amount: Yup.number()
      .min(1, "Please enter valid Amount")
      .required("Please enter Amount"),
  });

  const ActivityFormSchema = Yup.object().shape({
    collegeId: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    group: Yup.object().required("Please select Activity Group"),
    activityParticular: Yup.object().required("Please select Particular"),
    feesType: Yup.object().required("Please select Fees"),
    amount: Yup.number()
      .min(1, "Please enter valid Amount")
      .required("Please enter Amount"),
  });

  const handleSave = async (values) => {
    if (load) return;
    try {
      console.log("values--", values);

      let feesDue = [];
      let studentArr = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].amount == 0) {
          studentArr.push(data[i].name);
        } else {
          feesDue.push({
            studentID: data[i].studentID,
            amount: data[i].amount,
          });
        }
      }
      console.log("feesDue----", feesDue, studentArr.toString());
      if (feesDue.length == 0) {
        setModalMessage("Please enter at least one valid Amount");
        setModalErrorOpen(true);
        setModalTitle("Message");
        document.getElementById("amount0").focus();
        return;
      }

      setLoad(true);
      let addFeesDue = await StudentApi.addFeesDue(
        values.batch.batchID,
        values.batch.semester,
        values.batch.studyYear,
        values.particular.id,
        feesDue
      );

      console.log("addFeesDue---", addFeesDue);
      if (!addFeesDue.data.message.success) {
        setModalMessage(addFeesDue.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Already Exists");
        setLoad(false);
        return;
      }
      toast.success(addFeesDue.data.message.message);
      setData([]);
      formikRef.current.resetForm();
      handleUnSavedChanges(0);
      if (!collegeConfig.is_university) {
        selectList(collegeId);
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSaveActivityFee = async (values) => {
    if (load) return;
    try {
      console.log("values--", values, activityGroupStudentList);

      let studentActivityArr = activityGroupStudentList.map((item) => {
        return {
          studentID: item.studentID,
          semester: item.semester,
          studyYear: item.studyYear,
          batchID: item.batchID,
        };
      });

      if (studentActivityArr.length == 0) {
        setModalMessage("Please enter at least one valid Amount");
        setModalErrorOpen(true);
        setModalTitle("Message");
        document.getElementById("amount0").focus();
        return;
      }

      setLoad(true);
      let addFeesDue = await StudentApi.addCommonFeesDueActivityGrp(
        values.group.activityGroupID,
        moment(values.group.fromMonth).format("YYYY-MM-DD").split(" ")[0],
        values.feesType.value,
        values.activityParticular.id,
        values.amount,
        studentActivityArr
      );
      console.log("addFeesDue---", addFeesDue);
      if (!addFeesDue.data.message.success) {
        setModalMessage(addFeesDue.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Already Exists");
        setLoad(false);
        return;
      }
      toast.success(addFeesDue.data.message.message);
      setActivityGroupStudentList([]);
      formikActivityRef.current.resetForm();
      if (collegeConfig.is_university) {
        getGroupList(formikActivityRef?.current?.values?.collegeId.collegeID);
      } else {
        getGroupList(collegeId);
      }
      handleUnSavedChanges(0);
      setShowRes(false);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleParticular = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      setData([]);
      console.log("values---", values);
      const students = await StudentApi.getFeeDue(
        collegeConfig.institution_type,
        values.course.id,
        collegeConfig.institution_type === 1 ? null : values.batch.batchID,
        values.batch.semester,
        values.admissionType ? values.admissionType.id : null,
        values.particular.id
      );
      console.log("students-------", students);
      if (!students.data.message.success) {
        setModalMessage(students.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      handleUnSavedChanges(1);
      for (let i = 0; i < students.data.message.data.length; i++) {
        students.data.message.data[i].amount = values.amount;
        students.data.message.data[i].amountError = false;
      }
      setData(students.data.message.data);

      setInitialAmount(values.amount);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleAmount = (item, index, amount) => {
    let arr = data;
    setData([]);
    arr[index].amount = amount;
    setData([...arr]);
  };

  const selectList = async (college_id) => {
    try {
      console.log("selectList", collegeConfig);
      const masterList = await StudentApi.getMaster(5, college_id);
      setCollege(college_id);
      console.log("masterList", masterList);

      if (!masterList.data.message.success) {
        setModalMessage(masterList.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setCourseList(masterList.data.message.data.course_data);
      if (masterList.data.message.data.course_data.length == 1) {
        formikRef.current.setFieldValue(
          "course",
          masterList.data.message.data.course_data[0]
        );
        getBatchMaster(masterList.data.message.data.course_data[0]);
      }
      //masterList.data.message.data.admission_type_data
      //add all in 0th index
      masterList.data.message.data.admission_type_data.splice(0, 0, {
        id: null,
        admissionType: "All",
      });
      setAdmissionTypeList(masterList.data.message.data.admission_type_data);
      formikRef.current.setFieldValue(
        "admissionType",
        masterList.data.message.data.admission_type_data[0]
      );
      setParticularList(masterList.data.message.data.particular_uncommon_data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const getBatchMaster = async (text) => {
    console.log("text---", text);
    handleUnSavedChanges(0);

    formikRef.current.setFieldValue("batch", null);
    formikRef.current.setFieldValue("particular", null);
    formikRef.current.setFieldValue("amount", "");
    formikRef.current.setFieldTouched("amount", false);

    if (text) {
      try {
        const getPersonalMasterRes = await StudentApi.getMaster(
          collegeConfig.institution_type === 1 ? 8 : 5,
          college,
          text.id
        );
        setSemesterList(
          collegeConfig.institution_type === 1
            ? getPersonalMasterRes.data.message.data.semester_data
            : getPersonalMasterRes.data.message.data.batch_data
        );
        console.log("getPersonalMasterRes---", getPersonalMasterRes);
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    }
  };

  const handleCheckBoxOnchange = () => {
    let arr = data;
    setData([]);
    console.log("arr", arr);
    for (let i = 0; i < arr.length; i++) {
      arr[i].amount = "";
      arr[i].amountError = false;
    }
    console.log("arr------", arr);
    setData([...arr]);
  };

  // Function to get all assigned students
  const getAllAssignedStudents = async (values) => {
    if (load) return;
    console.log("values--", values);

    if (values?.group.isMonthlyFees == 0 || values?.group.isMonthlyFees == 1) {
      setModalMessage("Fees Due already created for this group");
      setModalErrorOpen(true);
      setModalTitle("Message");
      setLoad(false);
      return;
    }

    try {
      setLoad(true);
      const getAllAssignedStudentsRes = await StudentApi.getAllAssignedStudents(
        values.group.activityGroupID
      );
      console.log("getAllAssignedStudentsRes---", getAllAssignedStudentsRes);

      setActivityGroupStudentList(
        getAllAssignedStudentsRes.data.message.data.students
      );
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  // Function to get all activity group list
  const getGroupList = async (collegeID) => {
    try {
      setLoad(true);
      const getAllActivityGroupRes = await StudentApi.getAllActivityGroup(
        collegeID
      );
      console.log("getAllActivityGroupRes---", getAllActivityGroupRes);
      setActivityGroupList(
        getAllActivityGroupRes.data.message.data.activity_group
      );

      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  useEffect(() => {
    // if (!collegeConfig.is_university) {
    //   selectList(collegeId);
    //   getGroupList(collegeId);
    // }
  }, [collegeConfig.is_university]);

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
        <Tabs
          id="uncontrolled-tab-example"
          className="text-center mt-4 pt-2"
          fill
        >
          <Tab eventKey={1} title={"Details"}>
            <div className="row no-gutters mt-1 p-3">
              <Formik
                enableReinitialize={false}
                innerRef={formikRef}
                initialValues={{
                  college: "",
                  itemName: "",
                  itemGroup: "",
                  unitOfMeasure: "",
                  disabled: false,
                  maintainStock: false,
                  hasVariants: false,
                  fixedAsset: false,
                  openingStock: "",
                  brand: "",
                  shelfLife: "",
                  endLife: "",
                  materialRequestType: "",
                  valuationMethod: "",
                  warrantyPeriod: "",
                  weightPerUnit: "",
                  weightUOM: "",
                  allowNegativeStock: false,
                  barcode: "",
                  serialNo: false,
                  serialNumber: "",
                  batchNo: false,
                  automaticallyCreateNewBatch: false,
                  batchNumberSeries: "",
                  expiryDate: false,
                  retainSample: false,
                  maxSampleQuantity: "",
                  autoCreateAssets: false,
                  assetCategory: "",
                  valuationRate: "",
                }}
                validationSchema={FormSchema}
                onSubmit={handleParticular}
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
                      <div className="row no-gutters">
                        <div className="col-lg-12">
                          {collegeConfig.is_university ? (
                            <SelectFieldFormik
                              autoFocus
                              tabIndex={0}
                              label="College"
                              labelSize={3}
                              id="college"
                              mandatory={1}
                              options={collegeConfig.collegeList}
                              getOptionLabel={(option) => option.collegeName}
                              getOptionValue={(option) => option.collegeID}
                              searchIcon={false}
                              clear={false}
                              onChange={(text) => {
                                setFieldValue("college", text);
                                setCollege(text);
                                selectList(text.collegeID);
                                setFieldValue("course", "");
                                setFieldValue("batch", "");
                                setFieldValue("particular", "");
                                setFieldValue("amount", "");
                                setData([]);
                              }}
                              style={{ width: "80%" }}
                            />
                          ) : null}
                          <TextFieldFormik
                            autoFocus
                            labelSize={3}
                            tabIndex={1}
                            id="itemName"
                            style={{ width: "50%" }}
                            label="Item Name"
                            mandatory={1}
                            maxlength={45}
                            onChange={(e) => {
                              handleUnSavedChanges(1);
                              setFieldValue(
                                "itemName",
                                preFunction.capitalizeFirst(e.target.value)
                              );
                              setUnSavedChanges(true);
                            }}
                          />
                          <SelectFieldFormik
                            autoFocus={!collegeConfig.is_university}
                            label={"Item Group"}
                            id="itemGroup"
                            tabIndex={1}
                            labelSize={3}
                            mandatory={1}
                            maxlength={40}
                            matchFrom="start"
                            clear={false}
                            options={courseList}
                            style={{ width: "50%" }}
                            getOptionLabel={(option) => option.courseName}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("itemGroup", text);
                            }}
                          />
                          <SelectFieldFormik
                            label={"Unit of Measure"}
                            id="unitOfMeasure"
                            mandatory={1}
                            tabIndex={2}
                            labelSize={3}
                            maxlength={10}
                            matchFrom="start"
                            style={{ width: "30%" }}
                            options={semesterList}
                            clear={false}
                            getOptionLabel={(option) =>
                              collegeConfig.institution_type === 1
                                ? option.className
                                : option.semester
                            }
                            getOptionValue={(option) => option.semester}
                            onChange={(text) => {
                              setFieldValue("unitOfMeasure", text);
                            }}
                          />
                          <CheckboxField
                            label={"Disabled"}
                            value={values.disabled}
                            checked={values.disabled}
                            leftLabel={true}
                            labelSize={3}
                            onChange={() => {
                              setFieldValue("disabled", !values.disabled);
                            }}
                            // disabled={!toDateOff ? false : true}
                          />

                          <CheckboxField
                            label={"Has Variants"}
                            value={values.hasVariants}
                            checked={values.hasVariants}
                            leftLabel={true}
                            labelSize={3}
                            onChange={() => {
                              setFieldValue("hasVariants", !values.hasVariants);
                            }}
                            // disabled={!toDateOff ? false : true}
                          />

                          <SelectFieldFormik
                            label="Brand"
                            id="brand"
                            labelSize={3}
                            mandatory={1}
                            maxlength={10}
                            tabIndex={3}
                            options={admissionTypeList}
                            matchFrom="start"
                            style={{ width: "50%" }}
                            getOptionLabel={(option) => option.admissionType}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("brand", text);
                              handleUnSavedChanges(0);
                            }}
                          />
                          <CheckboxField
                            label={"Fixed Asset"}
                            id="fixedAsset"
                            value={values.fixedAsset}
                            checked={values.fixedAsset}
                            leftLabel={true}
                            labelSize={3}
                            onChange={() => {
                              setFieldValue("fixedAsset", !values.fixedAsset);
                              setFieldValue("maintainStock", false);
                            }}
                            // disabled={!toDateOff ? false : true}
                          />
                          {values?.fixedAsset ? (
                            <CheckboxField
                              label={"Auto Create Assets on Purchase"}
                              id="autoCreateAssets"
                              value={values.autoCreateAssests}
                              checked={values.autoCreateAssets}
                              leftLabel={true}
                              labelSize={3}
                              onChange={() => {
                                setFieldValue(
                                  "autoCreateAssets",
                                  !values.autoCreateAssets
                                );
                              }}
                              // disabled={!toDateOff ? false : true}
                            />
                          ) : null}
                          {values?.fixedAsset ? (
                            <SelectFieldFormik
                              label="Asset Category"
                              id="assetCategory"
                              labelSize={3}
                              mandatory={1}
                              maxlength={10}
                              tabIndex={3}
                              options={admissionTypeList}
                              matchFrom="start"
                              style={{ width: "50%" }}
                              getOptionLabel={(option) => option.admissionType}
                              getOptionValue={(option) => option.id}
                              onChange={(text) => {
                                setFieldValue("assetCategory", text);
                                handleUnSavedChanges(0);
                              }}
                            />
                          ) : null}
                          <CheckboxField
                            label={"Maintain Stock"}
                            id="maintainStock"
                            value={values.maintainStock}
                            checked={values.maintainStock}
                            leftLabel={true}
                            labelSize={3}
                            onChange={() => {
                              setFieldValue(
                                "maintainStock",
                                !values.maintainStock
                              );
                              setFieldValue("fixedAsset", false);
                              setFieldValue("autoCreateAssets", false);
                              setFieldValue("assetCategory", "");
                            }}
                            // disabled={!values.fixedAsset ? false : true}
                          />
                          {values?.maintainStock ? (
                            <>
                              <TextFieldFormik
                                id="openingStock"
                                label="Opening Stock"
                                placeholder=" "
                                labelSize={3}
                                mandatory={1}
                                tabIndex={5}
                                maxlength={7}
                                style={{ width: "10%" }}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    handleChange(e);
                                    handleUnSavedChanges(0);
                                  }
                                }}
                              />
                              <TextFieldFormik
                                id="valuationRate"
                                label="Valuation Rate"
                                placeholder=" "
                                labelSize={3}
                                mandatory={1}
                                tabIndex={5}
                                maxlength={7}
                                style={{ width: "10%" }}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    handleChange(e);
                                    handleUnSavedChanges(0);
                                  }
                                }}
                              />
                            </>
                          ) : null}
                          {values?.maintainStock ? (
                            <>
                              <div className="subhead-row">
                                <div className="subhead">
                                  Inventory Settings
                                </div>
                                <div className="col line-div"></div>
                              </div>
                              <TextFieldFormik
                                id="shelfLife"
                                label="Self Life in Days"
                                placeholder=" "
                                labelSize={3}
                                mandatory={1}
                                tabIndex={5}
                                maxlength={7}
                                style={{ width: "10%" }}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    handleChange(e);
                                    handleUnSavedChanges(0);
                                  }
                                }}
                              />
                              <DateFieldFormik
                                labelSize={3}
                                tabIndex={3}
                                label="End of Life"
                                id="endLife"
                                maxDate={moment().subtract(1, "years")}
                                minDate={moment().subtract(20, "years")}
                                mandatory={1}
                                style={{ width: "45%" }}
                                onChange={(e) => {
                                  handleUnSavedChanges(1);
                                  setFieldValue("endLife", e.target.value);
                                }}
                              />
                              <SelectFieldFormik
                                label="Material Request Type"
                                id="materialRequestType"
                                labelSize={3}
                                mandatory={1}
                                maxlength={10}
                                tabIndex={3}
                                options={admissionTypeList}
                                matchFrom="start"
                                style={{ width: "50%" }}
                                getOptionLabel={(option) =>
                                  option.admissionType
                                }
                                getOptionValue={(option) => option.id}
                                onChange={(text) => {
                                  setFieldValue("materialRequestType", text);
                                  handleUnSavedChanges(0);
                                }}
                              />
                              <SelectFieldFormik
                                label="Valuation Method"
                                id="valuationMethod"
                                labelSize={3}
                                mandatory={1}
                                maxlength={10}
                                tabIndex={3}
                                options={admissionTypeList}
                                matchFrom="start"
                                style={{ width: "50%" }}
                                getOptionLabel={(option) =>
                                  option.admissionType
                                }
                                getOptionValue={(option) => option.id}
                                onChange={(text) => {
                                  setFieldValue("valuationMethod", text);
                                  handleUnSavedChanges(0);
                                }}
                              />
                              <TextFieldFormik
                                id="warrantyPeriod"
                                label="Warranty Period in Days"
                                placeholder=" "
                                labelSize={3}
                                mandatory={1}
                                tabIndex={5}
                                maxlength={7}
                                style={{ width: "10%" }}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    handleChange(e);
                                    handleUnSavedChanges(0);
                                  }
                                }}
                              />
                              <TextFieldFormik
                                id="weightPerUnit"
                                label="Weight Per Unit"
                                placeholder=" "
                                labelSize={3}
                                mandatory={1}
                                tabIndex={5}
                                maxlength={7}
                                style={{ width: "10%" }}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    handleChange(e);
                                    handleUnSavedChanges(0);
                                  }
                                }}
                              />
                              <TextFieldFormik
                                id="weightUOM"
                                label="Weight UOM"
                                placeholder=" "
                                labelSize={3}
                                mandatory={1}
                                tabIndex={5}
                                maxlength={7}
                                style={{ width: "10%" }}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    handleChange(e);
                                    handleUnSavedChanges(0);
                                  }
                                }}
                              />
                              <CheckboxField
                                label={"Allow Negative Stock"}
                                value={values.allowNegativeStock}
                                checked={values.allowNegativeStock}
                                leftLabel={true}
                                labelSize={3}
                                onChange={() => {
                                  setFieldValue(
                                    "allowNegativeStock",
                                    !values.allowNegativeStock
                                  );
                                }}
                                // disabled={!toDateOff ? false : true}
                              />
                              <TextFieldFormik
                                id="barcode"
                                label="Barcode"
                                placeholder=" "
                                labelSize={3}
                                mandatory={1}
                                tabIndex={5}
                                maxlength={7}
                                style={{ width: "10%" }}
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    handleChange(e);
                                    handleUnSavedChanges(0);
                                  }
                                }}
                              />
                              <CheckboxField
                                label={"Serial No."}
                                value={values.serialNo}
                                checked={values.serialNo}
                                leftLabel={true}
                                labelSize={3}
                                onChange={() => {
                                  setFieldValue("serialNo", !values.serialNo);
                                }}
                                // disabled={!toDateOff ? false : true}
                              />
                              {values?.serialNo ? (
                                <TextFieldFormik
                                  id="serialNumber"
                                  label="Serial Number"
                                  placeholder=" "
                                  labelSize={3}
                                  mandatory={1}
                                  tabIndex={5}
                                  maxlength={7}
                                  style={{ width: "10%" }}
                                  onChange={(e) => {
                                    if (
                                      preFunction.amountValidation(
                                        e.target.value
                                      )
                                    ) {
                                      handleChange(e);
                                      handleUnSavedChanges(0);
                                    }
                                  }}
                                />
                              ) : null}
                              <CheckboxField
                                label={"Batch No."}
                                value={values.batchNo}
                                checked={values.batchNo}
                                leftLabel={true}
                                labelSize={3}
                                onChange={() => {
                                  setFieldValue("batchNo", !values.batchNo);
                                  setFieldValue(
                                    "automaticallyCreateNewBatch",
                                    false
                                  );
                                  setFieldValue("expiryDate", false);
                                  setFieldValue("retainSample", false);
                                }}
                                // disabled={!toDateOff ? false : true}
                              />
                              {values?.batchNo ? (
                                <>
                                  <CheckboxField
                                    label={"Auto Create New Batch"}
                                    value={values.automaticallyCreateNewBatch}
                                    checked={values.automaticallyCreateNewBatch}
                                    leftLabel={true}
                                    labelSize={3}
                                    onChange={() => {
                                      setFieldValue(
                                        "automaticallyCreateNewBatch",
                                        !values.automaticallyCreateNewBatch
                                      );
                                    }}
                                    // disabled={!toDateOff ? false : true}
                                  />
                                  {values?.automaticallyCreateNewBatch ? (
                                    <TextFieldFormik
                                      id="batchNumberSeries"
                                      label="Batch Number Series"
                                      placeholder=" "
                                      labelSize={3}
                                      mandatory={1}
                                      tabIndex={5}
                                      maxlength={7}
                                      style={{ width: "10%" }}
                                      onChange={(e) => {
                                        if (
                                          preFunction.amountValidation(
                                            e.target.value
                                          )
                                        ) {
                                          handleChange(e);
                                          handleUnSavedChanges(0);
                                        }
                                      }}
                                    />
                                  ) : null}
                                  <CheckboxField
                                    label={"Expiry Date"}
                                    value={values.expiryDate}
                                    checked={values.expiryDate}
                                    leftLabel={true}
                                    labelSize={3}
                                    onChange={() => {
                                      setFieldValue(
                                        "expiryDate",
                                        !values.expiryDate
                                      );
                                    }}
                                    // disabled={!toDateOff ? false : true}
                                  />
                                  <CheckboxField
                                    label={"Retain Sample"}
                                    value={values.retainSample}
                                    checked={values.retainSample}
                                    leftLabel={true}
                                    labelSize={3}
                                    onChange={() => {
                                      setFieldValue(
                                        "retainSample",
                                        !values.retainSample
                                      );
                                    }}
                                    // disabled={!toDateOff ? false : true}
                                  />
                                  {values?.retainSample ? (
                                    <TextFieldFormik
                                      id="maxSampleQuantity"
                                      label="Max Sample Quantity"
                                      placeholder=" "
                                      labelSize={3}
                                      mandatory={1}
                                      tabIndex={5}
                                      maxlength={7}
                                      style={{ width: "10%" }}
                                      onChange={(e) => {
                                        if (
                                          preFunction.amountValidation(
                                            e.target.value
                                          )
                                        ) {
                                          handleChange(e);
                                          handleUnSavedChanges(0);
                                        }
                                      }}
                                    />
                                  ) : null}
                                </>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                        <div className="text-right mt-2 p-0">
                          <Button
                            tabIndex={6}
                            type="button"
                            onClick={() => {
                              handleSave(values);
                            }}
                            text="F4 - Next"
                            id="save"
                          />
                        </div>
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </Tab>
          <Tab eventKey={2} title="Purchasing">
            <div className="row no-gutters mt-1 p-3">
              <Formik
                enableReinitialize={false}
                innerRef={formikActivityRef}
                initialValues={{
                  collegeId: "",
                  purchaseUnitOfMeasure: "",
                  minimumOrderQuantity: "",
                  safetyStock: "",
                  leadTime: "",
                  lastPurchaseRate: "",
                  allowPurchase: false,
                  customerProvidedItem: false,
                  customer: "",
                }}
                validationSchema={ActivityFormSchema}
                onSubmit={getAllAssignedStudents}
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
                      <div className="row no-gutters">
                        <div className="col-lg-12">
                          {/* {collegeConfig.is_university ? (
                            <SelectFieldFormik
                              autoFocus
                              tabIndex={0}
                              label="College"
                              id="collegeId"
                              mandatory={1}
                              options={collegeConfig.collegeList}
                              getOptionLabel={(option) => option.collegeName}
                              getOptionValue={(option) => option.collegeID}
                              searchIcon={false}
                              clear={false}
                              onChange={(text) => {
                                setFieldValue("collegeId", text);
                                getGroupList(text.collegeID);
                                selectList(text.collegeID);
                                setFieldValue("particular", "");
                                setFieldValue("amount", "");
                                setActivityGroupStudentList([]);
                                setShowRes(false);
                              }}
                              style={{ width: "80%" }}
                            />
                          ) : null} */}
                          <SelectFieldFormik
                            label={"Purchase Unit of Measure"}
                            id="purchaseUnitOfMeasure"
                            tabIndex={1}
                            labelSize={3}
                            mandatory={1}
                            maxlength={40}
                            matchFrom="start"
                            clear={false}
                            options={courseList}
                            style={{ width: "50%" }}
                            getOptionLabel={(option) => option.courseName}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("purchaseUnitOfMeasure", text);
                            }}
                          />
                          <TextFieldFormik
                            id="minimumOrderQuantity"
                            label="Minimum Order Quantity"
                            placeholder=" "
                            labelSize={3}
                            mandatory={1}
                            tabIndex={5}
                            maxlength={7}
                            style={{ width: "10%" }}
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e.target.value)
                              ) {
                                handleChange(e);
                                handleUnSavedChanges(0);
                              }
                            }}
                          />
                          <TextFieldFormik
                            id="safetyStock"
                            label="Safety Stock"
                            placeholder=" "
                            labelSize={3}
                            mandatory={1}
                            tabIndex={5}
                            maxlength={7}
                            style={{ width: "10%" }}
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e.target.value)
                              ) {
                                handleChange(e);
                                handleUnSavedChanges(0);
                              }
                            }}
                          />
                          <CheckboxField
                            label={"Allow Purchase"}
                            value={values.allowPurchase}
                            checked={values.allowPurchase}
                            leftLabel={true}
                            labelSize={3}
                            onChange={() => {
                              setFieldValue(
                                "allowPurchase",
                                !values.allowPurchase
                              );
                            }}
                            // disabled={!toDateOff ? false : true}
                          />
                          <TextFieldFormik
                            id="leadTime"
                            label="Lead Time in Days"
                            placeholder=" "
                            labelSize={3}
                            mandatory={1}
                            tabIndex={5}
                            maxlength={7}
                            style={{ width: "10%" }}
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e.target.value)
                              ) {
                                handleChange(e);
                                handleUnSavedChanges(0);
                              }
                            }}
                          />
                          <TextFieldFormik
                            id="lastPurchaseRate"
                            label="Last Purchase Rate"
                            placeholder=" "
                            labelSize={3}
                            mandatory={1}
                            tabIndex={5}
                            maxlength={7}
                            style={{ width: "10%" }}
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e.target.value)
                              ) {
                                handleChange(e);
                                handleUnSavedChanges(0);
                              }
                            }}
                          />
                          <CheckboxField
                            label={"Customer Provided Item"}
                            value={values.customerProvidedItem}
                            checked={values.customerProvidedItem}
                            leftLabel={true}
                            labelSize={3}
                            onChange={() => {
                              setFieldValue(
                                "customerProvidedItem",
                                !values.customerProvidedItem
                              );
                            }}
                            // disabled={!toDateOff ? false : true}
                          />
                          {values?.customerProvidedItem ? (
                            <SelectFieldFormik
                              label="Customer"
                              tabIndex={1}
                              id="customer"
                              mandatory={1}
                              labelSize={3}
                              style={{ width: "50%" }}
                              options={activityGroupList}
                              getOptionLabel={(option) =>
                                option.activityGroupName
                              }
                              getOptionValue={(option) =>
                                option.activityGroupID
                              }
                              onChange={(text) => {
                                setFieldValue("customer", text);
                              }}
                            />
                          ) : null}
                          <CheckboxField
                            label={"Delivered by Supplier"}
                            value={values.deliveredBySupplier}
                            checked={values.deliveredBySupplier}
                            leftLabel={true}
                            labelSize={3}
                            onChange={() => {
                              setFieldValue(
                                "deliveredBySupplier",
                                !values.deliveredBySupplier
                              );
                            }}
                            // disabled={!toDateOff ? false : true}
                          />
                          <SelectFieldFormik
                            label="Supplier"
                            id="supplier"
                            mandatory={1}
                            tabIndex={4}
                            labelSize={3}
                            maxlength={10}
                            matchFrom="start"
                            options={particularList}
                            clear={false}
                            style={{ width: "50%" }}
                            getOptionLabel={(option) => option.particular}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("supplier", text);
                              handleUnSavedChanges(0);
                            }}
                          />

                          <SelectFieldFormik
                            label="Country of Origin"
                            id="countryOfOrigin"
                            mandatory={1}
                            tabIndex={4}
                            maxlength={10}
                            labelSize={3}
                            matchFrom="start"
                            options={activityFeesTypeList}
                            clear={false}
                            style={{ width: "40%" }}
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            onChange={(text) => {
                              setFieldValue("countryOfOrigin", text);
                              handleUnSavedChanges(0);
                            }}
                          />

                          <TextFieldFormik
                            id="customsTariffNumber"
                            isAmount={true}
                            label="Customs Tariff Number"
                            placeholder=" "
                            mandatory={1}
                            tabIndex={5}
                            labelSize={3}
                            maxlength={7}
                            style={{ width: "20%" }}
                            onChange={(e) => {
                              setActivityGroupStudentList([]);
                              if (
                                preFunction.amountValidation(e.target.value)
                              ) {
                                handleChange(e);
                                handleUnSavedChanges(0);
                              }
                            }}
                          />
                          <div className="subhead-row">
                            <div className="subhead">Sales</div>
                            <div className="col line-div"></div>
                          </div>
                        </div>
                        <SelectFieldFormik
                          label="Sales Unit of Measure"
                          id="salesUnitOfMeasure"
                          mandatory={1}
                          tabIndex={4}
                          maxlength={10}
                          labelSize={3}
                          matchFrom="start"
                          options={activityFeesTypeList}
                          clear={false}
                          style={{ width: "40%" }}
                          getOptionLabel={(option) => option.label}
                          getOptionValue={(option) => option.value}
                          onChange={(text) => {
                            setFieldValue("salesUnitOfMeasure", text);
                            handleUnSavedChanges(0);
                          }}
                        />
                        <TextFieldFormik
                          id="customsTariffNumber"
                          isAmount={true}
                          label="Maximum Discount (%)"
                          placeholder=" "
                          mandatory={1}
                          tabIndex={5}
                          labelSize={3}
                          maxlength={7}
                          style={{ width: "20%" }}
                          onChange={(e) => {
                            setActivityGroupStudentList([]);
                            if (preFunction.amountValidation(e.target.value)) {
                              handleChange(e);
                              handleUnSavedChanges(0);
                            }
                          }}
                        />
                        <CheckboxField
                          label={"Grant Commission"}
                          value={values.grantCommission}
                          checked={values.grantCommission}
                          leftLabel={true}
                          labelSize={3}
                          onChange={() => {
                            setFieldValue(
                              "grantCommission",
                              !values.grantCommission
                            );
                          }}
                          // disabled={!toDateOff ? false : true}
                        />
                        <CheckboxField
                          label={"Allow Sales"}
                          value={values.allowSales}
                          checked={values.allowSales}
                          leftLabel={true}
                          labelSize={3}
                          onChange={() => {
                            setFieldValue("allowSales", !values.allowSales);
                          }}
                          // disabled={!toDateOff ? false : true}
                        />

                        <div className="text-right mt-2 p-0">
                          <Button
                            tabIndex={6}
                            type="button"
                            onClick={() => {
                              // handleSaveActivityFee(values);
                            }}
                            text="F4 - Save"
                          />
                        </div>
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default AddProduct;
