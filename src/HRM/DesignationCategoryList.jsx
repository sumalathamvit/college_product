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
import ScreenTitle from "../component/common/ScreenTitle";
import string from "../string";
import TextFieldFormik from "../component/FormField/TextFieldFormik";

function DesignationCategoryList() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editDesignationCategory, setEditDesignationCategory] = useState("");
  const [CheckDesignationCategory, setCheckDesignationCategory] =
    useState(false);
  const [noChange, setNoChange] = useState(false);
  const [designationCategoryList, setDesignationCategoryList] = useState([]);
  const [show, setShow] = useState(false);

  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    designationCategory: Yup.string().required(
      "Please enter Designation Category"
    ),
  });

  const handleSave = async (values) => {
    if (
      editDesignationCategory &&
      editDesignationCategory.name === values.designationCategory
    ) {
      setNoChange(true);
      return;
    }

    const CheckDesignationCategory = await EmployeeApi.checkDesignationCategory(
      values.designationCategory
    );
    console.log("CheckDesignationCategory", CheckDesignationCategory);
    if (CheckDesignationCategory.data.data.length > 0) {
      setCheckDesignationCategory(true);
      setLoad(false);
      return;
    }

    try {
      setLoad(true);

      if (editDesignationCategory) {
        handleUpdateDesignation(values);
      } else {
        const addDesignationCategoryRes =
          await EmployeeApi.addDesignationCategory(values.designationCategory);
        console.log("addDesignationCategoryRes", addDesignationCategoryRes);
        if (!addDesignationCategoryRes.ok) {
          setLoad(false);
          return;
        }
        setOpenModal(false);
        toast.success("Designation added successfully");
        setEditDesignationCategory("");
        getDesignationCategoryList(0);
        setLoad(false);
      }
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleUpdateDesignation = async (values) => {
    try {
      const updateDesignationCategoryRes =
        await EmployeeApi.updateEmployeeQualification(
          "Designation Category",
          editDesignationCategory.name,
          values.designationCategory
        );
      console.log("updateDesignationCategoryRes", updateDesignationCategoryRes);
      if (!updateDesignationCategoryRes.ok) {
        setLoad(false);
        return;
      }
      setOpenModal(false);
      toast.success("Designation Category updated successfully");
      setEditDesignationCategory("");
      getDesignationCategoryList(0);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSelect = async (text) => {
    console.log("text", text);
    try {
      const searchDesignationCategoryList = data.filter(
        (item) => item.name === text.name
      );
      console.log(
        "searchDesignationCategoryList",
        searchDesignationCategoryList
      );
      setData(searchDesignationCategoryList);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSearch = async (text) => {
    console.log("text", text);
    try {
      if (text.length > 2) {
        const searchDesignationCategory =
          await EmployeeApi.getSearchDesignationCategory(text);
        console.log("searchDesignationCategory", searchDesignationCategory);
        setDesignationCategoryList(searchDesignationCategory.data.data);
        setShow(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getDesignationCategoryList = async (showAll, check) => {
    try {
      if (check) {
        setShow(true);
      }
      setLoad(true);
      const getDesignationCategoryRes =
        await EmployeeApi.getEmployeeDesignationCategoryList(
          showAll ? "None" : string.PAGE_LIMIT
        );
      console.log("getDesignationCategoryRes--", getDesignationCategoryRes);
      setData(getDesignationCategoryRes?.data?.data);
      if (string.PAGE_LIMIT === getDesignationCategoryRes.data.data.length) {
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
    setEditDesignationCategory(values);
    setOpenModal(true);
    setNoChange(false);
    setCheckDesignationCategory(false);
  };

  useEffect(() => {
    getDesignationCategoryList(0);
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
              placeholder={"Search Designation Category"}
              id="searchDesignationCategory"
              tabIndex={1}
              clear={true}
              maxlength={40}
              options={designationCategoryList}
              style={{ width: "75%" }}
              searchIcon={true}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.name}
              onInputChange={(inputValue) => {
                handleSearch(inputValue);
              }}
              onChange={(text) => {
                if (text === "" || text === null) {
                  if (!show) getDesignationCategoryList(0, 1);
                } else {
                  handleSelect(text);
                  setDesignationCategoryList([]);
                }
              }}
            />
          </div>
          <div className="col-lg-5 text-right">
            <Button
              frmButton={false}
              className={"btn-green"}
              text={`Add Designation Category`}
              onClick={(e) => {
                setOpenModal(true);
                setEditDesignationCategory("");
                setNoChange(false);
                setCheckDesignationCategory(false);
              }}
            />
          </div>
        </div>
        <div className="table-responsive p-0">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th width="1%">No.</th>
                <th>Designation Category</th>
                <th width="10%">Update</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
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
                getDesignationCategoryList(true);
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
                designationCategory: editDesignationCategory
                  ? editDesignationCategory.name
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
                        {editDesignationCategory ? "Edit " : "Add "}Designation
                        Category
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="row px-5">
                        <div className="row no-gutters pb-2 mt-1 ">
                          <TextFieldFormik
                            tabIndex={2}
                            labelSize={4}
                            id="designationCategory"
                            label="Designation Category"
                            mandatory={1}
                            maxlength={40}
                            onChange={(e) => {
                              setFieldValue(
                                "designationCategory",
                                e.target.value
                              );
                              setCheckDesignationCategory(false);
                              setNoChange(false);
                            }}
                            error={
                              CheckDesignationCategory
                                ? "Designation Category already exists"
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
export default DesignationCategoryList;
