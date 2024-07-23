import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import { showList } from "../component/common/CommonArray";
import ScreenTitle from "../component/common/ScreenTitle";
import Icon from "../component/Icon";
import { useDispatch, useSelector } from "react-redux";
import { lmsSliceActions } from "../store/lms-clice";
import LMSApi from "../api/LMSApi";
import string from "../string";
import AuthContext from "../auth/context";
import CourseCard from "../component/CourseCard";

const prefixerror = "MyCourse";
function MyCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { studentEmail, studentEnrollNumber } = useContext(AuthContext);
  const myCourse = useSelector((state) => state.lms.myCourse);

  console.log(studentEmail, "studentEmail");

  const getEnrolledCourse = async () => {
    try {
      setLoading(true);
      dispatch(lmsSliceActions.removeMyCourse());
      dispatch(lmsSliceActions.removeAllCourse());
      const response = await LMSApi.getEnrolledCourse(studentEmail);

      console.log(response, "response");

      if (!response.ok) {
        setLoading(false);

        return;
      }
      console.log(response.data.data, "response.data.data");

      if (response.data.data.length == 0) {
        setLoading(false);
        return;
      }

      const allCourse = await LMSApi.getLMSCourse();

      if (!response.ok) {
        setLoading(false);
        return;
      }

      let courseData = response.data.data.map((item) => {
        let course = allCourse.data.data.find(
          (course) => course.name === item.course
        );
        return {
          ...course,
          ...item,
        };
      });

      dispatch(lmsSliceActions.replaceMyCourse(courseData));
      dispatch(lmsSliceActions.replaceAllCourse(allCourse.data.data));

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEnrolledCourse();
  }, [studentEnrollNumber]);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={loading}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle
          titleClass="page-heading-position"
          customTitle={"My course"}
        />
        {myCourse && myCourse.length > 0 ? (
          <div className="row no-gutters mt-1 text-center">
            {myCourse.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-5">
            <Icon name="book" size={50} color="gray" />
            <span className="mt-2">{loading ? null : "No course found"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
export default MyCourse;
