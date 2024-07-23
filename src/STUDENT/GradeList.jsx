import React, { useState, useEffect, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import Modal from "react-bootstrap/Modal";
import * as Yup from "yup";
import { toast } from "react-toastify";

import StudentApi from "../api/StudentApi";

import Button from "../component/FormField/Button";
import AuthContext from "../auth/context";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ScreenTitle from "../component/common/ScreenTitle";
import SwitchField from "../component/FormField/SwitchField";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import ModalComponent from "../component/ModalComponent";
import TextFieldFormik from "../component/FormField/TextFieldFormik";

function GradeList() {
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editGrade, setEditGrade] = useState("");
  const [CheckGrade, setCheckGrade] = useState("");
  const [noChange, setNoChange] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [markError, setMarkError] = useState(false);
  const [validateMark, setValidateMark] = useState(false);

  const formikRef = useRef();
  const collegeRef = useRef();

  const ShowSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select college")
      : null,
  });

  const FormSchema = Yup.object().shape({
    grade: Yup.string().required("Please enter Grade"),
    maxMark: Yup.string().required("Please enter Max Mark"),
    minMark: Yup.string().required("Please enter Min Mark"),
  });

  const handleSave = async (values) => {
    console.log("values", values);
    if (!noChange) {
      setModalErrorOpen(true);
      setModalTitle("Message");
      setModalMessage("No changes made");
      return;
    }

    if (parseInt(values.minMark) >= parseInt(values.maxMark)) {
      setMarkError(true);
      return;
    }

    const duplicate = checkDuplicate(values);
    console.log("duplicate", duplicate);
    if (duplicate) {
      setValidateMark(true);
      return;
    }

    try {
      setLoad(true);
      const addorUpdateGrade = await StudentApi.addorUpdateGrade(
        values.college ? values.college.collegeID : collegeId,
        editGrade ? editGrade?.id : null,
        values.grade,
        values.gradePoint ? values.gradePoint : 0,
        values.minMark,
        values.maxMark,
        editGrade ? values.active : 1
      );
      console.log("addorUpdateGrade", addorUpdateGrade);
      if (!addorUpdateGrade.data.message.success) {
        setCheckGrade(addorUpdateGrade.data.message.message);
        setLoad(false);
        return;
      }
      toast.success(addorUpdateGrade.data.message.message);
      setOpenModal(false);
      handleShow(collegeRef.current.values);

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleShow = async (values) => {
    try {
      setLoad(true);
      const getGradeRes = await StudentApi.getAllGradeList(
        collegeConfig.is_university ? values.college.collegeID : collegeId
      );
      console.log("getGradeRes--", getGradeRes);
      setShowResult(true);
      setData(getGradeRes?.data?.message?.data?.grade);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleValidateGrade = () => {
    setMarkError(false);
    setValidateMark(false);
    if (!collegeRef.current.values.college && collegeConfig.is_university) {
      setModalErrorOpen(true);
      setModalTitle("Message");
      setModalMessage("Please select college");
      return;
    }
    setOpenModal(true);
    setEditGrade("");
  };

  const handleEdit = async (values) => {
    console.log("values", values);
    setEditGrade(values);
    setOpenModal(true);
    setCheckGrade("");
    setMarkError(false);
    setValidateMark(false);
  };

  // validate duplicate min ,max mark and range also
  const checkDuplicate = (values) => {
    console.log("values", values);
    let number = [];
    let duplicate = false;
    data.map((item) => {
      for (let i = item.minMark; i <= item.maxMark; i++) {
        if (editGrade) {
          if (editGrade.id !== item.id) number.push(i);
        } else {
          number.push(i);
        }
      }
    });
    console.log("number", number);

    if (
      number.includes(parseInt(values.minMark)) ||
      number.includes(parseInt(values.maxMark))
    ) {
      duplicate = true;
    }
    return duplicate;
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      handleShow(collegeId);
    }
  }, [collegeConfig]);

  return (
    <div className="content-area" onClick={preFunction.hideNavbar}>
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
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={collegeRef}
            initialValues={{
              college: null,
            }}
            validationSchema={ShowSchema}
            onSubmit={(values) => handleShow(values)}
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
                  <div className="row">
                    <div className="col-lg-12 text-right p-0">
                      <Button
                        frmButton={false}
                        className={"btn-green"}
                        type={"button"}
                        text={`Add Grade`}
                        isTable={true}
                        onClick={(e) => {
                          handleValidateGrade();
                        }}
                      />
                    </div>
                    <div className="col-lg-10 p-0">
                      {collegeConfig.is_university && (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={0}
                          labelSize={2}
                          isTable={true}
                          label="College"
                          id="college"
                          style={{ width: "80%" }}
                          mandatory={1}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          options={collegeConfig.collegeList}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            setShowResult(false);
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {!showResult && (
                    <Button
                      tabIndex={5}
                      text={"Show"}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                      }}
                    />
                  )}
                </form>
              );
            }}
          </Formik>
        </div>
        {showResult ? (
          <>
            <div className="subhead-row">
              <div className="subhead">Grade Detail</div>
              <div className="col line-div"></div>
            </div>
            <div className="table-responsive p-0">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="2%">No.</th>
                    <th>Grade</th>
                    <th width="15%">Credit Point</th>
                    <th width="15%">Max Mark</th>
                    <th width="15%">Min Mark</th>
                    <th width="10%">Active</th>
                    <th width="10%">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="7" align="center">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.grade}</td>
                          <td align="right">{item.gradePoint}</td>
                          <td align="right">{item.maxMark}</td>
                          <td align="right">{item.minMark}</td>
                          <td align="center">{item.isActive ? "Yes" : "No"}</td>
                          <td align="center">
                            <Button
                              text={"Edit"}
                              className={"btn-3"}
                              type="button"
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
            </div>
          </>
        ) : null}

        <Modal
          show={openModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={() => setOpenModal(false)}
        >
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              grade: editGrade ? editGrade.grade : "",
              gradePoint: editGrade ? editGrade.gradePoint : "",
              maxMark: editGrade ? editGrade.maxMark : "",
              minMark: editGrade ? editGrade.minMark : "",
              active: editGrade ? editGrade.isActive : "",
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
                      {editGrade ? "Edit " : "Add "}Grade
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row px-5">
                      <div className="row no-gutters pb-2 mt-1 ">
                        <TextFieldFormik
                          autoFocus
                          tabIndex={1}
                          id="grade"
                          label="Grade"
                          mandatory={1}
                          maxlength={2}
                          style={{ width: "40%" }}
                          onChange={(e) => {
                            setFieldValue("grade", e.target.value);
                            setCheckGrade("");
                            setNoChange(true);
                          }}
                          error={CheckGrade ? CheckGrade : ""}
                        />
                        <TextFieldFormik
                          tabIndex={2}
                          id="gradePoint"
                          label="Credit Point"
                          maxlength={2}
                          style={{ width: "40%" }}
                          onChange={(e) => {
                            if (
                              !isNaN(e.target.value) &&
                              !e.target.value.includes(" ") &&
                              !e.target.value.includes(".") &&
                              e.target.value <= 10
                            ) {
                              setMarkError(false);
                              setFieldValue("gradePoint", e.target.value);
                            }
                            setNoChange(true);
                            setCheckGrade("");
                          }}
                        />
                        <TextFieldFormik
                          tabIndex={3}
                          id="maxMark"
                          label="Max Mark"
                          mandatory={1}
                          maxlength={3}
                          style={{ width: "40%" }}
                          onChange={(e) => {
                            if (
                              !isNaN(e.target.value) &&
                              !e.target.value.includes(" ") &&
                              !e.target.value.includes(".") &&
                              e.target.value <= 100
                            ) {
                              setMarkError(false);
                              setValidateMark(false);
                              setFieldValue("maxMark", e.target.value);
                            }
                            setNoChange(true);
                            setCheckGrade("");
                          }}
                        />
                        <TextFieldFormik
                          tabIndex={4}
                          id="minMark"
                          label="Min Mark"
                          mandatory={1}
                          maxlength={3}
                          style={{ width: "40%" }}
                          onChange={(e) => {
                            if (
                              !isNaN(e.target.value) &&
                              !e.target.value.includes(" ") &&
                              !e.target.value.includes(".") &&
                              e.target.value <= 100
                            ) {
                              setMarkError(false);
                              setValidateMark(false);
                              setFieldValue("minMark", e.target.value);
                            }
                            setNoChange(true);
                            setCheckGrade("");
                          }}
                          error={
                            markError
                              ? "Min mark should be less than Max mark"
                              : validateMark
                              ? "Max and Min Mark range already exist"
                              : ""
                          }
                        />
                        {editGrade ? (
                          <SwitchField
                            label="Active"
                            tabIndex={5}
                            yesOption={"Yes"}
                            noOption={"No"}
                            checked={values.active}
                            onChange={() => {
                              setFieldValue("active", !values.active);
                              setNoChange(true);
                              setCheckGrade("");
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="row my-1 py-2">
                      <div className="col-lg-6 d-flex justify-content-end">
                        <Button
                          tabIndex={editGrade ? 6 : 5}
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
  );
}
export default GradeList;
