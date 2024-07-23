import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import moment from "moment";
import { Tab, Tabs } from "react-bootstrap";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";

import libraryapi from "../api/libraryapi";

import preFunction from "../component/common/CommonFunction";
import { useSelector } from "react-redux";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import ReactSelectField from "../component/FormField/ReactSelectField";
import TextField from "../component/FormField/TextField";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import TextareaFieldFormik from "../component/FormField/TextareaFieldFormik";
import DisplayText from "../component/FormField/DisplayText";
import ErrorMessage from "../component/common/ErrorMessage";
import ScreenTitle from "../component/common/ScreenTitle";
import ModalComponent from "../component/ModalComponent";
import AuthContext from "../auth/context";

function JournalReceipt() {
  const journalRef = useRef();

  const [load, setLoad] = useState(false);

  const [supplementaryName, setSupplementaryName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [errorModal, setErrorModal] = useState(false);
  const [journalErrorMesage, setJournalErrorMesage] = useState("");

  const [journalIDList, setJournalIDList] = useState([]);
  const [modeOfReceiptList, setModeOfReceiptList] = useState([]);
  const [supplementaryList, setSupplementaryList] = useState([]);

  const [data, setData] = useState([]);
  const [supplementaryData, setSupplementaryData] = useState([]);

  const [qtyError, setQtyError] = useState(false);
  const [supError, setSupError] = useState(false);
  const [dueDateError, setDueDateError] = useState(false);

  const [count, setCount] = useState();

  const [showRes, setShowRes] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [addSupplementary, setAddSupplementary] = useState("");
  const [masterError, setMasterError] = useState(false);
  const [masterErrorMessage, setMasterErrorMessage] = useState("");
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId } = useContext(AuthContext);

  const journalSchema = Yup.object().shape({
    journalID: Yup.object().required("please select Journal ID"),
    dateofReceipt: Yup.date().required("please select Date of Receipt"),
    modeOfReceipt: Yup.object().required("please select Mode of Receipt"),
    dateOfIssue: Yup.date().required("please select Date of Issue"),
    volumeNo: Yup.string().required("please enter Volume Number"),
    issueNo: Yup.string().required("please enter Issue Number"),
    period: Yup.string().required("please enter Period"),
    pages: Yup.string().required("please enter Pages"),
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
    setJournalErrorMesage("");
    setErrorModal(false);
    try {
      setLoad(true);

      console.log("values", values, dueDate);
      console.log("supplementaryData", supplementaryData);
      if (dueDate == "") {
        setDueDateError(true);
        setLoad(false);
        return;
      }

      const journalReceiptRes = await libraryapi.addJournalReceipt(
        values.journalID.subscription_id,
        count == 0 ? values.dateOfIssue : dueDate,
        values.dateofReceipt,
        values.modeOfReceipt.value,
        values.dateOfIssue,
        values.volumeNo.replace(/\s\s+/g, " ").trim(),
        values.issueNo,
        values.period.replace(/\s\s+/g, " ").trim(),
        values.pages,
        values.remarks.replace(/\s\s+/g, " ").trim()
      );
      console.log("journalReceiptRes", journalReceiptRes);
      if (journalReceiptRes.ok == true) {
        toast.success("Journal Receipt Added Successfully");
        document.getElementById("journalID")?.focus();
        handleUnSavedChanges(0);
      } else {
        setErrorModal(true);
        setJournalErrorMesage(journalReceiptRes.data.message);
        setLoad(false);
        return;
      }

      if (supplementaryName !== "" && quantity !== "") {
        handleAddSupplementary();
      }
      console.log("supplementaryData", supplementaryData);

      if (supplementaryData.length > 0) {
        for (let i = 0; i < supplementaryData.length; i++) {
          const supplementaryRes = await libraryapi.addSupplementary(
            values.journalID.subscription_id,
            supplementaryData[i].supplementaryID,
            supplementaryData[i].quantity,
            supplementaryData[i].remark.replace(/\s\s+/g, " ").trim()
            // supplementaryData[i].status
          );
          console.log("supplementaryRes", supplementaryRes);
        }
      }
      setDueDate("");
      setSupplementaryData([]);
      setData([]);
      journalRef.current.setFieldValue("journalID", "");
      setShowRes(false);
      resetForm();

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleAddSupplementary = async () => {
    try {
      console.log("values", supplementaryName, quantity, remark);
      let err = false;
      if (!supplementaryName) {
        setSupError(true);
        err = true;
      }
      if (!quantity) {
        setQtyError(true);
        err = true;
      }
      if (err) return;

      let supDetails = supplementaryData;
      let obj = {
        supplementaryID: supplementaryName.value,
        supplementaryName: supplementaryName.label,
        quantity: quantity,
        remark: remark,
        // status: status,
      };
      supDetails.push(obj);
      setSupplementaryData(supDetails);

      let arr = supplementaryList.filter(
        (e) => e.value != supplementaryName.value
      );
      console.log("arr", arr);
      setSupplementaryList(arr);
      setSupplementaryName("");
      setQuantity("");
      setRemark("");
      // setStatus(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleDeleteSupplementary = (item) => {
    const deletedSupplementary = supplementaryData.filter((m) => m !== item);
    setSupplementaryData(deletedSupplementary);

    let arr = supplementaryList;
    console.log("item--", item);
    console.log("arr--", arr);
    arr.push({
      label: item.supplementaryName,
      value: item.supplementaryID,
    });
    console.log("arrr--", arr);
    setSupplementaryList(arr);
  };

  const handleJournalIDSearch = async (text) => {
    try {
      if (text.replace(/\s\s+/g, " ").trim().length > 2) {
        const res = await libraryapi.getJournalIDList(
          collegeConfig.is_university
            ? journalRef.current.values.college.collegeID
            : collegeId,
          text
        );
        console.log("res", res);
        setJournalIDList(res.data.message);
      } else {
        setJournalIDList([]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleJournalIDSelect = async (text) => {
    try {
      setLoad(true);
      setDueDate("");
      console.log("text", text);
      journalRef.current.setFieldValue("dateofReceipt", "");
      journalRef.current.setFieldValue("modeOfReceipt", "");
      journalRef.current.setFieldValue("dateOfIssue", "");
      journalRef.current.setFieldValue("volumeNo", "");
      journalRef.current.setFieldValue("issueNo", "");
      journalRef.current.setFieldValue("period", "");
      journalRef.current.setFieldValue("pages", "");
      journalRef.current.setFieldValue("remarks", "");
      // setShowRes(false);
      const subDataRes = await libraryapi.getJournalIDDetails(
        text.subscription_id
      );
      console.log("subDataRes", subDataRes);
      setData(subDataRes.data.message);
      setCount(subDataRes.data.message[0].count);
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleAddMaster = async () => {
    if (load) return;
    console.log("addSupplementary---", addSupplementary);
    let err = false;
    const masterRegEx = /^[A-Za-z0-9@(). \-+/]+$/;
    if (addSupplementary.trim() === "") {
      err = true;
      setMasterError(true);
      setMasterErrorMessage("Please enter Supplementary Name");
      document.getElementById("addSupplementary")?.focus();
    } else if (!masterRegEx.test(addSupplementary.trim())) {
      err = true;
      setMasterError(true);
      setMasterErrorMessage("Please enter valid Supplementary Item");
      document.getElementById("addSupplementary")?.focus();
    }
    if (err) {
      return;
    }
    try {
      setLoad(true);
      const addMasterRes = await libraryapi.addSupplementaryMaster(
        addSupplementary.replace(/\s\s+/g, " ").trim()
      );
      console.log("addMasterRes", addMasterRes);
      if (addMasterRes.ok == true) {
        toast.success("Supplementary Item Added Successfully");
        setOpenModal(false);
        setAddSupplementary("");
      } else {
        setMasterError(true);
        setMasterErrorMessage("Supplementary Name already exists");
        document.getElementById("addSupplementary")?.focus();
        setLoad(false);
        return;
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const getInitialList = async () => {
    const modeOfReceiptRes = await libraryapi.getModeOfReceiptList();
    console.log("modeOfReceiptRes", modeOfReceiptRes);
    setModeOfReceiptList(modeOfReceiptRes.data.data);

    const supplementaryRes = await libraryapi.getSupplementaryList();
    console.log("supplementaryRes", supplementaryRes);
    setSupplementaryList(supplementaryRes.data.data);
  };

  useEffect(() => {
    getInitialList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={"Journal Receipt"}
        isOpen={errorModal}
        message={journalErrorMesage}
        okClick={() => {
          setErrorModal(false);
        }}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-2">
          <Formik
            enableReinitialize={true}
            innerRef={journalRef}
            initialValues={{
              college: collegeConfig.is_university
                ? collegeConfig.collegeList[0]
                : "",
              journalID: "",
              dateofReceipt: "",
              modeOfReceipt: "",
              dateOfIssue: "",
              volumeNo: "",
              issueNo: "",
              period: "",
              pages: "",
              remarks: "",
            }}
            validationSchema={journalSchema}
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
                  {collegeConfig.is_university && (
                    <SelectFieldFormik
                      autoFocus
                      labelSize={3}
                      tabIndex={1}
                      label="College"
                      id="college"
                      mandatory={1}
                      getOptionLabel={(option) => option.collegeName}
                      getOptionValue={(option) => option.collegeID}
                      options={collegeConfig.collegeList}
                      onChange={(text) => {
                        setFieldValue("college", text);
                        setFieldValue("journalID", "");
                        setShowRes(false);
                      }}
                      style={{ width: "70%" }}
                    />
                  )}

                  <SelectFieldFormik
                    autoFocus
                    label="Journal Name"
                    id="journalID"
                    mandatory={1}
                    labelSize={3}
                    clear={false}
                    searchIcon={true}
                    tabIndex={1}
                    maxlength={10}
                    options={journalIDList}
                    getOptionLabel={(option) => option.journal_name}
                    getOptionValue={(option) => option.subscription_id}
                    onInputChange={(text) => {
                      handleJournalIDSearch(text);
                    }}
                    onChange={(text) => {
                      setFieldValue("journalID", text);
                      handleJournalIDSelect(text);
                      handleUnSavedChanges(1);
                    }}
                    style={{ width: "50%" }}
                  />

                  {showRes ? (
                    <>
                      {data[0]?.journal_name ? (
                        <DisplayText
                          labelSize={3}
                          label="Journal Name"
                          value={data[0]?.journal_name}
                        />
                      ) : null}

                      {data[0]?.subscription_type ? (
                        <DisplayText
                          labelSize={3}
                          label="Subscription Type"
                          value={data[0]?.subscription_type}
                        />
                      ) : null}

                      {data[0]?.subscription_number ? (
                        <DisplayText
                          labelSize={3}
                          label="Subscription Number"
                          value={data[0]?.subscription_number}
                        />
                      ) : null}

                      {data[0]?.subscriptionfrom ? (
                        <DisplayText
                          labelSize={3}
                          label="Subscription From"
                          value={moment(data[0]?.subscriptionfrom).format(
                            "DD-MM-yyyy"
                          )}
                        />
                      ) : null}

                      {data[0]?.subscriptionto ? (
                        <DisplayText
                          labelSize={3}
                          label="Subscription To"
                          value={moment(data[0]?.subscriptionto).format(
                            "DD-MM-yyyy"
                          )}
                        />
                      ) : null}

                      {data[0]?.frequency ? (
                        <DisplayText
                          labelSize={3}
                          label="Frequency"
                          value={data[0]?.frequency}
                        />
                      ) : null}

                      {data[0]?.isForeign ? (
                        <DisplayText
                          labelSize={3}
                          label="Foreign"
                          value={data[0]?.isForeign}
                        />
                      ) : null}

                      {data[0]?.publisher ? (
                        <DisplayText
                          labelSize={3}
                          label="Publisher"
                          value={data[0]?.publisher}
                        />
                      ) : null}

                      {data[0]?.editor ? (
                        <DisplayText
                          labelSize={3}
                          label="Editor"
                          value={data[0]?.editor}
                        />
                      ) : null}

                      {data[0]?.journal_subject ? (
                        <DisplayText
                          labelSize={3}
                          label="Subject"
                          value={data[0]?.journal_subject}
                        />
                      ) : null}

                      {data[0]?.supplier_name ? (
                        <DisplayText
                          labelSize={3}
                          label="Supplier Name"
                          value={data[0]?.supplier_name}
                        />
                      ) : null}

                      <div className="row mt-4 mb-4">
                        <Tabs
                          id="uncontrolled-tab-example"
                          className="text-center p-0"
                          fill
                          onSelect={(e) => {
                            if (e == 1) {
                              setSupError(false);
                              setQtyError(false);
                            } else {
                              setDueDateError(false);
                            }
                          }}
                        >
                          <Tab eventKey={1} title="Subscription Details">
                            <div
                              className="row no-gutters pt-3"
                              style={{ maxHeight: "400px", overflowY: "auto" }}
                            >
                              <table className="table table-bordered table-hover">
                                <thead>
                                  <tr>
                                    <th width="1%">No.</th>
                                    <th width="20%">Issue Date</th>
                                    <th width="25%">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {data[0]?.received.map((item, index) => {
                                    return (
                                      <tr>
                                        <td align="center">{index + 1}</td>
                                        <td>
                                          {item.status !== "Received" &&
                                          moment(item.date) <= moment() ? (
                                            <span
                                              style={{
                                                color: "blue",
                                                cursor: "pointer",
                                              }}
                                              onClick={() => {
                                                setDueDate(item.date);
                                                setDueDateError(false);
                                              }}
                                            >
                                              {moment(item.date).format(
                                                "DD-MM-yyyy"
                                              )}
                                            </span>
                                          ) : (
                                            <>
                                              {moment(item.date).format(
                                                "DD-MM-yyyy"
                                              )}
                                            </>
                                          )}
                                        </td>

                                        <td>{item.status}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              {/* </div> */}
                            </div>
                          </Tab>
                          <Tab eventKey={2} title="Supplementary">
                            <div className="row no-gutters pt-1">
                              <div className="text-right mb-2">
                                <Button
                                  type="button"
                                  frmButton={false}
                                  className={"btn-green"}
                                  text="Add Supplementary Item"
                                  onClick={() => {
                                    setOpenModal(true);
                                  }}
                                />
                              </div>
                              <table className="table table-bordered table-hover">
                                <thead>
                                  <tr>
                                    <th width="1%">No.</th>
                                    <th width="40%">Supplementary Item</th>
                                    <th width="12%">Qty</th>
                                    <th>Remarks</th>
                                    {/* <th width="5%">Active</th> */}
                                    <th width="1%"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {supplementaryData.map((item, index) => {
                                    return (
                                      <tr>
                                        <td align="center">{index + 1}</td>
                                        <td>{item.supplementaryName}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.remark}</td>
                                        {/* <td>
                                          {item.status == true ? "Yes" : "No"}
                                        </td> */}
                                        <td align="center">
                                          <Button
                                            type="button"
                                            text={"-"}
                                            isTable={true}
                                            className={"plus-button"}
                                            onClick={() =>
                                              handleDeleteSupplementary(item)
                                            }
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  {supplementaryList.length !== 0 ? (
                                    <tr>
                                      <td align="center">
                                        {supplementaryData.length + 1}
                                      </td>
                                      <td>
                                        <ReactSelectField
                                          id="supplementaryName"
                                          placeholder="Supplementary Item"
                                          isTable={true}
                                          mandatory={1}
                                          maxlength={20}
                                          onFocus={() => {
                                            console.log("focus");
                                          }}
                                          options={supplementaryList}
                                          searchIcon={false}
                                          value={supplementaryName}
                                          onChange={(text) => {
                                            setSupplementaryName(text);
                                            setSupError(false);
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <TextField
                                          id="quantity"
                                          placeholder="Qty"
                                          isTable={true}
                                          mandatory={1}
                                          maxlength={2}
                                          value={quantity}
                                          onChange={(e) => {
                                            if (
                                              !isNaN(e.target.value) &&
                                              !e.target.value.includes(" ")
                                            ) {
                                              setQuantity(e.target.value);
                                              setQtyError(false);
                                            }
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <TextField
                                          id="remark"
                                          placeholder="Remarks"
                                          isTable={true}
                                          maxlength={15}
                                          value={remark}
                                          onChange={(e) => {
                                            setRemark(e.target.value);
                                          }}
                                        />
                                      </td>
                                      {/* <td align="center">
                                        <input
                                          id="status"
                                          type="checkbox"
                                          checked={status}
                                          onClick={(e) => {
                                            console.log("status", status);
                                            setStatus(!status);
                                          }}
                                        />
                                      </td> */}
                                      <td>
                                        <Button
                                          type="button"
                                          frmButton={false}
                                          isTable={true}
                                          className="plus-button"
                                          text="+"
                                          onClick={() => {
                                            handleAddSupplementary();
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  ) : null}
                                </tbody>
                              </table>
                              <div className="row mb-1">
                                <div className="col-lg-5 ps-4">
                                  <ErrorMessage
                                    Message={"Please select Supplementary Item"}
                                    view={supError}
                                  />
                                </div>
                                <div className="col-lg-7 ps-4">
                                  <ErrorMessage
                                    Message={"Please enter Quantity"}
                                    view={qtyError}
                                  />
                                </div>
                              </div>
                            </div>
                          </Tab>
                        </Tabs>
                        <div className="col-lg-12 mt-2 text-center">
                          <ErrorMessage
                            Message={
                              "Please select Due Date for Journal Receipt"
                            }
                            view={dueDateError}
                          />
                        </div>
                      </div>

                      {dueDate ? (
                        <DisplayText
                          labelSize={3}
                          label="Due Date"
                          value={moment(dueDate).format("DD-MM-yyyy")}
                        />
                      ) : null}
                      <DateFieldFormik
                        id="dateofReceipt"
                        label="Date of Receipt"
                        labelSize={3}
                        tabIndex={2}
                        bottom={true}
                        mandatory={1}
                        minDate={new Date(moment().subtract(1, "weeks"))}
                        maxDate={new Date()}
                        onChange={(e) => {
                          setFieldValue("dateofReceipt", e.target.value);
                        }}
                        style={{ width: "30%" }}
                      />

                      <SelectFieldFormik
                        id="modeOfReceipt"
                        label="Mode of Receipt"
                        labelSize={3}
                        mandatory={1}
                        tabIndex={3}
                        search={false}
                        clear={false}
                        options={modeOfReceiptList}
                        onChange={(text) => {
                          setFieldValue("modeOfReceipt", text);
                        }}
                        style={{ width: "30%" }}
                      />

                      <DateFieldFormik
                        id="dateOfIssue"
                        label="Date of Issue"
                        labelSize={3}
                        tabIndex={4}
                        bottom={true}
                        mandatory={1}
                        minDate={new Date(moment().subtract(1, "months"))}
                        maxDate={new Date(moment())}
                        onChange={(e) => {
                          setFieldValue("dateOfIssue", e.target.value);
                        }}
                        style={{ width: "30%" }}
                      />

                      <TextFieldFormik
                        id="volumeNo"
                        label="Volume Number"
                        labelSize={3}
                        tabIndex={5}
                        maxlength={10}
                        onChange={(e) => {
                          setFieldValue("volumeNo", e.target.value);
                        }}
                        mandatory={1}
                        style={{ width: "30%" }}
                      />

                      <TextFieldFormik
                        id="issueNo"
                        label="Issue Number"
                        labelSize={3}
                        tabIndex={6}
                        maxlength={10}
                        onChange={(e) => {
                          if (
                            !isNaN(e.target.value) &&
                            !e.target.value.includes(" ")
                          ) {
                            setFieldValue("issueNo", e.target.value);
                          }
                        }}
                        mandatory={1}
                        style={{ width: "30%" }}
                      />

                      <TextFieldFormik
                        id="period"
                        label="Period"
                        labelSize={3}
                        tabIndex={7}
                        maxlength={10}
                        onChange={handleChange}
                        mandatory={1}
                        style={{ width: "30%" }}
                      />

                      <TextFieldFormik
                        id="pages"
                        label="Pages"
                        labelSize={3}
                        tabIndex={8}
                        maxlength={3}
                        onChange={(e) => {
                          if (
                            !isNaN(e.target.value) &&
                            !e.target.value.includes(" ")
                          ) {
                            setFieldValue("pages", e.target.value);
                          }
                        }}
                        mandatory={1}
                        style={{ width: "15%" }}
                      />

                      <TextareaFieldFormik
                        id="remarks"
                        label="Remarks"
                        labelSize={3}
                        tabIndex={9}
                        maxlength={45}
                        onChange={(e) => {
                          setFieldValue("remarks", e.target.value);
                        }}
                        style={{ width: "50%" }}
                      />

                      <div className="row no-gutters mt-3">
                        <Button
                          tabIndex={10}
                          text="F4 - Save"
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                          id="save"
                        />
                      </div>
                    </>
                  ) : null}
                </form>
              );
            }}
          </Formik>
          <Modal
            show={openModal}
            dialogClassName="my-modal"
            onEscapeKeyDown={() => {
              setOpenModal(false);
              setAddSupplementary("");
              setMasterError(false);
              setMasterErrorMessage("");
            }}
          >
            <Modal.Header>
              <Modal.Title>Add Supplementary Item</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <TextField
                tabIndex={51}
                autoFocus={openModal ? true : false}
                id="addSupplementary"
                label="New Supplementary Name"
                value={addSupplementary}
                mandatory={1}
                maxlength={45}
                labelSize={4}
                onChange={(e) => {
                  setAddSupplementary(e.target.value);
                  setMasterError(false);
                }}
                error={masterError ? masterErrorMessage : ""}
                touched={masterError ? true : false}
                style={{ width: "80%" }}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                tabIndex={52}
                type="button"
                text="Save"
                frmButton={false}
                onClick={handleAddMaster}
                isTable={true}
              />
              <Button
                type="button"
                text={"Close"}
                frmButton={false}
                onClick={(e) => {
                  setOpenModal(false);
                  setAddSupplementary("");
                  setMasterError(false);
                  setMasterErrorMessage("");
                }}
                isTable={true}
              />
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default JournalReceipt;
