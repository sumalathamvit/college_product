import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import Modal from "react-bootstrap/Modal";
import * as Yup from "yup";
import { toast } from "react-toastify";

import EmployeeApi from "../api/EmployeeApi";

import string from "../string";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SwitchField from "../component/FormField/SwitchField";
import ScreenTitle from "../component/common/ScreenTitle";
import ReactSelectField from "../component/FormField/ReactSelectField";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import ModalComponent from "../component/ModalComponent";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import { feesType } from "../component/common/CommonArray";

function AddParticular() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [particularList, setParticularList] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);
  const [openModal, setOpenModal] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [particularId, setParticularId] = useState();
  const [editParticular, setEditParticular] = useState("");
  const [tutionFeeCheck, setTutionFeeCheck] = useState(false);
  const [termList, setTermList] = useState([]);
  const [show, setShow] = useState(false);
  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    addParticular: Yup.string().required("Please enter Particular"),
    feesType: Yup.object().required("Please select Fees Type"),
    term: tutionFeeCheck
      ? Yup.object().required("Please enter Term")
      : Yup.object().notRequired(),
  });

  const handleParticular = async (values) => {
    try {
      setLoad(true);
      console.log("values", values);

      const addParticularRes = await EmployeeApi.addOrUpdateParticular(
        particularId ? particularId : null,
        values.addParticular,
        values.feesType.value == "Miscellaneous" ? 1 : 0,
        values.feesType.value == "Common Fees" ? 1 : 0,
        values.feesType.value == "Yearly Fees" ? 1 : 0,
        values.feesType.value == "Yearly Fees" && tutionFeeCheck ? 1 : 0,
        values.feesType.value == "Yearly Fees" && tutionFeeCheck
          ? values.term?.value
          : null,
        particularId ? values.active : 1
      );
      console.log("addParticularRes", addParticularRes);
      if (!addParticularRes.data.message.success) {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage(addParticularRes.data.message.message);
        setLoad(false);
        return;
      }
      setOpenModal(false);
      toast.success(addParticularRes.data.message.message);
      setTutionFeeCheck(false);
      setEditParticular("");
      setParticularId();
      getParticularList(0);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelect = async (text) => {
    console.log("text", text);
    try {
      const searchParticularList = data.filter(
        (item) => item.particular === text.particular
      );
      console.log("searchParticularList", searchParticularList);
      setData(searchParticularList);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSearch = async (text) => {
    console.log("text", text);
    try {
      if (text.length > 2) {
        const searchParticular = await EmployeeApi.searchParticular(text);
        console.log("searchParticular", searchParticular);
        setParticularList(searchParticular.data.message.data.particular);
        setShow(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getParticularList = async (showAll, check) => {
    try {
      if (check === 1) {
        setShow(true);
      }
      setLoad(true);
      const getAllParticular = await EmployeeApi.getAllParticular(
        showAll ? 1 : 0
      );
      console.log("getAllParticular", getAllParticular);
      setData(getAllParticular.data.message.data.all_particular);
      if (
        string.PAGE_LIMIT ===
        getAllParticular.data.message.data.all_particular.length
      ) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleEdit = async (values) => {
    console.log("values", values);
    if (values.isFeesStructure) {
      values.feesType = "Yearly Fees";
    } else if (values.isMisc) {
      values.feesType = "Miscellaneous";
    } else if (values.isDeduct) {
      values.feesType = "Common Fees";
    }
    if (collegeConfig.institution_type === 1)
      setTutionFeeCheck(values.isTuitionFees);
    setEditParticular(values);
    setOpenModal(true);
    setParticularId(values.id);
  };

  const handleTerm = () => {
    console.log("values", collegeConfig.no_of_term);
    let termList = [];
    for (let i = 1; i <= collegeConfig.no_of_term; i++) {
      termList.push({ value: i, label: i });
    }
    console.log("termList", termList);
    setTermList(termList);
  };

  useEffect(() => {
    getParticularList(0);
    handleTerm();
  }, []);

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
        okClick={() => {
          setModalErrorOpen(false);
        }}
      />

      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mb-3">
          <div className="col-lg-7 mt-2">
            <ReactSelectField
              placeholder={"Search Particulars"}
              id="particulars"
              tabIndex={1}
              clear={true}
              maxlength={40}
              options={particularList}
              style={{ width: "75%" }}
              searchIcon={true}
              getOptionLabel={(option) => option.particular}
              getOptionValue={(option) => option.id}
              onInputChange={(inputValue) => {
                handleSearch(inputValue);
              }}
              onChange={(text) => {
                if (text === "" || text === null) {
                  if (!show) getParticularList(0, 1);
                } else {
                  handleSelect(text);
                  setParticularList([]);
                }
              }}
            />
          </div>
          <div className="col-lg-5 text-right">
            <Button
              frmButton={false}
              className={"btn-green"}
              text={`Add Particular`}
              onClick={(e) => {
                setOpenModal(true);
                setTutionFeeCheck(false);
                setEditParticular("");
                setParticularId();
              }}
            />
          </div>
        </div>
        <div className="table-responsive p-0">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th width="1%">No.</th>
                <th>Particular</th>
                <th width="10%">Miscellaneous</th>
                <th width="10%">Common Fees</th>
                <th width="10%">Yearly Fees</th>
                {collegeConfig.institution_type === 1 && (
                  <>
                    <th width="7%">Tution Fees</th>
                    <th width="5%">Term</th>
                  </>
                )}
                <th width="5%">Active</th>
                <th width="10%">Update</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.particular}</td>
                    <td>{item.isMisc ? "Yes" : "No"}</td>
                    <td>{item.isDeduct ? "Yes" : "No"}</td>
                    <td>{item.isFeesStructure ? "Yes" : "No"}</td>
                    {collegeConfig.institution_type === 1 && (
                      <>
                        <td>{item.isTuitionFees ? "Yes" : "No"}</td>
                        <td>{item.term}</td>
                      </>
                    )}
                    <td>{item.isActive ? "Yes" : "No"}</td>
                    <td align="center">
                      <Button
                        text={"Edit"}
                        className={"btn-3"}
                        type="submit"
                        isTable={true}
                        onClick={() => {
                          handleEdit(item);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {showLoadMore && (
            <Button
              text="Show All"
              onClick={(e) => {
                getParticularList(true);
              }}
            />
          )}

          <Modal
            show={openModal}
            dialogClassName="my-modal"
            onEscapeKeyDown={() => setOpenModal(false)}
          >
            <Formik
              enableReinitialize={true}
              innerRef={formikRef}
              initialValues={{
                feesType: editParticular?.feesType
                  ? {
                      value: editParticular?.feesType,
                      label: editParticular?.feesType,
                    }
                  : "",
                addParticular: editParticular ? editParticular.particular : "",
                term: editParticular?.term
                  ? { value: editParticular?.term, label: editParticular?.term }
                  : "",
                active: editParticular ? editParticular.isActive : false,
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
                    <Modal.Header>
                      <Modal.Title>
                        {editParticular ? "Edit " : "Add "}Particular
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="row px-5">
                        <div className="row no-gutters pb-2 mt-1 ">
                          <TextFieldFormik
                            autoFocus
                            tabIndex={1}
                            labelSize={4}
                            id="addParticular"
                            label="Fees Description"
                            mandatory={1}
                            maxlength={40}
                            style={{ width: "80%" }}
                            onChange={(e) => {
                              setFieldValue("addParticular", e.target.value);
                            }}
                          />
                          <SelectFieldFormik
                            tabIndex={2}
                            labelSize={4}
                            id="feesType"
                            label="Fees Type"
                            mandatory={1}
                            options={feesType}
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            onChange={(text) => {
                              setFieldValue("feesType", text);
                            }}
                            style={{ width: "60%" }}
                          />
                          {values.feesType.value === "Yearly Fees" &&
                          collegeConfig.institution_type === 1 ? (
                            <>
                              <SwitchField
                                label="Tution Fees"
                                labelSize={4}
                                tabIndex={5}
                                yesOption={"Yes"}
                                noOption={"No"}
                                checked={tutionFeeCheck}
                                onChange={() => {
                                  setTutionFeeCheck(!tutionFeeCheck);
                                }}
                              />

                              {tutionFeeCheck ? (
                                <SelectFieldFormik
                                  tabIndex={2}
                                  labelSize={4}
                                  id="term"
                                  label="Term"
                                  mandatory={1}
                                  options={termList}
                                  getOptionLabel={(option) => option.label}
                                  getOptionValue={(option) => option.value}
                                  onChange={(text) => {
                                    setFieldValue("term", text);
                                  }}
                                  style={{ width: "40%" }}
                                />
                              ) : null}
                            </>
                          ) : null}
                          {particularId && (
                            <SwitchField
                              label="Active"
                              labelSize={4}
                              tabIndex={7}
                              yesOption={"Yes"}
                              noOption={"No"}
                              checked={values.active}
                              onChange={() => {
                                setFieldValue("active", !values.active);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <div className="row my-1 py-2">
                        <div className="col-lg-6 d-flex justify-content-end">
                          <Button
                            tabIndex={8}
                            isTable={true}
                            text="Save"
                            onClick={(e) => {
                              preFunction.handleErrorFocus(errors);
                            }}
                          />
                        </div>

                        <div className="col-lg-6 d-flex justify-content-start p-0">
                          <Button
                            tabIndex={9}
                            isTable={true}
                            text="Close"
                            type="button"
                            onClick={(e) => {
                              setOpenModal(false);
                              // setFieldTouched(markError ? false : true);
                            }}
                          />
                        </div>
                      </div>
                    </Modal.Footer>
                  </form>
                );
              }}
            </Formik>
          </Modal>
        </div>
      </div>
    </div>
  );
}
export default AddParticular;
