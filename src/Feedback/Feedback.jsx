import React, {
  useEffect,
  useState,
  createRef,
  useRef,
  useContext,
} from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Formik } from "formik";

import academicApi from "../api/AcademicApi";
import libraryapi from "../api/libraryapi";

import FileField from "../component/FormField/FileField";
import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import TextAreaFieldFormik from "../component/FormField/TextareaFieldFormik";
import ModalComponent from "../component/ModalComponent";
import ScreenTitle from "../component/common/ScreenTitle";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import { allowedFileExtensions } from "../component/common/CommonArray";

import string from "../string";
import storage from "../auth/storage";
import EmployeeApi from "../api/EmployeeApi";
import AuthContext from "../auth/context";

const qualificationSchema = Yup.object().shape({
  screenName: Yup.object().required("Please select Screen Name"),
  comments: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .required("Please enter Comments")
    .trim(),
});

function Feedback() {
  const { role } = useContext(AuthContext);
  const [load, setLoad] = useState(false);
  const fileInputRef = createRef();
  const [image, setImage] = useState([]);
  const [fileType, setFileType] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [screenNameList, setScreenNameList] = useState([]);
  const formikRef = useRef();

  const handleImage = (e) => {
    console.log(e.target.files);
    let fType = [];
    let fImage = [];
    for (let i = 0; i < e.target.files.length; i++) {
      if (e.target.files[i].size > string.MATERIAL_FILE_SIZE) {
        setModalTitle("File Size");
        setModalMessage("Please choose file size less than 2MB");
        setModalErrorOpen(true);
        fileInputRef.current.value = "";
        return false;
      }
      if (
        allowedFileExtensions.indexOf(
          e.target.files[i].name.split(".")[1].toLowerCase()
        ) === -1
      ) {
        setModalTitle("File Type");
        setModalMessage("Please upload pdf, jpeg, jpg, png file only");
        setModalErrorOpen(true);
        fileInputRef.current.value = "";
        return false;
      }
      fType.push("file" + (i + 1) + "." + e.target.files[i].name.split(".")[1]);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          fImage.push(reader.result);
        }
      };
      reader.readAsDataURL(e.target.files[i]);
    }
    setFileType(fType);
    setImage(fImage);
  };

  const handleSave = async (values) => {
    if (load) return;
    console.log("values---", values, fileType);
    console.log("fileType---", fileType);
    console.log("image---", image);
    try {
      setLoad(true);
      const collegeName = storage.getCollegeName();
      let msg = "";
      console.log("role---", role);
      if (role.toUpperCase() == string.SUPER_ADMIN_ROLE) {
        msg =
          "Name : Super Admin" +
          "\nInstitute Name : " +
          collegeName +
          "\nScreen Name : " +
          values?.screenName?.form +
          "\nComment : " +
          values.comments;
      } else {
        const empName = storage.getEmployeeName();
        const getEmployeeDetailsByEmailRes =
          await EmployeeApi.getEmployeeDetailsByEmail(
            sessionStorage.getItem("email")
          );
        console.log(
          "getEmployeeDetailsByEmailRes---",
          getEmployeeDetailsByEmailRes
        );
        const mobile = getEmployeeDetailsByEmailRes.data.data[0].cell_number;

        msg =
          "Name : " +
          empName +
          "\nMobile : " +
          mobile +
          "\nInstitute Name : " +
          collegeName +
          "\nScreen Name : " +
          values?.screenName?.form +
          "\nComment : " +
          values.comments;
      }

      const sendFeedbackEmailRes = await academicApi.sendFeedbackEmail(
        collegeName + " - " + "Support",
        msg,
        fileType,
        image
      );
      formikRef.current.resetForm();
      console.log("sendFeedbackEmailRes---", sendFeedbackEmailRes);
      toast.success("Contact Mail Sent Successfully");
      setImage([]);
      setFileType([]);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const getAllMaster = async () => {
    const getUserSettingByUserRes = await libraryapi.getUserSettingByUser(
      sessionStorage.getItem("email")
    );
    console.log("getUserSettingByUserRes---", getUserSettingByUserRes);
    setScreenNameList(getUserSettingByUserRes.data.message.data.user_setting);
  };

  useEffect(() => {
    getAllMaster();
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
        <Formik
          innerRef={formikRef}
          enableReinitialize={false}
          initialValues={{
            screenName: null,
            comments: "",
            certFile: null,
          }}
          validationSchema={qualificationSchema}
          onSubmit={handleSave}
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
                <div className="col-lg-9">
                  {/* <div className="row no-gutters mt-1">
                    <div className="col-lg-5 text-right pe-3 mt-2">
                      <label>Rating</label>
                    </div>
                    <div className="col-lg-7 p-0">
                      <Rating
                        size="large"
                        name="simple-controlled"
                        value={rating}
                        onChange={(event, newValue) => {
                          setRating(newValue);
                          console.log("newValue---", newValue);
                        }}
                      />
                    </div>
                  </div> */}
                  <SelectFieldFormik
                    id="screenName"
                    label="Screen Name"
                    mandatory={1}
                    getOptionLabel={(option) => option.form}
                    getOptionValue={(option) => option.formID}
                    options={screenNameList}
                    onChange={(e) => {
                      setFieldValue("screenName", e);
                    }}
                  />
                  <TextAreaFieldFormik
                    id="comments"
                    label="Comments"
                    placeholder="Type your experience..."
                    onChange={(e) => {
                      setFieldValue("comments", e.target.value);
                    }}
                    mandatory={1}
                    rows={5}
                  />
                  <FileField
                    ref={fileInputRef}
                    label="Attachment"
                    id="certFile"
                    error={errors.certFile}
                    multiple
                    // style={{ width: "80%" }}
                    touched={touched.certFile}
                    onChange={(e) => {
                      console.log(fileInputRef, "file");
                      setFieldValue("certFile", e.target.files);
                      handleImage(e);
                    }}
                    accept=".pdf, image/*"
                  />
                </div>
                <Button
                  text="Submit"
                  type="submit"
                  onClick={(e) => preFunction.handleErrorFocus(errors)}
                />
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default Feedback;
