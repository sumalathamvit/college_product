import React, { useEffect, useState, useRef } from "react";
import * as Yup from "yup";
import { Formik } from "formik";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import Button from "../component/FormField/Button";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import SwitchField from "../component/FormField/SwitchField";
import ScreenTitle from "../component/common/ScreenTitle";

import LibraryApi from "../api/libraryapi";
import { toast } from "react-toastify";
import ModalComponent from "../component/ModalComponent";
import { Modal } from "react-bootstrap";

const FormSchema = Yup.object().shape({
  module: Yup.object().required("Please select Module"),
});

const ModalFormSchema = Yup.object().shape({
  modalModule: Yup.object().required("Please select Module"),
  modalFormName: Yup.string().required("Please enter Form Name"),
  modalFormLink: Yup.string().required("Please enter Form Link"),
});

function AddRoleSettingForm() {
  //#region const
  const formikRef = useRef();
  const modalFormikRef = useRef();
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [moduleList, setModuleList] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [formList, setFormList] = useState([]);
  const [formID, setFormID] = useState();
  //#endregion

  const getAllMaster = async () => {
    try {
      setFormList([]);
      const getMasterAssignRoleRes = await LibraryApi.getMasterAssignRole(
        "module"
      );
      console.log("getMasterAssignRoleRes", getMasterAssignRoleRes);
      if (!getMasterAssignRoleRes.data.message.success) {
        console.log("error", getMasterAssignRoleRes.data.message);
        return;
      }
      setModuleList(getMasterAssignRoleRes.data.message.data.module);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleShow = async (values) => {
    if (load) return;
    console.log("values", values);
    try {
      setLoad(true);
      const getFormList = await LibraryApi.getFormList(values.module.moduleID);
      console.log("getFormList", getFormList);
      setFormList(getFormList.data.message.data.form);
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleModal = (item, values) => {
    console.log("values", item, values);
    setOpenModal(true);
    let arr = [];
    arr.push(item);
    arr.push((item.module = values.module.module));
    arr.push((item.moduleID = values.module.moduleID));
    console.log("arr", arr[0]);
    setModalData(arr);
    setFormID(item.formID);
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values", values);

    try {
      setLoad(true);
      const addorUpdateForm = await LibraryApi.addorUpdateForm(
        values.modalModule.moduleID,
        formID ? formID : null,
        values.modalFormName,
        values.modalFormLink,
        modalData.length == 0 ? 1 : values.modalStatus
      );
      console.log("addorUpdateForm", addorUpdateForm);
      if (addorUpdateForm.data.message.success == false) {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage(addorUpdateForm.data.message.message);
        // setOpenModal(true);
        setLoad(false);
        return;
      }
      toast.success(addorUpdateForm.data.message.message);
      setFormID();
      resetForm();
      setShowRes(false);
      setOpenModal(false);
      handleShow(formikRef?.current?.values);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    getAllMaster();
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
        okClick={() => setModalErrorOpen(false)}
      />

      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <Formik
          innerRef={formikRef}
          enableReinitialize={true}
          initialValues={{
            module: "",
          }}
          validationSchema={FormSchema}
          onSubmit={handleShow}
        >
          {({ errors, values, handleChange, handleSubmit, setFieldValue }) => {
            return (
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="row no-gutters mt-1">
                  <div className="col-lg-3">
                    <SelectFieldFormik
                      label="Module"
                      labelSize={4}
                      isTable={true}
                      id="module"
                      getOptionLabel={(option) => option.module}
                      getOptionValue={(option) => option.moduleID}
                      options={moduleList}
                      // style={{ width: "35%" }}
                      mandatory={1}
                      maxlength={15}
                      tabIndex={3}
                      onChange={(text) => {
                        setShowRes(false);
                        setFormList([]);
                        setFieldValue("module", text);
                      }}
                    />
                  </div>
                  <div className="col-lg-6 ps-3">
                    {/* {formList.length === 0 || !showRes ? ( */}
                    <Button
                      frmButton={false}
                      isCenter={false}
                      isTable={true}
                      text={"Show"}
                      tabIndex={4}
                      onClick={() => preFunction.handleErrorFocus(errors)}
                    />
                    {/* ) : null} */}
                  </div>
                  <div className="col-lg-3 text-right">
                    <Button
                      frmButton={false}
                      text={"Add Form"}
                      className={"btn-green"}
                      type="button"
                      isTable={true}
                      onClick={() => {
                        if (formikRef.current.values.module.moduleID) {
                          setOpenModal(true);
                          setModalData([]);
                        } else {
                          setModalErrorOpen(true);
                          setModalTitle("Message");
                          setModalMessage("Please select Module");
                        }
                      }}
                    />
                  </div>
                </div>
                {showRes && (
                  <>
                    <div className="row no-gutters mt-3">
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th>Form Name</th>
                              <th width="25%">Form Link</th>
                              <th width="7%">Status</th>
                              <th width="10%">Update</th>
                            </tr>
                          </thead>
                          {formList.length === 0 ? (
                            <tbody>
                              <tr>
                                <td colSpan="9" className="text-center">
                                  No records found
                                </td>
                              </tr>
                            </tbody>
                          ) : (
                            <tbody>
                              <>
                                {formList.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{item.form}</td>
                                      <td>{item.formLink}</td>
                                      <td>
                                        {item.isActive == 1
                                          ? "Active"
                                          : "Inactive"}
                                      </td>
                                      <td>
                                        <button
                                          type="submit"
                                          className="btn-3"
                                          // title="View Prescription"
                                          onClick={() => {
                                            handleModal(item, values);
                                          }}
                                        >
                                          <span className="icofont-prescription"></span>
                                          Edit
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </>
                            </tbody>
                          )}
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </form>
            );
          }}
        </Formik>

        <Modal
          show={openModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={() => setOpenModal(false)}
        >
          <Formik
            innerRef={modalFormikRef}
            // enableReinitialize={true}
            initialValues={{
              modalModule:
                modalData.length > 0
                  ? {
                      moduleID: modalData[0]?.moduleID,
                      module: modalData[0]?.module,
                    }
                  : "",
              modalFormName: modalData.length > 0 ? modalData[0].form : "",
              modalFormLink: modalData.length > 0 ? modalData[0].formLink : "",
              modalStatus: modalData.length > 0 ? modalData[0].isActive : "",
            }}
            validationSchema={ModalFormSchema}
            onSubmit={handleSave}
          >
            {({
              errors,
              values,
              handleChange,
              handleSubmit,
              setFieldValue,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <Modal.Header>
                    <Modal.Title>
                      {modalData.length > 0 ? "Edit Form" : "Add Form"}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row no-gutters">
                      <div className="col-lg-2"></div>
                      <div className="col-lg-8">
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={1}
                          clear={false}
                          labelSize={3}
                          searchIcon={false}
                          label="Module"
                          id="modalModule"
                          mandatory={1}
                          placeholder="Module"
                          getOptionLabel={(option) => option.module}
                          getOptionValue={(option) => option.moduleID}
                          options={moduleList}
                          onChange={(text) => {
                            setFieldValue("modalModule", text);
                          }}
                        />
                        <TextFieldFormik
                          id="modalFormName"
                          labelSize={3}
                          label="Form Name"
                          placeholder="Form Name"
                          mandatory={1}
                          tabIndex={2}
                          onChange={(e) => {
                            setFieldValue("modalFormName", e.target.value);
                          }}
                          style={{ minWidth: "120px" }}
                          maxlength={40}
                        />
                        <TextFieldFormik
                          id="modalFormLink"
                          labelSize={3}
                          label="Form Link"
                          placeholder="Form Link"
                          mandatory={1}
                          tabIndex={3}
                          onChange={(e) => {
                            setFieldValue("modalFormLink", e.target.value);
                          }}
                          style={{ minWidth: "120px" }}
                          maxlength={40}
                        />
                        {modalData.length > 0 ? (
                          <SwitchField
                            labelSize={3}
                            tabIndex={4}
                            label="Status"
                            isTable={true}
                            yesOption="Yes"
                            noOption="No"
                            onChange={(e) => {
                              // setFieldValue("modalStatus", e.target.value);
                              setFieldValue(
                                "modalStatus",
                                values.modalStatus == 1 ? 0 : 1
                              );
                            }}
                            checked={values.modalStatus == 1 ? true : false}
                          />
                        ) : null}
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      tabIndex={modalData.length == 0 ? 4 : 5}
                      className={"btn me-3"}
                      frmButton={false}
                      text={"Save"}
                      onClick={() => preFunction.handleErrorFocus(errors)}
                    />
                    <Button
                      frmButton={false}
                      type="button"
                      text={"Close"}
                      onClick={() => setOpenModal(false)}
                    />
                  </Modal.Footer>
                </form>
              );
            }}
          </Formik>
        </Modal>
      </div>
    </div>
  );
}

export default AddRoleSettingForm;
