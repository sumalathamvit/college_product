import React, { useEffect, useRef, useState, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";

import libraryapi from "../api/libraryapi";

import { useSelector } from "react-redux";
import AuthContext from "../auth/context";
import ModalComponent from "../component/ModalComponent";
import TextField from "../component/FormField/TextField";
import { toast } from "react-toastify";

function InstitutionConfig() {
  const collegeConfig = useSelector((state) => state.web.college);
  const { setUnSavedChanges, collegeId } = useContext(AuthContext);

  const formikRef = useRef();

  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [moduleList, setModuleList] = useState([]);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    module: Yup.object().required("Please select Config Data"),
  });

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage?.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage?.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const getCollegeConfig = async (collegeId, key) => {
    console.log("Key", key);
    try {
      if (!collegeId) {
        return;
      }
      const collegeConfigRes = await libraryapi.getCollegeConfigData(
        collegeId,
        key == "All" ? null : key
      );
      console.log("collegeConfigRes", collegeConfigRes);

      if (!collegeConfigRes.data.message.success) {
        setModalMessage(collegeConfigRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        return;
      }
      let configData = collegeConfigRes.data.message.data.config_data;
      if (key == "All") {
        let arr = [];
        for (let i = 0; i < configData.length; i++) {
          arr.push({
            label: configData[i].data,
            value: configData[i].data,
          });
        }
        setModuleList(arr);
      }
      console.log("configData", configData);
      setData(configData);
    } catch (error) {
      console.log("error", error);
    }
  };

  // const handleDeleteConfig = (index, key) => {
  //   let tempData = [...data];
  //   delete tempData[index].value[key];
  //   setData(tempData);
  // };

  // const handleAddConfig = () => {
  //   console.log("configName", configName);
  //   let err = false;
  //   if (!configValue) {
  //     setConfigValueError(true);
  //     setConfigValueErrorMessage("Please enter Config Value");
  //     document.getElementById("configValue").focus();
  //     err = true;
  //   }
  //   if (!configName) {
  //     setConfigNameError(true);
  //     setConfigNameErrorMessage("Please enter Config Name");
  //     document.getElementById("configName").focus();
  //     err = true;
  //   }
  //   if (configValue && configValue.length < 3) {
  //     setConfigValueError(true);
  //     setConfigValueErrorMessage("Please enter minimun 3 char");
  //     document.getElementById("configValue").focus();
  //     err = true;
  //   }
  //   if (configName && configName.length < 3) {
  //     setConfigNameError(true);
  //     setConfigNameErrorMessage("Please enter minimun 3 char");
  //     document.getElementById("configName").focus();
  //     err = true;
  //   }
  //   if (err) {
  //     return;
  //   }

  //   let tempData = [...data];
  //   let lastObj = tempData[tempData.length - 1];
  //   lastObj[configName] = configValue;
  //   setData(tempData);

  //   setConfigName("");
  //   setConfigValue("");

  //   handleUnSavedChanges(1);
  // };

  const handleSaveConfig = async (item, values) => {
    console.log("item", item);
    console.log("values", values);
    if (!item) return;
    try {
      setLoad(true);
      const addorUpdateConfig = await libraryapi.upDateConfig(
        item.configID,
        values.college ? values.college.collegeID : collegeId,
        item.data,
        item.value
      );
      console.log("addorUpdateConfig", addorUpdateConfig);

      if (addorUpdateConfig.data.message.success) {
        toast.success(addorUpdateConfig.data.message.message);
        getCollegeConfig(collegeId, values.module.value);
        handleUnSavedChanges(0);
        setEditIndex(-1);
      } else {
        setModalMessage(addorUpdateConfig.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleClear = () => {
    setShowRes(false);
    setData([]);
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getCollegeConfig(collegeId, "All");
    }
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
        <ScreenTitle titleClass={"page-heading-position"} />
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={{
              college: "",
              module: "",
            }}
            validationSchema={FormSchema}
            onSubmit={(values) => {
              getCollegeConfig(
                values.college ? values.college.collegeID : collegeId,
                values.module ? values.module.value : null
              );
              setShowRes(true);
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
                  {collegeConfig.is_university && (
                    <SelectFieldFormik
                      autoFocus
                      labelSize={2}
                      tabIndex={1}
                      label="College"
                      id="college"
                      mandatory={1}
                      options={collegeConfig.collegeList}
                      getOptionLabel={(option) => option.collegeName}
                      getOptionValue={(option) => option.collegeID}
                      searchIcon={false}
                      clear={false}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setFieldValue("college", text);
                        if (text?.collegeID) {
                          getCollegeConfig(text.collegeID, "All");
                        }
                        handleClear();
                      }}
                    />
                  )}
                  <SelectFieldFormik
                    label="Config Data"
                    labelSize={2}
                    id="module"
                    options={[{ label: "All", value: "All" }, ...moduleList]}
                    style={{ width: "30%" }}
                    mandatory={1}
                    maxlength={15}
                    tabIndex={2}
                    onChange={(text) => {
                      setShowRes(false);
                      setFieldValue("module", text);
                      handleClear();
                    }}
                  />
                  {data.length === 0 && (
                    <Button
                      type="submit"
                      text="Show"
                      tabIndex={4}
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                    />
                  )}
                  {showRes && (
                    <>
                      {data.map((item, index) => {
                        let obj = JSON.parse(item.value);
                        let heading = Object.keys(obj);
                        return (
                          <div key={index}>
                            <div className="row no-gutters">
                              <div className="subhead-row">
                                <div className="subhead">{item.data}</div>
                                <div className="col line-div"></div>
                              </div>
                            </div>

                            <div className="row no-gutters">
                              <div className="col-lg-10">
                                <div className="table p-0 m-0">
                                  <table className="table table-bordered mb-1">
                                    <thead>
                                      <tr>
                                        <th>No.</th>
                                        <th>Config Name</th>
                                        <th>Config Value</th>
                                        <th></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {heading.map((item, idx) => (
                                        <tr key={idx}>
                                          <th width="5%">{idx + 1}</th>
                                          <th width="20%">{item}</th>
                                          <td width="70%">
                                            <TextField
                                              id="updateData"
                                              value={obj[item]}
                                              mandatory={1}
                                              onChange={(e) => {
                                                let tempData = [...data];
                                                let tempObj = JSON.parse(
                                                  tempData[index].value
                                                );
                                                if (
                                                  typeof obj[item] === "object"
                                                ) {
                                                  tempObj[item] =
                                                    e.target.value.split(",");
                                                } else {
                                                  tempObj[item] =
                                                    e.target.value;
                                                }
                                                tempData[index].value =
                                                  JSON.stringify(tempObj);
                                                setData(tempData);
                                                handleUnSavedChanges(1);
                                              }}
                                              disabled={editIndex !== index}
                                            />
                                          </td>
                                          <td width="5%">
                                            <Button
                                              isTable={true}
                                              type="button"
                                              className="plus-button"
                                              text="-"
                                              onClick={() => {
                                                let tempData = [...data];
                                                let tempObj = JSON.parse(
                                                  tempData[index].value
                                                );
                                                delete tempObj[item];
                                                tempData[index].value =
                                                  JSON.stringify(tempObj);
                                                setData(tempData);

                                                handleUnSavedChanges(1);
                                              }}
                                              disabled={editIndex !== index}
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                      <tr>
                                        <th></th>
                                        <td>
                                          <TextField
                                            id="configName"
                                            placeholder={"Config Name"}
                                            mandatory={1}
                                            maxlength={25}
                                            onChange={(e) => {}}
                                            disabled={editIndex !== index}
                                          />
                                        </td>
                                        <td>
                                          <TextField
                                            id="configValue"
                                            placeholder={"Config Value"}
                                            mandatory={1}
                                            maxlength={140}
                                            onChange={(e) => {}}
                                            disabled={editIndex !== index}
                                          />
                                        </td>
                                        <td>
                                          <Button
                                            isTable={true}
                                            type="button"
                                            className="plus-button"
                                            text="+"
                                            onClick={(event) => {
                                              event.preventDefault();
                                              const row =
                                                event.target.closest("tr");
                                              const configName =
                                                row.querySelector(
                                                  "#configName"
                                                ).value;
                                              const configValue =
                                                row.querySelector(
                                                  "#configValue"
                                                ).value;

                                              if (!configName) {
                                                row
                                                  .querySelector("#configName")
                                                  .focus();
                                                return;
                                              }
                                              if (!configValue) {
                                                row
                                                  .querySelector("#configValue")
                                                  .focus();
                                                return;
                                              }

                                              let tempData = [...data];
                                              let tempObj = JSON.parse(
                                                tempData[index].value
                                              );
                                              tempObj[configName] = configValue;
                                              tempData[index].value =
                                                JSON.stringify(tempObj);
                                              setData(tempData);
                                              handleUnSavedChanges(1);
                                              row.querySelector(
                                                "#configName"
                                              ).value = "";
                                              row.querySelector(
                                                "#configValue"
                                              ).value = "";
                                            }}
                                            disabled={editIndex !== index}
                                          />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <div className="row no-gutters">
                                    <Button
                                      id="saveBtn"
                                      text="Save"
                                      type="button"
                                      isCenter={true}
                                      onClick={async (event) => {
                                        event.preventDefault();
                                        const tableDiv =
                                          event.target.closest(".table");
                                        const rows =
                                          tableDiv.querySelectorAll("tbody tr");

                                        let configName =
                                          rows[rows.length - 1].querySelector(
                                            "#configName"
                                          ).value;
                                        let configValue =
                                          rows[rows.length - 1].querySelector(
                                            "#configValue"
                                          ).value;
                                        if (configName && configValue) {
                                          let tempData = [...data];
                                          let tempObj = JSON.parse(
                                            tempData[index].value
                                          );
                                          tempObj[configName] = configValue;
                                          tempData[index].value =
                                            JSON.stringify(tempObj);
                                          setData(tempData);
                                          handleUnSavedChanges(1);
                                          rows[rows.length - 1].querySelector(
                                            "#configName"
                                          ).value = "";
                                          rows[rows.length - 1].querySelector(
                                            "#configValue"
                                          ).value = "";
                                        }

                                        await handleSaveConfig(item, values);
                                      }}
                                      disabled={editIndex !== index}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-2 text-right">
                                <Button
                                  isTable={true}
                                  isCenter={false}
                                  text="Edit"
                                  type="button"
                                  className={"btn-3"}
                                  onClick={() => {
                                    setEditIndex(index);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
export default InstitutionConfig;
