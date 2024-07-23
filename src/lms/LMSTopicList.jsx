import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SettingsIcon from "@mui/icons-material/Settings";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import { Modal } from "react-bootstrap";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";
import ModalComponent from "../component/ModalComponent";
import { Formik } from "formik";
import LMSApi from "../api/LMSApi";
import TextFieldFormik from "../component/FormField/TextFieldFormik";

function LMSTopicList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [topicedit, setTopicEdit] = useState();
  const [data, setData] = useState([]);
  const [editTopic, setEditTopic] = useState();
  const [load, setLoad] = useState(false);
  const [draggable, setDraggable] = useState(false);
  const [draggedRowId, setDraggedRowId] = useState();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [titleeditmodal, setTitleEditModal] = useState();
  const getAllList = async () => {
    setLoad(true);
    try {
      const getAllTopicByChapterRes = await LMSApi.getAllTopicByChapter(
        location.state.chapter.name
      );
      console.log("getAllTopicByChapterRes---", getAllTopicByChapterRes);
      for (let i = 0; i < getAllTopicByChapterRes.data.data.length; i++) {
        getAllTopicByChapterRes.data.data[i].id = i;
      }
      // for (let i = 0; i < getAllTopicByChapterRes.data.data.length; i++) {
      //   getAllTopicByChapterRes.data.data[i].id = i;
      //   for (let i = 0; i < getAllTopicByChapterRes.data.data.length; i++) {
      //     const updateLessonIndexLabelRes = await LMSApi.updateLessonIndexLabel(
      //       getAllTopicByChapterRes.data.data[i].name,
      //       i + 1
      //     );
      //     console.log("updateLessonIndexLabelRes--", updateLessonIndexLabelRes);
      //   }
      // }
      setData(getAllTopicByChapterRes.data.data);
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
  const handleEdit = async (value) => {
    console.log("value--", topicedit.title, value.topicname);
    if (load) return;
    try {
      setLoad(true);
      if (topicedit.title == value.topicname) {
        // getAllList();
        setModalMessage("No changes made");
        setModalErrorOpen(true);
        setModalTitle("Message");
        setTitleEditModal(false);
        setLoad(false);
        return;
        // toast.success("No changes made", {
        //   autoClose: 1000, // time in milliseconds, 5000ms = 5 seconds
        // });
      }

      const updateCourseRes = await LMSApi.editCourseLessonName(
        topicedit.name,
        value.topicname
      );
      console.log("updateCourseRes--", updateCourseRes);
      toast.success("Topic updated successfully");

      getAllList();
      setTitleEditModal(false);
      setLoad(false);
      return;
    } catch (error) {
      console.log("error----", error);
      setLoad(false);
    }
  };
  const handleDrop = async (e, dropIndex) => {
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
    for (let i = 0; i < updatedRows.length; i++) {
      const updateLessonIndexLabelRes = await LMSApi.updateLessonIndexLabel(
        updatedRows[i].name,
        i + 1
      );
      console.log("updateLessonIndexLabelRes--", updateLessonIndexLabelRes);
    }
    getAllList();
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
          /{" "}
          <a
            href="javascript:void(0)"
            onClick={(e) =>
              navigate("/chapter-list", { state: location.state })
            }
          >
            {location?.state?.course?.title}
          </a>{" "}
          / <b>{location?.state?.chapter?.title}</b>
        </div>
        {/* <div className="mt-2">
          <div
            dangerouslySetInnerHTML={{
              __html: location?.state?.chapter?.description,
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
              navigate("/new-lms-topic", {
                state: {
                  data: data,
                  course: location.state.course,
                  chapter: location.state.chapter,
                },
              });
            }}
            text={"New Topic"}
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
                  <th>Topic</th>
                  {/* <th width="5%">Sort Order</th> */}
                  <th width="5%">Setting</th>
                </tr>
              </thead>
              {data?.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={8} align="center">
                      No topic found
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
                            navigate("/view-lms-topic", {
                              state: {
                                course: location.state.course,
                                chapter: location.state.chapter,
                                topic: item,
                              },
                            });
                          }}
                        >
                          {item.title}
                        </a>
                      </td>
                      {/* <td align="right">{item.index_label}</td> */}

                      <td align="center">
                        <SettingsIcon
                          style={{
                            width: "1em",
                            height: "1em",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            setTopicEdit(item);
                            setTitleEditModal(true);
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
          show={titleeditmodal}
          dialogClassName="title-modal"
          onEscapeKeyDown={() => {
            // setEditChapter();
            setTitleEditModal(false);
          }}
        >
          <Modal.Header>
            <Modal.Title> Edit Title</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formik
              enableReinitialize={true}
              // innerRef={formilRef}
              initialValues={{
                topicname: topicedit ? topicedit.title : "",
              }}
              // validationSchema={formSchema}
              onSubmit={handleEdit}
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
                        label="Topic Name"
                        tabIndex={1}
                        id="topicname"
                        mandatory={1}
                        searchIcon={true}
                        onChange={(e) => {
                          setFieldValue("topicname", e.target.value);
                        }}
                      />
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
                          setTitleEditModal(false);
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
export default LMSTopicList;
