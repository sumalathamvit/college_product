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
import { useDispatch, useSelector } from "react-redux";
import { lmsSliceActions } from "../store/lms-clice";

const prefixerror = "MyTopic";
function MyTopic() {
  const navigate = useNavigate();
  const location = useLocation();
  const courseName = location.state.courseName;
  const courseId = location.state.courseId;
  const courseTitle = location.state.courseTitle;
  const data = useSelector((state) => state.lms.currentTopic);
  const [modalVisible, setModalVisible] = useState(false);
  const [load, setLoad] = useState(false);

  const [videoLink, setVideoLink] = useState([]);
  const dispatch = useDispatch();

  console.log(location.state, "location.state");

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
    if (!data.youtube) {
      setVideoLink([]);
      return;
    }
    setVideoLink(data.youtube.split(","));
  }, []);

  return (
    <>
      <div className="content-area-report" onClick={preFunction.hideNavbar}>
        <div className="row no-gutters bg-white-report">
          <div className="row no-gutters  mb-4">
            <div className="col-6  text-start">
              <Button
                frmButton={false}
                className="btn-3"
                onClick={() => {
                  navigate("/lms-my-chapter", {
                    state: {
                      courseId: courseId,
                      courseName: courseName,
                      title: courseTitle,
                    },
                  });
                }}
                text={"Back"}
                type="button"
              />
            </div>
            <div className="col-6  text-end">
              <Button
                frmButton={false}
                className="btn-3"
                onClick={() => {
                  previousTopic();
                }}
                text={"Previous"}
                type="button"
              />
              &nbsp;&nbsp;
              <Button
                frmButton={false}
                className={"btn-green"}
                onClick={() => {
                  nextTopic();
                }}
                text={"Complete & Next"}
                type="button"
              />
            </div>
          </div>
          <ScreenTitle
            titleClass="page-heading-position"
            customTitle={data.title}
          />
          {data.youtube ? (
            <iframe
              height={"500px"}
              src={data.youtube}
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          ) : null}

          <DisplayText
            // label="Content"
            labelSize={2}
            value={`<html>
        <head>
  <style>

  table{
    border-radius: 10px;
  }

  td{
    border:1px solid #000 !important;
    padding: 0.4rem
  }
   

  pre{
    color: #e5e7eb;
    background-color: #1f2937;
    overflow-x: auto;
    font-weight: 400;
    padding: 10px;
}
  code{
    color: #e5e7eb;
    background-color: #1f2937;
    overflow-x: auto;
    font-weight: 400;
}


.table-bordered{
  border-collapse: collapse;
  width: 100%;
  border:1px solid #000 !important;
}

  </style>
</head>
<body>${data.body}</body>
</html>`}
            isHTML={true}
          />
          <div className="row no-gutters">
            <button title="Previous" onPress={() => previousTopic()} />
            <button title="Complete & Next" onPress={() => nextTopic()} />
          </div>

          {/* {modalVisible && (
        <div style={commonStyles(theme).modalContainer}>
          <div
            style={[
              commonStyles(theme).modalSubContainer,
              {
                padding: 10,
              },
            ]}
          >
            <button
              onClick={() => setModalVisible(false)}
              style={{
                alignSelf: "flex-end",
              }}
            >
              <IconComponent
                name={"close-circle-outline"}
                size={30}
                fill={colors[theme].icon}
              />
            </button>
          </div>
        </div>
      )} */}
        </div>
      </div>
    </>
  );
}
export default MyTopic;
