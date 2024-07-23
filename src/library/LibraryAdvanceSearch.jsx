import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import libraryApi from "../api/libraryapi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import TextFieldFormik from "../component/FormFieldLibrary/TextFieldFormik";
import SelectFieldFormik from "../component/FormFieldLibrary/SelectFieldFormik";
import Button from "../component/FormField/Button";
import { orderbyList } from "../component/common/CommonArray";
import ErrorMessage from "../component/common/ErrorMessage";

import string from "../string";
import ScreenTitle from "../component/common/ScreenTitle";

const formSchema = Yup.object().shape({
  edition: Yup.string()
    .matches(/^[a-zA-Z0-9\s.]+$/, "Please enter valid Edition")
    .trim(),
});

function LibraryAdvanceSearch() {
  const [load, setLoad] = useState(false);
  const [titleList, setTitleList] = useState([]);
  const [authorList, setAuthorList] = useState([]);
  const [publisherList, setPublisherList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [data, setData] = useState([]);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [emptyError, setEmptyError] = useState(false);

  const [deptList, setDeptList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const currentYear = new Date().getFullYear();

  const years = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push({ label: year, value: year });
  }

  const handleView = async (values, showAll) => {
    if (load) return;
    try {
      console.log("values------", values);
      if (
        !values.title?.value &&
        !values.author?.value &&
        !values.subject?.value &&
        !values.yearofPublish?.value &&
        !values.edition &&
        !values.publisher?.value &&
        !values.supplier?.value &&
        !values.department?.value
      ) {
        setEmptyError(true);
        return;
      }
      setLoad(true);
      const bookAdvanceSearchRes = await libraryApi.getAdvanceSearch(
        values.title ? values.title.value : "",
        values.author ? values.author.value : "",
        values.subject ? values.subject.value : "",
        values.yearofPublish ? values.yearofPublish.value.toString() : "",
        values.edition,
        values.publisher ? values.publisher.value : "",
        values.supplier ? values.supplier.value : "",
        values.department ? values.department.value : "",
        values.orderBy.value,
        showAll == 1 ? null : string.PAGE_LIMIT
      );
      console.log("bookAdvanceSearchRes---", bookAdvanceSearchRes);
      setData(bookAdvanceSearchRes.data.message);
      setShowRes(true);
      if (bookAdvanceSearchRes.data.message.length === string.PAGE_LIMIT) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleSearchTitle = async (text) => {
    if (text.trim().length > 2) {
      try {
        const mainTitleRes = await libraryApi.getTitlebySearch(
          text?.trim(),
          "purchase"
        );

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

  const handleSearchAuthor = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const authorRes = await libraryApi.getAuthorBySearch(
          text.replace(/\s\s+/g, " ").trim()
        );
        console.log("authorRes---", authorRes);
        setAuthorList(authorRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setAuthorList([]);
    }
  };

  const handleSearchPublisher = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const publisher = await libraryApi.getPublisherBySearch(
          text.replace(/\s\s+/g, " ").trim()
        );
        console.log("publisher---", publisher);
        setPublisherList(publisher.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setPublisherList([]);
    }
  };

  const handleSearchSupplier = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const supplierRes = await libraryApi.getSupplierBySearch(
          text.replace(/\s\s+/g, " ").trim()
        );
        console.log("supplierRes---------", supplierRes);
        setSupplierList(supplierRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setSupplierList([]);
    }
  };

  const handleSearchSubject = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const subjectRes = await libraryApi.getSearchSubjectList(
          text.replace(/\s\s+/g, " ").trim()
        );
        console.log("subjectRes---", subjectRes);
        setSubjectList(subjectRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setSubjectList([]);
    }
  };

  const getSearchDetail = async () => {
    try {
      const deptRes = await libraryApi.getDeptList();
      setDeptList(deptRes.data.data);
    } catch (error) {
      console.log("catch---", error);
    }
  };

  useEffect(() => {
    getSearchDetail();
  }, []);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <Formik
            enableReinitialize={false}
            initialValues={{
              title: "",
              author: "",
              publisher: "",
              supplier: "",
              subject: "",
              edition: "",
              yearofPublish: "",
              department: "",
              orderBy: orderbyList[0],
            }}
            validationSchema={formSchema}
            onSubmit={handleView}
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
                    <div className="col-lg-6 pe-2 p-0">
                      <SelectFieldFormik
                        autoFocus
                        label="Title"
                        id="title"
                        tabIndex={1}
                        searchIcon={true}
                        options={titleList}
                        maxlength={40}
                        onInputChange={(text) => {
                          handleSearchTitle(text);
                        }}
                        onChange={(text) => {
                          setFieldValue("title", text);
                          setShowRes(false);
                          setEmptyError(false);
                        }}
                      />

                      <SelectFieldFormik
                        label="Author"
                        id="author"
                        tabIndex={2}
                        options={authorList}
                        searchIcon={true}
                        maxlength={40}
                        onInputChange={(text) => {
                          handleSearchAuthor(text);
                        }}
                        onChange={(text) => {
                          setShowRes(false);
                          setEmptyError(false);
                          setFieldValue("author", text);
                        }}
                      />

                      <SelectFieldFormik
                        label="Department"
                        id="department"
                        maxlength={40}
                        tabIndex={3}
                        options={deptList}
                        matchFrom="start"
                        onChange={(text) => {
                          setShowRes(false);
                          setEmptyError(false);
                          setFieldValue("department", text);
                        }}
                      />

                      <SelectFieldFormik
                        label="Supplier"
                        id="supplier"
                        searchIcon={true}
                        tabIndex={4}
                        options={supplierList}
                        maxlength={40}
                        onInputChange={(text) => {
                          handleSearchSupplier(text);
                        }}
                        onChange={(text) => {
                          setShowRes(false);
                          setEmptyError(false);
                          setFieldValue("supplier", text);
                        }}
                      />
                    </div>
                    <div className="col-lg-6 ps-3 p-0">
                      <SelectFieldFormik
                        label="Publisher"
                        id="publisher"
                        searchIcon={true}
                        options={publisherList}
                        maxlength={40}
                        tabIndex={5}
                        onInputChange={(text) => {
                          handleSearchPublisher(text);
                        }}
                        onChange={(text) => {
                          setShowRes(false);
                          setEmptyError(false);
                          setFieldValue("publisher", text);
                        }}
                      />

                      <SelectFieldFormik
                        label="Subject"
                        id="subject"
                        searchIcon={true}
                        matchFrom="start"
                        maxlength={40}
                        tabIndex={6}
                        options={subjectList}
                        onInputChange={(text) => {
                          handleSearchSubject(text);
                        }}
                        onChange={(text) => {
                          setShowRes(false);
                          setEmptyError(false);
                          setFieldValue("subject", text);
                        }}
                      />
                      <div className="row no-gutters">
                        <div className="col-lg-6 pe-2">
                          <SelectFieldFormik
                            label="Year of Publish"
                            id="yearofPublish"
                            maxlength={4}
                            tabIndex={7}
                            options={years}
                            onChange={(text) => {
                              setShowRes(false);
                              setEmptyError(false);
                              setFieldValue("yearofPublish", text);
                            }}
                          />
                        </div>
                        <div className="col-lg-6 ps-2">
                          <TextFieldFormik
                            id="edition"
                            label="Edition"
                            tabIndex={8}
                            onChange={(e) => {
                              setShowRes(false);
                              setEmptyError(false);
                              setFieldValue("edition", e.target.value);
                            }}
                            maxlength={15}
                          />
                        </div>
                      </div>
                    </div>
                    <SelectFieldFormik
                      label="Sort By"
                      id="orderBy"
                      tabIndex={9}
                      style={{ width: "20%" }}
                      search={false}
                      clear={false}
                      options={orderbyList}
                      onChange={(text) => {
                        setShowRes(false);
                        setEmptyError(false);
                        setFieldValue("orderBy", text);
                      }}
                    />
                  </div>
                  <div className="col-lg-12 text-center">
                    <ErrorMessage
                      Message={"Please apply atleast one filter to search"}
                      view={emptyError}
                    />
                  </div>
                  <Button
                    tabIndex={10}
                    text="Show"
                    type="submit"
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                  />
                  {showRes && (
                    <>
                      <div className="row no-gutters mt-4">
                        <div className="row no-gutters mb-3 mt-2">
                          <div className="table-responsive">
                            <table
                              className="table table-bordered report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="3%">Access No.</th>
                                  <th width="5%">Available</th>
                                  <th>Title</th>
                                  <th width="15%">Author</th>
                                  <th width="10%">Subject</th>
                                  <th width="10%">Department</th>
                                  <th width="5%">YOP</th>
                                  <th width="5%">Edition</th>
                                  <th width="10%">Publisher</th>
                                  <th width="8%">Supplier</th>
                                  <th width="2%">Call Number</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.length == 0 ? (
                                  <tr>
                                    <td colSpan="12" className="text-center">
                                      No data found
                                    </td>
                                  </tr>
                                ) : (
                                  data.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.access_number}</td>
                                        <td>
                                          {item.is_available ? "Yes" : "No"}
                                        </td>
                                        <td>{item.main_title}</td>
                                        <td>{item.author_name}</td>
                                        <td>{item.subject_name}</td>
                                        <td>{item.book_department}</td>
                                        <td>{item.year_of_publish}</td>
                                        <td>{item.edition}</td>
                                        <td>{item.publisher}</td>
                                        <td>{item.supplier}</td>
                                        <td>{item.call_number}</td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                          {showLoadMore && (
                            <Button
                              text="Show All"
                              className={"btn mt-3"}
                              isTable={true}
                              onClick={(e) => {
                                handleView(values, 1);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default LibraryAdvanceSearch;
