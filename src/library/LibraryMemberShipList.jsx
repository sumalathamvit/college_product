import React, { useEffect, useState, useContext, useRef } from "react";
import { Modal } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import libraryApi from "../api/libraryapi";
import StudentApi from "../api/StudentApi";

import AuthContext from "../auth/context";

import string from "../string";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SwitchField from "../component/FormFieldLibrary/SwitchField";
import Button from "../component/FormField/Button";
import ReadOnlyField from "../component/ReadOnlyField";
import ScreenTitle from "../component/common/ScreenTitle";
import TextAreaField from "../component/FormFieldLibrary/TextareaField";
import ModalComponent from "../component/ModalComponent";
import SelectFieldFormik from "../component/FormFieldLibrary/SelectFieldFormik";

function MemberShipList() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [statusOpenModal, setStatusOpenModal] = useState(false);
  const [memberDetail, setMemberDetail] = useState([]);
  const [memberStatus, setMemberStatus] = useState();
  const [oldMemberStatus, setOldMemberStatus] = useState();
  const [memberIndex, setMemberIndex] = useState();
  const [showRes, setShowRes] = useState(false);
  const [noChangesError, setNoChangesError] = useState(false);
  const [reasonError, setReasonError] = useState(false);
  const [reason, setReason] = useState("");
  const [collegeMadatory, setCollegeManadatory] = useState(true);

  const formikRef = useRef();

  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [memberList, setMemberList] = useState([]);
  const [noChangeError, setNoChangeError] = useState(false);
  const [prevValues, SetPrevValues] = useState({});
  const { unSavedChanges, setUnSavedChanges, collegeId } =
    useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  const FormSchema = Yup.object().shape({
    college:
      collegeConfig.is_university && collegeMadatory
        ? Yup.object().required("Please select College")
        : Yup.mixed().notRequired(),
  });

  const handleStatusChange = async (memberNumber) => {
    console.log("Saved");
    console.log("editmember---", memberNumber, memberStatus);
    if (oldMemberStatus == memberStatus) {
      setNoChangesError(true);
      return;
    }
    if (memberStatus == "Close") {
      if (reason == "" || !reason) {
        console.log("testestets");
        document.getElementById("reason")?.focus();
        setReasonError(true);
        return;
      }
    }
    const editmemberRes = await libraryApi.editMemberShip(
      memberNumber,
      memberStatus,
      reason
    );
    console.log("editmemberRes---", editmemberRes);
    data[memberIndex].member_status = memberStatus;
    setStatusOpenModal(false);
    toast.success("MemberShip Status Saved Successfully");
  };

  const getMemberList = async (values, showAll) => {
    try {
      setLoad(true);
      setShowRes(true);
      SetPrevValues(values);
      console.log("prevValues---", prevValues);
      console.log("values---", values);

      // if (
      //   prevValues?.course?.id == values.course?.id &&
      //   prevValues?.batch?.batchID == values.batch?.batchID &&
      //   prevValues?.memberNumber?.value == values.memberNumber?.value &&
      //   prevValues?.college?.collegeID == values.college?.collegeID
      // ) {
      //   setNoChangeError(true);
      //   setLoad(false);
      //   return;
      // }

      // let searchStringArr = [];

      // if (values.course) {
      //   searchStringArr.push(
      //     `["member_department","=","${values.course.courseName}"]`
      //   );
      // }
      // if (values.batch) {
      //   searchStringArr.push(`["student_batch","=","${values.batch.batch}"]`);
      // }
      // if (values.memberNumber) {
      //   searchStringArr.push(
      //     `["member_number","=","${values.memberNumber.value}"]`
      //   );
      // }
      // if (values.college) {
      //   searchStringArr.push(
      //     `["college_id","=","${
      //       collegeConfig.is_university ? values.college.collegeID : collegeId
      //     }"]`
      //   );
      // }
      // let searchstr = searchStringArr.join(",");
      // console.log("searchstr", searchstr);

      const memberRes = await libraryApi.getMemberShipList(
        collegeConfig.institution_type,
        values.course ? values.course.courseName : null,
        values.semester
          ? collegeConfig.institution_type !== 1
            ? values.semester.batch
            : null
          : null,
        values.semester
          ? collegeConfig.institution_type == 1
            ? values.semester.semester
            : null
          : null,
        values.memberNumber ? values.memberNumber.value : null,
        showAll == 1 ? 1 : 0,
        collegeConfig.is_university ? values.college?.collegeID : collegeId,
        "current"
      );
      console.log("memberRes---", memberRes);
      setData(memberRes.data.message.data.member_list);
      if (
        string.PAGE_LIMIT === memberRes.data.message.data.member_list.length
      ) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getMemberDetail = async (item, index) => {
    console.log("item--", item);
    setMemberDetail(item);
    setMemberStatus(item.member_status);
    setReason(item.reason);
    setStatusOpenModal(true);
    setOldMemberStatus(item.member_status);
    setMemberIndex(index);
  };

  const handleMemberSearch = async (inputValue) => {
    if (inputValue.length > 2) {
      try {
        const studentRes = await libraryApi.searchLibraryMember(
          inputValue,
          "current",
          collegeConfig.institution_type
        );
        console.log("studentRes---", studentRes);
        for (
          let i = 0;
          i < studentRes.data.message.data.member_data.length;
          i++
        ) {
          studentRes.data.message.data.member_data[i].value =
            studentRes.data.message.data.member_data[i].member_number;
          studentRes.data.message.data.member_data[i].label =
            studentRes.data.message.data.member_data[i].member_number +
            " - " +
            studentRes.data.message.data.member_data[i].member_name;
        }
        setMemberList(studentRes.data.message.data.member_data);
      } catch (error) {
        console.log("error----", error);
      }
    } else {
      setMemberList([]);
    }
  };

  const getBatchMaster = async (text = null) => {
    console.log("text---", text);
    if (text) {
      try {
        const getBatchRes = await StudentApi.getMaster(
          collegeConfig.institution_type == 1 ? 8 : 2,
          collegeConfig.is_university ? text.collegeID : collegeId,
          text.id
        );
        console.log("getBatchRes---", getBatchRes);
        collegeConfig.institution_type == 1
          ? setBatchList(getBatchRes.data.message.data.semester_data)
          : setBatchList(getBatchRes.data.message.data.batch_data);
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    } else {
      setBatchList([]);
    }
  };

  const getCourseList = async (value) => {
    console.log("value---", value);
    if (value) {
      try {
        const getMasterRes = await StudentApi.getMaster(
          collegeConfig.institution_type == 1 ? 8 : 2,
          value
        );
        console.log("getMasterRes---", getMasterRes);

        setCourseList(getMasterRes.data.message.data.course_data);

        if (!collegeConfig.is_university) {
          const memberRes = await libraryApi.getMemberShipList(
            collegeConfig.institution_type,
            null,
            null,
            null,
            null,
            0,
            collegeId,
            "current"
          );
          console.log("memberRes", memberRes);
          setShowRes(true);
          setData(memberRes.data.message.data.member_list);
          if (
            string.PAGE_LIMIT === memberRes.data.message.data.member_list.length
          ) {
            setShowLoadMore(true);
          } else {
            setShowLoadMore(false);
          }
        }
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getCourseList(collegeId);
    } else {
      setCourseList([]);
    }
  }, [collegeConfig.is_university]);

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
        <div className="row no-gutters">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: "",
              course: "",
              semester: "",
              memberNumber: "",
            }}
            validationSchema={FormSchema}
            onSubmit={getMemberList}
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
                    {collegeConfig.is_university && (
                      <div className="col-lg-3 pe-2">
                        <SelectFieldFormik
                          autoFocus
                          label="College"
                          id="college"
                          labelSize={3}
                          mandatory={collegeMadatory ? 1 : 0}
                          clear={collegeMadatory ? false : true}
                          tabIndex={1}
                          maxLength={15}
                          style={{ width: "97%" }}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          options={collegeConfig.collegeList}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            getCourseList(text ? text.collegeID : null);
                            setShowRes(false);
                            setNoChangeError(false);
                            setData([]);
                            setShowRes(false);
                          }}
                        />
                      </div>
                    )}
                    <div className="col-lg-4 ">
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        label={RENAME?.course}
                        labelSize={3}
                        tabIndex={collegeConfig.is_university ? 2 : 1}
                        id="course"
                        matchFrom="start"
                        searchIcon={false}
                        clear={true}
                        options={courseList}
                        style={{ width: "97%" }}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          getBatchMaster(text);
                          setFieldValue("course", text);
                          setFieldValue("semester", "");
                          setShowRes(false);
                          setNoChangeError(false);
                          setData([]);
                        }}
                      />
                    </div>
                    {collegeConfig.institution_type == 1 ? (
                      <div className="col-lg-2 pe-2">
                        <SelectFieldFormik
                          label={RENAME?.sem}
                          id="semester"
                          tabIndex={3}
                          labelSize={3}
                          clear={true}
                          searchIcon={false}
                          style={{ width: "97%" }}
                          options={batchList}
                          getOptionLabel={(option) => option.className}
                          getOptionValue={(option) => option.semester}
                          onChange={(text) => {
                            setFieldValue("semester", text);
                            setShowRes(false);
                            setNoChangeError(false);
                            setData([]);
                          }}
                        />
                      </div>
                    ) : null}
                    <div className="col-lg-3">
                      <SelectFieldFormik
                        searchIcon={true}
                        label={"Member Number / Name"}
                        id="memberNumber"
                        options={memberList}
                        labelSize={3}
                        tabIndex={4}
                        maxlength={15}
                        clear={true}
                        onInputChange={(inputValue) => {
                          handleMemberSearch(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("memberNumber", text);
                          setShowRes(false);
                          setNoChangeError(false);
                          setData([]);
                          text
                            ? setCollegeManadatory(false)
                            : setCollegeManadatory(true);
                        }}
                        noOptionsMessage={(text) =>
                          preFunction.reactSelectNoOptionsMessage(text)
                        }
                        // style={{ width: "40%" }}
                      />
                    </div>
                    {/* <div className="col-lg-8 mt-2 text-center ms-3">
                      <ErrorMessage
                        Message={"No changes made"}
                        view={noChangeError}
                      />
                    </div> */}
                    <Button type="submit" text="Search" tabIndex={5} />
                  </div>
                  {showRes && (
                    <>
                      <div className="row no-gutters">
                        <div className="row totcntstyle"></div>
                        <>
                          <div className="">
                            <table className="table table-bordered table-hover">
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="5%">Member No.</th>
                                  <th width="15%">Name</th>
                                  <th>{RENAME?.dept}</th>
                                  <th width="10%">{RENAME?.batch}</th>
                                  <th width="5%">Member Type</th>
                                  <th width="5%">Status</th>
                                  <th width="5%"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {data?.length == 0 ? (
                                  <tr>
                                    <td colSpan="10" className="text-center">
                                      No Member found
                                    </td>
                                  </tr>
                                ) : (
                                  data?.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td align="center">{index + 1}</td>
                                        <td>{item.member_number}</td>
                                        <td>{item.member_name}</td>
                                        <td>
                                          {
                                            item.member_department?.split(
                                              "-"
                                            )[0]
                                          }
                                        </td>
                                        <td>
                                          {collegeConfig.institution_type == 1
                                            ? item.className
                                            : item.student_batch}
                                        </td>
                                        <td>{item.config_member_type}</td>
                                        <td>
                                          {item.member_status == "Close" ? (
                                            <span style={{ color: "red" }}>
                                              Closed
                                            </span>
                                          ) : (
                                            item.member_status
                                          )}
                                        </td>
                                        <td>
                                          <Button
                                            className={"btn-3"}
                                            isTable={true}
                                            onClick={() => {
                                              getMemberDetail(item, index);
                                              setNoChangesError(false);
                                            }}
                                            text="Status"
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
                      </div>
                    </>
                  )}
                </form>
              );
            }}
          </Formik>
        </div>
        {showLoadMore && (
          <Button
            text="Show All"
            className={"btn mt-2"}
            isTable={true}
            onClick={(e) => {
              getMemberList(formikRef.current.values, 1);
            }}
          />
        )}
        <Modal
          show={statusOpenModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={() => setStatusOpenModal(false)}
        >
          <Modal.Header>
            <Modal.Title>Member Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row px-5">
              <div className="col-lg-6">
                <ReadOnlyField
                  label="Member Number"
                  value={memberDetail.member_number}
                />
                <ReadOnlyField label="Name" value={memberDetail.member_name} />
              </div>
              <div className="col-lg-6">
                {memberDetail.student_batch ? (
                  <ReadOnlyField
                    label={RENAME?.batch}
                    value={memberDetail.student_batch}
                  />
                ) : null}
                <ReadOnlyField
                  label="Member Type"
                  value={memberDetail.config_member_type}
                />
              </div>
            </div>
            <div className="row col-lg-12 px-5">
              <ReadOnlyField
                label={RENAME?.dept}
                value={memberDetail.member_department}
              />
              <div className="ps-3 p-0">
                <SwitchField
                  label="Member Status"
                  isTable={true}
                  tabIndex={1}
                  yesOption="Open"
                  noOption="Close"
                  onChange={(e) => {
                    setMemberStatus(memberStatus == "Open" ? "Close" : "Open");
                    setNoChangesError(false);
                    console.log("memberStatus", memberStatus);
                  }}
                  checked={memberStatus == "Open" ? true : false}
                  error={noChangesError ? "No Changes made" : ""}
                  touched={noChangesError ? true : false}
                />

                {memberStatus == "Close" ? (
                  <>
                    <TextAreaField
                      id="reason"
                      name="reason"
                      label="Reason"
                      value={reason}
                      tabIndex={2}
                      mandatory={1}
                      title={true}
                      onChange={(e) => {
                        setReason(e.target.value);
                        setReasonError(false);
                      }}
                      placeholder="reason"
                      error={reasonError ? "Please enter Reason" : ""}
                      touched={reasonError ? true : false}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              frmButton={false}
              type="button"
              text={"Save"}
              tabIndex={3}
              onClick={() => handleStatusChange(memberDetail.member_number)}
            />
            <Button
              frmButton={false}
              type="button"
              text={"Close"}
              onClick={() => setStatusOpenModal(false)}
            />
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
export default MemberShipList;
