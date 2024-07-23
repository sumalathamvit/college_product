import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";

import libraryapi from "../api/libraryapi";
import StudentApi from "../api/StudentApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import ScreenTitle from "../component/common/ScreenTitle";

const startingWithLetter = Yup.string().matches(
  /^[A-Za-z]/,
  "Name must start with a letter"
);

const containingValidCharacters = Yup.string().matches(
  /^[A-Za-z@. ()\-\d]*$/,
  "Please enter valid Supplier Name"
);

const supplierAddSchema = Yup.object().shape({
  supplierName: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .concat(startingWithLetter)
    .concat(containingValidCharacters)
    .required("Please enter Supplier Name")
    .trim(),

  supplierEmail: Yup.string().test(
    "is-valid-email",
    "Enter valid Email",
    (value) => {
      if (value && value.trim() !== "") {
        return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(value));
      }
      return true;
    }
  ),
  supplierPhoneNumber: Yup.string()
    .required("Please enter Mobile Number")
    .matches(/^[0-9]\d{9}$/, "Please enter valid Mobile Number"),
  supplierAddress1: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(/^[A-Za-z0-9\s,.'\-&@#/]+$/, "Please enter Valid Address")
    .required("Please enter Address Line 1")
    .trim(),
  supplierAddress2: Yup.string()
    .matches(/^[A-Za-z0-9\s,.'\-&@#/]+$/, "Please enter Valid Address")
    .trim(),
  state: Yup.object().required("Please select state"),
  city: Yup.object().when("state", (state, schema) => {
    if (state[0]?.state == "Tamil Nadu" || state[0]?.state == "Puducherry") {
      return Yup.object().required("Please select City/District");
    }
    return schema;
  }),
  otherCity: Yup.string().when("state", (state, schema) => {
    if (state[0]?.state != "Tamil Nadu" && state[0]?.state != "Puducherry") {
      return Yup.string().required("Please enter City/District");
    }
    return schema;
  }),
  pinCode: Yup.number()
    .test("is-six-digits", "Please enter valid Pin Code", (value) =>
      /^[0-9]{6}$/.test(String(value))
    )
    .required("Please enter Pin Code"),
});
let otherCity = false;

function SupplierComponent({ supplierModal = false, handleClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);

  const [supplierNameError, setSupplierNameError] = useState(false);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const formikRef = useRef();

  const handleSave = async (values, check, { resetForm }) => {
    if (load) return;
    try {
      setLoad(true);
      console.log("values------", values);

      const addSupplierRes = await libraryapi.addSupplier(
        values.supplierName.replace(/\s\s+/g, " ").trim(),
        values.supplierPhoneNumber.toString(),
        values.supplierEmail
      );
      console.log("addSupplierRes---", addSupplierRes);
      if (addSupplierRes.ok == true) {
        const addAddressRes = await libraryapi.addSupplierAddress(
          addSupplierRes.data.data.name,
          values.supplierAddress1.replace(/\s\s+/g, " ").trim(),
          values.supplierAddress2.replace(/\s\s+/g, " ").trim(),
          otherCity == true
            ? values.otherCity.replace(/\s\s+/g, " ").trim()
            : values.city.city,
          values.state.state,
          values.pinCode
        );
        console.log("addAddressRes--------", addAddressRes);
        if (addAddressRes.ok == true) {
          toast.success("Supplier Added Successfully");
          resetForm();
          if (check) handleClose();
          const states = stateList.filter(
            (data) => data.state === "Tamil Nadu"
          );
          console.log("tamilNaduStates", states);
          formikRef.current.setFieldValue("state", states[0]);
          document.getElementById("supplierName")?.focus();
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleSupplierName = async (text) => {
    try {
      console.log("text", text);
      if (text.length > 2) {
        const validatesSupplier = await libraryapi.validateSupplier(text);
        console.log("validatesSupplier", validatesSupplier);
        if (validatesSupplier.data.data.length > 0) {
          setSupplierNameError(true);
          document.getElementById("supplierName")?.focus();
          return;
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleState = async (value) => {
    console.log("state---", value);
    if (!value) {
      return;
    }
    if (value.state != "Puducherry" && value.state != "Tamil Nadu") {
      otherCity = true;
    } else {
      otherCity = false;
      const masterRes = await StudentApi.getCityMaster(3, value.id);
      console.log("masterRes----", masterRes);
      setCityList(masterRes.data.message.data.city_data);
    }
  };

  const handleMasterData = async () => {
    try {
      const masterRes = await StudentApi.getMaster(3);
      console.log("masterRes", masterRes);
      const tamilNaduStates = masterRes.data.message.data.state_data.filter(
        (data) => data.state === "Tamil Nadu"
      );
      console.log("tamilNaduStates", tamilNaduStates);
      formikRef.current.setFieldValue("state", tamilNaduStates[0]);
      setStateList(masterRes.data.message.data.state_data);
      handleState(tamilNaduStates[0]);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    handleMasterData();
  }, []);

  return (
    <Formik
      innerRef={formikRef}
      enableReinitialize={true}
      initialValues={{
        supplierName: "",
        supplierEmail: "",
        supplierPhoneNumber: "",
        supplierAddress1: "",
        supplierAddress2: "",
        state: "",
        city: "",
        otherCity: "",
        pinCode: "",
      }}
      validationSchema={supplierAddSchema}
      onSubmit={(values) => {
        handleSave(values, supplierModal ? 1 : 0, formikRef.current);
      }}
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
            <CustomActivityIndicator
              style={{ height: 100, alignSelf: "center" }}
              visible={load}
            />
            <div className="row no-gutters">
              <div className="col-lg-10 ms-4 mt-2">
                <TextFieldFormik
                  autoFocus
                  label="Supplier Name"
                  id="supplierName"
                  labelSize={3}
                  mandatory={1}
                  tabIndex="101"
                  maxlength={45}
                  onBlur={(e) => handleSupplierName(e.target.value)}
                  style={{ width: "60%" }}
                  onChange={(e) => {
                    setFieldValue(
                      "supplierName",
                      preFunction.capitalizeFirst(e.target.value)
                    );
                    setSupplierNameError(false);
                  }}
                  error={supplierNameError ? "Supplier already exists" : ""}
                  touched={supplierNameError ? true : false}
                />

                <TextFieldFormik
                  label="Supplier Email ID"
                  id="supplierEmail"
                  labelSize={3}
                  tabIndex="102"
                  onChange={handleChange}
                  maxlength={50}
                  style={{ width: "60%" }}
                />

                <TextFieldFormik
                  id="supplierPhoneNumber"
                  label="Mobile Number"
                  placeholder="Mobile"
                  labelSize={3}
                  style={{ width: "32%" }}
                  tabIndex="103"
                  onChange={(e) => {
                    if (preFunction.amountValidation(e.target.value)) {
                      setFieldValue("supplierPhoneNumber", e.target.value);
                    }
                  }}
                  maxlength={10}
                  mandatory={1}
                />

                <TextFieldFormik
                  label="Address Line 1"
                  id="supplierAddress1"
                  maxlength={45}
                  tabIndex="104"
                  labelSize={3}
                  style={{ width: "80%" }}
                  onChange={handleChange}
                  mandatory={1}
                />

                <TextFieldFormik
                  label="Address Line 2"
                  id="supplierAddress2"
                  maxlength={45}
                  tabIndex="105"
                  labelSize={3}
                  style={{ width: "80%" }}
                  onChange={handleChange}
                />

                <SelectFieldFormik
                  label="State"
                  id="state"
                  options={stateList}
                  tabIndex="106"
                  clear={false}
                  getOptionLabel={(option) => option.state}
                  getOptionValue={(option) => option.id}
                  mandatory={1}
                  labelSize={3}
                  onChange={(text) => {
                    setFieldValue("state", text);
                    setFieldValue("city", "");
                    handleState(text);
                  }}
                  style={{ width: "80%" }}
                />
                {otherCity ? (
                  <TextFieldFormik
                    id="otherCity"
                    label="City/District"
                    onChange={handleChange}
                    maxlength={40}
                    tabIndex={otherCity ? "107" : ""}
                    mandatory={1}
                    labelSize={3}
                    style={{ width: "80%" }}
                  />
                ) : (
                  <SelectFieldFormik
                    label="City/District"
                    id="city"
                    labelSize={3}
                    options={cityList}
                    clear={false}
                    tabIndex={otherCity ? "" : "107"}
                    getOptionLabel={(option) => option.city}
                    getOptionValue={(option) => option.id}
                    mandatory={1}
                    onChange={(text) => setFieldValue("city", text)}
                    style={{ width: "80%" }}
                  />
                )}

                <TextFieldFormik
                  label="Pin Code"
                  id="pinCode"
                  maxlength={6}
                  tabIndex="108"
                  labelSize={3}
                  mandatory={1}
                  style={{ width: "32%" }}
                  onChange={(e) => {
                    if (preFunction.amountValidation(e.target.value)) {
                      setFieldValue("pinCode", e.target.value);
                    }
                  }}
                />
              </div>
            </div>
            {supplierModal == true ? (
              <div className="row p-0 my-2">
                <div className="col-lg-6 text-right">
                  <Button
                    text="F4 - Save"
                    frmButton={false}
                    tabIndex="109"
                    // isTable={true}
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                    id="save"
                  />
                </div>

                <div className="col-lg-6 text-left">
                  <Button
                    text="Close"
                    type="button"
                    // isTable={true}
                    frmButton={false}
                    onClick={(e) => {
                      console.log("close");
                      handleClose();
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="row no-gutters mt-3">
                <Button
                  onClick={(e) => preFunction.handleErrorFocus(errors)}
                  text="F4 - Save"
                  tabIndex="109"
                  id="save"
                />
              </div>
            )}
          </form>
        );
      }}
    </Formik>
  );
}

export default SupplierComponent;
