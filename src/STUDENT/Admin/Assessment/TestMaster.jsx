import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import HeadingIcon from "@mui/icons-material/School";
import { Formik } from "formik";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";

import academicApi from "../../../api/AcademicApi";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import TextFieldFormik from "../../../component/FormField/TextFieldFormik";
import TextField from "../../../component/FormField/TextField";
import ModalComponent from "../../../component/ModalComponent";
import ScreenTitle from "../../../component/common/ScreenTitle";
import AuthContext from "../../../auth/context";

const FormSchema = Yup.object().shape({
  testName: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(/^[A-Za-z0-9@., -]+$/, "Please enter valid Test Name")
    .required("Please enter Test Name")
    .trim(),
  maxMark: Yup.number().required("Please enter Max Mark"),
  passMark: Yup.number().required("Please enter Pass Mark"),
});

function TestMaster() {
  const { collegeId } = useContext(AuthContext);
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [markError, setMarkError] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const formikRef = useRef();

  const getInitialList = async () => {
    try {
      const getAllTestRes = await academicApi.getAllTest(collegeId);
      console.log("getAllTestRes---", getAllTestRes);
      if (getAllTestRes.data.message.data.test.length > 0)
        setData(getAllTestRes.data.message.data.test);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddTest = async (values) => {
    console.log("values---", values);
    console.log("test---", values.testName, values.passMark, values.maxMark);
    // return;
    if (parseInt(values.maxMark) < parseInt(values.passMark)) {
      setLoad(false);
      setMarkError(true);
      return;
    }
    try {
      const createNewTestRes = await academicApi.createNewTest(
        collegeId,
        values.testName,
        values.passMark,
        values.maxMark
      );
      console.log("createNewTestRes---", createNewTestRes);
      if (createNewTestRes.data.message.success) {
        toast.success(createNewTestRes.data.message.message);
        formikRef.current.setFieldValue("testName", "");
        formikRef.current.setFieldValue("passMark", "");
        formikRef.current.setFieldValue("maxMark", "");
        formikRef.current.setFieldTouched("testName", false);
        formikRef.current.setFieldTouched("passMark", false);
        formikRef.current.setFieldTouched("maxMark", false);
        getInitialList();
        setOpenModal(false);
      } else {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage(createNewTestRes.data.message.message);

        setLoad(false);
        return;
      }
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
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
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => setModalErrorOpen(false)}
      />

      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position" />
        <div className="row no-gutters mt-1">
          <form autoComplete="off">
            <div className="p-0 mt-1 text-right">
              <Button
                text={"Add Test"}
                className={"btn-green"}
                type="button"
                frmButton={false}
                isTable={true}
                onClick={(e) => {
                  setOpenModal(true);
                }}
              />
            </div>
            {data.length > 0 ? (
              <div className="row">
                <div className="row no-gutters mt-3">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th>Test Name</th>
                        <th width="10%">Max Mark</th>
                        <th width="10%">Pass Mark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => {
                        return (
                          <tr>
                            <td class="text-center">{index + 1}</td>
                            <td>{item.test}</td>
                            <td class="text-center">{item.maxMark}</td>
                            <td class="text-center">{item.minMark}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="row no-gutters mt-3">
                <div className="card">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th>Test Name</th>
                        <th width="10%">Max Mark</th>
                        <th width="10%">Pass Mark</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colspan={6} align="center">
                          No data found
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <Modal
              show={openModal}
              onEscapeKeyDown={(e) => setOpenModal(false)}
            >
              <Formik
                enableReinitialize={true}
                innerRef={formikRef}
                initialValues={{
                  testName: null,
                  maxMark: "",
                  passMark: "",
                }}
                validationSchema={FormSchema}
                onSubmit={handleAddTest}
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
                        <Modal.Title>Test Master</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <div style={{ width: "600px" }}>
                          <div className="row col-lg-9">
                            <TextFieldFormik
                              autoFocus
                              tabIndex={1}
                              label="Test Name"
                              id="testName"
                              mandatory={1}
                              style={{ width: "70%" }}
                              onChange={handleChange}
                            />
                            <TextFieldFormik
                              tabIndex={2}
                              type="number"
                              id="maxMark"
                              label="Max Mark"
                              placeholder="Mark"
                              mandatory={1}
                              maxlength={3}
                              style={{ width: "25%" }}
                              onChange={(e) => {
                                if (
                                  !isNaN(e.target.value) &&
                                  !e.target.value.includes(" ")
                                ) {
                                  setFieldValue("maxMark", e.target.value);
                                }
                              }}
                            />
                            <TextField
                              tabIndex={3}
                              type="number"
                              id="passMark"
                              label="Pass Mark"
                              placeholder="Mark"
                              error={
                                errors.passMark
                                  ? errors.passMark
                                  : markError
                                  ? "Please enter valid Mark"
                                  : ""
                              }
                              touched={
                                touched.passMark
                                  ? touched.passMark
                                  : markError
                                  ? true
                                  : false
                              }
                              value={values.passMark}
                              mandatory={1}
                              maxlength={3}
                              style={{ width: "25%" }}
                              onChange={(e) => {
                                if (
                                  !isNaN(e.target.value) &&
                                  e.target.value < parseInt(values.maxMark)
                                ) {
                                  setFieldValue("passMark", e.target.value);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </Modal.Body>
                      <Modal.Footer>
                        <div className="row ">
                          <div className="col-lg-6 d-flex justify-content-end">
                            <Button
                              tabIndex={4}
                              isTable={true}
                              text="Save"
                              // type="button"
                              onClick={(e) => {
                                preFunction.handleErrorFocus(errors);
                              }}
                            />
                          </div>

                          <div className="col-lg-6 d-flex justify-content-start p-0">
                            <Button
                              tabIndex={5}
                              isTable={true}
                              text="Close"
                              type="button"
                              onClick={(e) => {
                                setOpenModal(false);
                                setFieldTouched(markError ? false : true);
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
          </form>
        </div>
      </div>
    </div>
  );
}

export default TestMaster;
