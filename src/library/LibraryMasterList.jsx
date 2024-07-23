import React, { useState } from "react";
import libraryApi from "../api/libraryapi";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";

import headingSvg from "../assests/svg/library-master-head.svg";
import authorPng from "../assests/png/Author.png";
import bookTypePng from "../assests/png/BookType.png";
import departmentPng from "../assests/png/Department.png";
import publisherPng from "../assests/png/Publisher.png";
import subjectPng from "../assests/png/Subject.png";

import Button from "../component/FormField/Button";
import ErrorMessage from "../component/common/ErrorMessage";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ReactSelectField from "../component/FormFieldLibrary/ReactSelectField";
import SwitchField from "../component/FormField/SwitchField";
import TextField from "../component/FormField/TextField";

import string from "../string";

import ScreenTitle from "../component/common/ScreenTitle";
import Lottie from "lottie-react";

function LibraryMasterList() {
  const [data, setData] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [load, setLoad] = useState(false);
  const [masters, setMasters] = useState("");
  const [addMasters, setAddMasters] = useState("");
  const [isStatus, setIsStatus] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [oldMasterValue, setOldMasterValue] = useState(false);
  const [oldStatus, setOldStatus] = useState(false);
  const [docType, setDocType] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [masterList, setMasterList] = useState([]);
  const [master, setMaster] = useState();
  const [addMasterModal, setAddMasterModal] = useState(false);
  const [cleared, setCleared] = useState(false);

  const getAllMastersValue = async (value, showAll, clearStatus) => {
    let docTypeAdd =
      value == "Main Title"
        ? "Lib Book Title"
        : value == "Author"
        ? "Lib Author"
        : value == "Publisher"
        ? "Lib Publisher"
        : value == "Department"
        ? "Lib Department"
        : value == "Subject"
        ? "Lib Subject"
        : value == "Book Type"
        ? "Lib Book Type"
        : value == "Supplier"
        ? "Supplier"
        : "";
    document.getElementById("master")?.focus();
    setDocType(docTypeAdd);
    getAllMastersList(docTypeAdd, showAll, clearStatus);
  };

  const getAllMastersList = async (value, showAll, clearStatus) => {
    console.log("---", cleared, value, showAll);
    setMaster("");
    setAddMasters("");
    setErrorMsg("");
    setShowError(false);
    setIsEdit(false);
    if (!cleared || showAll || clearStatus) {
      try {
        setLoad(true);
        // setData([]);

        const getMasterDataRes = await libraryApi.getMasterList(
          value,
          showAll ? "None" : string.PAGE_LIMIT
        );
        console.log("getMasterDataRes", getMasterDataRes.data.data);

        setData(getMasterDataRes.data.data);
        setMasterData(getMasterDataRes.data.data);

        if (string.PAGE_LIMIT === getMasterDataRes.data.data.length) {
          setShowLoadMore(true);
        } else {
          setShowLoadMore(false);
        }
        setCleared(true);

        setLoad(false);
        document.getElementById("master")?.focus();
      } catch (error) {
        console.log(error);
        setLoad(false);
      }
    }
  };

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
      setLoad(true);
      if (addMasters && addMasters.length > 2) {
        console.log(docType, addMasters, 1);
        let fieldName;
        if (docType === "Lib Author") {
          fieldName = "author_name";
        } else if (docType === "Lib Department") {
          fieldName = "library_department";
        } else if (docType === "Lib Publisher") {
          fieldName = "publisher";
        } else if (docType === "Lib Subject") {
          fieldName = "library_subject";
        } else if (docType === "Lib Book Type") {
          fieldName = "book_type";
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
          setLoad(false);
          return;
        }
        toast.success(`${masters} added successfully!`);
        setIsStatus(false);
        setAddMasters("");
        setAddMasterModal(false);
        getAllMastersList(docType);

        document.getElementById("master")?.focus();
      } else {
        if (addMasters.length <= 2) {
          setShowError(true);
          setErrorMsg(`Please enter valid ${masters} name`);
          document.getElementById("textId")?.focus();
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleEdit = async (value, status) => {
    console.log("values", value, status);
    setOldMasterValue(value);
    setOldStatus(status);
    setAddMasters(value);
    setIsStatus(status);
    setIsEdit(true);
    setErrorMsg("");
    setShowError(false);
    handleEditMasterModel(value);
    // document.getElementById("textId")?.focus();
  };

  const handleEditMasterModel = async (value) => {
    setAddMasters(value);
    setAddMasterModal(true);
  };

  const handleUpdateMaster = async () => {
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

      setShowError(false);
      setLoad(true);
      if (addMasters && addMasters.length > 2) {
        if (oldMasterValue != addMasters || oldStatus != isStatus) {
          if (oldMasterValue != addMasters) {
            const editMasterRes = await libraryApi.editMaster(
              docType,
              oldMasterValue,
              addMasters.replace(/\s\s+/g, " ").trim()
            );
            console.log("editMasterRes---", editMasterRes);
            if (!editMasterRes.ok) {
              setShowError(true);
              setErrorMsg(`${masters} "${addMasters}" already exists`);
              document.getElementById("textId")?.focus();
              setLoad(false);
              return;
            }
          }
          const editMasterStatusRes = await libraryApi.editMasterStatus(
            docType,
            isStatus,
            addMasters
          );
          console.log("editMasterStatusRes---", editMasterStatusRes);
          toast.success(`${masters} updated successfully!`);
          setIsStatus(false);
          setAddMasters("");
          setAddMasterModal(false);
          getAllMastersList(docType);
          document.getElementById("master")?.focus();
        } else {
          setShowError(true);
          setErrorMsg(`No changes made`);
          setLoad(false);
          return;
        }
      } else {
        if (addMasters == "") {
          setShowError(true);
          setErrorMsg(`Please enter valid ${masters} name`);
          document.getElementById("textId")?.focus();
        } else if (addMasters.length <= 2) {
          setShowError(true);
          setErrorMsg(`Please enter valid ${masters} name`);
          document.getElementById("textId")?.focus();
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("catch---", error);
    }
  };

  const handleSearch = async (text) => {
    setMasterList([]);
    console.log("text", text);
    console.log("text123", text.replace(/\s\s+/g, " ").trim());
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const getMasterData = await libraryApi.getMasterData(
          docType,
          text.replace(/\s\s+/g, " ").trim()
        );
        console.log("getMasterData", getMasterData);
        setMasterList(getMasterData.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleTitleSearchResult = async (text) => {
    setMaster(text);
    console.log("text", text);
    if (text) {
      setCleared(false);
      const getMasterData = await libraryApi.getExactMasterData(
        docType,
        text.value
      );
      setData(getMasterData.data.data);
      console.log("getMasterData.data.data", getMasterData.data.data);
      setShowLoadMore(false);
    } else {
      getAllMastersList(docType);
    }
  };

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />

        <div className="row no-gutters mt-4">
          <div className="mb-1">
            <div className="row no-gutters">
              <div className="row col-lg-7 p-0">
                <div
                  className="col-lg-4 p-0 pe-2"
                  onClick={() => {
                    setMasters("Author");
                    getAllMastersValue("Author", 0, 1);
                  }}
                >
                  <div
                    className={`custom-card${
                      masters === "Author" ? "-active" : ""
                    }`}
                  >
                    <div className="text-center">
                      <img src={authorPng} className="custom-image-card" />
                    </div>
                    <div className="card-body">Author</div>
                  </div>
                </div>
                <div
                  className="col-lg-4 ps-2 p-0 pe-2"
                  onClick={() => {
                    setMasters("Book Type");
                    getAllMastersValue("Book Type", 0, 1);
                  }}
                >
                  <div
                    className={`custom-card${
                      masters === "Book Type" ? "-active" : ""
                    }`}
                  >
                    <div className="text-center">
                      <img src={bookTypePng} className="custom-image-card" />
                    </div>
                    <div className="card-body">Book Type</div>
                  </div>
                </div>
                <div
                  className="col-lg-4 ps-2 p-0"
                  onClick={() => {
                    setMasters("Department");
                    getAllMastersValue("Department", 0, 1);
                  }}
                >
                  <div
                    className={`custom-card${
                      masters === "Department" ? "-active" : ""
                    }`}
                  >
                    <div className="text-center">
                      <img src={departmentPng} className="custom-image-card" />
                    </div>
                    <div className="card-body">Department</div>
                  </div>
                </div>
              </div>
              <div className="row col-lg-5 p-0 ps-2">
                <div
                  className="col-lg-6 ps-2 p-0 pe-2"
                  onClick={() => {
                    setMasters("Publisher");
                    getAllMastersValue("Publisher", 0, 1);
                  }}
                >
                  <div
                    className={`custom-card${
                      masters === "Publisher" ? "-active" : ""
                    }`}
                  >
                    <div className="text-center">
                      <img src={publisherPng} className="custom-image-card" />
                    </div>
                    <div className="card-body">Publisher</div>
                  </div>
                </div>
                <div
                  className="col-lg-6 ps-2 p-0"
                  onClick={() => {
                    setMasters("Subject");
                    getAllMastersValue("Subject", 0, 1);
                  }}
                >
                  <div
                    className={`custom-card${
                      masters === "Subject" ? "-active" : ""
                    }`}
                  >
                    <div className="text-center">
                      <img src={subjectPng} className="custom-image-card" />
                    </div>
                    <div className="card-body">Subject</div>
                  </div>
                </div>
              </div>
            </div>

            {masters ? (
              <div>
                <div className="subhead-row">
                  <div className="subhead">Search / Add / Update Master</div>
                  <div className="col line-div"></div>
                </div>
                <div className="row no-gutters">
                  <div className="col-lg-7">
                    <div className="mt-2 mb-3">
                      <ReactSelectField
                        autoFocus
                        placeholder={masters}
                        id="master"
                        value={master}
                        options={masterList}
                        searchIcon={true}
                        style={{ width: "100%" }}
                        onInputChange={(text) => {
                          handleSearch(text);
                        }}
                        onChange={(text) => {
                          setMaster(text);
                          handleTitleSearchResult(text);
                          // setMasterList([]);
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-lg-5 mt-1 p-0 text-right">
                    <Button
                      frmButton={false}
                      className={"btn-green"}
                      text={`Add ${masters}`}
                      onClick={() => setAddMasterModal(true)}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {masters && data.length > 0 ? (
            <div className="table-responsive p-0">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="5%">No.</th>
                    <th>{masters}</th>
                    <th width="15%">Active</th>
                    <th width="15%">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>
                          {masters == "Supplier"
                            ? item.disabled
                              ? "No"
                              : "Yes"
                            : item.is_active
                            ? "Yes"
                            : "No"}
                        </td>
                        <td align="center">
                          <Button
                            text={"Edit"}
                            className={"btn-3"}
                            type="submit"
                            isTable={true}
                            onClick={(e) => {
                              console.log("dsfdsf", masters);
                              handleEdit(
                                item.name,
                                masters == "Supplier"
                                  ? item.disabled
                                  : item.is_active
                              );
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {showLoadMore && (
                <Button
                  text="Show All"
                  onClick={(e) => {
                    setCleared(false);
                    getAllMastersList(docType, 1);
                  }}
                />
              )}
            </div>
          ) : null}
          {/* // ) : (
          //   load && (
          //     <Lottie
          //       style={{ height: 200, marginTop: 30, alignSelf: "center" }}
          //       animationData={require("../assests/json/booklottie.json")}
          //       loop={true}
          //     />
          //   )
          // )} */}
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
              <Modal.Title>{`Add ${masters}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row px-5">
                <div className="row no-gutters">
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
                      setCleared(false);
                    }}
                    onKeyUp={(e) => {
                      if (e.keyCode == 13)
                        isEdit ? handleUpdateMaster() : handleAddMaster();
                    }}
                  />
                  <div className="row p-0">
                    <div className="col-lg-5"></div>
                    <div className="col-lg-7 p-0 pt-1">
                      <ErrorMessage Message={errorMsg} view={showError} />
                    </div>
                  </div>
                  {isEdit ? (
                    <div className="mt-2 p-0">
                      <SwitchField
                        tabIndex={2}
                        label="Active"
                        checked={isStatus}
                        onChange={(e) => {
                          setShowError(false);
                          setIsStatus(!isStatus);
                          setCleared(false);
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                tabIndex={3}
                text={"Save"}
                frmButton={false}
                onClick={(e) => {
                  setCleared(false);
                  isEdit ? handleUpdateMaster() : handleAddMaster();
                }}
                isTable={true}
              />
              <Button
                text={"Close"}
                frmButton={false}
                onClick={(e) => {
                  setAddMasterModal(false);
                  setAddMasters("");
                  setIsStatus(false);
                  setIsEdit(false);
                  setErrorMsg("");
                }}
                isTable={true}
              />
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}
export default LibraryMasterList;
