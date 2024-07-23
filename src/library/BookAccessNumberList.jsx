import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";

import libraryApi from "../api/libraryapi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ReactSelectField from "../component/FormFieldLibrary/ReactSelectField";
import Button from "../component/FormField/Button";
import ReadOnlyField from "../component/ReadOnlyField";
import ErrorMessage from "../component/common/ErrorMessage";
import ScreenTitle from "../component/common/ScreenTitle";
import SwitchField from "../component/FormFieldLibrary/SwitchField";

import { toast } from "react-toastify";

function BookAccessNumberList() {
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [bookTitleList, setBookTitleList] = useState([]);
  const [handledByList, setHandledByList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [bookTitle, setBookTitle] = useState("");
  const [handledBy, setHandledBy] = useState("");
  const [editItem, setEditItem] = useState("");
  const [accessNumber, setAccessNumber] = useState("");
  const [status, setStatus] = useState("");

  const [showRes, setShowRes] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [noChangeError, setNoChangeError] = useState(false);
  const [reference, setReference] = useState(false);
  const [showBookIdError, setShowBookIdError] = useState(false);

  const handleSave = async () => {
    if (load) return;
    setNoChangeError(false);
    try {
      console.log("data----", data, status.value, handledBy.value);
      if (
        editItem.status == status.value &&
        editItem.handled_by == handledBy.value &&
        editItem.is_reference == reference
      ) {
        setNoChangeError(true);
        return;
      }

      setLoad(true);
      console.log(
        "Edit Access Number ---",
        accessNumber,
        status,
        handledBy,
        reference
      );
      const editAccNoRes = await libraryApi.editAccNo(
        accessNumber,
        status.value != "Active" || handledBy.value != "Library" ? 0 : 1,
        handledBy.value,
        status.value,
        reference
      );
      console.log("editAccNoRes--", editAccNoRes);
      if (editAccNoRes.ok) {
        const editAccessNoLogRes = await libraryApi.editAccessNoLog(
          accessNumber,
          editItem.status,
          status.value
        );
        console.log("editAccessNoLogRes--", editAccessNoLogRes);

        toast.success("Book Settings Saved Successfully");
        setOpenModal(false);
      }
      handleEdit(editItem.book_id);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleAccessNumber = async (item) => {
    setOpenModal(true);
    setNoChangeError(false);

    setEditItem(item);
    setAccessNumber(item.access_number);
    setStatus({ label: item.status, value: item.status });
    setHandledBy({
      label: item.handled_by,
      value: item.handled_by,
    });
    setReference(item.is_reference);
  };

  const handleEdit = async (book_id) => {
    console.log("book_id-------", book_id);
    setData([]);
    setShowRes(true);
    if (book_id && book_id != "") {
      try {
        setLoad(true);
        console.log("book_id", book_id);
        const getAccessNoRes = await libraryApi.findStatus(book_id);
        console.log("getAccessNoRes", getAccessNoRes);
        setData(getAccessNoRes.data.message);
        getAccessNoRes.data.message.length > 0 &&
          document.getElementById("bookTitle").blur();
        setLoad(false);
      } catch (error) {
        setLoad(false);
        console.log("catch----", error);
      }
    } else {
      setShowRes(false);
    }
  };

  const handleSearchTitleWithAuthor = async (text) => {
    if (text.length > 2) {
      try {
        const mainTitleRes = await libraryApi.getBookAuthorPublisherByKeyword(
          text
        );
        console.log("mainTitleRes---", mainTitleRes);
        setBookTitleList(mainTitleRes.data.message);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const getAllList = async () => {
    const handledByRes = await libraryApi.getDeptList();
    console.log("handledByRes", handledByRes);
    setHandledByList(handledByRes.data.data);

    const statusRes = await libraryApi.getStatus();
    console.log("statusRes--", statusRes);
    setStatusList(statusRes.data.data);
  };

  useEffect(() => {
    getAllList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />

        <ReactSelectField
          autoFocus
          label="Book Title"
          placeholder=""
          id="bookTitle"
          mandatory={1}
          value={bookTitle}
          searchIcon={true}
          options={bookTitleList}
          getOptionLabel={(option) => option.search}
          getOptionValue={(option) => option.book_id}
          style={{ width: "40%" }}
          onInputChange={(inputValue) => {
            handleSearchTitleWithAuthor(inputValue);
            // getBookList(inputValue);
          }}
          onChange={(value) => {
            if (!value) setShowRes(false);
            setBookTitle(value);
            handleEdit(value ? value?.book_id : "");
            setBookTitleList([]);
          }}
        />
        <ErrorMessage
          Message={"Please choose the book"}
          view={showBookIdError}
        />
        {showRes && (
          <>
            <div className="row no-gutters mt-3">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="1%">No.</th>
                    <th width="10%">Access No.</th>
                    <th>Handled By</th>
                    <th width="5%">Available</th>
                    <th width="5%">Reference</th>
                    <th width="8%">Status</th>
                    <th width="5%">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length == 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center">
                        Book not available in library
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.access_number}</td>
                          <td>{item.handled_by}</td>
                          <td>{item.is_available == 1 ? "Yes" : "No"}</td>
                          <td>{item.is_reference == 1 ? "Yes" : "No"}</td>
                          <td>
                            {item.status}
                            {/* <div
                              style={{
                                color: item.status != "Active" && "#2455b7",
                              }}
                            >
                              {item.status}
                            </div> */}
                          </td>
                          <td>
                            <Button
                              className={"btn-3"}
                              width="60px"
                              height="30px"
                              isTable={true}
                              text={"Edit"}
                              onClick={() => {
                                handleAccessNumber(item);
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
        )}
        <Modal
          show={openModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={() => setOpenModal(false)}
        >
          <Modal.Header>
            <Modal.Title>Book Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row no-gutters  mb-4">
              <div className="col-lg-2"></div>
              <div className="col-lg-8">
                <ReadOnlyField
                  label="Access Number - Title"
                  value={
                    bookTitle &&
                    accessNumber &&
                    accessNumber + " - " + bookTitle?.search?.split("-")[0]
                  }
                />
                <ReactSelectField
                  tabIndex={1}
                  search={false}
                  clear={false}
                  label="Status"
                  id="status"
                  value={status}
                  style={{ width: "40%" }}
                  placeholder="Status"
                  options={statusList}
                  onChange={(value) => {
                    setStatus(value);
                    setNoChangeError(false);
                  }}
                />
                <ReactSelectField
                  tabIndex={2}
                  clear={false}
                  searchIcon={false}
                  label="Handled By"
                  id="handledBy"
                  mandatory={1}
                  value={handledBy}
                  placeholder="Handled By"
                  options={handledByList}
                  onChange={(value) => {
                    setHandledBy(value);
                    setNoChangeError(false);
                  }}
                />
                <SwitchField
                  tabIndex={3}
                  label="Reference Book"
                  isTable={true}
                  yesOption="Yes"
                  noOption="No"
                  onChange={(e) => {
                    setReference(reference == 1 ? 0 : 1);
                    setNoChangeError(false);
                  }}
                  checked={reference == 1 ? true : false}
                  error={noChangeError ? "No Changes made" : ""}
                  touched={noChangeError ? true : false}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              tabIndex={4}
              className={"btn me-3"}
              frmButton={false}
              type="button"
              text={"Save"}
              onClick={() => {
                handleSave();
              }}
            />
            <Button
              frmButton={false}
              type="button"
              text={"Close"}
              onClick={() => setOpenModal(false)}
            />
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default BookAccessNumberList;
