import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import Modal from "react-bootstrap/Modal";
import * as Yup from "yup";
import { toast } from "react-toastify";

import EmployeeApi from "../api/EmployeeApi";

import Button from "../component/FormField/Button";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import preFunction from "../component/common/CommonFunction";
import ReactSelectField from "../component/FormField/ReactSelectField";
import string from "../string";
import ScreenTitle from "../component/common/ScreenTitle";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../component/FormField/TextFieldFormik";

function DesignationList() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [designationList, setDesignationList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editDesignation, setEditDesignation] = useState("");
  const [CheckDesignation, setCheckDesignation] = useState(false);
  const [noChange, setNoChange] = useState(false);
  const [designationCategoryList, setDesignationCategoryList] = useState([]);
  const [show, setShow] = useState(false);

  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    designationCategory: Yup.object().required(
      "Please select Designation Category"
    ),
    designation: Yup.string().required("Please enter Designation"),
  });

  const handleSave = async (values) => {
    if (
      editDesignation &&
      editDesignation.designation_name === values.designation &&
      editDesignation.custom_designation_category ===
        values.designationCategory?.name
    ) {
      setNoChange(true);
      return;
    }

    if (
      (editDesignation &&
        editDesignation.designation_name !== values.designation) ||
      !editDesignation
    ) {
      const CheckDesignation = await EmployeeApi.checkEmployeeDesignation(
        values.designation
      );
      console.log("CheckDesignation", CheckDesignation);
      if (CheckDesignation.data.data.length > 0) {
        setCheckDesignation(true);
        setLoad(false);
        return;
      }
    }

    try {
      setLoad(true);

      if (editDesignation) {
        handleUpdateDesignation(values);
      } else {
        const addDesignationRes = await EmployeeApi.addEmployeeDesignation(
          values.designation,
          values.designationCategory?.name
        );
        console.log("addDesignationRes", addDesignationRes);
        if (!addDesignationRes.ok) {
          setLoad(false);
          return;
        }
        setOpenModal(false);
        toast.success("Designation added successfully");
        setEditDesignation("");
        getDesignationList(0);
        setLoad(false);
      }
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleUpdateDesignation = async (values) => {
    try {
      const updateDesignationCategory =
        await EmployeeApi.updateEmployeeDesignation(
          editDesignation.designation_name,
          values.designationCategory?.name
        );
      console.log("updateDesignationCategory", updateDesignationCategory);
      if (!updateDesignationCategory.ok) {
        setLoad(false);
        return;
      }

      if (editDesignation.designation_name !== values.designation) {
        const updateDesignationRes =
          await EmployeeApi.updateEmployeeQualification(
            "Designation",
            editDesignation.designation_name,
            values.designation
          );
        console.log("updateDesignationRes", updateDesignationRes);
        if (!updateDesignationRes.ok) {
          setLoad(false);
          return;
        }
      }
      setOpenModal(false);
      toast.success("Designation updated successfully");
      setEditDesignation("");
      getDesignationList(0);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSelect = async (text) => {
    console.log("text", text);
    try {
      const searchDesignationList = data.filter(
        (item) => item.designation_name === text.designation_name
      );
      console.log("searchDesignationList", searchDesignationList);
      setData(searchDesignationList);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSearch = async (text) => {
    console.log("text", text);
    try {
      if (text.length > 2) {
        const searchDesignation =
          await EmployeeApi.getSearchEmployeeDesignation(text);
        console.log("searchDesignation", searchDesignation);
        setDesignationList(searchDesignation.data.data);
        setShow(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getDesignationList = async (showAll, check) => {
    try {
      if (check) {
        setShow(true);
      }
      setLoad(true);
      const getDesignationRes = await EmployeeApi.getEmployeeDesignationList(
        showAll ? "None" : string.PAGE_LIMIT
      );
      console.log("getDesignationRes--", getDesignationRes);
      setData(getDesignationRes?.data?.data);
      if (string.PAGE_LIMIT === getDesignationRes.data.data.length) {
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
    setEditDesignation(values);
    setOpenModal(true);
    setNoChange(false);
    setCheckDesignation(false);
  };

  const getAllList = async () => {
    try {
      const masterList = await EmployeeApi.getEmployeeDesignationCategoryList();
      console.log("MasterList----", masterList);
      setDesignationCategoryList(masterList.data.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getAllList();
    getDesignationList(0);
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
              placeholder={"Search Designation"}
              id="searchDesignation"
              tabIndex={1}
              clear={true}
              maxlength={40}
              options={designationList}
              style={{ width: "75%" }}
              searchIcon={true}
              getOptionLabel={(option) => option.designation_name}
              getOptionValue={(option) => option.designation_name}
              onInputChange={(inputValue) => {
                handleSearch(inputValue);
              }}
              onChange={(text) => {
                if (text === "" || text === null) {
                  if (!show) {
                    getDesignationList(0, 1);
                  }
                } else {
                  handleSelect(text);
                  setDesignationList([]);
                }
              }}
            />
          </div>
          <div className="col-lg-5 text-right">
            <Button
              frmButton={false}
              className={"btn-green"}
              text={`Add Designation`}
              onClick={(e) => {
                setOpenModal(true);
                setEditDesignation("");
                setNoChange(false);
                setCheckDesignation(false);
              }}
            />
          </div>
        </div>
        <div className="table-responsive p-0">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th width="1%">No.</th>
                <th>Designation</th>
                <th width="40%">Designation Category</th>
                <th width="10%">Update</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.designation_name}</td>
                    <td>{item.custom_designation_category}</td>
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
                getDesignationList(true);
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
                designation: editDesignation
                  ? editDesignation.designation_name
                  : "",
                designationCategory: editDesignation
                  ? { name: editDesignation.custom_designation_category }
                  : "",
              }}
              validationSchema={FormSchema}
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
              }) => {
                return (
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <Modal.Header>
                      <Modal.Title>
                        {editDesignation ? "Edit" : "Add"} Designation
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="row px-5">
                        <div className="row no-gutters pb-2 mt-1 ">
                          <SelectFieldFormik
                            label="Designation Category"
                            id="designationCategory"
                            mandatory={1}
                            maxlength={20}
                            tabIndex={1}
                            matchFrom="start"
                            getOptionLabel={(option) => option?.name}
                            getOptionValue={(option) => option?.name}
                            options={designationCategoryList}
                            labelSize={4}
                            onChange={(text) => {
                              setFieldValue("designationCategory", text);
                              setNoChange(false);
                            }}
                          />
                          <TextFieldFormik
                            tabIndex={2}
                            labelSize={4}
                            id="designation"
                            label="Designation"
                            mandatory={1}
                            maxlength={40}
                            onChange={(e) => {
                              setFieldValue("designation", e.target.value);
                              setCheckDesignation(false);
                              setNoChange(false);
                            }}
                            error={
                              CheckDesignation
                                ? "Designation already exists"
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
                            tabIndex={3}
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
export default DesignationList;
