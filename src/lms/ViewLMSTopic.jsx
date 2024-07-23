import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";
import ModalComponent from "../component/ModalComponent";
import LMSApi from "../api/LMSApi";
import DisplayText from "../component/FormField/DisplayText";
import ReactPlayer from "react-player";
import string from "../string";

function ViewLMSTopic() {
  const navigate = useNavigate();
  const location = useLocation();
  const formilRef = useRef();
  const [editTopic, setEditTopic] = useState();
  const [load, setLoad] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const formSchema = Yup.object().shape({
    titleName: Yup.string().required("Please enter the Tile"),
    content: Yup.string()
      .test(
        "valid-content",
        "Please enter valid content",
        (value) => value.trim() !== "" && value !== "<p></p>\n"
      )
      .required("Please enter the Content"),
  });

  const handleAddTopic = async (values) => {
    if (load) return;
    console.log("values--", values);
    // return;
    console.log("editTopic--", editTopic);
    try {
      setLoad(true);
      if (editTopic) {
        if (
          values.titleName == editTopic.title &&
          values.description == editTopic.description
        ) {
          setModalTitle("Message");
          setModalMessage("No changes made");
          setModalErrorOpen(true);
          return;
        }
        const checkForDuplocateChapterRes =
          await LMSApi.checkForDuplocateChapterExceptName(
            location.state.course.name,
            values.titleName,
            editTopic.name
          );
        console.log(
          "checkForDuplocateChapterRes--",
          checkForDuplocateChapterRes
        );
        if (checkForDuplocateChapterRes.data.data.length > 0) {
          setModalTitle("Message");
          setModalMessage("Chapter " + values.titleName + " already exist");
          setModalErrorOpen(true);
          return;
        }

        const updateChapterRes = await LMSApi.updateChapter(
          editTopic.name,
          values.titleName,
          values.description
        );
        console.log("updateChapterRes--", updateChapterRes);
        if (updateChapterRes.status) {
          toast.success("Chapter updated successfully");
          navigate("/lms-chapter-list", {
            state: {
              course: location.state.course,
              chapter: location.state.chapter,
            },
          });
          return;
        }
      } else {
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
          values.content,
          values.instructorContent,
          values.videoURL,
          order
        );
        console.log("addTopicRes--", addTopicRes);
        if (addTopicRes.status) {
          toast.success("Topic added successfully");
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
    console.log("useEffect--", location.state.topic);
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
          / <b>{location?.state?.topic?.title}</b>
        </div>

        <div className="row no-gutters mt-3">
          <Formik
            enableReinitialize={true}
            innerRef={formilRef}
            initialValues={{
              titleName: editTopic?.title,
              content: editTopic?.content,
              instructorContent: editTopic?.instructorContent,
              videoURL: editTopic?.videoURL,
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
                  <div className="col-lg-12">
                    {/* <div className="page-heading">
                      <div>{location?.state?.topic?.title}</div>
                    </div> */}
                    <div style={{ textAlign: "right", marginTop: -15 }}>
                      <Button
                        text={"Edit"}
                        frmButton={false}
                        className={"btn-3"}
                        tabIndex={3}
                        onClick={(e) => {
                          navigate("/new-lms-topic", {
                            state: {
                              course: location.state.course,
                              chapter: location.state.chapter,
                              topic: location.state.topic,
                            },
                          });
                        }}
                      />
                    </div>
                    {location?.state?.topic?.youtube && (
                      <div class="iframe-container">
                        <iframe
                          width="560px"
                          height="315px"
                          class="image"
                          // src="https://www.youtube.com/embed/vDfOV_nN3IU"
                          // // src="https://www.youtube.com/watch?v=qU7u9wGB0JA"
                          src={location.state.topic.youtube}
                          frameborder="0"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen=""
                        ></iframe>
                      </div>
                    )}
                    {location?.state?.topic?.custom_private_video ? (
                      <div class="iframe-container">
                        <ReactPlayer
                          url={
                            string.FILEURL +
                            "lms/video/" +
                            location.state.topic.custom_private_video
                          }
                          controls={true}
                          width="560px"
                          height="315px"
                          config={{
                            file: {
                              attributes: {
                                onContextMenu: (e) => e.preventDefault(),
                                controlsList: "nodownload", // this will work only on chrome
                              },
                            },
                          }}
                        />
                      </div>
                    ) : null}

                    <DisplayText
                      // label="Content"
                      labelSize={2}
                      value={`<html>
        <head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  h1{
    margin-top: 0;
    margin-bottom: 0;
    font-size: 22px;
  }

  h2{
    margin-top: 0;
    margin-bottom: 0;
    font-size: 20px;
  }
  table{
    border-radius: 10px;
  }

  td{
    border:1px solid #000 !important;
    padding: 0.4rem
  }
   

  pre{
    color: #000000;
    background-color: #e3e3e3;
    overflow-x: auto;
    font-weight: 400;
    padding: 10px;
}
  code{
    color: #000000;
    background-color: #e3e3e3;
    overflow-x: auto;
    font-weight: 400;
}
iframe{
  width: 100%;
  height: 300px;
}
 

.table-bordered{
  border-collapse: collapse;
  width: 100%;
  border:1px solid #000 !important;
}

  </style>
</head>
<body>

${location?.state?.topic?.body}

</body>
</html>`}
                      isHTML={true}
                    />
                    {/* value === "<p></p>\n" ? null : value */}
                    {location?.state?.topic?.instructor_notes ==
                    "<p></p>\n" ? null : location?.state?.topic
                        ?.instructor_notes ? (
                      <div className="border p-2">
                        <span className="fw-bold">Instructor Content</span>
                        <DisplayText
                          value={location?.state?.topic?.instructor_notes
                            .replace("&lt;", "<")
                            .replace("&gt;", ">")}
                          isHTML={true}
                        />
                      </div>
                    ) : null}
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default ViewLMSTopic;
