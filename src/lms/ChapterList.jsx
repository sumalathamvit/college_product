import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { Modal } from "react-bootstrap";
import { Formik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import OpenWithIcon from "@mui/icons-material/OpenWith";

import api from "../api/StudentApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import TextField from "../component/FormField/TextField";
import ScreenTitle from "../component/common/ScreenTitle";
import { toast } from "react-toastify";
import SettingsIcon from "@mui/icons-material/Settings";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import FileField from "../component/FormField/FileField";
import TextAreaFieldFormik from "../component/FormField/TextareaFieldFormik";
import LMSApi from "../api/LMSApi";
import ModalComponent from "../component/ModalComponent";
import DisplayText from "./../component/FormField/DisplayText";

function ChapterList() {
  const navigate = useNavigate();
  const location = useLocation();
  const formilRef = useRef();
  const collegeConfig = useSelector((state) => state.web.college);
  const [data, setData] = useState([]);
  const [titleOpenModal, setTitleOpenModal] = useState(false);
  const [draggable, setDraggable] = useState(false);
  const [editChapter, setEditChapter] = useState();
  const [load, setLoad] = useState(false);

  const [draggedRowId, setDraggedRowId] = useState(null);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const formSchema = Yup.object().shape({
    titleName: Yup.string().required("Please enter the Chapter Name"),
    description: Yup.string().required("Please enter the Description"),
  });

  const handleAddChapter = async (values) => {
    console.log("values--", data);

    if (load) return;
    try {
      if (editChapter) {
        const res = data.some(
          (item) =>
            item.title.trim().toLowerCase() ===
            values.titleName.trim().toLowerCase()
        );
        // console.log(res, "check response");

        if (
          values.titleName == editChapter.title &&
          values.description == editChapter.description
        ) {
          setModalMessage("No changes made");
          setModalErrorOpen(true);
          setModalTitle("Message");
          setTitleOpenModal(false);
          setLoad(false);
          // toast.success("No changes made", {
          //   autoClose: 1000, // time in milliseconds, 5000ms = 5 seconds
          // });
          setEditChapter();
          return;
        }
        if (res && values.description == editChapter.description) {
          setModalMessage("Chapter Name already exist");
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        setLoad(true);
        const checkForDuplocateChapterRes =
          await LMSApi.checkForDuplocateChapterExceptName(
            location.state.course.name,
            values.titleName,
            editChapter.name
          );
        console.log(
          "checkForDuplocateChapterRes--",
          checkForDuplocateChapterRes
        );
        if (checkForDuplocateChapterRes.data.data.length > 0) {
          setModalMessage("Chapter " + values.titleName + " already exist");
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          // toast.success("Chapter " + values.titleName + " already exist", {
          //   autoClose: 1000, // time in milliseconds, 5000ms = 5 seconds
          // });
          setTitleOpenModal(false);
          setEditChapter();
          return;
        }

        const updateChapterRes = await LMSApi.updateChapter(
          editChapter.name,
          values.titleName,
          values.description
        );
        console.log("updateChapterRes--", updateChapterRes);
        if (updateChapterRes.status) {
          toast.success("Chapter updated successfully");
          getAllList();
          setTitleOpenModal(false);
          setEditChapter();
          setLoad(false);
          return;
        }
      } else {
        setLoad(true);
        const res = data.some(
          (item) =>
            item.title.trim().toLowerCase() ===
            values.titleName.trim().toLowerCase()
        );
        console.log(res, "check response");
        if (res) {
          setModalMessage("Chapter Name already exist");
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        const checkForDuplocateChapterRes =
          await LMSApi.checkForDuplocateChapter(
            location.state.course.name,
            values.titleName
          );
        console.log(
          "checkForDuplocateChapterRes--",
          checkForDuplocateChapterRes
        );
        if (checkForDuplocateChapterRes.data.data.length > 0) {
          setModalMessage(values.titleName + " already exist");
          setModalErrorOpen(true);
          setModalTitle("Message");

          setLoad(false);
          // toast.success("Chapter " + values.titleName + " already exist", {
          //   autoClose: 1000, // time in milliseconds, 5000ms = 5 seconds
          // });
          setTitleOpenModal(false);
          setEditChapter();
          return;
          // toast.success("Chapter " + values.titleName + " already exist", {
          //   autoClose: 1000, // time in milliseconds, 5000ms = 5 seconds
          // });
        }
        const addChapterRes = await LMSApi.addChapter(
          location.state.course.name,
          values.titleName,
          values.description
        );
        console.log("addChapterRes--", addChapterRes.data.data.name);
        if (addChapterRes.status) {
          toast.success("Chapter added successfully");
          let chapters = data.map((item, index) => {
            return {
              chapter: item.name,
            };
          });
          console.log("chapters--", chapters);

          const assignChapterRes = await LMSApi.assignChapter(
            [
              ...chapters,
              {
                chapter: addChapterRes.data.data.name,
              },
            ],
            location.state.course.name
          );
          console.log("assignChapterRes--", assignChapterRes);
          getAllList();
          setTitleOpenModal(false);
          setEditChapter();
          setLoad(false);
          return;
        }
      }
    } catch (error) {
      console.log("exception--", error);
    }
  };

  const getAllList = async () => {
    try {
      setLoad(true);
      const getAllCoursesRes = await LMSApi.getAllChapterByCourse(
        location.state.course.name
      );
      console.log("getAllCoursesRes---", getAllCoursesRes);

      for (let i = 0; i < getAllCoursesRes.data.data.length; i++) {
        getAllCoursesRes.data.data[i].id = i;
      }
      setData(getAllCoursesRes.data.data);

      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  useEffect(() => {
    console.log("useEffect--", location.state);
    getAllList();
  }, []);

  const handleDragStart = (e, id) => {
    setDraggedRowId(id);
    e.currentTarget.classList.add("cursor-grabbing");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    setLoad(true);
    try {
      e.preventDefault();
      const draggedRowIndex = data.findIndex((row) => row.id === draggedRowId);
      console.log("draggedRowIndex--", draggedRowIndex);
      const updatedRows = [...data];
      console.log("updatedRows--", updatedRows);
      const [draggedRow] = updatedRows.splice(draggedRowIndex, 1);
      updatedRows.splice(dropIndex, 0, draggedRow);
      console.log("final updatedRows--", updatedRows);
      setData(updatedRows);
      e.currentTarget.classList.remove("cursor-grabbing");
      console.log(updatedRows, "updatednewrow ----");
      // return;
      for (let i = 0; i < updatedRows.length; i++) {
        const updateLessonIndexLabelRes = await LMSApi.updateChapterIndexLabel(
          updatedRows[i].name,
          i + 1
        );
        console.log("updateLessonIndexLabelRes--", updateLessonIndexLabelRes);
      }
      getAllList();
      setLoad(false);
    } catch (error) {
      setLoad(false);
    }
  };

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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="col-lg-12">
          <a
            href="javascript:void(0)"
            onClick={(e) => navigate("/course-list")}
          >
            Courses
          </a>{" "}
          / <b>{location.state.course.title}</b>
        </div>
        {/* <div className="mt-2">
          <div
            dangerouslySetInnerHTML={{
              __html: location.state.course.description,
            }}
          ></div>
        </div> */}
        <div style={{ textAlign: "right" }}>
          <Button
            isTable={true}
            frmButton={false}
            className="btn-3"
            onClick={() => {
              if (draggable) setDraggable(false);
              else setDraggable(true);
            }}
            text={draggable ? "Disable Ordering" : "Enable Ordering"}
            type="button"
          />
          &nbsp;&nbsp;
          <Button
            isTable={true}
            frmButton={false}
            className={"btn-green"}
            onClick={() => {
              setEditChapter();
              setTitleOpenModal(true);
            }}
            text={"New Chapter"}
            type="button"
          />
        </div>
        <div className="row no-gutters mt-3">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  {draggable && (
                    <th width="1%">
                      <OpenWithIcon />
                    </th>
                  )}
                  <th width="1%">No.</th>
                  <th>Chapter</th>
                  {/* <th width="5%">Sort Order</th> */}
                  <th width="5%">Setting</th>
                </tr>
              </thead>
              {data?.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={8} align="center">
                      No chapter found
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {data?.map((item, index) => (
                    <tr
                      id={index}
                      key={index}
                      draggable={draggable}
                      onDragStart={(e) => {
                        draggable && handleDragStart(e, item.id);
                      }}
                      onDragOver={(e) => draggable && handleDragOver(e)}
                      onDrop={(e) => draggable && handleDrop(e, index)}
                    >
                      {draggable && (
                        <td width="1%">
                          <OpenWithIcon
                            style={{
                              width: "1em",
                              height: "1em",
                              cursor: "pointer",
                              color: "gray",
                            }}
                          />
                        </td>
                      )}
                      <td>{index + 1}</td>
                      <td>
                        <a
                          href="javascript:void(0)"
                          onClick={(e) => {
                            navigate("/lms-topic-list", {
                              state: {
                                chapter: item,
                                course: location.state.course,
                              },
                            });
                          }}
                        >
                          {item.title}
                        </a>
                      </td>
                      {/* <td></td> */}
                      <td align="center">
                        <SettingsIcon
                          style={{
                            width: "1em",
                            height: "1em",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            setEditChapter(item);
                            setTitleOpenModal(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
        <Modal
          show={titleOpenModal}
          dialogClassName="title-modal"
          onEscapeKeyDown={() => {
            setEditChapter();
            setTitleOpenModal(false);
          }}
        >
          <Modal.Header>
            <Modal.Title>
              {editChapter ? "Edit Chapter" : "New Chapter"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formik
              enableReinitialize={true}
              innerRef={formilRef}
              initialValues={{
                titleName: editChapter ? editChapter?.title : "",
                description: editChapter ? editChapter?.description : "",
              }}
              validationSchema={formSchema}
              onSubmit={handleAddChapter}
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
                    <div className="col-lg-10">
                      <TextFieldFormik
                        autoFocus
                        label="Chapter Name"
                        tabIndex={1}
                        id="titleName"
                        mandatory={1}
                        searchIcon={true}
                        onChange={(e) => {
                          setFieldValue("titleName", e.target.value);
                        }}
                      />

                      <TextAreaFieldFormik
                        id="description"
                        label="Description"
                        // tabIndex={2}
                        mandatory={1}
                        onChange={(e) =>
                          setFieldValue("description", e.target.value)
                        }
                        maxlength={500}
                      />
                      {/* <DisplayText
                        label="Order"
                        value={
                          editChapter
                            ? editChapter?.order
                            : parseInt(data[data.length]?.sort_order) + 1
                        }
                      /> */}
                    </div>
                    {/* <Button
                      text={"F4 - Save"}
                      tabIndex={3}
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                      id="save"
                    /> */}
                    <div className="text-center mt-2">
                      <Button
                        className={"btn me-4"}
                        frmButton={false}
                        tabIndex={5}
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                        id="save"
                        text="F4 - Save"
                      />
                      <Button
                        text="Close"
                        type="button"
                        frmButton={false}
                        onClick={(e) => {
                          setTitleOpenModal(false);
                        }}
                      />
                    </div>
                  </form>
                );
              }}
            </Formik>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
export default ChapterList;
