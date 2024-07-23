import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import Modal from "react-bootstrap/Modal";
import * as Yup from "yup";
import { toast } from "react-toastify";

import InventoryApi from "../../api/InventoryApi";

import string from "../../string";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ScreenTitle from "../../component/common/ScreenTitle";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ReactSelectField from "../../component/FormField/ReactSelectField";

function TaxCategory() {
  const [data, setData] = useState([]);
  const [taxCategoryList, setTaxCategoryList] = useState([]);
  const [load, setLoad] = useState(false);
  const [showAllButton, setShowAllButton] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [editTaxCategory, setEditTaxCategory] = useState("");
  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    taxCategoryName: Yup.string().required("Please enter Tax Category Name"),
  });

  const handleTaxCategory = async (values) => {
    // try {
    //   setLoad(true);
    //   console.log("values", values);
    //   console.log("editTaxCategory--", editTaxCategory);
    //   if (editTaxCategory) {
    //     const doctypeRenameRes = await InventoryApi.doctypeRename(
    //       "tax category",
    //       editTaxCategory.name,
    //       values.taxCategoryName
    //     );
    //     console.log("doctypeRenameRes---", doctypeRenameRes);
    //     toast.success("Tax Category updated successfully");
    //   } else {
    //     const addTaxCategoryRes = await InventoryApi.addTaxCategory(
    //       values.taxCategoryName,
    //       values.description
    //     );
    //     console.log("addTaxCategoryRes", addTaxCategoryRes);
    //     toast.success("Tax Category added successfully");
    //   }
    //   getTaxCategoryList(0);
    //   setOpenModal(false);
    //   setEditTaxCategory();
    //   setLoad(false);
    // } catch (error) {
    //   console.log("error", error);
    //   setLoad(false);
    // }
  };

  const getTaxCategoryList = async (showAll) => {
    try {
      const getAllTaxCategoryRes = await InventoryApi.getTaxCategory(
        showAll ? "NONE" : string.PAGE_LIMIT
      );
      console.log("getAllTaxCategoryRes", getAllTaxCategoryRes);
      setData(getAllTaxCategoryRes.data.data);
      setShowAllButton(false);
      if (
        !showAll &&
        getAllTaxCategoryRes.data.data.length === string.PAGE_LIMIT
      ) {
        setShowAllButton(true);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSearch = async (text) => {
    // console.log("text", text);
    // try {
    //   if (text.length > 2) {
    //     const searchTaxCategoryRes = await InventoryApi.searchTaxCategory(text);
    //     console.log("searchTaxCategoryRes", searchTaxCategoryRes);
    //     setTaxCategoryList(searchTaxCategoryRes.data.data);
    //   }
    // } catch (error) {
    //   console.log("error", error);
    // }
  };

  const handleEdit = async (values) => {
    console.log("values", values);
    setEditTaxCategory(values);
    setOpenModal(true);
  };

  useEffect(() => {
    getTaxCategoryList(0);
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
              placeholder={"Search Tax Category"}
              id="particulars"
              tabIndex={1}
              clear={true}
              maxlength={40}
              options={taxCategoryList}
              style={{ width: "75%" }}
              searchIcon={true}
              getOptionLabel={(option) => option.taxCategory}
              getOptionValue={(option) => option.name}
              onChange={(text) => {
                if (text) setData([text]);
                else getTaxCategoryList(0);
              }}
              onInputChange={(inputValue) => {
                handleSearch(inputValue);
              }}
            />
          </div>
          <div className="col-lg-5 text-right">
            <Button
              frmButton={false}
              className={"btn-green"}
              text={`Add Tax Category`}
              onClick={(e) => {
                setOpenModal(true);
                setEditTaxCategory("");
              }}
            />
          </div>
        </div>
        <div className="table-responsive p-0">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th width="1%">No.</th>
                <th>Tax Category</th>
                <th width="10%">Update</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="3" align="center">
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.item_group_name}</td>
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
                })
              )}
            </tbody>
          </table>
          {showAllButton && (
            <Button
              text="Show All"
              onClick={(e) => {
                getTaxCategoryList(true);
              }}
            />
          )}

          <Modal
            show={openModal}
            dialogClassName="my-modal"
            onEscapeKeyDown={() => {
              setOpenModal(false);
              setEditTaxCategory();
            }}
          >
            <Formik
              enableReinitialize={true}
              innerRef={formikRef}
              initialValues={{
                taxCategoryName: editTaxCategory
                  ? editTaxCategory.item_group_name
                  : "",
              }}
              validationSchema={FormSchema}
              onSubmit={handleTaxCategory}
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
                      <Modal.Title>Add Tax Category</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="row px-5">
                        <div className="row no-gutters pb-2 mt-1 ">
                          <TextFieldFormik
                            autoFocus
                            tabIndex={1}
                            ltabelSize={4}
                            id="taxCategoryName"
                            label="Tax Category Name"
                            mandatory={1}
                            maxlength={40}
                            style={{ width: "80%" }}
                            onChange={(e) => {
                              setFieldValue("taxCategoryName", e.target.value);
                            }}
                          />
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <div className="row my-1 py-2">
                        <div className="col-lg-6 d-flex justify-content-end">
                          <Button
                            tabIndex={2}
                            isTable={true}
                            text="Save"
                            onClick={(e) => {
                              preFunction.handleErrorFocus(errors);
                            }}
                          />
                        </div>

                        <div className="col-lg-6 d-flex justify-content-start p-0">
                          <Button
                            tabIndex={3}
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
export default TaxCategory;
