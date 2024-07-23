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

function ItemGroup() {
  const [data, setData] = useState([]);
  const [itemGroupList, setItemGroupList] = useState([]);
  const [load, setLoad] = useState(false);
  const [showAllButton, setShowAllButton] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [editItemGroup, setEditItemGroup] = useState("");
  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    itemGroupName: Yup.string().required("Please enter Item Group Name"),
  });

  const handleItemGroup = async (values) => {
    // try {
    //   setLoad(true);
    //   console.log("values", values);
    //   console.log("editItemGroup--", editItemGroup);
    //   if (editItemGroup) {
    //     const doctypeRenameRes = await InventoryApi.doctypeRename(
    //       "Item Group",
    //       editItemGroup.name,
    //       values.itemGroupName
    //     );
    //     console.log("doctypeRenameRes---", doctypeRenameRes);
    //     toast.success("Item Group updated successfully");
    //   } else {
    //     const addItemGroupRes = await InventoryApi.addItemGroup(
    //       values.itemGroupName,
    //       values.description
    //     );
    //     console.log("addItemGroupRes", addItemGroupRes);
    //     toast.success("Item Group added successfully");
    //   }
    //   getItemGroupList(0);
    //   setOpenModal(false);
    //   setEditItemGroup();
    //   setLoad(false);
    // } catch (error) {
    //   console.log("error", error);
    //   setLoad(false);
    // }
  };

  const getItemGroupList = async (showAll) => {
    try {
      const getAllItemGroupRes = await InventoryApi.getItemGroup(
        showAll ? "NONE" : string.PAGE_LIMIT
      );
      console.log("getAllItemGroupRes", getAllItemGroupRes);
      setData(getAllItemGroupRes.data.data);
      setShowAllButton(false);
      if (
        !showAll &&
        getAllItemGroupRes.data.data.length === string.PAGE_LIMIT
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
    //     const searchItemGroupRes = await InventoryApi.searchItemGroup(text);
    //     console.log("searchItemGroupRes", searchItemGroupRes);
    //     setItemGroupList(searchItemGroupRes.data.data);
    //   }
    // } catch (error) {
    //   console.log("error", error);
    // }
  };

  const handleEdit = async (values) => {
    console.log("values", values);
    setEditItemGroup(values);
    setOpenModal(true);
  };

  useEffect(() => {
    getItemGroupList(0);
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
              placeholder={"Search Item Group"}
              id="particulars"
              tabIndex={1}
              clear={true}
              maxlength={40}
              options={itemGroupList}
              style={{ width: "75%" }}
              searchIcon={true}
              getOptionLabel={(option) => option.ItemGroup}
              getOptionValue={(option) => option.name}
              onChange={(text) => {
                if (text) setData([text]);
                else getItemGroupList(0);
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
              text={`Add Item Group`}
              onClick={(e) => {
                setOpenModal(true);
                setEditItemGroup("");
              }}
            />
          </div>
        </div>
        <div className="table-responsive p-0">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th width="1%">No.</th>
                <th>Item Group</th>
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
                getItemGroupList(true);
              }}
            />
          )}

          <Modal
            show={openModal}
            dialogClassName="my-modal"
            onEscapeKeyDown={() => {
              setOpenModal(false);
              setEditItemGroup();
            }}
          >
            <Formik
              enableReinitialize={true}
              innerRef={formikRef}
              initialValues={{
                itemGroupName: editItemGroup
                  ? editItemGroup.item_group_name
                  : "",
              }}
              validationSchema={FormSchema}
              onSubmit={handleItemGroup}
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
                      <Modal.Title>Add Item Group</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="row px-5">
                        <div className="row no-gutters pb-2 mt-1 ">
                          <TextFieldFormik
                            autoFocus
                            tabIndex={1}
                            ltabelSize={4}
                            id="itemGroupName"
                            label="Item Group Name"
                            mandatory={1}
                            maxlength={40}
                            style={{ width: "80%" }}
                            onChange={(e) => {
                              setFieldValue("itemGroupName", e.target.value);
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
export default ItemGroup;
