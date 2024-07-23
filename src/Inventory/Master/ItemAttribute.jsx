import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import Modal from "react-bootstrap/Modal";
import * as Yup from "yup";
import { toast } from "react-toastify";

import string from "../../string";

import InventoryApi from "../../api/InventoryApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ScreenTitle from "../../component/common/ScreenTitle";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import { TextField } from "@mui/material";

function ItemAttribute() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showAllButton, setShowAllButton] = useState(false);
  const collegeConfig = useSelector((state) => state.web.college);
  const [openModal, setOpenModal] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [particularId, setParticularId] = useState();
  const [editParticular, setEditParticular] = useState("");
  const [tutionFeeCheck, setTutionFeeCheck] = useState(false);
  const [termList, setTermList] = useState([]);
  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    itemAttributeName: Yup.string().required(
      "Please enter Item Attribute Name"
    ),
  });

  const handleItemAttribute = async (values) => {
    // try {
    // setLoad(true);
    // console.log("values", values);
    // if (editParticular) {
    //   const updateItemAttributeRes = await InventoryApi.updateItemAttribute(
    //     editParticular.name,
    //     values.itemAttributeName,
    //     values.description
    //   );
    //   console.log("updateBrandRes---", updateBrandRes);
    //   setLoad(false);
    //   toast.success("Brand updated successfully");
    //   return;
    // }
    // const addBrandRes = await InventoryApi.addBrand(
    //   values.brandName,
    //   values.description
    // );
    // console.log("addBrandRes", addBrandRes);
    // toast.success("Brand added successfully");
    // getBrandList();
    // setOpenModal(false);
    // setEditParticular();
    //   setLoad(false);
    // } catch (error) {
    //   console.log("error", error);
    //   setLoad(false);
    // }
  };

  const getItemAttributeList = async (showAll) => {
    try {
      const getAllItemAttributeRes = await InventoryApi.getItemAttribute(
        showAll ? "NONE" : string.PAGE_LIMIT
      );
      console.log("getAllItemAttributeRes---", getAllItemAttributeRes);
      setData(getAllItemAttributeRes.data.data);
      setShowAllButton(false);
      if (
        !showAll &&
        getAllItemAttributeRes.data.data.length === string.PAGE_LIMIT
      ) {
        setShowAllButton(true);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleEdit = async (values) => {
    // console.log("values", values);
    // const getItemAttributeByIdRes = await InventoryApi.getItemAttributeById(
    //   values.name
    // );
    // console.log("getItemAttributeByIdRes", getItemAttributeByIdRes);
    // setEditParticular(values);
    // setOpenModal(true);
  };

  useEffect(() => {
    getItemAttributeList(0);
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
              placeholder={"Search Item Attribute"}
              id="particulars"
              tabIndex={1}
              clear={true}
              maxlength={40}
              options={[]}
              style={{ width: "75%" }}
              searchIcon={true}
              getOptionLabel={(option) => option.particular}
              getOptionValue={(option) => option.id}
              onInputChange={(inputValue) => {}}
              onChange={(text) => {}}
            />
          </div>
          <div className="col-lg-5 text-right">
            <Button
              frmButton={false}
              className={"btn-green"}
              text={`Add Item Attribute`}
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
                <th>Item Attribute</th>
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
              ) : data.length === 0 ? (
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
                })
              )}
            </tbody>
          </table>
          {showAllButton && (
            <Button
              text="Show All"
              onClick={(e) => {
                getItemAttributeList(true);
              }}
            />
          )}

          <Modal
            show={openModal}
            dialogClassName="my-modal"
            onEscapeKeyDown={() => {
              setOpenModal(false);
              setEditParticular();
            }}
          >
            <Formik
              enableReinitialize={true}
              innerRef={formikRef}
              initialValues={{
                itemAttributeName: editParticular ? editParticular.brand : "",
              }}
              validationSchema={FormSchema}
              onSubmit={handleItemAttribute}
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
                      <Modal.Title>Add Item Attribute</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="row px-5">
                        <div className="row no-gutters pb-2 mt-1 ">
                          <TextFieldFormik
                            autoFocus
                            tabIndex={1}
                            labelSize={4}
                            id="itemAttributeName"
                            label="Item Attribute Name"
                            mandatory={1}
                            maxlength={40}
                            style={{ width: "80%" }}
                            onChange={(e) => {
                              setFieldValue(
                                "itemAttributeName",
                                e.target.value
                              );
                            }}
                          />
                        </div>
                        <table className="table table-bordered table-hover">
                          <thead>
                            <tr>
                              <th width="40%">Attribute Value</th>
                              <th width="40%">Abbreviation</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <TextFieldFormik
                                  placeholder={"Attribute Value"}
                                  id="itemAttributeValue"
                                  tabIndex={2}
                                  mandatory={1}
                                />
                              </td>
                              <td>
                                <TextFieldFormik
                                  placeholder={"Abbreviation"}
                                  id="itemAttributeAbbreviation"
                                  tabIndex={3}
                                  mandatory={1}
                                />
                              </td>
                              <td>
                                <Button
                                  isTable={true}
                                  type="button"
                                  tabIndex={4}
                                  text={"+"}
                                  className={"plus-button"}
                                  onClick={(e) => {}}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
export default ItemAttribute;
