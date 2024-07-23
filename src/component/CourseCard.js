import React from "react";
import { useNavigate } from "react-router-dom";
import string from "../string";

const CourseCard = ({ course }) => {
  const { name, course: courseName, title, image, progress } = course;
  const imageUrl = image.includes("/files")
    ? string.TESTBASEURL + image
    : string.FILEURL + image;
  const navigate = useNavigate();

  const navigateToChapter = () => {
    navigate("/lms-my-chapter", {
      state: {
        courseId: name,
        courseName,
        title,
      },
    });
  };

  return (
    <div className="col-6 pe-2">
      <div
        className="border rounded-3 p-1 cursor-pointer lms-my-course-card"
        onClick={navigateToChapter}
      >
        <div className="lms-card">
          <img src={imageUrl} alt={title} className="banner-image" />
          <h2 className="lms-course-title">{title}</h2>
          <progress value={parseInt(progress)} max="100"></progress>
          <p className="lms-sub-text">{parseInt(progress)}% Completed</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
