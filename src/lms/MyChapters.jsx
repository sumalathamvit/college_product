import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ScreenTitle from "../component/common/ScreenTitle";
import Icon from "../component/Icon";
import { useDispatch, useSelector } from "react-redux";
import { lmsSliceActions } from "../store/lms-clice";
import LMSApi from "../api/LMSApi";
import AuthContext from "../auth/context";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "../component/FormField/Button";
import DisplayText from "../component/FormField/DisplayText";
import ReactPlayer from "react-player";
import string from "../string";
import { toast } from "react-toastify";

const prefixerror = "MyChapters";
function MyChapters() {
  const navigate = useNavigate();
  const location = useLocation();

  const [visibleIndex, setVisibleIndex] = useState(null);
  const { studentEmail } = useContext(AuthContext);

  const [load, setLoad] = useState(false);

  const dispatch = useDispatch();
  const allTopicData = useSelector((state) => state.lms.allTopic);
  const data = useSelector((state) => state.lms.currentTopic);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const courseId = location.state.courseId;
  const courseName = location.state.courseName;

  console.log(studentEmail, "studentEmail");

  const getTopicWithChapter = async () => {
    try {
      setLoad(true);
      dispatch(lmsSliceActions.removeTopic());

      const chapter = await LMSApi.getChapter(location.state.courseName);
      const topic = await LMSApi.getTopic(location.state.courseName);
      const completedTopic = await LMSApi.getCompletedTopicList(
        studentEmail,
        location.state.courseName
      );

      console.log(completedTopic.data.data, "completedTopic.data.data");
      const allTopics = topic.data.data.map((topic) => {
        const completed = completedTopic.data.data.find(
          (item) => item.lesson === topic.name
        );
        return {
          ...topic,
          completed: completed ? true : false,
        };
      });

      const chapterTopic = chapter.data.data.map((chapter) => {
        const topics = allTopics.filter(
          (topic) => topic.chapter === chapter.name
        );
        const completedTopics = topics.filter(
          (topic) => topic.completed === true
        );
        return {
          ...chapter,
          topics,
          completedTopicCount: completedTopics.length,
          topicCount: topics.length,
        };
      });
      // setData(chapterTopic);

      dispatch(lmsSliceActions.replaceAllTopic(chapterTopic));
      // dispatch(lmsSliceActions.replaceCurrentTopic(chapterTopic[0].topics[0]));
      // if data have to compare with the current topic
      const currentTopic = chapterTopic.find((item) => {
        return item.topics.find((topic) => {
          return topic.name === data.name;
        });
      });
      if (currentTopic) {
        dispatch(lmsSliceActions.replaceCurrentTopic(data));
      } else {
        dispatch(
          lmsSliceActions.replaceCurrentTopic(chapterTopic[0].topics[0])
        );
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);

      console.log(error);
    }
  };

  const toggleVisibility = (item, index) => {
    setVisibleIndex(visibleIndex === index ? null : index); // Toggle visibility
  };

  const nextTopic = async () => {
    try {
      console.log("lesson", data.completed);

      if (data.completed) {
        dispatch(lmsSliceActions.nextTopic(data.name));
        return;
      }

      setLoad(true);
      console.log("    name", courseId, "value", data.name);
      const response1 = await LMSApi.updateCurrentLesson(courseId, data.name);
      console.log(response1, "response1");

      if (!response1.ok) {
        setLoad(false);
        return;
      }
      console.log(response1.data, "response1");

      console.log("  course", courseName, "lesson", data.name);

      const response2 = await LMSApi.updateLessonProgress(
        courseName,
        data.name
      );
      setLoad(false);

      console.log(response2.data, "response2");

      if (!response2.ok) {
        setLoad(false);

        return;
      }
      if (response2.data.message) {
        dispatch(
          lmsSliceActions.updateCourseProgress({
            name: courseId,
            progress: response2.data.message,
          })
        );
        if (response2.data.message === 100) {
          toast.success("Course Completed");
        }
      }
      dispatch(
        lmsSliceActions.updateTopicCompleted({
          name: data.name,
          progress: response2.data.message,
        })
      );
    } catch (error) {
      setLoad(false);

      console.log(error);
    }
  };

  const previousTopic = () => {
    dispatch(lmsSliceActions.previousTopic(data.name));
  };

  useEffect(() => {
    getTopicWithChapter();
  }, []);

  //find the current chapter index from the allTopicData
  useEffect(() => {
    const currentChapterIndex = allTopicData.findIndex((item) => {
      return item.topics.find((topic) => {
        return topic.name === data.name;
      });
    });
    setSelectedIndex(currentChapterIndex);
  }, [data]);

  return (
    <div className="lms-bg" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />

      <div>
        <div className="row lms-heading">
          <div
            className="col-6 text-start row cursor-pointer no-gutters align-center"
            onClick={() => navigate("/")}
          >
            <Icon iconName={"West"} className={`align-center p-0 col-1 `} />
            <text className="ps-2 col-11">{location.state.title}</text>
          </div>
          <div className="col-6 pe-2 no-gutters text-end  mt-0">
            <Button
              frmButton={false}
              className="lms-btn-3 me-4 mt-0"
              onClick={() => {
                previousTopic();
              }}
              text={"Previous"}
              type="button"
              isTable={true}
            />
            <Button
              isTable={true}
              frmButton={false}
              className={"btn-green  mt-0"}
              onClick={() => {
                nextTopic();
              }}
              text={"Complete & Next"}
              type="button"
            />
          </div>
        </div>
        <div className="row no-gutters ">
          <div className="col-2 lms-nav-bar-card">
            {allTopicData.map((item, index) => {
              return (
                <>
                  <div
                    onClick={() => {
                      toggleVisibility(item, index);
                    }}
                  >
                    <ul className="list-group pointer">
                      <div
                        onClick={() => {
                          setSelectedIndex(selectedIndex == index ? -1 : index);
                        }}
                        className="border-bottom lms-chapter-heading row align-items-center  ps-4"
                      >
                        <div className="col-10 ">
                          <span className="lms-chapter-heading-text">
                            {item.title}
                            <br />
                            <span className="lms-chapter-subheading-text">
                              {item.completedTopicCount} / {item.topicCount}{" "}
                              Complete
                            </span>
                          </span>
                        </div>
                        <div className="col-2">
                          <Icon
                            iconName={
                              selectedIndex == index
                                ? "KeyboardArrowUp"
                                : "KeyboardArrowDown"
                            }
                            color={"#1d4699"}
                            fontSize={"small"}
                            style={{ float: "right" }}
                          />
                        </div>
                      </div>
                    </ul>

                    {selectedIndex == index
                      ? item.topics.map((topic, index) => {
                          return (
                            <div className="row">
                              <div
                                className={`row ${
                                  data.name === topic.name
                                    ? "lms-lesson-heading-active"
                                    : "lms-lesson-heading"
                                } 
                                align-items-center  p-2 
                                 ps-4
                                `}
                                onClick={() => {
                                  console.log("topic", topic);
                                  dispatch(
                                    lmsSliceActions.replaceCurrentTopic(topic)
                                  );
                                }}
                              >
                                <div className="col-1 align-left p-0">
                                  <Icon
                                    className="my-chapter-icon"
                                    iconName={
                                      topic.completed
                                        ? "CheckCircle"
                                        : "PanoramaFishEye"
                                    }
                                  />
                                </div>
                                <div className="col-10 align-left p-0 text-left ps-1">
                                  <Icon
                                    iconName={
                                      topic.youtube ||
                                      topic.custom_private_video
                                        ? "YouTube"
                                        : "MenuBook"
                                    }
                                    className={`align-left p-0 ${
                                      topic.youtube ||
                                      topic.custom_private_video
                                        ? "my-chapter-icon-youtube"
                                        : " my-chapter-icon"
                                    }`}
                                  />
                                  <text className="ps-1 lms-lesson-title">
                                    {topic.title}
                                  </text>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      : null}
                  </div>
                </>
              );
            })}
          </div>
          <div className="col-10 ps-2 pe-2">
            <div>
              {data.youtube ? (
                <>
                  <ReactPlayer
                    url={data.youtube}
                    controls={true}
                    height={
                      // i need height responsive windows height - 100px for the header and footer and 100px for the top and bottom padding of the video
                      window.innerHeight - 150
                    }
                    width={"100%"}
                    config={{
                      file: {
                        attributes: {
                          onContextMenu: (e) => e.preventDefault(),
                          controlsList: "nodownload", // this will work only on chrome
                        },
                      },
                    }}
                  />
                </>
              ) : null}
              {data.custom_private_video ? (
                <>
                  <ReactPlayer
                    url={
                      string.FILEURL + "lms/video/" + data.custom_private_video
                    }
                    controls={true}
                    height={
                      // i need height responsive windows height - 100px for the header and footer and 100px for the top and bottom padding of the video
                      window.innerHeight - 150
                    }
                    width={"100%"}
                    config={{
                      file: {
                        attributes: {
                          onContextMenu: (e) => e.preventDefault(),
                          controlsList: "nodownload", // this will work only on chrome
                        },
                      },
                    }}
                  />
                </>
              ) : null}
              <div className="ps-5 pe-5 pt-5">
                <DisplayText
                  labelSize={2}
                  value={
                    data.body
                      ? `<html>
        <head>
 
</head>
<body>${data.body}</body>
</html>`
                      : null
                  }
                  isHTML={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyChapters;
