import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";

import libraryApi from "../api/libraryapi";

import { authorTypeList } from "./common/CommonArray";
import TextField from "./FormField/TextField";
import ReactSelectField from "./FormField/ReactSelectField";
import preFunction from "./common/CommonFunction";
import Button from "./FormField/Button";
import ErrorMessage from "./common/ErrorMessage";
import SelectFieldFormik from "./FormField/SelectFieldFormik";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";

function BookTitleComponent({ titleModal = false, handleClose }) {
  //#region  declaration
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [addNewTitle, setAddNewTitle] = useState(false);
  const [titleExistsError, setTitleExistsError] = useState(false);

  const [deptList, setDeptList] = useState([]);
  const [authorList, setAuthorList] = useState([]);
  const [publisherList, setPublisherList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);

  const [bookTypeList, setBookTypeList] = useState([]);
  const [mainTitleList, setMainTitleList] = useState([]);
  const [addMasterModal, setAddMasterModal] = useState(false);

  const [masters, setMasters] = useState("");
  const [addMasters, setAddMasters] = useState("");
  const [isStatus, setIsStatus] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [docType, setDocType] = useState("");
  const { unSavedChanges, setUnSavedChanges, collegeId } =
    useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const currentYear = new Date().getFullYear();

  const years = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push({ label: year, value: year });
  }
  const formikRef = useRef();
  const titleRef = useRef();
  //#endregion

  const bookAddSchema = () => {
    if (collegeConfig.is_university) {
      return Yup.object().shape({
        college: Yup.object().required("Please select College"),
        modalMainTitle: Yup.string()
          .min(3, "Must be at least 3 characters long")
          .matches(/^[A-Za-z0-9@()-. ]+$/, "Please enter valid Title")
          .required("Please enter Title")
          .trim(),
        modalAuthor: Yup.array().required("Please select Author"),
        modalPublisher: Yup.object().required("Please select Publisher"),
        modalDepartment: Yup.object().required("Please select Department Name"),
        modalIsbnNumber: Yup.string().test(
          "is-valid-isbn",
          "Enter Valid ISBN Number",
          (value) => {
            if (value && value.trim() !== "") {
              return /^[a-zA-Z0-9-]+$/.test(String(value));
            }
            return true;
          }
        ),
        modalAuthorType: Yup.object().required("Please select Author Origin"),
        modalBookType: Yup.object().required("Please select Book Type"),

        modalSubject: Yup.array().required("Please select Subject Name"),
        modalCallNumber: Yup.string()
          .matches(/^[a-zA-Z0-9-]+$/, "Please enter valid call number")
          .required("Please enter call number")
          .trim(),
        modalRackNumber: Yup.string()
          .matches(/^[a-zA-Z0-9-]+$/, "Please enter valid rack number")
          .required("Please enter rack number")
          .trim(),
      });
    } else {
      return Yup.object().shape({
        modalMainTitle: Yup.string()
          .min(3, "Must be at least 3 characters long")
          .matches(/^[A-Za-z0-9@()-. ]+$/, "Please enter valid Title")
          .required("Please enter Title")
          .trim(),
        modalAuthor: Yup.array().required("Please select Author"),
        modalPublisher: Yup.object().required("Please select Publisher"),
        modalDepartment: Yup.object().required("Please select Department Name"),
        modalIsbnNumber: Yup.string().test(
          "is-valid-isbn",
          "Enter Valid ISBN Number",
          (value) => {
            if (value && value.trim() !== "") {
              return /^[a-zA-Z0-9-]+$/.test(String(value));
            }
            return true;
          }
        ),
        modalAuthorType: Yup.object().required("Please select Author Origin"),
        modalBookType: Yup.object().required("Please select Book Type"),

        modalSubject: Yup.array().required("Please select Subject Name"),
        modalCallNumber: Yup.string()
          .matches(/^[a-zA-Z0-9-]+$/, "Please enter valid call number")
          .required("Please enter call number")
          .trim(),
        modalRackNumber: Yup.string()
          .matches(/^[a-zA-Z0-9-]+$/, "Please enter valid rack number")
          .required("Please enter rack number")
          .trim(),
      });
    }
  };

  const handleSearchTitle = async (text) => {
    if (text.trim().length > 2) {
      try {
        const mainTitleRes = await libraryApi.getTitlebySearch(text?.trim());

        console.log("mainTitleRes---", mainTitleRes);
        const distinctLabels = {};
        mainTitleRes.data.message.data.book_data.forEach((item) => {
          if (!distinctLabels.hasOwnProperty(item.main_title)) {
            distinctLabels[item.main_title] = item.main_title;
          }
        });
        const distinctLabelValuePairs = Object.keys(distinctLabels).map(
          (main_title) => ({
            value: distinctLabels[main_title],
            label: main_title,
          })
        );
        setMainTitleList(distinctLabelValuePairs);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setMainTitleList([]);
    }
  };

  const handleSearchSubject = async (text) => {
    if (text.length > 2) {
      try {
        const subjectRes = await libraryApi.getSearchSubjectList(text);
        console.log("subjectRes---", subjectRes);
        setSubjectList(subjectRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleSearchAuthor = async (text) => {
    if (text.length > 2) {
      try {
        const authorRes = await libraryApi.getAuthorBySearch(text);
        setAuthorList(authorRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleSearchPublisher = async (text) => {
    if (text.length > 2) {
      try {
        const publisher = await libraryApi.getPublisherBySearch(text);
        console.log("publisherres---", publisher);
        setPublisherList(publisher.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleCheckBook = async (mainTitle, publisher) => {
    console.log("mainTitle-------", mainTitle, publisher);
    if (mainTitle != "" && publisher && publisher.value != "") {
      const checkDuplicateBookRes = await libraryApi.checkDuplicateBook(
        mainTitle,
        publisher.value
      );
      console.log("checkDuplicateBookRes-----", checkDuplicateBookRes);
      if (checkDuplicateBookRes.data.message.length > 0) {
        setTitleExistsError(true);
        setLoad(false);
        return;
      }
    }
  };

  const handleBookAdd = async (values, check, { resetForm }) => {
    if (load) return;
    console.log("values-----", values, values.modalSubject);
    try {
      setLoad(true);
      let subjectArr = [];
      for (let i = 0; i < values.modalSubject.length; i++) {
        subjectArr.push({ library_subject: values.modalSubject[i].value });
      }
      console.log("subjectArr---", subjectArr);

      let authorArr = [];
      for (let i = 0; i < values.modalAuthor.length; i++) {
        authorArr.push({ author_name: values.modalAuthor[i].value });
      }
      console.log("authorArr---", authorArr);

      if (values.modalMainTitle != "" && values.modalPublisher.value != "") {
        const checkDuplicateBookRes = await libraryApi.checkDuplicateBook(
          values.modalMainTitle,
          values.modalPublisher.value
        );
        console.log("checkDuplicateBookRes-----", checkDuplicateBookRes);
        if (checkDuplicateBookRes.data.message.length > 0) {
          setTitleExistsError(true);
          document.getElementById("modalMainTitle")?.focus();
          setLoad(false);
          return;
        }
      }

      const bookAddRes = await libraryApi.addBook(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        values.modalMainTitle,
        values.modalPublisher.value,
        values.modalAuthorType.value,
        values.modalDepartment.value,
        values.modalBookType.value,
        values.modalIsbnNumber,
        values.modalCallNumber,
        values.modalRackNumber,
        subjectArr,
        authorArr
      );
      console.log("bookAddRes---", bookAddRes);
      const blist = [bookAddRes.data.data];

      if (formikRef.current) {
        formikRef.current.setFieldValue("mainTitle", {
          label: values.modalMainTitle,
          value: bookAddRes.data.data.name,
        });
      }
      toast.success("Book Detail Added Successfully");
      resetForm();
      setAddNewTitle(false);
      if (check) handleClose();
      document.getElementById("modalMainTitle")?.focus();
      formikRef.current.setFieldValue("modalMainTitle", "");
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const getAllList = async () => {
    try {
      const bookTypeRes = await libraryApi.getBookTypeList();
      setBookTypeList(bookTypeRes.data.data);

      const deptRes = await libraryApi.getDeptList();
      setDeptList(deptRes.data.data);
    } catch (error) {
      setLoad(false);
      console.log("catch---", error);
    }
  };

  // const getBookDetailsByMainTitle = async (value) => {
  //   // closeErrors();
  //   // setShowBookIdError(false);
  //   // setBookId("");
  //   // setSelectedBook();
  //   // setBookList([]);
  //   if (value != "") {
  //     try {
  //       console.log("value------", value);
  //       const getBookByTitleRes = await libraryApi.bookSearch(value, 1, null);
  //       console.log("getBookByTitleRes--", getBookByTitleRes);
  //       // setBookList(getBookByTitleRes.data.message);
  //       if (getBookByTitleRes.data.message.length === 1) {
  //         // setBookId(getBookByTitleRes.data.message[0].name);
  //         // setSelectedBook(getBookByTitleRes.data.message[0]);
  //       } else {
  //         // setOpenSuggessionModal(true);
  //       }
  //     } catch (error) {
  //       console.log("error---", error);
  //     }
  //   }
  // };

  const handleAddMaster = async () => {
    try {
      let err = false;
      const masterRegEx = /^[A-Za-z0-9@(). \-+/]+$/;
      if (addMasters.trim() === "") {
        err = true;
        setErrorMsg(`Please enter ${masters} name`);
        setShowError(true);
        document.getElementById("textId")?.focus();
      } else if (!masterRegEx.test(addMasters.trim())) {
        err = true;
        setErrorMsg(`Please enter valid ${masters} name`);
        setShowError(true);
        document.getElementById("textId")?.focus();
      }
      if (err) {
        return;
      }
      // setModalLoad(true);
      if (addMasters && addMasters.length > 2) {
        console.log(docType, addMasters, 1);
        let fieldName;
        if (docType === "Lib Author") {
          fieldName = "author_name";
        } else if (docType === "Lib Publisher") {
          fieldName = "publisher";
        } else if (docType === "Lib Subject") {
          fieldName = "library_subject";
        }
        const addMasterRes = await libraryApi.addMaster(
          docType,
          fieldName,
          addMasters.replace(/\s\s+/g, " ").trim(),
          1
        );
        console.log("addMaster---", addMasterRes);
        if (!addMasterRes.ok) {
          setShowError(true);
          setErrorMsg(`${masters} "${addMasters}" already exists`);
          document.getElementById("textId")?.focus();
          // setModalLoad(false);
          return;
        }
        toast.success(`${masters} added successfully!`);
        if (docType === "Lib Author") {
          let arr = titleRef.current.values.modalAuthor
            ? titleRef.current.values.modalAuthor
            : [];
          arr.push({ label: addMasters, value: addMasterRes.data.data.name });
          titleRef.current.setFieldValue("modalAuthor", arr);
        } else if (docType === "Lib Publisher") {
          titleRef.current.setFieldValue("modalPublisher", {
            label: addMasters,
            value: addMasterRes.data.data.name,
          });
        } else if (docType === "Lib Subject") {
          let arr = titleRef.current.values.modalSubject
            ? titleRef.current.values.modalSubject
            : [];
          console.log("arr---", arr);

          arr.push({ label: addMasters, value: addMasterRes.data.data.name });
          console.log("arr---", arr);
          titleRef.current.setFieldValue("modalSubject", arr);
        }
        setIsStatus(false);
        setAddMasters("");
        setAddMasterModal(false);

        document.getElementById("master")?.focus();
      } else {
        if (addMasters.length <= 2) {
          setShowError(true);
          setErrorMsg(`Please enter valid ${masters} name`);
          document.getElementById("textId")?.focus();
        }
      }
      // setModalLoad(false);
    } catch (error) {
      // setModalLoad(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    getAllList();
  }, [collegeConfig.is_university]);

  return (
    <div>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <Formik
        enableReinitialize={true}
        innerRef={titleRef}
        initialValues={{
          college: "",
          modalMainTitle: "",
          modalMainTitleObj: "",
          modalAuthor: "",
          modalPublisher: "",
          modalAuthorType: "",
          modalDepartment: "",
          modalIsbnNumber: "",
          modalSubject: "",
          modalBookType: "",
          modalIsbnNumber: "",
          modalCallNumber: "",
          modalRackNumber: "",
        }}
        validationSchema={bookAddSchema}
        onSubmit={(values) =>
          handleBookAdd(values, handleClose ? 1 : 0, formikRef.current)
        }
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
                <div className="col-lg-12">
                  <div className="col-lg-10">
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        label="College"
                        id="college"
                        mandatory={1}
                        title={true}
                        clear={false}
                        tabIndex={101}
                        maxLength={15}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          // setCollege(text);
                          setTitleExistsError(false);
                          setFieldValue("college", text);
                        }}
                      />
                    )}
                  </div>
                  <div className="row no-gutters">
                    <div className="col-lg-10">
                      {addNewTitle ? (
                        <TextField
                          autoFocus={!collegeConfig.is_university}
                          id="modalMainTitle"
                          placeholder="Title"
                          label="Title"
                          tabIndex={102}
                          value={values.modalMainTitle}
                          error={
                            titleExistsError
                              ? "Book Title: " +
                                values.modalMainTitle +
                                ", Publisher: " +
                                values.modalPublisher.value +
                                " already exists"
                              : errors.modalMainTitle
                          }
                          touched={
                            titleExistsError ? true : touched.modalMainTitle
                          }
                          onChange={(e) => {
                            setFieldValue("modalMainTitle", e.target.value);
                            setTitleExistsError(false);
                            handleCheckBook(e.target.value, values.publisher);
                          }}
                          mandatory={1}
                          maxlength={140}
                        />
                      ) : (
                        <ReactSelectField
                          autoFocus
                          placeholder="Title"
                          label="Title"
                          id="modalMainTitleObj"
                          mandatory={1}
                          title={true}
                          searchIcon={true}
                          tabIndex={102}
                          maxLength={15}
                          error={
                            titleExistsError
                              ? "Book Title: " +
                                values.modalMainTitle +
                                ", Publisher: " +
                                values.modalPublisher?.label +
                                " already exists"
                              : errors.modalMainTitle
                          }
                          touched={
                            titleExistsError ? true : touched.modalMainTitle
                          }
                          value={values.modalMainTitleObj}
                          options={mainTitleList}
                          onInputChange={(inputValue) => {
                            handleSearchTitle(inputValue);
                          }}
                          onChange={(text) => {
                            setFieldValue("modalMainTitle", text.label);
                            setFieldValue("modalMainTitleObj", text);
                            handleCheckBook(text.label, values.modalPublisher);
                            setMainTitleList([]);
                            setTitleExistsError(false);
                          }}
                        />
                      )}
                    </div>
                    <div className="col-lg-2 ps-2 mt-2">
                      {addNewTitle ? (
                        <Button
                          type="button"
                          frmButton={false}
                          isTable={true}
                          className={"btn-3"}
                          text={`Search Title`}
                          onClick={() => {
                            setFieldValue("modalMainTitle", "");
                            setFieldValue("modalMainTitleObj", "");
                            setAddNewTitle(false);
                          }}
                        />
                      ) : (
                        <Button
                          type="button"
                          frmButton={false}
                          className={"btn-3"}
                          isTable={true}
                          text={`New Title`}
                          onClick={() => {
                            setFieldValue("modalMainTitle", "");
                            setFieldValue("modalMainTitleObj", "");
                            setAddNewTitle(true);
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="row no-gutters">
                    <div className="col-lg-10">
                      <ReactSelectField
                        label="Author Name"
                        placeholder="Author Name"
                        id="modalAuthor"
                        tabIndex={103}
                        mandatory={1}
                        error={errors.modalAuthor}
                        touched={touched.modalAuthor}
                        value={values.modalAuthor}
                        options={authorList}
                        isMulti={true}
                        searchIcon={true}
                        closeMenuOnSelect={false}
                        onInputChange={(inputValue) => {
                          handleSearchAuthor(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("modalAuthor", text);
                          setAuthorList([]);
                        }}
                      />
                    </div>
                    <div className="col-lg-2 ps-2 mt-2">
                      <Button
                        type="button"
                        frmButton={false}
                        className={"btn-3"}
                        isTable={true}
                        text={`New Author`}
                        onClick={() => {
                          setDocType("Lib Author");
                          setMasters("Author");
                          setAddMasterModal(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="row no-gutters">
                  <div className="col-lg-10">
                    <ReactSelectField
                      label="Publisher"
                      placeholder="Publisher"
                      id="modalPublisher"
                      mandatory={1}
                      tabIndex={104}
                      error={errors.modalPublisher}
                      touched={touched.modalPublisher}
                      value={values.modalPublisher}
                      searchIcon={true}
                      options={publisherList}
                      onInputChange={(inputValue) => {
                        handleSearchPublisher(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("modalPublisher", text);
                        handleCheckBook(values);
                        setPublisherList([]);
                        setTitleExistsError(false);
                      }}
                    />
                  </div>
                  <div className="col-lg-2 ps-2 mt-2">
                    <Button
                      type="button"
                      frmButton={false}
                      className={"btn-3"}
                      isTable={true}
                      text={`New Publisher`}
                      onClick={() => {
                        setMasters("Publisher");
                        setDocType("Lib Publisher");
                        setAddMasterModal(true);
                      }}
                    />
                  </div>

                  <div className="col-lg-10">
                    <ReactSelectField
                      label="Department Name"
                      id="modalDepartment"
                      mandatory={1}
                      tabIndex={105}
                      searchIcon={false}
                      error={errors.modalDepartment}
                      touched={touched.modalDepartment}
                      value={values.modalDepartment}
                      options={deptList}
                      onChange={(text) =>
                        setFieldValue("modalDepartment", text)
                      }
                    />

                    <TextField
                      id="modalIsbnNumber"
                      placeholder="ISBN"
                      label="ISBN"
                      tabIndex={106}
                      value={values.modalIsbnNumber}
                      error={errors.modalIsbnNumber}
                      touched={touched.modalIsbnNumber}
                      onChange={(e) =>
                        setFieldValue("modalIsbnNumber", e.target.value)
                      }
                      style={{ width: "60%" }}
                      maxlength={5}
                    />

                    <ReactSelectField
                      label="Author Origin"
                      placeholder="Author Type"
                      id="modalAuthorType"
                      mandatory={1}
                      tabIndex={107}
                      error={errors.modalAuthorType}
                      touched={touched.modalAuthorType}
                      value={values.modalAuthorType}
                      options={authorTypeList}
                      style={{ width: "60%" }}
                      search={false}
                      onChange={(text) =>
                        setFieldValue("modalAuthorType", text)
                      }
                    />

                    <ReactSelectField
                      label="Book Type"
                      placeholder="Book Type"
                      id="modalBookType"
                      search={false}
                      mandatory={1}
                      tabIndex={108}
                      style={{ width: "60%" }}
                      error={errors.modalBookType}
                      touched={touched.modalBookType}
                      value={values.modalBookType}
                      options={bookTypeList}
                      onChange={(text) => setFieldValue("modalBookType", text)}
                    />
                  </div>
                  <div className="row no-gutters">
                    <div className="col-lg-10">
                      <ReactSelectField
                        label="Subject Name"
                        placeholder="Subject Name"
                        id="modalSubject"
                        mandatory={1}
                        searchIcon={true}
                        tabIndex={109}
                        error={errors.modalSubject}
                        touched={touched.modalSubject}
                        value={values.modalSubject}
                        options={subjectList}
                        isMulti={true}
                        closeMenuOnSelect={false}
                        onInputChange={(inputValue) => {
                          handleSearchSubject(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("modalSubject", text);
                          setSubjectList([]);
                        }}
                      />
                    </div>
                    <div className="col-lg-2 ps-2 mt-2">
                      <Button
                        type="button"
                        frmButton={false}
                        className={"btn-3"}
                        isTable={true}
                        text={`New Subject`}
                        onClick={() => {
                          setMasters("Subject");
                          setDocType("Lib Subject");
                          setAddMasterModal(true);
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-lg-10">
                    <TextField
                      id="modalCallNumber"
                      placeholder="Call Number"
                      label="Call Number"
                      tabIndex={110}
                      value={values.modalCallNumber}
                      error={errors.modalCallNumber}
                      touched={touched.modalCallNumber}
                      onChange={(e) =>
                        setFieldValue("modalCallNumber", e.target.value)
                      }
                      style={{ width: "60%" }}
                      maxlength={5}
                      mandatory={1}
                    />
                    <TextField
                      id="modalRackNumber"
                      placeholder="Rack Number"
                      label="Rack Number"
                      tabIndex={111}
                      value={values.modalRackNumber}
                      error={errors.modalRackNumber}
                      touched={touched.modalRackNumber}
                      onChange={(e) =>
                        setFieldValue("modalRackNumber", e.target.value)
                      }
                      style={{ width: "60%" }}
                      maxlength={5}
                      mandatory={1}
                    />
                  </div>
                </div>
              </div>
              {titleModal ? (
                <div className="row p-0 my-2">
                  <div className="col-lg-6 text-right">
                    <Button
                      text={"F4 - Save"}
                      tabIndex={112}
                      frmButton={false}
                      // isTable={true}
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                      id="save"
                    />
                  </div>

                  <div className="col-lg-6 text-left">
                    <Button
                      text="Close"
                      type="button"
                      // isTable={true}
                      frmButton={false}
                      onClick={(e) => {
                        handleClose();
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="row no-gutters mt-3">
                  <Button
                    text={"F4 - Save"}
                    tabIndex={12}
                    isTable={true}
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                    id="save"
                  />
                </div>
              )}
            </form>
          );
        }}
      </Formik>
      <Modal
        show={addMasterModal}
        dialogClassName="my-modal"
        onEscapeKeyDown={() => {
          setAddMasterModal(false);
          setAddMasters("");
          setIsStatus(false);
          setIsEdit(false);
        }}
      >
        <Modal.Header>
          <Modal.Title>{`New ${masters}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="row col-lg-10 no-gutters">
              <TextField
                autoFocus={addMasterModal ? true : false}
                id="textId"
                placeholder={`New ${masters}`}
                label={`New ${masters}`}
                value={addMasters}
                mandatory={1}
                tabIndex={1}
                maxlength={140}
                onChange={(e) => {
                  setShowError(false);
                  setAddMasters(e.target.value);
                }}
              />
              <div className="row p-0">
                <div className="col-lg-5"></div>
                <div className="col-lg-7 p-0 pt-1">
                  <ErrorMessage Message={errorMsg} view={showError} />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            tabIndex={2}
            text={"Save"}
            frmButton={false}
            onClick={(e) => {
              handleAddMaster();
            }}
            isTable={true}
          />
          <Button
            tabIndex={2}
            text={"Close"}
            frmButton={false}
            isTable={true}
            onClick={(e) => {
              setAddMasterModal(false);
              setAddMasters("");
              // setIsStatus(false);
              // setIsEdit(false);
              setErrorMsg("");
            }}
          />
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default BookTitleComponent;
