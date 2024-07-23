import React, { useState, useEffect, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import Modal from "react-bootstrap/Modal";
import * as Yup from "yup";
import { toast } from "react-toastify";

import StudentApi from "../api/StudentApi";

import Button from "../component/FormField/Button";
import string from "../string";
import AuthContext from "../auth/context";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ScreenTitle from "../component/common/ScreenTitle";
import SwitchField from "../component/FormField/SwitchField";
import ReactSelectField from "../component/FormField/ReactSelectField";
import ModalComponent from "../component/ModalComponent";
import TextFieldFormik from "../component/FormField/TextFieldFormik";

function BoardingPlaceList() {
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editBoardingPlace, setEditBoardingPlace] = useState("");
  const [noChange, setNoChange] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [boardingPlaceList, setBoardingPlaceList] = useState([]);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [termList, setTermList] = useState([]);
  const [termCount, setTermCount] = useState(0);
  const [show, setShow] = useState(false);
  // let termCount = 3;
  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    boardingPlace: Yup.string().required("Please enter boarding place"),
    amount:
      termCount == 1 ? Yup.number().required("Please enter Amount") : null,
    ...(termList.length > 0 &&
      termList.reduce((acc, item) => {
        if (termCount > 1) {
          return {
            ...acc,
            [item.value]: Yup.number().required(`Please enter Amount`),
          };
        }
        return acc;
      }, {})),
  });

  const handleSave = async (values) => {
    console.log("values", values);
    if (!noChange) {
      setModalErrorOpen(true);
      setModalTitle("Message");
      setModalMessage("No changes made");
      return;
    }

    try {
      setLoad(true);
      let term = {};
      let total = 0;
      if (termList.length > 0) {
        termList.forEach((item) => {
          term[item.value] = parseInt(values[item.value]);
          total += parseInt(values[item.value]);
        });
      }
      console.log("term", term, JSON.stringify(term));

      const addorUpdatePlace = await StudentApi.addorUpdateBoardingPlace(
        editBoardingPlace ? editBoardingPlace.id : null,
        values.boardingPlace,
        termCount > 1 ? JSON.stringify(term) : null,
        termCount == 1 ? values.amount : total,
        editBoardingPlace ? values.active : 1
      );
      console.log("addorUpdatePlace", addorUpdatePlace);
      if (!addorUpdatePlace.data.message.success) {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage(addorUpdatePlace.data.message.message);
        setLoad(false);
        return;
      }
      toast.success(addorUpdatePlace.data.message.message);
      setOpenModal(false);
      getBoardingPlaceList(0);

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleEdit = async (values) => {
    console.log("values", values);
    setEditBoardingPlace(values);
    if (values.term) {
      //change to array of object
      Object.entries(JSON.parse(values.term)).map(([key, value]) => {
        for (let i = 0; i < termList.length; i++) {
          if (key == termList[i].value) {
            termList[i].amount = value;
          }
        }
      });
    }
    console.log("term", termList);
    setOpenModal(true);
  };

  const getBoardingPlaceList = async (showAll, check) => {
    try {
      setLoad(true);
      setData([]);
      if (check === 1) {
        setShow(true);
      }
      const getBoardingPlace = await StudentApi.getandSearchBoradingPlace(
        collegeId,
        null,
        showAll ? 1 : 0
      );
      console.log("getBoardingPlace--", getBoardingPlace);
      if (!getBoardingPlace?.data?.message?.success) {
        setLoad(false);
        return;
      }
      setData(getBoardingPlace?.data?.message?.data?.boarding_place);
      setTermCount(getBoardingPlace?.data?.message?.data?.transport_term);
      if (
        string.PAGE_LIMIT ===
        getBoardingPlace?.data?.message?.data?.boarding_place.length
      ) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelect = async (text) => {
    console.log("text", text);
    try {
      const BoardingPlaceList = data.filter((item) => item.id === text.id);
      console.log("BoardingPlaceList", BoardingPlaceList);
      setData(BoardingPlaceList);
      setShowLoadMore(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSearch = async (text) => {
    console.log("text", text);
    try {
      if (text.length > 2) {
        const searchBoardingPlace = await StudentApi.getandSearchBoradingPlace(
          collegeId,
          text
        );
        console.log("searchBoardingPlace", searchBoardingPlace);
        setBoardingPlaceList(
          searchBoardingPlace?.data?.message?.data?.boarding_place
        );
        setShow(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleTerm = () => {
    console.log("collegeConfig", collegeConfig);
    setTermList([]);
    if (termCount > 1) {
      let termList = [];
      for (let i = 1; i <= termCount; i++) {
        termList.push({ value: "term" + i, label: "Term " + i });
      }
      console.log("termList", termList);
      setTermList(termList);
    }
  };

  useEffect(() => {
    getBoardingPlaceList(0);
    handleTerm();
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
        okClick={() => {
          setModalErrorOpen(false);
        }}
      />

      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mb-3">
          <div className="col-lg-7 mt-2">
            <ReactSelectField
              placeholder={"Search Boarding Place"}
              id="boardingPlace"
              tabIndex={1}
              clear={true}
              maxlength={40}
              options={boardingPlaceList}
              style={{ width: "85%" }}
              searchIcon={true}
              getOptionLabel={(option) => option.boardingPlace}
              getOptionValue={(option) => option.id}
              onInputChange={(inputValue) => {
                handleSearch(inputValue);
              }}
              onChange={(text) => {
                if (text === "" || text === null) {
                  if (!show) {
                    getBoardingPlaceList(0, 1);
                  }
                } else {
                  handleSelect(text);
                  setBoardingPlaceList([]);
                }
              }}
            />
          </div>
          {termCount > 0 ? (
            <div className="col-lg-5 text-right">
              <Button
                frmButton={false}
                className={"btn-green"}
                text={`Add Boarding Place`}
                onClick={(e) => {
                  setOpenModal(true);
                  setEditBoardingPlace("");
                  handleTerm();
                }}
              />
            </div>
          ) : null}
        </div>
        <div className="table-responsive p-0">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th width="2%">No.</th>
                <th>Boarding Place</th>
                {collegeConfig.institute_type === 1 ? (
                  <th width="15%">Fees Type</th>
                ) : null}
                <th width="10%">Amount (₹)</th>
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
                      <td>{item.boardingPlace}</td>
                      {collegeConfig.institute_type === 1 ? (
                        <td>{item.feesType}</td>
                      ) : null}
                      <td align="right">{item.amount}</td>
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
          {showLoadMore && (
            <Button
              text="Show All"
              onClick={(e) => {
                getBoardingPlaceList(true);
              }}
            />
          )}
        </div>

        <Modal
          show={openModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={() => setOpenModal(false)}
        >
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              boardingPlace: editBoardingPlace
                ? editBoardingPlace.boardingPlace
                : "",

              ...(termList.length > 0 &&
                termList.reduce((acc, item) => {
                  acc[item.value] = item?.amount ? item.amount : "";
                  return acc;
                }, {})),
              amount: editBoardingPlace ? editBoardingPlace.amount : "",
              active: editBoardingPlace ? editBoardingPlace.isActive : false,
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
                      {editBoardingPlace ? "Edit " : "Add "}Boarding Place
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row px-5">
                      <div className="row no-gutters pb-2 mt-1 ">
                        <TextFieldFormik
                          autoFocus
                          tabIndex={1}
                          labelSize={3}
                          id="boardingPlace"
                          label="Boarding Place"
                          mandatory={1}
                          maxlength={140}
                          // style={{ width: "80%" }}
                          onChange={(e) => {
                            setFieldValue("boardingPlace", e.target.value);
                            setNoChange(true);
                            // setCheckPlace("");
                          }}
                        />
                        {termCount == 1 ? (
                          <TextFieldFormik
                            tabIndex={2}
                            labelSize={3}
                            id="amount"
                            label="Amount (₹)"
                            mandatory={1}
                            isAmount={true}
                            maxlength={5}
                            style={{ width: "40%" }}
                            onChange={(e) => {
                              if (
                                !isNaN(e.target.value) &&
                                !e.target.value.includes(" ") &&
                                !e.target.value.includes(".")
                              ) {
                                setFieldValue("amount", e.target.value);
                              }
                              setNoChange(true);
                            }}
                          />
                        ) : null}
                        {termCount > 1
                          ? termList.map((item, index) => {
                              return (
                                <TextFieldFormik
                                  tabIndex={2 + index}
                                  labelSize={3}
                                  id={item.value}
                                  label={item.label}
                                  placeholder="Amount (₹)"
                                  mandatory={1}
                                  maxlength={5}
                                  isAmount={true}
                                  style={{ width: "40%" }}
                                  onChange={(e) => {
                                    if (
                                      !isNaN(e.target.value) &&
                                      !e.target.value.includes(" ") &&
                                      !e.target.value.includes(".")
                                    ) {
                                      setFieldValue(item.value, e.target.value);
                                    }
                                    setNoChange(true);
                                  }}
                                />
                              );
                            })
                          : null}

                        {editBoardingPlace ? (
                          <SwitchField
                            label="Active"
                            labelSize={3}
                            tabIndex={termCount > 1 ? termCount + 2 : 3}
                            yesOption={"Yes"}
                            noOption={"No"}
                            checked={values.active}
                            onChange={() => {
                              setFieldValue("active", !values.active);
                              setNoChange(true);
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
                          tabIndex={
                            editBoardingPlace && termCount > 1
                              ? termCount + 3
                              : editBoardingPlace && termCount === 1
                              ? 4
                              : !editBoardingPlace && termCount > 1
                              ? termCount + 2
                              : 3
                          }
                          isTable={true}
                          text="Save"
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                        />
                      </div>

                      <div className="col-lg-6 d-flex justify-content-start p-0">
                        <Button
                          // tabIndex={9}
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
export default BoardingPlaceList;
