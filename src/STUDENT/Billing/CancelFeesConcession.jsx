import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import ErrorMessage from "../../component/common/ErrorMessage";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import StudentCard from "../../component/StudentCard";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import CommonApi from "../../component/common/CommonApi";

import AuthContext from "../../auth/context";

const FormSchema = Yup.object().shape({
  student: Yup.object().required("Please select Student"),
});

function CancelFeesConcession() {
  const navigate = useNavigate();
  const [concessionData, setConcessionData] = useState([]);
  const [load, setLoad] = useState(false);
  const [studentList, setStudentList] = useState([]);

  const [uncheckedError, setUncheckedError] = useState(false);
  const [checkBoxMessage, setCheckBoxMessage] = useState("");
  const [studentInfo, setStudentInfo] = useState();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();

  const { setUnSavedChanges, collegeId, role } = useContext(AuthContext);

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleStaffConcession = (item) => {
    console.log("item--", item);

    if (item.concessionType === "Staff" && item.isCancel === 1) {
      console.log("item--", item);
      concessionData.forEach((item) => {
        if (item.concessionType === "Staff") {
          item.isCancel = 1;
        }
      });
    } else if (item.concessionType === "Staff" && item.isCancel === 0) {
      concessionData.forEach((item) => {
        if (item.concessionType === "Staff") {
          item.isCancel = 0;
        }
      });
    }
  };

  const handleSave = async (values) => {
    if (load) return;
    console.log("values--", values);
    setUncheckedError(false);
    setCheckBoxMessage("");

    const checkBoxes = document.querySelectorAll('input[type="checkbox"]');
    console.log("checkBoxes", checkBoxes);
    // if checkBoxes is not checked then return
    let checked = false;
    checkBoxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checked = true;
      }
    });
    if (!checked) {
      setUncheckedError(true);
      setCheckBoxMessage("Please select at least one Concession to cancel");
      setLoad(false);
      return;
    }

    const result = [];
    concessionData.forEach((item) => {
      const existingConcessionIndex = result.findIndex(
        (concession) => concession.feesConcessionID === item.feesConcessionID
      );
      console.log("item-concessionType----", item.concessionType);
      if (item.isCancel != 1) {
        return;
      }
      const detail = {
        feesConcessionDetailID: item.feesConcessionDetailID,
        feeDueID: item.feesDueID,
        concessionAmount: item.concessionAmount,
      };

      if (existingConcessionIndex > -1) {
        result[existingConcessionIndex].feesConcessionDetail.push(detail);
      } else {
        console.log("item-concessionType----", item.concessionType);
        if (item.concessionType === "Sibling") {
          result.push({
            feesConcessionID: item.feesConcessionID,
            concessionType: item.concessionType,
            feesConcessionDetail: [detail],
          });
        } else if (item.concessionType === "Staff") {
          result.push({
            feesConcessionID: item.feesConcessionID,
            concessionType: item.concessionType,
            feesConcessionDetail: [detail],
          });
        } else if (item.concessionType === "Management") {
          result.push({
            feesConcessionID: item.feesConcessionID,
            concessionType: item.concessionType,
            feesConcessionDetail: [detail],
          });
        }
      }
    });

    console.log("result--", result);
    try {
      setLoad(true);
      const cancelConcession = await StudentApi.cancelStudentConcession(
        result,
        collegeConfig.institution_type
      );
      console.log("cancelConcession--", cancelConcession);
      if (!cancelConcession.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(cancelConcession.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(cancelConcession.data.message.message);
      formikRef.current.resetForm();
      setConcessionData([]);
      setStudentList([]);
      setStudentInfo();
      setLoad(false);
      handleUnSavedChanges(0);
      document.getElementById("student")?.focus();
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelectStudent = async (value) => {
    console.log("value--", value);
    try {
      setLoad(true);
      setConcessionData([]);
      handleUnSavedChanges(0);
      setStudentInfo();
      if (value) {
        const getConcessionList = await StudentApi.getStudentConcessionList(
          value.id,
          value.semester,
          collegeConfig.institution_type
        );
        console.log("getConcessionList--", getConcessionList);

        if (getConcessionList.data.message.data.concession_list) {
          for (
            let i = 0;
            i < getConcessionList.data.message.data.concession_list.length;
            i++
          ) {
            getConcessionList.data.message.data.concession_list[i].isCancel = 0;
          }
        }
        setConcessionData(getConcessionList.data.message.data.concession_list);
        if (getConcessionList.data.message.data.concession_list.length == 0) {
          setModalErrorOpen(true);
          setModalMessage("No Concession Found");
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        setStudentInfo(value);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const searchStudent = async (value) => {
    setStudentList(
      await CommonApi.searchStudent(
        value,
        collegeConfig.common_cashier == 1 || role == "SuperAdmin"
          ? null
          : collegeId
      )
    );
  };

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
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
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formikRef}
            initialValues={{
              student: "",
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
                  <div className="row no-gutters">
                    <div className="col-lg-9 mt-2">
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="Student No. / Name"
                        labelSize={3}
                        id="student"
                        mandatory={1}
                        maxlength={40}
                        clear={true}
                        searchIcon={true}
                        style={{ width: "80%" }}
                        options={studentList}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                        onInputChange={(inputValue) => {
                          searchStudent(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("student", text);
                          setFieldTouched("student", false);
                          handleSelectStudent(text);
                          setUncheckedError(false);
                        }}
                      />
                    </div>
                    {studentInfo ? (
                      <>
                        <div className="subhead-row mt-2 pt-1">
                          <div className="subhead">Student Details</div>
                          <div className="col line-div"></div>
                        </div>

                        {studentInfo && (
                          <StudentCard studentInfo={studentInfo} />
                        )}
                      </>
                    ) : null}
                    {concessionData.length > 0 && values.student ? (
                      <div className="row p-0">
                        <div className="subhead-row p-0">
                          <div className="subhead"> Fees Detail</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="row p-0 mt-1">
                          <div className="table-responsive row p-0">
                            <table className="table table-bordered table-hover">
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width={"8%"}>{RENAME?.sem}</th>
                                  <th>Particular</th>
                                  <th width="10%">Opening Balance (₹)</th>
                                  <th width="5%">Concession Type</th>
                                  <th width="5%">Concession (₹)</th>
                                  <th width="5%">Paid (₹)</th>
                                  <th width="5%">Refund (₹)</th>
                                  <th width="10%">Outstanding Balance (₹)</th>
                                  <th width="5%">Cancel Concession</th>
                                </tr>
                              </thead>
                              <tbody>
                                {concessionData.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{item.className}</td>
                                      <td>{item.particular}</td>
                                      <td align="right">
                                        {item.openingBalance}
                                      </td>
                                      <td align="right">
                                        {item.concessionType}
                                      </td>
                                      <td align="right">
                                        {item.isCancel == 1 ? (
                                          <strike>
                                            {item.concessionAmount}
                                          </strike>
                                        ) : (
                                          item.concessionAmount
                                        )}
                                      </td>
                                      <td align="right">{item.paid}</td>
                                      <td align="right">{item.refund}</td>
                                      <td align="right">
                                        {item.isCancel == 1
                                          ? item.balance + item.concessionAmount
                                          : item.balance}
                                      </td>
                                      <td style={{ textAlign: "center" }}>
                                        <input
                                          type="checkbox"
                                          name="isCancel"
                                          id="isCancel"
                                          value={item.isCancel}
                                          checked={
                                            item.isCancel === 1 ? true : false
                                          }
                                          onChange={(e) => {
                                            handleUnSavedChanges(1);
                                            concessionData[index].isCancel =
                                              item.isCancel === 1 ? 0 : 1;
                                            setConcessionData([
                                              ...concessionData,
                                            ]);
                                            console.log("item--", item);
                                            setUncheckedError(false);
                                            handleStaffConcession(item);
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <ErrorMessage
                            Message={checkBoxMessage}
                            view={uncheckedError}
                          />
                        </div>
                      </div>
                    ) : null}
                    {concessionData.length > 0 && values.student ? (
                      <div className="row">
                        <Button
                          tabIndex={3 + concessionData.length}
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                          id="save"
                          text="F4 - Save"
                        />
                      </div>
                    ) : null}
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default CancelFeesConcession;
