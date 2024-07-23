import React, { useEffect, useState, useContext, useRef } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";

import libraryapi from "../api/libraryapi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import ErrorMessage from "../component/common/ErrorMessage";
import ScreenTitle from "../component/common/ScreenTitle";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";

function LibrarySettings() {
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [memberType, setMemberType] = useState("");
  const [issueConfigList, setIssueConfigList] = useState([]);
  const [issueCount, setIssueCount] = useState();
  const [fineAmount, setFineAmount] = useState();
  const [dueDays, setDueDays] = useState();
  const [noChangeError, setNoChangeError] = useState(false);
  const [college, setCollege] = useState();
  const { unSavedChanges, setUnSavedChanges, collegeId } =
    useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const DetailsSchema = Yup.object().shape({
    college: collegeConfig?.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    memberType: Yup.object().required("Please select Member Type"),
    issueCount: Yup.number().required("Please enter maximum Issue Count"),
    dueDays: Yup.number()
      .max(365, "Please enter less than 365")
      .required("Please enter Due Days"),

    fineAmount: Yup.number().required("Please enter Fine Amount"),
  });
  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    try {
      setLoad(true);
      console.log("values", values);
      if (
        memberType.value == values.memberType.value &&
        issueCount == values.issueCount &&
        dueDays == values.dueDays &&
        fineAmount == values.fineAmount
      ) {
        setNoChangeError(true);
        setLoad(false);
        return;
      } else {
        const librarySettingRes = await libraryapi.editLibrarySetting(
          values.memberType.value,
          values.issueCount,
          values.dueDays,
          values.fineAmount,
          collegeConfig?.is_university ? values.college.collegeID : collegeId
        );
        console.log("librarySettingRes---", librarySettingRes);
        if (librarySettingRes.ok == true) {
          handleUnSavedChanges(0);
          toast.success("Library Setting Updated Successfully");
          document
            .getElementById(
              collegeConfig?.is_university ? "college" : "memberType"
            )
            ?.focus();
          setMemberType("");
          setIssueCount("");
          setDueDays("");
          setFineAmount("");
          setCollege("");
        }
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const getLibrarySetting = async (collegeID) => {
    try {
      const libraryConfigRes = await libraryapi.getLibrarySetting(collegeID);
      console.log("libraryConfigRes--", libraryConfigRes);
      setIssueConfigList(libraryConfigRes.data.data);
    } catch (error) {
      setLoad(false);
    }
  };

  const handleMemberType = async (text, values) => {
    const memberTypeRes = await libraryapi.viewLibrarySetting(text.value);
    console.log("memberTyperes---", memberTypeRes, values);
    if (collegeConfig?.is_university) {
      setCollege({
        collegeID: values.college.collegeID,
        collegeName: values.college.collegeName,
      });
    }
    setMemberType({
      label: memberTypeRes.data.data.member_type,
      value: memberTypeRes.data.data.name,
    });
    setIssueCount(memberTypeRes.data.data.book_limit);
    setDueDays(memberTypeRes.data.data.due_day);
    setFineAmount(memberTypeRes.data.data.fine_amount);
  };

  useEffect(() => {
    if (!collegeConfig?.is_university) {
      console.log("college", collegeConfig?.is_university);
      getLibrarySetting(collegeId);
    } else {
      setIssueConfigList([]);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <Formik
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={{
              college: college,
              memberType: memberType,
              issueCount: issueCount,
              dueDays: dueDays,
              fineAmount: fineAmount,
            }}
            validationSchema={DetailsSchema}
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
              formik,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="row no-gutters ms-3 mt-2">
                    {collegeConfig?.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        id="college"
                        mandatory={1}
                        labelSize={3}
                        style={{ width: "70%" }}
                        options={collegeConfig?.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          console.log("college", text);
                          setFieldValue("college", text);
                          setFieldValue("memberType", "");
                          setFieldValue("issueCount", "");
                          setFieldValue("dueDays", "");
                          setFieldValue("fineAmount", "");
                          handleUnSavedChanges(1);
                          getLibrarySetting(text.collegeID);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      autoFocus={collegeConfig?.is_university ? false : true}
                      label="Member Type"
                      id="memberType"
                      tabIndex={collegeConfig?.is_university ? 2 : 1}
                      mandatory={1}
                      labelSize={3}
                      // search={false}
                      clear={false}
                      options={issueConfigList}
                      onChange={(text) => {
                        setFieldValue("memberType", text);
                        handleMemberType(text, values);
                        setNoChangeError(false);
                      }}
                      style={{ width: "40%" }}
                    />
                    <TextFieldFormik
                      id="issueCount"
                      label="Issue Count"
                      labelSize={3}
                      tabIndex={3}
                      onChange={(e) => {
                        if (preFunction.amountValidation(e.target.value)) {
                          setNoChangeError(false);
                          setFieldValue("issueCount", e.target.value);
                        }
                        handleUnSavedChanges(1);
                      }}
                      maxlength={2}
                      mandatory={1}
                      style={{ width: "25%" }}
                    />
                    <TextFieldFormik
                      id="dueDays"
                      label="Due Days"
                      labelSize={3}
                      tabIndex={4}
                      onChange={(e) => {
                        if (preFunction.amountValidation(e.target.value)) {
                          setNoChangeError(false);
                          setFieldValue("dueDays", e.target.value);
                        }
                        handleUnSavedChanges(1);
                      }}
                      maxlength={3}
                      mandatory={1}
                      style={{ width: "25%" }}
                    />
                    <TextFieldFormik
                      id="fineAmount"
                      placeholder="Fine Amount"
                      label="Fine Amount/Day (₹)"
                      labelSize={3}
                      tabIndex={5}
                      onChange={(e) => {
                        if (preFunction.amountValidation(e.target.value)) {
                          setNoChangeError(false);
                          setFieldValue("fineAmount", e.target.value);
                        }
                        handleUnSavedChanges(1);
                      }}
                      maxlength={2}
                      mandatory={1}
                      style={{ width: "25%" }}
                    />
                  </div>
                  <div className="col-lg-8 mt-2 text-center ms-3">
                    <ErrorMessage
                      Message={"No changes made"}
                      view={noChangeError}
                    />
                  </div>
                  <div className="row no-gutters mt-3">
                    <Button
                      tabIndex={6}
                      text="F4 - Save"
                      type="submit"
                      id="save"
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

export default LibrarySettings;
