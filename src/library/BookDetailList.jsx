import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import * as Yup from "yup";

import libraryApi from "../api/libraryapi";

import { authorTypeList } from "../component/common/CommonArray";
import Button from "../component/FormField/Button";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ModalComponent from "../component/ModalComponent";
import preFunction from "../component/common/CommonFunction";
import ReactSelectField from "../component/FormFieldLibrary/ReactSelectField";
import string from "../string";

import ReactSelectFieldHorizontal from "../component/FormField/ReactSelectField";
import TextFieldHorizontal from "../component/FormField/TextField";
import ScreenTitle from "../component/common/ScreenTitle";

const bookAddSchema = Yup.object().shape({
  modalMainTitle: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(/^[A-Za-z0-9@. ]+$/, "Please enter valid title")
    .required("Please enter title")
    .trim(),
  modalAuthor: Yup.array()
    .required("Please select Author")
    .min(1, "Please select Author"),
  // modalAuthor: Yup.array().required("Please select Author"),
  modalAuthorType: Yup.object().required("Please select Author Origin"),
  modalPublisher: Yup.object().required("Please select Publisher"),
  modalBookType: Yup.object().required("Please select Book Type"),
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
  modalSubject: Yup.array()
    .required("Please select Subject Name")
    .min(1, "Please select Subject Name"),
  // modalSubject: Yup.array().required("Please select Subject Name"),
  modalCallNumber: Yup.string()
    .matches(/^[a-zA-Z0-9.-]+$/, "Please enter valid call number")
    .required("Please enter call number")
    .trim(),
  modalRackNumber: Yup.string()
    .matches(/^[a-zA-Z0-9-]+$/, "Please enter valid rack number")
    .required("Please enter rack number")
    .trim(),
});

