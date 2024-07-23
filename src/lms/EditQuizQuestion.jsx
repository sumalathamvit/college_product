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
import SettingsIcon from "@mui/icons-material/Settings";
import LMSApi from "../api/LMSApi";
import HTMLEditor from "../component/FormField/HTMLEditor";
import TextAreaField from "../component/FormField/TextareaField";
import TextAreaFieldFormik from "../component/FormField/TextareaFieldFormik";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import HeadingIcon from "@mui/icons-material/School";
import { useDispatch } from "react-redux";
import { lmsSliceActions } from "../store/lms-clice";

function EditQuizQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  const formilRef = useRef();
  const [load, setLoad] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const dispatch = useDispatch();

  const contentRef = useRef();
  const insContentRef = useRef();

  const formSchema = Yup.object().shape({
    question: Yup.string().required("Please enter the Question"),
    option1: Yup.string().required("Please enter the Option 1"),
    option2: Yup.string().required("Please enter the Option 2"),
    option3: Yup.string().required("Please enter the Option 3"),
    option4: Yup.string().required("Please enter the Option 4"),
    correctanswer: Yup.object().required("Please Select the option"),
    // explanation: Yup.string().required("Please enter the Explanation"),
  });
  const answeroption = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
    { value: "4", label: "Option 4" },
  ];
  const handleUpdateTopic = async (values, { resetForm }) => {
    console.log("values--------------", values);
    let passingParam = {
      question: values.question,
      type: "Choices",
      option_1: values.option1,
      explanation_1:
        values.correctanswer.value === "1" ? values.explanation : "",
      is_correct_1: values.correctanswer.value === "1" ? 1 : 0,
      option_2: values.option2,
      explanation_2:
        values.correctanswer.value === "2" ? values.explanation : "",
      is_correct_2: values.correctanswer.value === "2" ? 1 : 0,
      option_3: values.option3,
      is_correct_3: values.correctanswer.value === "3" ? 1 : 0,
      explanation_3:
        values.correctanswer.value === "3" ? values.explanation : "",
      option_4: values.option4,
      explanation_4:
        values.correctanswer.value === "4" ? values.explanation : "",
      is_correct_4: values.correctanswer.value === "4" ? 1 : 0,
    };

    // return;
    console.log(location.state.question.name, "checking");
    try {
      setLoad(true);
      const updateQuizQuestionRes = await LMSApi.editQuestion(
        location.state.question.name,
        passingParam
      );
      console.log("updateQuizQuestionRes--", updateQuizQuestionRes);
      //   return;
      if (updateQuizQuestionRes.ok) {
        dispatch(
          lmsSliceActions.updateQuestion({
            question: updateQuizQuestionRes.data.data.question,
            name: updateQuizQuestionRes.data.data.name,
          })
        );
        toast.success("Question updated successfully");
        setLoad(false);
        resetForm();
        navigate("/quiz-test", {
          state: {
            question: updateQuizQuestionRes.data.data.question,
            name: updateQuizQuestionRes.data.data.name,
            quiz: location.state?.quiz,
            passing_percentage: location.state.question.passing_percentage,
          },
        });
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };
  useEffect(() => {
    console.log("location--", location.state.question);
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
      {/* <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} /> */}
      <div className="row no-gutters bg-white-report">
        <div className="row no-gutters">
          <div className="page-heading">
            <div>
              <HeadingIcon className="page-heading-position-report" />
              Quiz Questions
            </div>
          </div>

          <div className="col-lg-12">
            <a
              href="javascript:void(0)"
              onClick={(e) => navigate("/quiz-list")}
            >
              Quiz
            </a>{" "}
            /
            <a
              href="javascript:void(0)"
              onClick={(e) =>
                navigate("/quiz-test", {
                  state: {
                    quiz: location.state?.quiz,
                    passing_percentage:
                      location.state.question.passing_percentage,
                  },
                })
              }
            >
              {location.state?.quiz.title}
            </a>{" "}
            <b>/ Edit Quiz Question</b>
          </div>
        </div>
        <div className="row no-gutters mt-3">
          <Formik
            enableReinitialize={false}
            innerRef={formilRef}
            initialValues={{
              question: location.state.question.question,
              option1: location.state.question.option_1,
              option2: location.state.question.option_2,
              option3: location.state.question.option_3,
              option4: location.state.question.option_4,
              correctanswer:
                location.state.question.is_correct_1 === 1
                  ? answeroption[0]
                  : location.state.question.is_correct_2 === 1
                  ? answeroption[1]
                  : location.state.question.is_correct_3 === 1
                  ? answeroption[2]
                  : answeroption[3],
              explanation:
                location.state.question.is_correct_1 === 1
                  ? location.state.question.explanation_1
                  : location.state.question.is_correct_2 === 1
                  ? location.state.question.explanation_2
                  : location.state.question.is_correct_3 === 1
                  ? location.state.question.explanation_3
                  : location.state.question.explanation_4,
            }}
            validationSchema={formSchema}
            onSubmit={handleUpdateTopic}
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
                    <TextAreaFieldFormik
                      id="question"
                      label="Question"
                      tabIndex={1}
                      labelSize={3}
                      value={values.question}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("question", e.target.value);
                      }}
                    />

                    <TextFieldFormik
                      label="Option 1"
                      labelSize={3}
                      tabIndex={2}
                      id="option1"
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("option1", e.target.value);
                      }}
                    />
                    <TextFieldFormik
                      label="Option 2"
                      labelSize={3}
                      tabIndex={3}
                      id="option2"
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("option2", e.target.value);
                      }}
                    />
                    <TextFieldFormik
                      label="Option 3"
                      labelSize={3}
                      tabIndex={4}
                      id="option3"
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("option3", e.target.value);
                      }}
                    />
                    <TextFieldFormik
                      label="Option 4"
                      placeholder="Option 4"
                      labelSize={3}
                      tabIndex={5}
                      id="option4"
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("option4", e.target.value);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={1}
                      label={"Correct Answer"}
                      id="correctanswer"
                      mandatory={1}
                      labelSize={3}
                      //   labelSize={3}
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      options={answeroption}
                      style={{ width: "25%" }}
                      onChange={(text) => {
                        // setShowSubject(false);
                        setFieldValue("correctanswer", text);
                        console.log("text--", text);
                        // getBatchMaster(text);
                      }}
                    />
                    <TextAreaFieldFormik
                      autoFocus
                      label=" Explanation"
                      labelSize={3}
                      tabIndex={7}
                      id="explanation"
                      searchIcon={true}
                      onChange={(e) => {
                        setFieldValue("explanation", e.target.value);
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
      </div>
    </div>
  );
}
export default EditQuizQuestion;
