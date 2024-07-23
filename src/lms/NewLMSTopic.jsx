import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import ModalComponent from "../component/ModalComponent";
import { Modal, Tab, Tabs } from "react-bootstrap";
import LMSApi from "../api/LMSApi";
import HTMLEditor from "../component/FormField/HTMLEditor";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextAreaFieldFormik from "../component/FormField/TextareaFieldFormik";

function NewLMSTopic() {
  const navigate = useNavigate();
  const location = useLocation();
  const formilRef = useRef();
  const [load, setLoad] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [privateVideoList, setPrivateVideoList] = useState([]);
  const contentRef = useRef();
  const insContentRef = useRef();
  const [activeKey, setActiveKey] = useState(1);

  const formSchema = Yup.object().shape({
    titleName: Yup.string().required("Please enter the Title"),
    content:
      parseInt(activeKey) === 1
        ? Yup.string()
            .test(
              "valid-content",
              "Please enter valid content",
              (value) => value.trim() !== "" && value !== "<p></p>\n"
            )
            .required("Please enter the Content")
        : Yup.mixed().notRequired(),
    htmlContent:
      parseInt(activeKey) === 2
        ? Yup.string()
            .test(
              "valid-content",
              "Please enter valid content",
              (value) => value.trim() !== "" && value !== "<p></p>\n"
            )
            .required("Please enter the HTML Content")
        : Yup.mixed().notRequired(),
  });

  const handleAddTopic = async (values) => {
    console.log("values--------------", values);
    if (load) return;
    // console.log("values--------------", values);
    // return;
    try {
      let url;
      if (values.videoURL) {
        url = values.videoURL.match(/src="([^"]+)"/);
        console.log("url--------------", url);
        if (!url) {
          setModalTitle("Message");
          setModalMessage("Please upload a valid embed youtube video URL");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
      }
      if (location.state.topic) {
        if (
          values.titleName == location?.state?.topic?.title &&
          values.content == location?.state?.topic?.body &&
          values.htmlContent == location?.state?.topic?.body &&
          values.instructorContent ==
            location?.state?.topic?.instructor_notes &&
          values.videoURL == location?.state?.topic?.videoURL
        ) {
          setModalTitle("Message");
          setModalMessage("No changes made");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
        setLoad(true);
        const checkForDuplocateTopicRes = await LMSApi.checkForDuplocateTopic(
          location.state.chapter.name,
          values.titleName,
          location?.state?.topic?.name
        );
        console.log("checkForDuplocateTopicRes--", checkForDuplocateTopicRes);
        if (checkForDuplocateTopicRes.data.data.length > 0) {
          setModalTitle("Message");
          setModalMessage("Chapter " + values.titleName + " already exist");
          setModalErrorOpen(true);
          return;
        }

        const updateTopicRes = await LMSApi.updateTopic(
          location?.state?.topic?.name,
          values.titleName,
          parseInt(activeKey) === 1 ? values.content : values.htmlContent,
          values.instructorContent,
          values.videoURL ? url[1] : null,
          values.privateVideo
        );
        console.log("updateTopicRes--", updateTopicRes);
        if (updateTopicRes.ok) {
          toast.success("Topic updated successfully");
          setLoad(false);
          navigate("/view-lms-topic", {
            state: {
              course: location.state.course,
              chapter: location.state.chapter,
              topic: updateTopicRes.data.data,
            },
          });
          return;
        }
      } else {
        setLoad(true);
        const checkForDuplocateTopicRes = await LMSApi.checkForDuplocateTopic(
          location.state.chapter.name,
          values.titleName
        );

        console.log("checkForDuplocateTopicRes--", checkForDuplocateTopicRes);
        if (checkForDuplocateTopicRes.data.data.length > 0) {
          setModalTitle("Message");
          setModalMessage("Chapter " + values.titleName + " already exist");
          setModalErrorOpen(true);
          return;
        }
        let order = 1;
        const getLastSortOrderRes = await LMSApi.getHighestSortOrder(
          location.state.chapter.name
        );
        console.log("getLastSortOrderRes--", getLastSortOrderRes);
        if (getLastSortOrderRes.data.data.length > 0) {
          order = parseInt(getLastSortOrderRes.data.data[0].index_label) + 1;
        }
        const addTopicRes = await LMSApi.addTopic(
          location.state.chapter.name,
          values.titleName,
          parseInt(activeKey) === 1 ? values.content : values.htmlContent,
          values.instructorContent,
          values.videoURL ? url[1] : null,
          order,
          values.privateVideo
        );
        console.log("addTopicRes--", addTopicRes);

        if (addTopicRes.status) {
          toast.success("Topic added successfully");
          let lessons = location.state.data.map((item, index) => {
            return {
              lesson: item.name,
            };
          });
          // console.log("lessons--", lessons);
          const assignLessonRes = await LMSApi.assignTopic(
            [
              ...lessons,
              {
                lesson: addTopicRes.data.data.name,
              },
            ],
            location.state.chapter.name
          );
          console.log("assignLessonRes--", assignLessonRes);
          setLoad(false);
          navigate("/lms-topic-list", {
            state: {
              course: location.state.course,
              chapter: location.state.chapter,
            },
          });
          return;
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  useEffect(() => {
    console.log("useEffect--", location.state);
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
              navigate("/course-list", {
                state: { course: location.state.course },
              })
            }
          >
            {location?.state?.course?.title}
          </a>{" "}
          /{" "}
          <a
            href="javascript:void(0)"
            onClick={(e) =>
              navigate("/lms-topic-list", {
                state: {
                  course: location.state.course,
                  chapter: location.state.chapter,
                },
              })
            }
          >
            {location?.state?.chapter?.title}
          </a>{" "}
          /{" "}
          {location?.state?.topic?.title ? (
            <b>{location?.state?.topic?.title}</b>
          ) : (
            "New Topic"
          )}
        </div>

        <div className="row no-gutters mt-3">
          <Formik
            enableReinitialize={true}
            innerRef={formilRef}
            initialValues={{
              titleName: location?.state?.topic?.title,
              htmlContent: location?.state?.topic?.body,
              content: location?.state?.topic?.body,
              instructorContent: location?.state?.topic?.instructor_notes
                ?.replace("&lt;", "<")
                ?.replace("&gt;", ">"),
              videoURL: location?.state?.topic?.youtube
                ? `<iframe width="560" height="315" src="${location?.state?.topic?.youtube}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
                : "",
              privateVideo: location?.state?.topic?.custom_private_video,
            }}
            validationSchema={formSchema}
            onSubmit={handleAddTopic}
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
                      label="Topic"
                      labelSize={3}
                      tabIndex={1}
                      id="titleName"
                      mandatory={1}
                      searchIcon={true}
                      onChange={(e) => {
                        setFieldValue("titleName", e.target.value);
                      }}
                    />
                    <TextFieldFormik
                      label="YouTube Video URL"
                      labelSize={3}
                      maxlength={1000}
                      tabIndex={2}
                      id="videoURL"
                      searchIcon={true}
                      // style={{ width: "70%" }}
                      onChange={(e) => {
                        setFieldValue("videoURL", e.target.value);
                      }}
                    />
                    <TextFieldFormik
                      label="Private Video "
                      labelSize={3}
                      maxlength={1000}
                      tabIndex={2}
                      id="privateVideo"
                      searchIcon={true}
                      placeholder={"file_video.mp4"}
                      // style={{ width: "70%" }}
                      onChange={(e) => {
                        setFieldValue("privateVideo", e.target.value);
                      }}
                    />
                    {/* <SelectFieldFormik
                      label="Private Video "
                      labelSize={3}
                      maxlength={1000}
                      tabIndex={2}
                      id="privateVideo"
                      options={privateVideoList}
                      searchIcon={true}
                      getOptionLabel={(option) => option?.label}
                      getOptionValue={(option) => option?.link}
                      onChange={(e) => {
                        setFieldValue("privateVideo", e.target.value);
                      }}
                    /> */}
                    {/* </div> */}
                    {/* <div>
                      <pre>{values.content}</pre>
                    </div> */}
                    {/* <div className="row">
                    <div className="col-lg-10" style={{ marginLeft: "-6px" }}> */}

                    <div
                      className="col-lg-12 mt-2 text-end"
                      style={{ marginBottom: "-5px" }}
                    >
                      <Button
                        isTable={true}
                        frmButton={false}
                        className={"lms-btn-3 me-2 "}
                        onClick={() => setActiveKey(1)}
                        text={"Content"}
                        type="button"
                        style={{
                          backgroundColor: activeKey === 1 ? "#0669ad" : "",
                          color: activeKey === 1 ? "#fff" : "",
                        }}
                      />
                      <Button
                        isTable={true}
                        frmButton={false}
                        className={"lms-btn-3 "}
                        onClick={() => setActiveKey(2)}
                        text={"HTML"}
                        type="button"
                        style={{
                          backgroundColor: activeKey === 2 ? "#0669ad" : "",
                          color: activeKey === 2 ? "#fff" : "",
                        }}
                      />
                    </div>
                    {activeKey === 1 ? (
                      <HTMLEditor
                        id="content"
                        editorRef={contentRef}
                        label="Content"
                        labelSize={3}
                        tabIndex={3}
                        mandatory={1}
                        value={values.content}
                        html={false}
                        onChange={(val) => {
                          console.log("val--", val);
                          setFieldValue("content", val);
                        }}
                      />
                    ) : (
                      <TextAreaFieldFormik
                        id="htmlContent"
                        label="Content"
                        // tabIndex={2}
                        mandatory={1}
                        onChange={(e) =>
                          setFieldValue("htmlContent", e.target.value)
                        }
                        labelSize={3}
                        areaStyle={{ height: "500px" }}
                      />
                    )}

                    <HTMLEditor
                      id="instructorContent"
                      editorRef={insContentRef}
                      label="Instructor Content"
                      // style={{ width: "97%" }}
                      labelSize={3}
                      tabIndex={4}
                      value={values.instructorContent}
                      onChange={(val) => {
                        setFieldValue("instructorContent", val);
                      }}
                    />
                  </div>
                  <Button
                    text={"F4 - Save"}
                    tabIndex={5}
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                    id="save"
                  />
                </form>
              );
            }}
          </Formik>
        </div>
        {/* <Modal
          show={editmodal}
          onHide={() => setEditModal(false)}
          dialogClassName="my-modal"
          onEscapeKeyDown={() => setEditModal(false)}
        >
          <Modal.Header>
            <Modal.Title>HTML Editor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {location?.state?.topic?.body ? (
              <div>
                <pre>{location?.state?.topic?.body}</pre>
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-secondary"
              onClick={() => setEditModal(false)}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal> */}
      </div>
    </div>
  );
}
export default NewLMSTopic;
