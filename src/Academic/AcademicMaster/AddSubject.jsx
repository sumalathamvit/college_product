import React, {
  useEffect,
  useState,
  useRef,
  createRef,
  useContext,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import DateRangeIcon from "@mui/icons-material/DateRange";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import Button from "../../component/FormField/Button";
import moment from "moment";
import AcademicApi from "../../api/AcademicApi";
import { toast } from "react-toastify";
import ErrorMessage from "../../component/common/ErrorMessage";
import { useSelector } from "react-redux";
import AuthContext from "../../auth/context";
import ScreenTitle from "../../component/common/ScreenTitle";
import $ from "jquery";

function AddSubject() {
  //#region const
  const navigate = useNavigate();
  const location = useLocation();
  const formikRef = useRef();
  const formRef = useRef();
  const [load, setLoad] = useState(false);
  const [subjectTypeList, setSubjectTypeList] = useState([]);
  const [collegeList, setCollegeList] = useState([]);
  const [regulationList, setRegulationList] = useState([]);
  const [markError, setMarkError] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedRegulation, setSelectedRegulation] = useState("");
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName, setUnSavedChanges } = useContext(AuthContext);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    regulation: $("#regulation").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#regulation").attr("alt") ?? "Regulation"}`
        ),
    subjectType: $("#subjectType").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#subjectType").attr("alt") ?? "Subject Type"}`
        ),
    subjectCode: $("#subjectCode").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.string()
          .required(
            `Please enter ${$("#subjectCode").attr("alt") ?? "Subject Code"}`
          )
          .matches(
            /^[a-zA-Z0-9]+$/,
            `Please enter valid ${
              $("#subjectCode").attr("alt") ?? "Subject Code"
            }`
          ),
    subjectName: $("#subjectName").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.string().required(
          `Please enter ${$("#subjectName").attr("alt") ?? "Subject Name"}`
        ),
    maxMark: $("#maxMark").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.number("Please enter Valid Number")
          .max(100, "Mark should be less than 100")
          .required(`Please enter ${$("#maxMark").attr("alt") ?? "Max Mark"}`),
    minMark: $("#minMark").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.number("Please enter Valid Number")
          .max(100, "Mark should be less than 100")
          .required(`Please enter ${$("#minMark").attr("alt") ?? "Min Mark"}`),
    creditPoint: $("#creditPoint").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.number("Please enter Valid Number").required(
          `Please enter ${$("#creditPoint").attr("alt") ?? "Credit Point"}`
        ),
  });

  console.log("FormSchema---", FormSchema);

  const getMaster = async () => {
    const getSubjectTypeRes = await AcademicApi.getAllSubjectType();
    console.log("getSubjectTypeRes---", getSubjectTypeRes);
    setSubjectTypeList(getSubjectTypeRes.data.message.data.subjectTypes);

    const getRegulationRes = await AcademicApi.getAllRegulation();
    console.log("getRegulationRes---", getRegulationRes);
    setRegulationList(getRegulationRes.data.message.data.regulation);
  };

  const handelSave = async (values, { resetForm }) => {
    if (load) return;
    if (duplicateError) {
      document.getElementById("subjectCode").focus();
      return;
    }
    try {
      setLoad(true);
      console.log("values---", values);
      // return;
      setUnSavedChanges(false);
      if (parseInt(values.minMark) >= parseInt(values.maxMark)) {
        setMarkError(true);
        document.getElementById("minMark").focus();
        setLoad(false);
        return;
      }

      const addSubjectRes = await AcademicApi.addUpdateSubject(
        values.college.collegeID ? values.college.collegeID : collegeId,
        values.regulation.regulation,
        values.subjectType.subjectTypeID,
        values.subjectName.replace(/\s\s+/g, " ").trim(),
        values.subjectCode,
        values.minMark,
        values.maxMark,
        values.creditPoint ? values.creditPoint : 0
      );
      console.log("addSubjectRes---", addSubjectRes);
      if (addSubjectRes.data.message.success) {
        toast.success(addSubjectRes.data.message.message);
        resetForm();
        document.getElementById("subjectType").focus();
      } else {
        setDuplicateError(true);
        setDuplicateMessage(addSubjectRes.data.message.message);
        document.getElementById("subjectCode").focus();
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleSubjectCode = async (text) => {
    console.log("text", text);
    try {
      if (text === "") {
        setDuplicateError(false);
        return;
      }
      const res = await AcademicApi.checkDuplicateSubjectCode(
        text,
        collegeConfig.is_university ? selectedCollege?.collegeID : collegeId
      );
      console.log("res", res);
      if (res.data.message.success) {
        setDuplicateError(false);
      } else {
        setDuplicateError(true);
        setDuplicateMessage(res.data.message.message);
        document.getElementById("subjectCode").focus();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMaster();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: selectedCollege,
              regulation: selectedRegulation,
              subjectType: "",
              subjectName: "",
              subjectCode: "",
              creditPoint: "",
              minMark: "",
              maxMark: "",
            }}
            validationSchema={FormSchema}
            onSubmit={handelSave}
          >
            {({ errors, handleSubmit, handleChange, setFieldValue }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off" ref={formRef}>
                  <div className="col-lg-10">
                    {collegeConfig.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        id="college"
                        mandatory={1}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setSelectedCollege(text);
                          setUnSavedChanges(true);
                        }}
                      />
                    ) : null}
                    <SelectFieldFormik
                      tabIndex={2}
                      label="Regulation"
                      id="regulation"
                      options={regulationList}
                      getOptionLabel={(option) => option.regulation}
                      getOptionValue={(option) => option.regulation}
                      style={{ width: "50%" }}
                      mandatory={1}
                      maxlength={4}
                      onChange={(text) => {
                        setFieldValue("regulation", text);
                        setSelectedRegulation(text);
                        setUnSavedChanges(true);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={3}
                      label="Subject Type"
                      id="subjectType"
                      getOptionLabel={(option) => option.subjectType}
                      getOptionValue={(option) => option.subjectTypeID}
                      options={subjectTypeList}
                      maxlength={10}
                      mandatory={1}
                      onChange={(text) => {
                        setFieldValue("subjectType", text);
                        setUnSavedChanges(true);
                      }}
                    />
                    <TextFieldFormik
                      tabIndex={4}
                      id="subjectCode"
                      label="Subject Code"
                      mandatory={1}
                      onChange={(e) => {
                        setDuplicateError(false);
                        setFieldValue("subjectCode", e.target.value);
                        setUnSavedChanges(true);
                      }}
                      onBlur={(e) => {
                        handleSubjectCode(e.target.value);
                      }}
                      error={duplicateError ? duplicateMessage : ""}
                      touched={duplicateError ? true : false}
                      style={{ width: "50%" }}
                      maxlength={10}
                    />
                    <TextFieldFormik
                      tabIndex={5}
                      id="subjectName"
                      label="Subject Name"
                      mandatory={1}
                      onChange={(e) => {
                        handleChange(e);
                        setUnSavedChanges(true);
                      }}
                      maxlength={45}
                    />

                    <TextFieldFormik
                      tabIndex={6}
                      id="maxMark"
                      label={"University Maximum Mark"}
                      placeholder={"Max"}
                      mandatory={1}
                      onChange={(e) => {
                        if (
                          !isNaN(e.target.value) &&
                          !e.target.value.includes(" ")
                        ) {
                          setMarkError(false);
                          setFieldValue("maxMark", e.target.value);
                          setUnSavedChanges(true);
                        }
                      }}
                      style={{ width: "30%" }}
                      maxlength={3}
                    />
                    <TextFieldFormik
                      tabIndex={7}
                      id="minMark"
                      label={"University Minimum Mark"}
                      placeholder={"Min"}
                      mandatory={1}
                      onChange={(e) => {
                        if (
                          !isNaN(e.target.value) &&
                          !e.target.value.includes(" ")
                        ) {
                          setMarkError(false);
                          setFieldValue("minMark", e.target.value);
                          setUnSavedChanges(true);
                        }
                      }}
                      error={
                        markError
                          ? "Minimum mark should be less than Maximum mark"
                          : ""
                      }
                      touched={markError ? true : false}
                      style={{ width: "30%" }}
                      maxlength={3}
                    />

                    <TextFieldFormik
                      tabIndex={8}
                      id="creditPoint"
                      label="Credit Points"
                      mandatory={1}
                      onChange={(e) => {
                        if (
                          !isNaN(e.target.value) &&
                          !e.target.value.includes(" ")
                        ) {
                          handleChange(e);
                          setUnSavedChanges(true);
                        }
                      }}
                      style={{ width: "30%" }}
                      maxlength={2}
                    />
                  </div>

                  <div className="mt-3">
                    <Button
                      id="save"
                      tabIndex={collegeConfig.is_university ? 9 : 8}
                      text="F4 - Save"
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                    />
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
export default AddSubject;