function BookDetailList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [titleList, setTitleList] = useState([]);
  const [title, setTitle] = useState();
  const [showRes, setShowRes] = useState(false);
  const [authorList, setAuthorList] = useState([]);
  const [titleOpenModal, setTitleOpenModal] = useState(false);
  const [formValues, setFormValues] = useState();
  const [publisherList, setPublisherList] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [bookTypeList, setBookTypeList] = useState([]);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [cleared, setCleared] = useState(false);
  const formikRef = useRef();

  const handleCheckBook = async (values, check) => {
    if (load) return;
    try {
      setLoad(true);
      console.log("values-----", values, values.modalSubject);
      if (values.modalMainTitle != "" && values.modalPublisher.value != "") {
        const checkDuplicateBookRes = await libraryApi.checkDuplicateBookDetail(
          values.modalMainTitle,
          values.modalPublisher.value,
          formValues?.name
        );
        console.log("checkDuplicateBookRes-----", checkDuplicateBookRes);
        if (checkDuplicateBookRes.data.message.length > 0) {
          setModalMessage(
            `The book details with Title ${values.modalMainTitle} and Publisher ${values.modalPublisher.value} already exists`
          );
          setErrorOpen(true);
          setLoad(false);
          return;
        } else {
          console.log("check---", check);
          if (check == 1) {
            setLoad(false);
            return;
          } else {
            handleBookUpdate(values);
          }
          setLoad(false);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleBookUpdate = async (values) => {
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

      const bookAddRes = await libraryApi.editBook(
        formValues?.name,
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
      if (bookAddRes.ok) {
        toast.success("Book Detail Updated Successfully");
        setTitleOpenModal(false);
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
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
        setTitleList(distinctLabelValuePairs);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setTitleList([]);
    }
  };

  const handleTitleSearchResult = async (text) => {
    if (text) {
      setCleared(false);
      const res = await libraryApi.getBookByTitle(text.value);
      console.log("res---", res);
      setData(res.data.data);
      setShowLoadMore(false);
    } else {
      getBookDetailList();
    }
  };

  const getBookDetailList = async (showAll) => {
    console.log("showAll---", showAll, cleared);
    if (!cleared || showAll) {
      try {
        setShowRes(true);
        const res = await libraryApi.getAllBook(
          showAll ? "None" : string.PAGE_LIMIT
        );
        console.log("res---", res);
        setData(res.data.data);
        setShowLoadMore(false);
        if (res.data.data.length === string.PAGE_LIMIT) {
          setShowLoadMore(true);
          setCleared(true);
        } else {
          setShowLoadMore(false);
        }
      } catch (error) {
        console.log(error);
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
  const handleSearchAuthor = async (text) => {
    if (text.length > 2) {
      try {
        const authorRes = await libraryApi.getAuthorBySearch(text);
        console.log("authorRes---", authorRes);
        setAuthorList(authorRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
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

  const handleEditBook = async (id) => {
    console.log("values----", id, formikRef.current);
    setTitleOpenModal(true);
    const getBookDetail = await libraryApi.getBookDetail(id);
    console.log(" getBookDetail---", getBookDetail);
    setFormValues(getBookDetail.data.data);
  };

  const getAllList = async () => {
    try {
      setLoad(true);

      const bookTypeRes = await libraryApi.getBookTypeList();
      setBookTypeList(bookTypeRes.data.data);

      const deptRes = await libraryApi.getDeptList();
      setDeptList(deptRes.data.data);
      console.log(bookTypeRes.data.data, "bookType");
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("catch---", error);
    }
  };

  const setReactSelectMaxlength = () => {
    document.getElementById("mainTitle") &&
      document.getElementById("mainTitle").setAttribute("maxlength", 15);
    document.getElementById("modalPublisher") &&
      document.getElementById("modalPublisher").setAttribute("maxlength", 15);
    document.getElementById("modalSubject") &&
      document.getElementById("modalSubject").setAttribute("maxlength", 15);
    document.getElementById("supplier") &&
      document.getElementById("supplier").setAttribute("maxlength", 15);
    document.getElementById("yearOfPublish") &&
      document.getElementById("yearOfPublish").setAttribute("maxlength", 4);
    document.getElementById("modalAuthor") &&
      document.getElementById("modalAuthor").setAttribute("maxlength", 15);
  };

  useEffect(() => {
    getAllList();
    getBookDetailList();
    document.getElementById("title") &&
      document.getElementById("title").setAttribute("maxlength", 40);
  }, []);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={"Book Detail Duplication"}
        isOpen={errorOpen}
        message={modalMessage}
        okClick={() => setErrorOpen(false)}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <div className="row no-gutters">
            <div className="col-lg-8">
              <ReactSelectField
                autoFocus
                label="Title"
                id="title"
                value={title}
                placeholder="Title"
                searchIcon={true}
                options={titleList}
                // style={{ width: "60%" }}
                onBlur={(e) => setTitleList([])}
                onInputChange={(text) => {
                  handleSearchTitle(text);
                }}
                onChange={(text) => {
                  setTitle(text);
                  handleTitleSearchResult(text);
                  setTitleList([]);
                }}
                noOptionsMessage={(text) =>
                  preFunction.reactSelectNoOptionsMessage(text)
                }
              />
            </div>
            <div className="col-lg-4 text-right" style={{ paddingTop: "35px" }}>
              {/* <Button
                type="button"
                frmButton={false}
                className={"btn-green"}
                text="Add Title"
                onClick={() => navigate("/add-title")}
              /> */}
            </div>
          </div>
          {showRes && (
            <>
              <div className="row mt-4 p-0">
                <div className="table-responsive p-0">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        {/* <th width="10%">Book ID</th> */}
                        <th>Title</th>
                        <th width="20%">Publisher</th>
                        <th width="5%">View</th>
                        <th width="5%">Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length == 0 ? (
                        <tr>
                          <td colSpan="10" className="text-center">
                            No data found
                          </td>
                        </tr>
                      ) : (
                        data.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              {/* <td className="nowrapWhiteSpace">{item.name}</td> */}
                              <td>{item.main_title}</td>
                              <td className="nowrapWhiteSpace">
                                {item.publisher}
                              </td>
                              <td>
                                <button
                                  type="submit"
                                  className="btn-3"
                                  title="View Prescription"
                                  onClick={() =>
                                    navigate("/book-detail-view", {
                                      state: {
                                        purchaseid: item.name,
                                      },
                                    })
                                  }
                                >
                                  <span className="icofont-prescription"></span>
                                  View
                                </button>
                              </td>
                              <td>
                                <button
                                  type="submit"
                                  className="btn-3"
                                  title="View Prescription"
                                  onClick={() => {
                                    console.log("item", item);
                                    handleEditBook(item.name);
                                  }}
                                >
                                  <span className="icofont-prescription"></span>
                                  Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {showLoadMore && data.length > 0 && (
                  <Button
                    text="Show All"
                    onClick={(e) => {
                      getBookDetailList(1);
                      setCleared(false);
                    }}
                  />
                )}

                <Modal show={titleOpenModal} dialogClassName="title-modal">
                  <Modal.Header>
                    <Modal.Title>Title</Modal.Title>
                  </Modal.Header>
                  <Formik
                    enableReinitialize={true}
                    innerRef={formikRef}
                    initialValues={{
                      modalMainTitle: formValues?.main_title,
                      modalAuthor: formValues?.author_name.map(
                        (item, index) => {
                          return {
                            label: item?.author_name,
                            value: item?.author_name,
                          };
                        }
                      ),
                      modalPublisher: {
                        label: formValues?.publisher,
                        value: formValues?.publisher,
                      },
                      modalAuthorType: {
                        label: formValues?.author_origin,
                        value: formValues?.author_origin,
                      },
                      modalDepartment: {
                        label: formValues?.book_department,
                        value: formValues?.book_department,
                      },
                      modalIsbnNumber: {
                        label: formValues?.publisher,
                        value: formValues?.publisher,
                      },
                      modalSubject: formValues?.book_subject.map(
                        (item, index) => {
                          return {
                            label: item?.library_subject,
                            value: item?.library_subject,
                          };
                        }
                      ),
                      modalBookType: {
                        label: formValues?.book_type,
                        value: formValues?.book_type,
                      },
                      modalIsbnNumber: formValues?.isbn,
                      modalCallNumber: formValues?.call_number,
                      modalRackNumber: formValues?.rack_number,
                    }}
                    validationSchema={bookAddSchema}
                    onSubmit={handleCheckBook}
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
                        <form
                          onSubmit={handleSubmit}
                          onLoad={setReactSelectMaxlength}
                          autoComplete="off"
                        >
                          <Modal.Body>
                            <div className="row no-gutters">
                              {/* <div className="col-lg-10"> */}
                              <TextFieldHorizontal
                                autoFocus
                                id="modalMainTitle"
                                placeholder="Title"
                                label="Title"
                                labelSize={3}
                                tabIndex={1}
                                style={{ width: "90%" }}
                                value={values.modalMainTitle}
                                error={errors.modalMainTitle}
                                touched={touched.modalMainTitle}
                                onChange={(e) =>
                                  setFieldValue(
                                    "modalMainTitle",
                                    e.target.value
                                  )
                                }
                                mandatory={1}
                                maxlength={140}
                                onBlur={() => {
                                  handleCheckBook(values, 1);
                                }}
                              />

                              <ReactSelectFieldHorizontal
                                label="Author Name"
                                placeholder="Author Name"
                                id="modalAuthor"
                                mandatory={1}
                                labelSize={3}
                                tabIndex={2}
                                style={{ width: "90%" }}
                                error={errors.modalAuthor}
                                touched={touched.modalAuthor}
                                value={values.modalAuthor}
                                options={authorList}
                                isMulti={true}
                                searchIcon={true}
                                closeMenuOnSelect={false}
                                onBlur={(e) => setAuthorList([])}
                                onInputChange={(inputValue) => {
                                  handleSearchAuthor(inputValue);
                                }}
                                onChange={(text) => {
                                  setFieldValue("modalAuthor", text);
                                }}
                                noOptionsMessage={(text) =>
                                  preFunction.reactSelectNoOptionsMessage(text)
                                }
                              />

                              <ReactSelectFieldHorizontal
                                label="Publisher"
                                placeholder="Publisher"
                                id="modalPublisher"
                                mandatory={1}
                                labelSize={3}
                                tabIndex={3}
                                style={{ width: "60%" }}
                                error={errors.modalPublisher}
                                touched={touched.modalPublisher}
                                value={values.modalPublisher}
                                searchIcon={true}
                                options={publisherList}
                                onInputChange={(inputValue) => {
                                  handleSearchPublisher(inputValue);
                                }}
                                onBlur={(text) => {
                                  setPublisherList([]);
                                  handleCheckBook(values, 1);
                                }}
                                onChange={(text) =>
                                  setFieldValue("modalPublisher", text)
                                }
                                noOptionsMessage={(text) =>
                                  preFunction.reactSelectNoOptionsMessage(text)
                                }
                              />

                              <ReactSelectFieldHorizontal
                                label="Department Name"
                                placeholder="Department Name"
                                id="modalDepartment"
                                mandatory={1}
                                labelSize={3}
                                tabIndex={4}
                                style={{ width: "90%" }}
                                searchIcon={false}
                                error={errors.modalDepartment}
                                touched={touched.modalDepartment}
                                value={values.modalDepartment}
                                options={deptList}
                                onChange={(text) =>
                                  setFieldValue("modalDepartment", text)
                                }
                              />

                              <TextFieldHorizontal
                                id="modalIsbnNumber"
                                placeholder="ISBN"
                                label="ISBN"
                                labelSize={3}
                                tabIndex={5}
                                value={values.modalIsbnNumber}
                                error={errors.modalIsbnNumber}
                                touched={touched.modalIsbnNumber}
                                onChange={(e) =>
                                  setFieldValue(
                                    "modalIsbnNumber",
                                    e.target.value
                                  )
                                }
                                style={{ width: "30%" }}
                                maxlength={5}
                              />

                              <ReactSelectFieldHorizontal
                                label="Author Origin"
                                placeholder="Author Type"
                                id="modalAuthorType"
                                mandatory={1}
                                labelSize={3}
                                tabIndex={6}
                                style={{ width: "30%" }}
                                error={errors.modalAuthorType}
                                touched={touched.modalAuthorType}
                                value={values.modalAuthorType}
                                options={authorTypeList}
                                search={false}
                                onChange={(text) =>
                                  setFieldValue("modalAuthorType", text)
                                }
                              />

                              <ReactSelectFieldHorizontal
                                label="Type"
                                placeholder="Type"
                                id="modalBookType"
                                search={false}
                                mandatory={1}
                                labelSize={3}
                                tabIndex={7}
                                style={{ width: "30%" }}
                                error={errors.modalBookType}
                                touched={touched.modalBookType}
                                value={values.modalBookType}
                                options={bookTypeList}
                                onChange={(text) =>
                                  setFieldValue("modalBookType", text)
                                }
                              />

                              <ReactSelectFieldHorizontal
                                label="Subject Name"
                                placeholder="Subject Name"
                                id="modalSubject"
                                mandatory={1}
                                searchIcon={true}
                                labelSize={3}
                                tabIndex={8}
                                error={errors.modalSubject}
                                touched={touched.modalSubject}
                                value={values.modalSubject}
                                options={subjectList}
                                isMulti={true}
                                closeMenuOnSelect={false}
                                style={{ width: "90%" }}
                                onBlur={(e) => setSubjectList([])}
                                onInputChange={(inputValue) => {
                                  handleSearchSubject(inputValue);
                                }}
                                onChange={(text) => {
                                  setFieldValue("modalSubject", text);
                                }}
                                noOptionsMessage={(text) =>
                                  preFunction.reactSelectNoOptionsMessage(text)
                                }
                              />

                              <TextFieldHorizontal
                                id="modalCallNumber"
                                placeholder="Call Number"
                                label="Call Number"
                                labelSize={3}
                                tabIndex={9}
                                value={values.modalCallNumber}
                                error={errors.modalCallNumber}
                                touched={touched.modalCallNumber}
                                onChange={(e) =>
                                  setFieldValue(
                                    "modalCallNumber",
                                    e.target.value
                                  )
                                }
                                style={{ width: "30%" }}
                                maxlength={5}
                                mandatory={1}
                              />
                              <TextFieldHorizontal
                                id="modalRackNumber"
                                placeholder="Rack Number"
                                label="Rack Number"
                                labelSize={3}
                                tabIndex={10}
                                value={values.modalRackNumber}
                                error={errors.modalRackNumber}
                                touched={touched.modalRackNumber}
                                onChange={(e) =>
                                  setFieldValue(
                                    "modalRackNumber",
                                    e.target.value
                                  )
                                }
                                style={{ width: "30%" }}
                                maxlength={5}
                                mandatory={1}
                              />
                              {/* </div> */}
                            </div>
                          </Modal.Body>

                          <Modal.Footer>
                            <div className="col-lg-12 p-0 mb-3">
                              <div className="text-center">
                                <Button
                                  tabIndex={11}
                                  frmButton={false}
                                  text={"F4 - Save"}
                                  className={"btn me-3"}
                                  onClick={(e) =>
                                    preFunction.handleErrorFocus(errors)
                                  }
                                  id="save"
                                />
                                <Button
                                  type="button"
                                  frmButton={false}
                                  text={"Close"}
                                  onClick={(e) => setTitleOpenModal(false)}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default BookDetailList;
