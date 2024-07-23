import React, {
  useEffect,
  useState,
  useRef,
  createRef,
  useContext,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import HeadingIcon from "@mui/icons-material/School";
import { Formik } from "formik";

import academicApi from "../api/AcademicApi";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";

import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import { toast } from "react-toastify";
import FileField from "../component/FormField/FileField";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import ModalComponent from "../component/ModalComponent";
import AuthContext from "../auth/context";
import { useDispatch, useSelector } from "react-redux";
import { webSliceActions } from "../store/web";
import Icon from "../component/Icon";
import { allowedFileExtensions } from "../component/common/CommonArray";
import ScreenTitle from "../component/common/ScreenTitle";
import SettingsIcon from "@mui/icons-material/Settings";
import ReactSelectField from "../component/FormField/ReactSelectField";
import TextField from "../component/FormField/TextField";
import LMSApi from "../api/LMSApi";
import ErrorMessage from "../component/common/ErrorMessage";
import { lmsSliceActions } from "../store/lms-clice";
function TestQuiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);

  const [questionlist, setQuestionList] = useState([]);
  const [basicQuestionDetail, setBasicQuestionDetail] = useState([]);
  const [question, setQuestion] = useState([]);
  const [marks, setMarks] = useState([]);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [questionarr, setQuestionArr] = useState([]);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [errorView, setErrorView] = useState(false);
  const [questionErrorView, setQuestionErrorView] = useState(false);
  const [marksErrorView, setMarksErrorView] = useState(false);
  const [arraylength, setArrayLength] = useState(false);
  const { setUnSavedChanges } = useContext(AuthContext);
  const dispatch = useDispatch();
  const collegeConfig = useSelector((state) => state.web.college);
  const questionList = useSelector((state) => state.lms.questionList);

  const FormSchema = Yup.object().shape({
    title: Yup.string().required("Please enter the Title"),
    percentage: Yup.string().required("Please enter the Percentage"),
    // totalmarks: Yup.string().required("Please enter the TotalMarks"),
    // question: Yup.object().required("Please select the Question"),
    // marks: Yup.string().required("Please enter marks"),
  });

  const fileInputRef = createRef();
  const formikRef = useRef();

  console.log("location.state--", location.state);
  const getInitialList = async () => {
    try {
      const getselectedquestionlist = await LMSApi.viewQuizDetail(
        location.state?.quiz?.name
      );
      console.log("getselectedquestionlist--", getselectedquestionlist);
      // return;
      setBasicQuestionDetail(
        getselectedquestionlist.data.message.data.quiz_detail
      );
      setQuestionList(getselectedquestionlist.data.message.data.quiz_question);
      dispatch(
        lmsSliceActions.replaceQuestionList(
          getselectedquestionlist.data.message.data.quiz_question
        )
      );
      // const getquestionlist = await LMSApi.getQuestionDetail();
      // console.log("getquestionlist--", getquestionlist.data.data);

      // setQuestionList(getquestionlist.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      console.log("values--", values, questionList);
      // return;
      setMarksErrorView(false);
      setQuestionErrorView(false);
      if (questionList.length === 0) {
        setArrayLength(true);
        setLoad(false);
        // return;
      }

      let questionDetailArray = questionList.map((obj) => {
        console.log("obj--", obj);
        return {
          question: obj.questionName,
          marks: 4,
        };
      });
      console.log(
        "questionDetailArray--->",
        values.title,
        values.percentage,
        questionDetailArray
      );
      const assignquestionarr = await LMSApi.savequestionarray(
        values.title,
        values.percentage,
        questionDetailArray
      );
      console.log("assignquestionarr---", assignquestionarr);

      if (!assignquestionarr.ok) {
        setLoad(false);
        return;
      }
      toast.success("Quiz Created Successfully");
      setLoad(false);
      resetForm();
      setQuestionList([]);
      // dispatch(lmsSliceActions.removeQuestionList());
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleEditSubmit = async (values, { resetForm }) => {
    try {
      setLoad(true);
      console.log("values--", values, questionList);
      // return;
      setMarksErrorView(false);
      setQuestionErrorView(false);
      if (questionList.length === 0) {
        setArrayLength(true);
        setLoad(false);
        // return;
      }
      // if (values.question && values.marks) {
      //   handleAddQuestion(values);
      // }

      let questionDetailArray = questionList.map((obj) => {
        console.log("obj--", obj);
        return {
          question: obj.questionName,
          marks: 4,
        };
      });
      console.log(
        "questionDetailArray--->",
        values.title,
        values.percentage,
        questionDetailArray
      );

      const updatequestionarr = await LMSApi.updatequestionarray(
        location.state.quiz.name,
        values.title,
        values.percentage,
        questionDetailArray
      );
      console.log("updatequestionarr---", updatequestionarr);
      if (!updatequestionarr.ok) {
        setLoad(false);
        return;
      }
      toast.success("Quiz Updated Successfully");
      setLoad(false);
      resetForm();
      setQuestionList([]);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  // Function to delete Employee from the list
  const handleDeleteEmployee = (item) => {
    console.log("item--", item);
    dispatch(lmsSliceActions.removeQuestion(item.questionName));
  };
  const getQuestionDetail = async (item) => {
    const getQuestionData = await LMSApi.getQuestionData(item.questionName);
    // return;
    console.log("getQuestionData--", getQuestionData.data.data);
    navigate("/update-quiz-question", {
      state: {
        question: getQuestionData.data.data,
        quiz: location.state?.quiz,
        passing_percentage: location.state?.quiz?.passing_percentage,
      },
    });

    return;
  };
  useEffect(() => {
    console.log("location.state--", location.state);
    if (!location.state?.api_call_false) {
      getInitialList();
    }
  }, []);
  // const isFormValid = title && percentage;
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
        <div className="row no-gutters">
          {location.state?.quiz ? (
            <ScreenTitle
              customTitle="Edit Quiz"
              titleClass="page-heading-position-report"
            />
          ) : (
            <ScreenTitle
              customTitle="New Quiz"
              titleClass="page-heading-position-report"
            />
          )}

          <div className="col-lg-12">
            <a
              href="javascript:void(0)"
              onClick={(e) => navigate("/quiz-list")}
            >
              Quiz
            </a>{" "}
            {location.state?.quiz ? (
              <b>/ {location.state.quiz.title}</b>
            ) : (
              <b>/ New Quiz</b>
            )}
          </div>
        </div>

        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              title: location.state?.quiz ? location.state.quiz.title : null,
              percentage: location.state?.quiz
                ? location.state.quiz.passing_percentage
                : null,
              // totalmarks: null,
              question: null,
              marks: null,
            }}
            validationSchema={FormSchema}
            onSubmit={location.state?.quiz ? handleEditSubmit : handleSubmit}
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
                  <>
                    <div className="col-lg-8">
                      <TextFieldFormik
                        tabIndex={1}
                        id="title"
                        label="Title"
                        onChange={(e) => {
                          setUnSavedChanges(true);
                          setFieldTouched("title", false);
                          setFieldValue("title", e.target.value);
                        }}
                        style={{ width: "100%" }}
                        mandatory={1}
                      />

                      {/* <TextFieldFormik
                        tabIndex={2}
                        id="attempts"
                        label="Max Attempts"
                        onChange={(e) => {
                          setUnSavedChanges(true);
                          setFieldTouched("attempts", false);
                          setFieldValue("attempts", e.target.value);
                        }}
                        style={{ width: "100%" }}
                        mandatory={1}
                      /> */}

                      <TextFieldFormik
                        tabIndex={2}
                        id="percentage"
                        label="Passing Percentage"
                        placeholder={"Passing %"}
                        onChange={(e) => {
                          setUnSavedChanges(true);
                          setFieldTouched("percentage", false);
                          setFieldValue("percentage", e.target.value);
                        }}
                        style={{ width: "25%" }}
                        mandatory={1}
                      />

                      {/* <TextFieldFormik
                        tabIndex={4}
                        id="totalmarks"
                        label="Total Marks"
                        onChange={(e) => {
                          setUnSavedChanges(true);
                          setFieldTouched("totalmarks", false);
                          setFieldValue("totalmarks", e.target.value);
                        }}
                        style={{ width: "100%" }}
                        mandatory={1}
                      /> */}
                    </div>
                    <div className="p-0 mt-1 text-right">
                      <Button
                        text={"Add Question"}
                        type="button"
                        frmButton={false}
                        isTable={true}
                        onClick={(e) => {
                          navigate("/quiz-question", {
                            state: {
                              quiz: location.state?.quiz
                                ? location.state.quiz
                                : null,
                              passing_percentage:
                                location.state?.quiz?.passing_percentage,
                            },
                          });
                        }}

                        // disabled={!isFormValid} // Disable the button if the form is not valid
                        // />
                      />
                    </div>
                    {questionList.length > 0 ? (
                      <div className="row no-gutters mt-3">
                        <div className="table">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th>Questions</th>
                                {/* <th width="2%">Setting</th> */}
                                <th width="2%"></th>
                                {/* <th width="5%">Edit</th> */}
                              </tr>
                            </thead>

                            <tbody>
                              {questionList.map((item, index) => {
                                return (
                                  <tr>
                                    <td class="text-center">{index + 1}</td>
                                    <td>
                                      <a
                                        href="javascript:void(0)"
                                        onClick={(e) => {
                                          getQuestionDetail(item);
                                        }}
                                      >
                                        {item.questionTitle}
                                      </a>
                                    </td>

                                    {/* <td align="center">
                                      <SettingsIcon
                                        style={{
                                          width: "1em",
                                          height: "1em",
                                          cursor: "pointer",
                                        }}
                                        // onClick={(e) => {
                                        //   setOpenModal(true);
                                        //   setEditData(item);
                                        // }}
                                      />
                                    </td> */}
                                    <td>
                                      <Button
                                        isTable={true}
                                        type="button"
                                        className="plus-button"
                                        text="-"
                                        onClick={() =>
                                          handleDeleteEmployee(item)
                                        }
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                              {/* <tr key={1}>
                                <td>{questionList.length + 1}</td> */}

                              {/* <td>
                                  <SelectFieldFormik
                                    id="question"
                                    placeholder="Questions"
                                    tabIndex={1}
                                    mandatory={1}
                                    getOptionLabel={(option) => option.question}
                                    getOptionValue={(option) => option.question}
                                    options={questionlist}
                                    searchIcon={false}
                                    customErrorMessage={
                                      questionErrorView
                                        ? "Please select Question"
                                        : ""
                                    }
                                    onChange={(text) => {
                                      setFieldValue("question", text);
                                      setQuestion(text);
                                      setUnSavedChanges(true);
                                      setArrayLength(false);
                                      setQuestionErrorView(false);
                                    }}
                                  />
                                </td> */}
                              {/* <td align="center">
                                  <SettingsIcon
                                    style={{
                                      width: "1em",
                                      height: "1em",
                                      cursor: "pointer",
                                    }}
                                    // onClick={(e) => {
                                    //   setOpenModal(true);
                                    //   setEditData(item);
                                    // }}
                                  />
                                </td> */}
                              {/* <td width="10">
                                  <TextFieldFormik
                                    id="marks"
                                    mandatory={1}
                                    style={{ width: "80%" }}
                                    error={
                                      marksErrorView ? "Please enter marks" : ""
                                    }
                                    onChange={(e) => {
                                      setFieldValue("marks", e.target.value);
                                      setMarks("marks", e.target.value);
                                      setUnSavedChanges(true);
                                      setMarksErrorView(false);
                                    }}
                                  />
                                </td> */}
                              {/* <td>
                                  <Button
                                    isTable={true}
                                    className="plus-button"
                                    type="button"
                                    text="+"
                                    // onClick={() => {
                                    //   handleAddQuestion(values);
                                    // }}
                                  />
                                </td> */}
                              {/* </tr> */}
                            </tbody>
                          </table>

                          <ErrorMessage
                            Message={"Please add Question"}
                            view={arraylength}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="row no-gutters mt-3">
                        <div className="card">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th>Question Name</th>
                                <th width="10%" class="text-center">
                                  Setting
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td colspan={6} align="center">
                                  No Questions found
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    <Button
                      tabIndex={7}
                      text={"F4-Save"}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                      }}
                    />
                  </>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default TestQuiz;
