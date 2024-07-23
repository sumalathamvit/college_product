import React, { useEffect, useState, useRef } from "react";
import * as Yup from "yup";
import HeadingIcon from "@mui/icons-material/School";
import { Formik } from "formik";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import TextField from "../component/FormField/TextField";
import ModalComponent from "../component/ModalComponent";
import LMSApi from "../api/LMSApi";
import SettingsIcon from "@mui/icons-material/Settings";
import ScreenTitle from "../component/common/ScreenTitle";
import { lmsSliceActions } from "../store/lms-clice";
import { useDispatch } from "react-redux";

const FormSchema = Yup.object().shape({
  quizName: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .matches(/^[A-Za-z0-9@., -]+$/, "Please enter valid Quiz Name")
    .required("Please enter Quiz Name")
    .trim(),
});

function QuizList() {
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [editdata, setEditData] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const formikRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getInitialList = async () => {
    try {
      setLoad(true);

      const getquizlist = await LMSApi.getQuizList();
      console.log("getquizlist--", getquizlist);
      setData(getquizlist.data.data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  const handleEditQuiz = async (values) => {
    console.log("testing---", values, editdata.title);

    if (editdata.title == values.quizName) {
      // getAllList();

      setModalMessage("No changes made");
      setModalErrorOpen(true);
      setModalTitle("Message");
      setOpenModal(false);
      setLoad(false);
      // return;

      // toast.success("No changes made", {
      //   autoClose: 1000, // time in milliseconds, 5000ms = 5 seconds
      // });
      // setOpenModal(false);
      return;
    }
    try {
      const editquizname = await LMSApi.editQuizDetail(
        editdata.name,
        values.quizName
      );
      console.log("editquizname--", editquizname);

      if (editquizname.ok) {
        toast.success("Quiz Name Updated Successfully");
        getInitialList();
        setOpenModal(false);
      } else {
        setLoad(false);
        return;
      }
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  useEffect(() => {
    getInitialList();
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
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <form autoComplete="off">
            <div className="p-0 mt-1 text-right">
              <Button
                text={"New Quiz"}
                type="button"
                frmButton={false}
                isTable={true}
                onClick={(e) => {
                  navigate("/quiz-test", {
                    state: {
                      api_call_false: true,
                    },
                  });
                  dispatch(lmsSliceActions.removeQuestionList());
                }}
              />
            </div>
            {data.length > 0 ? (
              <div className="row no-gutters mt-3">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th>Quiz Name</th>
                        <th width="10%" class="text-center">
                          Setting
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((item, index) => {
                        return (
                          <tr>
                            <td class="text-center">{index + 1}</td>
                            <td>
                              <a
                                href="javascript:void(0)"
                                onClick={(e) => {
                                  navigate("/quiz-test", {
                                    state: { quiz: item },
                                  });
                                }}
                              >
                                {item.title}
                              </a>
                            </td>
                            {/* <td>{item.title}</td> */}
                            <td align="center">
                              <SettingsIcon
                                style={{
                                  width: "1em",
                                  height: "1em",
                                  cursor: "pointer",
                                }}
                                onClick={(e) => {
                                  setOpenModal(true);
                                  setEditData(item);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="row no-gutters mt-3">
                <div className="card">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th>Quiz Name</th>
                        <th width="10%" class="text-center">
                          Setting
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colspan={6} align="center">
                          No Quiz found
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </form>
        </div>
        <Modal
          show={openModal}
          dialogClassName="title-modal"
          onEscapeKeyDown={(e) => setOpenModal(false)}
        >
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              quizName: editdata.title,
            }}
            validationSchema={FormSchema}
            onSubmit={handleEditQuiz}
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
                  <Modal.Header>
                    <Modal.Title> Edit Quiz</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="col-lg-10">
                      <TextFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="QuizName"
                        id="quizName"
                        mandatory={1}
                        style={{ width: "70%" }}
                        onChange={handleChange}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="text-center mt-2">
                      <Button
                        className={"btn me-4"}
                        frmButton={false}
                        tabIndex={12}
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
                          setOpenModal(false);
                        }}
                      />
                    </div>
                    {/* <Button
                      type="submit"
                      text={"F4 - Save"}
                      frmButton={false}
                      tabIndex={12}
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                      id="save"
                    /> */}
                  </Modal.Footer>
                </form>
              );
            }}
          </Formik>
        </Modal>
      </div>
    </div>
  );
}

export default QuizList;
