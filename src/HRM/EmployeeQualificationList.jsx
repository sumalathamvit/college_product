import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import Modal from "react-bootstrap/Modal";
import * as Yup from "yup";
import { toast } from "react-toastify";

import EmployeeApi from "../api/EmployeeApi";

import string from "../string";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ScreenTitle from "../component/common/ScreenTitle";
import ReactSelectField from "../component/FormField/ReactSelectField";
import TextFieldFormik from "../component/FormField/TextFieldFormik";

function EmployeeQualificationList() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [qualificationList, setQualificationList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editQualification, setEditQualification] = useState("");
  const [CheckQualification, setCheckQualification] = useState(false);
  const [noChange, setNoChange] = useState(false);
  const [show, setShow] = useState(false);
  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    addQualification: Yup.string().required("Please enter Qualification"),
  });

  const handleQualification = async (values) => {
    if (
      editQualification &&
      editQualification.qualification === values.addQualification
    ) {
      setNoChange(true);
      return;
    }

    try {
      setLoad(true);
      const CheckQualification = await EmployeeApi.checkEmployeeQualification(
        values.addQualification
      );
      console.log("CheckQualification", CheckQualification);
      if (CheckQualification.data.data.length > 0) {
        setCheckQualification(true);
        setLoad(false);
        return;
      }

      if (editQualification) {
        const updateQualificationRes =
          await EmployeeApi.updateEmployeeQualification(
            "Qualification",
            editQualification.qualification,
            values.addQualification
          );
        console.log("updateQualificationRes", updateQualificationRes);
        if (!updateQualificationRes.ok) {
          setLoad(false);
          return;
        }
        setOpenModal(false);
        toast.success("Qualification updated successfully");
        setEditQualification("");
        getQualificationList(0);
        setLoad(false);
      } else {
        const addQualificationRes = await EmployeeApi.addEmployeeQualification(
          values.addQualification
        );
        console.log("addParticularRes", addQualificationRes);
        if (!addQualificationRes.ok) {
          setLoad(false);
          return;
        }
        setOpenModal(false);
        toast.success("Qualification added successfully");
        setEditQualification("");
        getQualificationList(0);
        setLoad(false);
      }
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelect = async (text) => {
    console.log("text", text);
    try {
      const searchQualificationList = data.filter(
        (item) => item.qualification === text.qualification
      );
      console.log("searchQualificationList", searchQualificationList);
      setData(searchQualificationList);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSearch = async (text) => {
    console.log("text", text);
    try {
      if (text.length > 1) {
        const searchQualification =
          await EmployeeApi.getSearchEmployeeQualification(text);
        console.log("searchQualification", searchQualification);
        setQualificationList(searchQualification.data.data);
        setShow(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getQualificationList = async (showAll, check) => {
    try {
      if (check) {
        setShow(true);
      }
      setLoad(true);
      const getQualRes = await EmployeeApi.getEmployeeQualificationList(
        showAll ? "None" : string.PAGE_LIMIT
      );
      console.log("getQualRes--", getQualRes);
      setData(getQualRes?.data?.data);
      if (string.PAGE_LIMIT === getQualRes.data.data.length) {
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
    setEditQualification(values);
    setOpenModal(true);
    setCheckQualification(false);
  };

  useEffect(() => {
    getQualificationList(0);
  }, []);

  return (
    <div className="content-area" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />

      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mb-3">
          <div className="col-lg-7 mt-2">
            <ReactSelectField
              placeholder={"Search Qualification"}
              id="employeeQualification"
              tabIndex={1}
              clear={true}
              maxlength={40}
              options={qualificationList}
              style={{ width: "75%" }}
              searchIcon={true}
              getOptionLabel={(option) => option.qualification}
              getOptionValue={(option) => option.qualification}
              onInputChange={(inputValue) => {
                handleSearch(inputValue);
              }}
              onChange={(text) => {
                if (text === "" || text === null) {
                  if (!show) getQualificationList(0, 1);
                } else {
                  handleSelect(text);
                  setQualificationList([]);
                }
              }}
            />
          </div>
          <div className="col-lg-5 text-right">
            <Button
              frmButton={false}
              className={"btn-green"}
              text={`Add Qualification`}
              onClick={(e) => {
                setOpenModal(true);
                setEditQualification("");
              }}
            />
          </div>
        </div>
        <div className="table-responsive p-0">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th width="1%">No.</th>
                <th>Qualification</th>
                <th width="10%">Update</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.qualification}</td>
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
                getQualificationList(true);
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
                addQualification: editQualification
                  ? editQualification.qualification
                  : "",
              }}
              validationSchema={FormSchema}
              onSubmit={handleQualification}
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
                        {editQualification ? "Edit" : "Add"} Qualification
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="row px-5">
                        <div className="row no-gutters pb-2 mt-1 ">
                          <TextFieldFormik
                            tabIndex={1}
                            labelSize={4}
                            id="addQualification"
                            label="Qualification"
                            mandatory={1}
                            maxlength={40}
                            style={{ width: "80%" }}
                            onChange={(e) => {
                              setFieldValue("addQualification", e.target.value);
                              setCheckQualification(false);
                              setNoChange(false);
                            }}
                            error={
                              CheckQualification
                                ? "Qualification already exists"
                                : noChange
                                ? "No changes made"
                                : ""
                            }
                          />
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
export default EmployeeQualificationList;
