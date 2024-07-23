import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import ScreenTitle from "../../component/common/ScreenTitle";
import CommonApi from "../../component/common/CommonApi";
import ViewInstituteStudent from "../../component/ViewInstituteStudent";
import ViewCollegeStudent from "../../component/ViewCollegeStudent";
import storage from "../../auth/storage";
import string from "../../string";
import AuthContext from "../../auth/context";

function ViewStudent() {
  //#region const
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [enrollNumber, setEnrollNumber] = useState();
  const [studentList, setStudentList] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);
  const { userRole } = useContext(AuthContext);
  const sessRole = storage.getRole();
  //#endregion

  const searchStudent = async (value) => {
    const studList = await CommonApi.searchStudent(value);
    setStudentList(studList);
    return studList;
  };

  const viewStudent = async (id) => {
    try {
      setLoad(true);
      setData([]);
      if (id) {
        let viewStudent;
        console.log(
          "collegeConfig.institution_type---",
          collegeConfig.institution_type
        );
        if (collegeConfig.institution_type == 5) {
          viewStudent = await StudentApi.trainingStudentDetail(id);
        } else {
          viewStudent = await StudentApi.studentDetailById(id);
        }
        setData(viewStudent.data.message.data);
        console.log("---viewStudent", viewStudent);

        if (location?.state?.id) {
          console.log("location.state.id------", location.state.id);
          const studList = await searchStudent(
            viewStudent.data.message.data.student.enrollNo
          );
          setEnrollNumber(studList[0]);
        }
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("location", location);
    if (location?.state && location?.state?.id) {
      viewStudent(location.state.id);
    }
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position"} />
        <div className="col-lg-10 mt-2">
          <ReactSelectField
            label="Student No. / Name"
            labelSize={5}
            tabIndex={1}
            autoFocus
            id="student"
            mandatory={1}
            maxlength={40}
            clear={true}
            value={enrollNumber}
            options={studentList}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            onInputChange={(inputValue) => {
              searchStudent(inputValue);
            }}
            onChange={(text) => {
              setEnrollNumber(text);
              viewStudent(text?.id);
            }}
          />
        </div>
        {enrollNumber && userRole == "Admin" ? (
          <div className="col-lg-2 ps-2">
            <Button
              tabIndex={2}
              className={"btn-green"}
              type="button"
              frmButton={false}
              text={"Edit"}
              onClick={() =>
                navigate(
                  collegeConfig.institution_type === 5
                    ? "/registration"
                    : "/add-student",
                  { state: { id: enrollNumber?.id } }
                )
              }
            />
          </div>
        ) : null}
        {enrollNumber && (
          <>
            {collegeConfig.institution_type === 5 ? (
              <ViewInstituteStudent data={data} />
            ) : (
              <ViewCollegeStudent data={data} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ViewStudent;
