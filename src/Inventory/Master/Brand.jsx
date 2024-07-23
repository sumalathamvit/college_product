import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import Modal from "react-bootstrap/Modal";
import * as Yup from "yup";
import { toast } from "react-toastify";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ScreenTitle from "../../component/common/ScreenTitle";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import InventoryApi from "../../api/InventoryApi";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import string from "../../string";

function Brand() {
  const [data, setData] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [load, setLoad] = useState(false);
  const [showAllButton, setShowAllButton] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [editBrand, setEditBrand] = useState("");
  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    brandName: Yup.string().required("Please enter Brand Name"),
  });

  const handleBrand = async (values) => {
    // try {
    //   setLoad(true);
    //   console.log("values", values);
    //   if (editBrand) {
    //     const updateBrandRes = await InventoryApi.updateBrand(
    //       editBrand.name,
    //       values.brandName,
    //       values.description
    //     );
    //     console.log("updateBrandRes---", updateBrandRes);
    //     toast.success("Brand updated successfully");
    //   } else {
    //     const addBrandRes = await InventoryApi.addBrand(
    //       values.brandName,
    //       values.description
    //     );
    //     console.log("addBrandRes", addBrandRes);
    //     toast.success("Brand added successfully");
    //   }
    //   getBrandList(0);
    //   setOpenModal(false);
    //   setEditBrand();
    //   setLoad(false);
    // } catch (error) {
    //   console.log("error", error);
    //   setLoad(false);
    // }
  };

  const getBrandList = async (showAll) => {
    try {
      const getAllBrandRes = await InventoryApi.getAllBrand(
        showAll ? "NONE" : string.PAGE_LIMIT
      );
      console.log("getAllBrandRes", getAllBrandRes);
      setData(getAllBrandRes.data.data);
      setShowAllButton(false);
      if (!showAll && getAllBrandRes.data.data.length === string.PAGE_LIMIT) {
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
    //     const searchBrandRes = await InventoryApi.searchBrand(text);
    //     console.log("searchBrandRes", searchBrandRes);
    //     setBrandList(searchBrandRes.data.data);
    //   }
    // } catch (error) {
    //   console.log("error", error);
    // }
  };

  const handleEdit = async (values) => {
    console.log("values", values);
    setEditBrand(values);
    setOpenModal(true);
  };

  useEffect(() => {
    getBrandList(0);
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
              placeholder={"Search Brand"}
              id="particulars"
              tabIndex={1}
              clear={true}
              maxlength={40}
              options={brandList}
              style={{ width: "75%" }}
              searchIcon={true}
              getOptionLabel={(option) => option.brand}
              getOptionValue={(option) => option.name}
              onChange={(text) => {
                if (text) setData([text]);
                else getBrandList(0);
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
              text={`Add Brand`}
              onClick={(e) => {
                setOpenModal(true);
                setEditBrand("");
              }}
            />
          </div>
        </div>
        <div className="table-responsive p-0">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th width="1%">No.</th>
                <th>Brand</th>
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
                getBrandList(true);
              }}
            />
          )}

          <Modal
            show={openModal}
            dialogClassName="my-modal"
            onEscapeKeyDown={() => {
              setOpenModal(false);
              setEditBrand();
            }}
          >
            <Formik
              enableReinitialize={true}
              innerRef={formikRef}
              initialValues={{
                brandName: editBrand ? editBrand.brand : "",
                description: editBrand ? editBrand.description : "",
              }}
              validationSchema={FormSchema}
              onSubmit={handleBrand}
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
                      <Modal.Title>Add Brand</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="row px-5">
                        <div className="row no-gutters pb-2 mt-1 ">
                          <TextFieldFormik
                            autoFocus
                            tabIndex={1}
                            ltabelSize={4}
                            id="brandName"
                            label="Brand Name"
                            mandatory={1}
                            maxlength={40}
                            style={{ width: "80%" }}
                            onChange={(e) => {
                              setFieldValue("brandName", e.target.value);
                            }}
                          />
                          <TextAreaFieldFormik
                            tabIndex={2}
                            ltabelSize={4}
                            id="description"
                            label="Description"
                            mandatory={0}
                            maxlength={200}
                            style={{ width: "80%" }}
                            onChange={(e) => {
                              setFieldValue("description", e.target.value);
                            }}
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
export default Brand;
