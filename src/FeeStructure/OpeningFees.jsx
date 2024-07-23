import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import moment from "moment";
import { useSelector } from "react-redux";
import * as Yup from "yup";

import StudentApi from "../api/StudentApi";

import AuthContext from "../auth/context";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextField from "../component/FormField/TextField";
import ReactSelectField from "../component/FormField/ReactSelectField";
import ModalComponent from "../component/ModalComponent";
import ErrorMessage from "../component/common/ErrorMessage";
import ScreenTitle from "../component/common/ScreenTitle";
import CheckboxField from "../component/FormField/CheckboxField";
import DateField from "../component/FormField/DateField";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import DisplayText from "../component/FormField/DisplayText";

function OpeningFees() {
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openFullFeeModal, setOpenFullFeeModal] = useState(false);
  const [courseModal, setCourseModal] = useState();
  const [admissionModal, setAdmissionModal] = useState();

  const [particularError, setParticularError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState(false);
  const [courseList, setCourseList] = useState([]);

  const [filterChange, setFilterChange] = useState(false);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [particularList, setParticularList] = useState([]);
  const [masterList, setMasterList] = useState([]);
  const [particulars, setParticulars] = useState([]);
  const [oldParticulars, setOldParticulars] = useState([]);
  const [amountArr, setAmountArr] = useState([]);

  const [feeStructureId, setFeeStructureId] = useState();
  const [feeStructureDetails, setFeeStructureDetails] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [showRes, setShowres] = useState(false);
  const [particular, setParticular] = useState("");
  const [courseDuration, setCourseDuration] = useState(0);
  const formikRef = useRef();
  const modalFormikRef = useRef();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const { unSavedChanges, setUnSavedChanges, collegeId } =
    useContext(AuthContext);

  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  const [discountString, setDiscountString] = useState();
  const [payFeeConcessionAmt, setPayFeeConcessionAmt] = useState();
  const [payFeeDueDate, setPayFeeDueDate] = useState();
  const [dueDateError, setDueDateError] = useState(false);
  const [disAmountError, setDisAmountError] = useState(false);
  const [disPercentError, setDisPercentError] = useState(false);
  const [payFullFeeError, setPayFullFeeError] = useState(false);
  const [totalPayFullFee, setTotalPayFullFee] = useState(0);
  const [payFeeDisPercent, setPayFeeDisPercent] = useState(0);

  const FullFeeFormSchema = Yup.object().shape({
    discountAmount: Yup.number().required("Please enter Discount Amount"),
    discountPercent: Yup.number().required("Please enter Discount Percent"),
    discountDate: Yup.string().required("Please enter Offer Ends On Date"),
  });

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required(
      collegeConfig.institution_type == 1
        ? "Please select " + RENAME?.sem
        : "Please select " + RENAME?.batch
    ),
    admissionType: Yup.object().required("Please select Admission Type"),
  });

  const handleAddPayFullFeeDiscount = async () => {
    if (disAmountError || disPercentError) {
      document.getElementById("discountAmount")?.focus();
      return;
    }
    if (modalFormikRef.current.values.discountAmount > oldParticulars[0].sem1) {
      document.getElementById("discountAmount")?.focus();
      setDisAmountError(true);
      return;
    }
    let particulars = [];
    for (let k = 0; k < oldParticulars.length; k++) {
      if (oldParticulars[k].payFullFee) {
        particulars.push({ particularID: oldParticulars[k].particularID });
      }
    }
    let passJson = {
      PARTICULARS: particulars,
      CONCESSION_AMOUNT: modalFormikRef.current.values.discountAmount,
      DUE_DATE: modalFormikRef.current.values.discountDate,
    };
    console.log("passJson--", passJson);
    if (discountString == JSON.stringify(passJson)) {
      setModalMessage("No changes made");
      setModalErrorOpen(true);
      setModalTitle("Message");
      return;
    }
    try {
      const updateFeesStructureRes = await StudentApi.updatePayFullFeeDiscount(
        feeStructureId,
        JSON.stringify(passJson)
      );
      console.log("updateFeesStructureRes---", updateFeesStructureRes);
      if (!updateFeesStructureRes.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(updateFeesStructureRes.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setOpenFullFeeModal(false);
      toast.success(updateFeesStructureRes.data.message.message);
      handleCheckDuplicateFeeStructure(formikRef.current.values, true);
      setLoad(false);
      return;
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const calculateTotalPayFullFee = () => {
    let total = 0;
    for (let k = 0; k < oldParticulars.length; k++) {
      if (oldParticulars[k].payFullFee)
        total += parseInt(oldParticulars[k].sem1);
    }
    setTotalPayFullFee(total);
    handleDiscount(
      total,
      modalFormikRef.current.values.discountAmount,
      modalFormikRef.current.values.discountPercent,
      2
    );
  };

  const handleDiscount = (totalPayFullFee, disAmt, disPercent, disType) => {
    console.log("disAmt---", totalPayFullFee, disAmt, disPercent, disType);
    let changed = 0;
    for (let k = 0; k < oldParticulars.length; k++) {
      if (oldParticulars[k].payFullFee) {
        changed = 1;
      }
    }
    if (changed === 0) {
      setPayFullFeeError(true);
      modalFormikRef.current.setFieldValue("discountAmount", "");
      modalFormikRef.current.setFieldValue("discountPercent", "");
      document.getElementById("fullFee0")?.focus();
      return;
    }
    setDisPercentError(false);
    setDisAmountError(false);
    if (disType == 1) {
      if (disPercent > 100) {
        setDisPercentError(true);
        return;
      }
      let amt = parseInt(totalPayFullFee * (disPercent / 100));
      modalFormikRef.current.setFieldValue("discountAmount", amt);
    } else if (disType == 0) {
      if (disAmt > totalPayFullFee) {
        setDisAmountError(true);
        return;
      }
      let amt = Math.round((disAmt / totalPayFullFee) * 100);
      modalFormikRef.current.setFieldValue("discountPercent", amt);
    } else if (
      disType == 2 &&
      modalFormikRef.current.values.discountPercent > 0
    ) {
      let amt = parseInt(totalPayFullFee * (disPercent / 100));
      modalFormikRef.current.setFieldValue("discountAmount", amt);
    }
  };

  const handleCheckDuplicateFeeStructure = async (values, reLoad = false) => {
    if (load) return;
    if (!filterChange && !reLoad) return;
    setParticulars([]);
    setOldParticulars([]);
    setParticularError(false);
    setDueDateError(false);
    setAmountError(false);
    setParticular("");
    let amtArr = [];
    const duration =
      collegeConfig.institution_type === 1 ||
      collegeConfig.institution_type === 5
        ? values.course.duration
        : values.course.duration * 2;
    for (let i = 0; i < duration; i++) {
      amtArr.push({ label: "sem" + (i + 1), value: "" });
    }
    setAmountArr(amtArr);
    try {
      setLoad(true);
      let parList = [];
      if (particularList.length === 0) {
        const masterList = await StudentApi.getMaster(
          5,
          !collegeConfig.is_university ? collegeId : values.college.collegeID
        );
        console.log("masterList----", masterList);
        setShowres(true);
        if (!masterList.data.message.success) {
          setModalMessage(masterList.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        setParticularList(masterList.data.message.data.particular_common_data);
        setMasterList(masterList.data.message.data);
        parList = masterList.data.message.data.particular_common_data;
        document.getElementById("particular")?.focus();
      } else {
        parList = particularList;
      }

      const feeStructure = await StudentApi.feesStructureDetail(
        collegeConfig.institution_type,
        values.course.id,
        values?.batch?.batchID,
        values?.batch?.studyYear,
        values.admissionType.id
      );
      console.log("feeStructure---", feeStructure);
      if (!feeStructure.data.message.success) {
        setModalMessage(feeStructure.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Already Exists");
        setLoad(false);
        return;
      }
      setLoad(false);

      setFilterChange(false);
      setShowres(true);

      setFeeStructureId();
      let payfullFeeParticularId = [];
      if (feeStructure?.data?.message?.data?.feesStructureDetail.length > 0) {
        setFeeStructureDetails(feeStructure.data.message.data);
        setFeeStructureId(feeStructure.data.message.data.feesStructure[0].id);
        if (
          feeStructure.data.message.data.feesStructure[0].discount &&
          feeStructure.data.message.data.feesStructure[0].discount != ""
        ) {
          setDiscountString(
            feeStructure.data.message.data.feesStructure[0].discount
          );
          const payfullFeeJson = JSON.parse(
            feeStructure.data.message.data.feesStructure[0].discount
          );
          console.log("payfullFeeJson---", payfullFeeJson);
          for (let p = 0; p < payfullFeeJson.PARTICULARS.length; p++) {
            payfullFeeParticularId.push(
              payfullFeeJson.PARTICULARS[p].particularID
            );
          }
          setPayFeeConcessionAmt(payfullFeeJson.CONCESSION_AMOUNT);
          setPayFeeDueDate(payfullFeeJson.DUE_DATE);
        }

        let particulars = [];
        for (
          let i = 0;
          i < feeStructure.data.message.data.feesStructureDetail.length;
          i++
        ) {
          let obj = {
            particularID:
              feeStructure.data.message.data.feesStructureDetail[i]
                .particularID,
            particularName:
              feeStructure.data.message.data.feesStructureDetail[i].particular,
            feesStructureDetailID:
              feeStructure.data.message.data.feesStructureDetail[i]
                .feesStructureDetailID,
            dueDate:
              feeStructure.data.message.data.feesStructureDetail[i].dueDate,
            payFullFee: payfullFeeParticularId.includes(
              feeStructure.data.message.data.feesStructureDetail[i].particularID
            )
              ? true
              : false,
          };
          if (
            collegeConfig.institution_type === 1 ||
            collegeConfig.institution_type === 5
          ) {
            obj["sem1"] =
              feeStructure.data.message.data.feesStructureDetail[i].sem1;
          } else {
            for (let j = 0; j < values.course.duration * 2; j++) {
              obj["sem" + (j + 1)] =
                feeStructure.data.message.data.feesStructureDetail[i][
                  "sem" + (j + 1)
                ];
            }
          }
          particulars.push(obj);
          parList = parList.filter(
            (e) =>
              e.id !=
              feeStructure.data.message.data.feesStructureDetail[i].particularID
          );
        }
        setOldParticulars(particulars);
        setParticularList(parList);
        handleUnSavedChanges(0);
        return;
      }
      const masterList = await StudentApi.getMaster(
        5,
        !collegeConfig.is_university ? collegeId : values.college.collegeID
      );
      console.log("masterList----", masterList);
      if (!masterList.data.message.success) {
        setModalMessage(masterList.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setParticularList(masterList.data.message.data.particular_common_data);
      document.getElementById("particular")?.focus();
    } catch (error) {
      setLoad(false);
      console.log("error=--", error);
    }
  };

  const handleSave = async (values, fullFee) => {
    if (load) return;
    setAmountError(false);
    setDueDateError(false);
    if (particulars.length === 0 && oldParticulars.length === 0) {
      let err = false;
      if (!particular) {
        setParticularError(true);
        document.getElementById("particular")?.focus();
        err = true;
        return;
      }
      setAmountError(false);
      let isAmountSet = false;
      for (let k = 0; k < amountArr.length; k++) {
        if (amountArr[k].value > 0) {
          isAmountSet = true;
        }
      }
      if (!isAmountSet) {
        document.getElementById("amount0")?.focus();
        setAmountError(true);
        err = true;
      }
      if (err) {
        setModalErrorOpen(true);
        setModalMessage("Please add atleast one particular");
        document.getElementById("particular")?.focus();
        return;
      } else {
        // handleParticular(values);
        let err = await handleParticular(values);
        if (err) {
          return;
        }
        setParticulars([...particulars]);
      }
    }
    setShowError(false);
    if (
      collegeConfig.institution_type === 1 ||
      collegeConfig.institution_type === 5
    ) {
      for (let k = 0; k < oldParticulars.length; k++) {
        if (!oldParticulars[k].dueDate) {
          setMessage("Please fill all Due Dates");
          setShowError(true);
          document.getElementById("dueDate" + k)?.focus();
          return;
        }
      }
    }
    if (particular) {
      let err = await handleParticular(values);
      if (err) {
        return;
      }
      setParticulars([...particulars]);
    }
    try {
      let dbParticulars = [];
      for (let i = 0; i < oldParticulars.length; i++) {
        if (
          collegeConfig.institution_type == 1 ||
          collegeConfig.institution_type == 5
        ) {
          dbParticulars.push({
            feesStructureDetailID:
              oldParticulars[i].feesStructureDetailID ?? null,
            particularID: oldParticulars[i].particularID,
            sem1: oldParticulars[i].sem1 ? parseInt(oldParticulars[i].sem1) : 0,
            dueDate: moment(oldParticulars[i].dueDate).format("YYYY-MM-DD"),
          });
        } else {
          dbParticulars.push({
            feesStructureDetailID:
              oldParticulars[i].feesStructureDetailID ?? null,
            particularID: oldParticulars[i].particularID,
            sem1: oldParticulars[i].sem1 ? parseInt(oldParticulars[i].sem1) : 0,
            sem2: oldParticulars[i].sem2 ? parseInt(oldParticulars[i].sem2) : 0,
            sem3: oldParticulars[i].sem3 ? parseInt(oldParticulars[i].sem3) : 0,
            sem4: oldParticulars[i].sem4 ? parseInt(oldParticulars[i].sem4) : 0,
            sem5: oldParticulars[i].sem5 ? parseInt(oldParticulars[i].sem5) : 0,
            sem6: oldParticulars[i].sem6 ? parseInt(oldParticulars[i].sem6) : 0,
            sem7: oldParticulars[i].sem7 ? parseInt(oldParticulars[i].sem7) : 0,
            sem8: oldParticulars[i].sem8 ? parseInt(oldParticulars[i].sem8) : 0,
            sem9: oldParticulars[i].sem9 ? parseInt(oldParticulars[i].sem9) : 0,
            sem10: oldParticulars[i].sem10
              ? parseInt(oldParticulars[i].sem10)
              : 0,
            dueDate: moment().format("YYYY-MM-DD"),
          });
        }
      }
      for (let i = 0; i < particulars.length; i++) {
        for (let j = 0; j < 10; j++) {
          particulars[i]["sem" + (j + 1)] =
            particulars[i]["sem" + (j + 1)] == "" ||
            !particulars[i]["sem" + (j + 1)]
              ? 0
              : parseInt(particulars[i]["sem" + (j + 1)]);
        }
        if (
          collegeConfig.institution_type == 1 ||
          collegeConfig.institution_type == 5
        ) {
          dbParticulars.push({
            feesStructureDetailID: particulars[i].feesStructureDetailID ?? null,
            particularID: particulars[i].particularID,
            sem1: parseInt(particulars[i].sem1),
            dueDate: particulars[i].dueDate,
          });
        } else {
          dbParticulars.push({
            feesStructureDetailID: particulars[i].feesStructureDetailID ?? null,
            particularID: particulars[i].particularID,
            sem1: particulars[i].sem1 ?? 0,
            sem2: particulars[i].sem2 ?? 0,
            sem3: particulars[i].sem3 ?? 0,
            sem4: particulars[i].sem4 ?? 0,
            sem5: particulars[i].sem5 ?? 0,
            sem6: particulars[i].sem6 ?? 0,
            sem7: particulars[i].sem7 ?? 0,
            sem8: particulars[i].sem8 ?? 0,
            sem9: particulars[i].sem9 ?? 0,
            sem10: particulars[i].sem10 ?? 0,
            dueDate: moment().format("YYYY-MM-DD"),
          });
        }
      }
      console.log("feeStructureDetails---", feeStructureDetails);
      let changed = 0;
      if (particulars.length === 0) {
        for (
          let k = 0;
          k < feeStructureDetails.feesStructureDetail.length;
          k++
        ) {
          if (
            dbParticulars.findIndex(
              (e) =>
                e.particularID ==
                feeStructureDetails.feesStructureDetail[k].particularID
            ) == -1
          ) {
            changed = 1;
            break;
          } else {
            let obj = dbParticulars.find(
              (e) =>
                e.particularID ==
                feeStructureDetails.feesStructureDetail[k].particularID
            );
            if (
              obj.sem1 != feeStructureDetails.feesStructureDetail[k].sem1 ||
              obj.dueDate != feeStructureDetails.feesStructureDetail[k].dueDate
            ) {
              changed = 1;
              break;
            }
            if (
              obj.sem2 != feeStructureDetails.feesStructureDetail[k].sem2 ||
              obj.dueDate != feeStructureDetails.feesStructureDetail[k].dueDate
            ) {
              changed = 1;
              break;
            }
            if (
              obj.sem3 != feeStructureDetails.feesStructureDetail[k].sem3 ||
              obj.dueDate != feeStructureDetails.feesStructureDetail[k].dueDate
            ) {
              changed = 1;
              break;
            }
            if (
              obj.sem4 != feeStructureDetails.feesStructureDetail[k].sem4 ||
              obj.dueDate != feeStructureDetails.feesStructureDetail[k].dueDate
            ) {
              changed = 1;
              break;
            }
            if (
              obj.sem5 != feeStructureDetails.feesStructureDetail[k].sem5 ||
              obj.dueDate != feeStructureDetails.feesStructureDetail[k].dueDate
            ) {
              changed = 1;
              break;
            }
            if (
              obj.sem6 != feeStructureDetails.feesStructureDetail[k].sem6 ||
              obj.dueDate != feeStructureDetails.feesStructureDetail[k].dueDate
            ) {
              changed = 1;
              break;
            }
            if (
              obj.sem7 != feeStructureDetails.feesStructureDetail[k].sem7 ||
              obj.dueDate != feeStructureDetails.feesStructureDetail[k].dueDate
            ) {
              changed = 1;
              break;
            }
            if (
              obj.sem8 != feeStructureDetails.feesStructureDetail[k].sem8 ||
              obj.dueDate != feeStructureDetails.feesStructureDetail[k].dueDate
            ) {
              changed = 1;
              break;
            }
            if (
              obj.sem9 != feeStructureDetails.feesStructureDetail[k].sem9 ||
              obj.dueDate != feeStructureDetails.feesStructureDetail[k].dueDate
            ) {
              changed = 1;
              break;
            }
            if (
              obj.sem10 != feeStructureDetails.feesStructureDetail[k].sem10 ||
              obj.dueDate != feeStructureDetails.feesStructureDetail[k].dueDate
            ) {
              changed = 1;
              break;
            }
          }
        }

        console.log("changed---", changed);
        if (changed == 0) {
          if (fullFee == 1) {
            let total = 0;
            for (let i = 0; i < oldParticulars.length; i++) {
              if (oldParticulars[i].payFullFee)
                total += parseInt(oldParticulars[i].sem1);
            }
            setPayFeeDisPercent(
              total > 0 ? Math.round((payFeeConcessionAmt / total) * 100) : 0
            );
            setTotalPayFullFee(total);
            setOpenFullFeeModal(true);
            return;
          }
          setModalMessage("No changes made");
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
      }
      let valueGiven = 0;
      for (let i = 0; i < dbParticulars.length; i++) {
        if (
          dbParticulars[i].sem1 != 0 ||
          dbParticulars[i].sem2 != 0 ||
          dbParticulars[i].sem3 != 0 ||
          dbParticulars[i].sem4 != 0 ||
          dbParticulars[i].sem5 != 0 ||
          dbParticulars[i].sem6 != 0 ||
          dbParticulars[i].sem7 != 0 ||
          dbParticulars[i].sem8 != 0 ||
          dbParticulars[i].sem9 != 0 ||
          dbParticulars[i].sem10 != 0
        ) {
          valueGiven = 1;
          break;
        }
      }
      if (valueGiven == 0) {
        setModalMessage("Please enter atleast one value");
        setModalErrorOpen(true);
        setModalTitle("Message");
        document.getElementById("amount1")?.focus();
        setLoad(false);
        return;
      }

      setLoad(true);
      console.log("dbParticulars---", dbParticulars);
      if (feeStructureId) {
        const updateFeesStructureRes = await StudentApi.updateFeesStructure(
          collegeConfig.institution_type,
          values?.batch?.semester,
          values.course.id,
          values?.course?.duration,
          values?.batch?.batchID,
          values.admissionType.id,
          feeStructureId,
          dbParticulars
        );
        console.log("updateFeesStructureRes---", updateFeesStructureRes);
        if (!updateFeesStructureRes.data.message.success) {
          setModalMessage(updateFeesStructureRes.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Already Exists");
          setLoad(false);
          return;
        }
        toast.success(updateFeesStructureRes.data.message.message);
        handleUnSavedChanges(0);
        setParticulars([]);
        setParticularError(false);
        setAmountError(false);
        setDueDateError(false);
        setAmountArr([]);
        setParticular("");
        formikRef.current.resetForm();
        formikRef.current.setFieldValue(
          "course",
          courseList.length === 1 ? courseList[0] : null
        );
        formikRef.current.setFieldValue(
          "admissionType",
          admissionTypeList.length === 1 ? admissionTypeList[0] : null
        );
        formikRef.current.setFieldValue(
          "batch",
          batchList.length === 1 ? batchList[0] : null
        );
        setShowres(false);
        setLoad(false);
        return;
      }
      setAmountError(false);

      const feeStructure = await StudentApi.addFeesStructure(
        collegeConfig.institution_type,
        values?.batch?.semester,
        values.course.id,
        values?.course?.duration,
        values?.batch?.batchID,
        values.admissionType.id,
        dbParticulars
      );
      console.log("feeStructure---", feeStructure);

      if (!feeStructure.data.message.success) {
        setModalMessage(feeStructure.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Already Exists");
        setLoad(false);
        return;
      }
      if (fullFee == 1) {
        let total = 0;
        for (let i = 0; i < oldParticulars.length; i++) {
          total += parseInt(oldParticulars[i].sem1);
        }
        setTotalPayFullFee(total);
        setOpenFullFeeModal(true);
        return;
      }
      toast.success(feeStructure.data.message.message);
      handleUnSavedChanges(0);
      setParticulars([]);
      setParticularError(false);
      setAmountError(false);
      setDueDateError(false);
      setAmountArr([]);
      setParticular("");
      formikRef.current.resetForm();
      formikRef.current.setFieldValue(
        "course",
        courseList.length === 1 ? courseList[0] : null
      );
      formikRef.current.setFieldValue(
        "admissionType",
        admissionTypeList.length === 1 ? admissionTypeList[0] : null
      );
      formikRef.current.setFieldValue(
        "batch",
        batchList.length === 1 ? batchList[0] : null
      );
      setShowres(false);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleParticular = async () => {
    setParticularError(false);
    setAmountError(false);
    setDueDateError(false);
    let err = false;
    if (!particular) {
      setParticularError(true);
      err = true;
      document.getElementById("particular")?.focus();
      return;
    }
    setAmountError(false);
    let isAmountSet = false;
    for (let k = 0; k < amountArr.length; k++) {
      if (amountArr[k].value != "" && amountArr[k].value > 0) {
        isAmountSet = true;
      }
    }
    if (!isAmountSet) {
      document.getElementById("amountNew")?.focus();
      setAmountError(true);
      err = true;
      return;
    }
    if (
      collegeConfig.institution_type === 1 ||
      collegeConfig.institution_type === 5
    ) {
      if (!amountArr[0].dueDate || amountArr[0].dueDate == "") {
        document.getElementById("dueDateNew")?.focus();
        err = true;
        setDueDateError(true);
      }
    }
    if (err) return false;
    let particularlist = particulars;
    let obj = {
      particularID: particular.id,
      particularName: particular.particular,
      dueDate:
        collegeConfig.institution_type === 1 ||
        collegeConfig.institution_type === 5
          ? amountArr[0].dueDate
          : null,
    };
    for (let k = 0; k < amountArr.length; k++) {
      obj[amountArr[k].label] = amountArr[k].value;
      obj[amountArr[k].label] = amountArr[k].value;
    }
    particularlist.push(obj);
    setParticulars(particularlist);
    let arr = particularList.filter((e) => e.id != particular.id);
    setParticularList(arr);

    setParticular("");
    for (let k = 0; k < amountArr.length; k++) {
      amountArr[k].value = "";
      amountArr[k].dueDate = "";
    }
    setAmountArr([...amountArr]);
    document.getElementById("particular")?.focus();
    return false;
  };

  const handleDeleteParticular = (item) => {
    const deleteParticular = particulars.filter((m) => m !== item);
    setParticulars(deleteParticular);
    let arr = particularList;
    arr.push({
      id: item.particularID,
      particular: item.particularName,
    });
    setParticularList(arr);
    document.getElementById("particular")?.focus();
  };

  const getClassData = async (course) => {
    try {
      let classList = await StudentApi.getMaster(8, collegeId, course.id);
      console.log("classList---", classList);
      setBatchList(classList.data.message.data.semester_data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCourseList = async (college_id) => {
    try {
      let masterList;
      if (
        collegeConfig.institution_type === 1 ||
        collegeConfig.institution_type === 5
      )
        masterList = await StudentApi.getMaster(8, college_id);
      else masterList = await StudentApi.getMaster(2, college_id);
      console.log("masterList---", masterList);
      if (!masterList.data.message.success) {
        setModalMessage(masterList.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(masterList.data.message.data.course_data);
      if (masterList.data.message.data.course_data.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          masterList.data.message.data.course_data[0]
        );
        getClassData(masterList.data.message.data.course_data[0]);
      }
      setAdmissionTypeList(masterList.data.message.data.admission_type_data);
      if (masterList.data.message.data.admission_type_data.length === 1) {
        formikRef.current.setFieldValue(
          "admissionType",
          masterList.data.message.data.admission_type_data[0]
        );
      }
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleCourse = async (values) => {
    formikRef.current.setFieldValue("batch", null);
    formikRef.current.setFieldValue(
      "admissionType",
      admissionTypeList.length === 1 ? admissionTypeList[0] : null
    );
    formikRef.current.setFieldValue("particular", null);
    formikRef.current.setFieldValue("amount", null);
    setCourseDuration(values.duration * 2);
    setParticulars([]);

    if (values) {
      const batchRes = await StudentApi.getMaster(
        5,
        !collegeConfig.is_university ? collegeId : values.collegeID,
        values.id
      );
      console.log("batchRes----", batchRes);
      if (!batchRes.data.message.success) {
        setModalMessage(batchRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        return;
      }

      if (batchRes.data.message.data.new_batch_data.length === 0) {
        formikRef.current.setFieldValue("batch", {
          batchID: null,
          batchYear:
            "1 Year (" +
            moment().format("yyyy") +
            "-" +
            moment().add(values.duration, "years").format("yyyy") +
            ")",
          batch:
            moment().format("yyyy") +
            "-" +
            moment().add(values.duration, "years").format("yyyy"),
          studyYear: 1,
          semester: 1,
        });
        return;
      }
      formikRef.current.setFieldValue(
        "batch",
        batchRes.data.message.data.new_batch_data[0]
      );
    }
  };

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getCourseList(collegeId);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
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
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formikRef}
            enableReinitialize={false}
            initialValues={{
              college: null,
              course: courseList.length === 1 ? courseList[0] : null,
              batch: batchList.length === 1 ? batchList[0] : null,
              admissionType:
                admissionTypeList.length === 1 ? admissionTypeList[0] : null,
              particular: null,
              amount: null,
            }}
            validationSchema={FormSchema}
            onSubmit={handleCheckDuplicateFeeStructure}
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
                  <div className="row no-gutters">
                    <div className="col-lg-2"></div>
                    <div className="col-lg-8 p-3">
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={0}
                          labelSize={3}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          style={{ width: "80%" }}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            if (unSavedChanges) {
                              setOpenModal(true);
                              setCourseModal(text);
                            } else {
                              setShowres(false);
                              setFieldValue("college", text);
                              setFieldValue("course", null);
                              setFieldValue("batch", null);
                              setFieldValue(
                                "admissionType",
                                admissionTypeList.length === 1
                                  ? admissionTypeList[0]
                                  : null
                              );
                              handleUnSavedChanges(0);
                              getCourseList(text?.collegeID);
                              setParticularList(
                                masterList?.particular_common_data ?? []
                              );
                            }
                          }}
                        />
                      ) : null}
                      {courseList.length != 1 && (
                        <SelectFieldFormik
                          autoFocus={!collegeConfig.is_university}
                          label={RENAME?.course}
                          labelSize={3}
                          id="course"
                          mandatory={1}
                          tabIndex={1}
                          clear={false}
                          matchFrom="start"
                          options={courseList}
                          getOptionLabel={(option) => option.courseName}
                          getOptionValue={(option) => option.id}
                          style={{ width: "80%" }}
                          onChange={(text) => {
                            if (unSavedChanges) {
                              setOpenModal(true);
                              setCourseModal(text);
                            } else {
                              if (collegeConfig.institution_type == 1)
                                getClassData(text);
                              else handleCourse(text);

                              setFieldValue("course", text);
                              setShowres(false);
                              setFieldValue("batch", null);
                              setFieldValue(
                                "admissionType",
                                admissionTypeList.length === 1
                                  ? admissionTypeList[0]
                                  : null
                              );
                              handleUnSavedChanges(0);
                              setFilterChange(true);
                              setParticularList(
                                masterList?.particular_common_data ?? []
                              );
                            }
                          }}
                        />
                      )}
                      {collegeConfig.institution_type === 1 ? (
                        <SelectFieldFormik
                          label={RENAME?.sem}
                          labelSize={3}
                          id="batch"
                          mandatory={1}
                          options={batchList}
                          tabIndex={2}
                          style={{ width: "40%" }}
                          clear={false}
                          maxLength={10}
                          getOptionLabel={(option) => option.className}
                          getOptionValue={(option) => option.semester}
                          onChange={(text) => {
                            if (unSavedChanges) {
                              setOpenModal(true);
                            } else {
                              setShowres(false);
                              setFieldValue("batch", text);
                              handleUnSavedChanges(0);
                              setFilterChange(true);
                              setParticularList(
                                masterList?.particular_common_data ?? []
                              );
                            }
                          }}
                        />
                      ) : null}
                      <SelectFieldFormik
                        label="Admission Type"
                        labelSize={3}
                        id="admissionType"
                        mandatory={1}
                        options={admissionTypeList}
                        tabIndex={collegeConfig.institution_type === 1 ? 3 : 2}
                        style={{ width: "40%" }}
                        clear={false}
                        maxLength={10}
                        getOptionLabel={(option) => option.admissionType}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          if (unSavedChanges) {
                            setOpenModal(true);
                            setAdmissionModal(text);
                          } else {
                            setShowres(false);
                            setFieldValue("admissionType", text);
                            handleUnSavedChanges(0);
                            setFilterChange(true);
                            setParticularList(
                              masterList?.particular_common_data ?? []
                            );
                          }
                        }}
                      />
                      {!showRes && (
                        <Button
                          text={"Show"}
                          tabIndex={
                            collegeConfig.institution_type === 1 ? 4 : 3
                          }
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                        />
                      )}
                    </div>
                    {showRes && collegeConfig.institution_type === 1 && (
                      <div className="col-lg-2 text-right">
                        <Button
                          frmButton={false}
                          text={"Full Fees Discount"}
                          onClick={() => {
                            handleSave(formikRef.current.values, 1);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </form>
              );
            }}
          </Formik>
          {showRes ? (
            <div className="row no-gutters mt-3">
              <div>
                <table className="table table-bordered table-fixed">
                  <thead>
                    <tr>
                      <th width="1%">No.</th>
                      <th width="30%">Particular</th>
                      {collegeConfig.institution_type == 1 ||
                      collegeConfig.institution_type == 5 ? (
                        <>
                          <th width="3%">Amount (₹)</th>
                          <th width="3%">Due Date</th>
                        </>
                      ) : (
                        [...Array(parseInt(courseDuration))].map(
                          (_, tableIndex) => <th>Sem {tableIndex + 1} (₹)</th>
                        )
                      )}
                      {particulars.length > 0 || particularList.length > 0 ? (
                        <th width="3%"></th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {oldParticulars.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.particularName}</td>
                          {collegeConfig.institution_type == 1 ||
                          collegeConfig.institution_type == 5 ? (
                            <>
                              <td align="right">
                                <TextField
                                  placeholder={" "}
                                  isAmount={true}
                                  id={"amount0"}
                                  mandatory={1}
                                  maxlength={7}
                                  value={item["sem1"]}
                                  onChange={(e) => {
                                    setParticularError(false);
                                    setAmountError(false);
                                    setDueDateError(false);
                                    handleUnSavedChanges(1);
                                    if (
                                      preFunction.amountValidation(
                                        e.target.value
                                      )
                                    ) {
                                      oldParticulars[index]["sem1"] =
                                        e.target.value;
                                      setOldParticulars([...oldParticulars]);
                                      sessionStorage.setItem(
                                        "unSavedChanges",
                                        true
                                      );
                                      setUnSavedChanges(true);
                                    }
                                  }}
                                />
                              </td>
                              <td>
                                <DateField
                                  id={"dueDate" + index}
                                  mandatory={1}
                                  value={moment(item["dueDate"])}
                                  minDate={moment()
                                    .subtract(1, "months")
                                    .format("YYYY-MM-DD")}
                                  maxDate={moment()
                                    .add(1, "years")
                                    .format("YYYY-MM-DD")}
                                  onChange={(e) => {
                                    setParticularError(false);
                                    setAmountError(false);
                                    setDueDateError(false);
                                    handleUnSavedChanges(1);
                                    oldParticulars[index]["dueDate"] =
                                      e.target.value;
                                    setOldParticulars([...oldParticulars]);
                                    sessionStorage.setItem(
                                      "unSavedChanges",
                                      true
                                    );
                                    setUnSavedChanges(true);
                                  }}
                                />
                              </td>
                            </>
                          ) : (
                            [...Array(parseInt(courseDuration))].map(
                              (_, tableIndex) => (
                                <td align="right">
                                  <TextField
                                    placeholder={" "}
                                    isAmount={true}
                                    id={"amount" + (tableIndex + 1)}
                                    mandatory={1}
                                    maxlength={7}
                                    tabIndex={6}
                                    value={item["sem" + (tableIndex + 1)]}
                                    onChange={(e) => {
                                      setParticularError(false);
                                      setAmountError(false);
                                      setDueDateError(false);
                                      handleUnSavedChanges(1);
                                      if (
                                        preFunction.amountValidation(
                                          e.target.value
                                        )
                                      ) {
                                        oldParticulars[index][
                                          "sem" + (tableIndex + 1)
                                        ] = e.target.value;
                                        setOldParticulars([...oldParticulars]);
                                        sessionStorage.setItem(
                                          "unSavedChanges",
                                          true
                                        );
                                        setUnSavedChanges(true);
                                      }
                                    }}
                                  />
                                </td>
                              )
                            )
                          )}
                          {particulars.length > 0 ||
                          particularList.length > 0 ? (
                            <td></td>
                          ) : null}
                        </tr>
                      );
                    })}
                    {particulars.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{oldParticulars.length + index + 1}</td>
                          <td>{item.particularName}</td>
                          {collegeConfig.institution_type == 1 ||
                          collegeConfig.institution_type == 5 ? (
                            <>
                              <td align="right">{item["sem1"]}</td>
                              <td>
                                {moment(item["dueDate"]).format("DD-MM-yyyy")}
                              </td>
                            </>
                          ) : (
                            [...Array(parseInt(courseDuration))].map(
                              (_, tableIndex) => (
                                <td align="right">
                                  {item["sem" + (tableIndex + 1)]}
                                </td>
                              )
                            )
                          )}
                          <td align="center" style={{ textAlign: "center" }}>
                            <Button
                              className="plus-button"
                              isTable={true}
                              type="button"
                              title="Sub"
                              onClick={() => {
                                handleDeleteParticular(item);
                              }}
                              text={"-"}
                            />
                          </td>
                        </tr>
                      );
                    })}
                    {particularList.length > 0 && (
                      <tr>
                        <td>
                          {oldParticulars.length + particulars.length + 1}
                        </td>
                        <td>
                          <ReactSelectField
                            autoFocus
                            id="particular"
                            mandatory={1}
                            tabIndex={5}
                            placeholder="Particular"
                            options={particularList}
                            getOptionLabel={(option) => option.particular}
                            getOptionValue={(option) => option.id}
                            searchIcon={false}
                            error={
                              particularError ? "Please select particular" : ""
                            }
                            clear={true}
                            touched={particularError ? true : false}
                            value={particular}
                            onChange={(text) => {
                              handleUnSavedChanges(1);
                              setParticularError(false);
                              setAmountError(false);
                              setDueDateError(false);
                              setParticular(text);
                              sessionStorage.setItem("unSavedChanges", true);
                              setUnSavedChanges(true);
                            }}
                          />
                        </td>
                        {collegeConfig.institution_type == 1 ||
                        collegeConfig.institution_type == 5 ? (
                          <>
                            <td align="right">
                              <TextField
                                placeholder={" "}
                                isAmount={true}
                                id={"amountNew"}
                                mandatory={1}
                                maxlength={7}
                                tabIndex={6}
                                value={amountArr[0]?.value}
                                onChange={(e) => {
                                  setParticularError(false);
                                  setAmountError(false);
                                  setDueDateError(false);
                                  handleUnSavedChanges(1);
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    amountArr[0].value = e.target.value;
                                    setAmountArr([...amountArr]);
                                    sessionStorage.setItem(
                                      "unSavedChanges",
                                      true
                                    );
                                    setUnSavedChanges(true);
                                  }
                                }}
                              />
                            </td>
                            <td>
                              <DateField
                                id={"dueDateNew"}
                                mandatory={1}
                                tabIndex={7}
                                value={amountArr[0]?.dueDate ?? ""}
                                touched={dueDateError}
                                error={
                                  dueDateError ? "Please select Due Date" : ""
                                }
                                minDate={moment()
                                  .subtract(1, "months")
                                  .format("YYYY-MM-DD")}
                                maxDate={moment()
                                  .add(1, "years")
                                  .format("YYYY-MM-DD")}
                                onChange={(e) => {
                                  setParticularError(false);
                                  setAmountError(false);
                                  setDueDateError(false);
                                  handleUnSavedChanges(1);
                                  amountArr[0].dueDate = e.target.value;
                                  setAmountArr([...amountArr]);
                                  sessionStorage.setItem(
                                    "unSavedChanges",
                                    true
                                  );
                                  setUnSavedChanges(true);
                                }}
                              />
                            </td>
                          </>
                        ) : (
                          [...Array(parseInt(courseDuration))].map(
                            (_, tableIndex) => (
                              <td align="right">
                                <TextField
                                  placeholder={" "}
                                  isAmount={true}
                                  id={"amount" + tableIndex}
                                  mandatory={1}
                                  maxlength={7}
                                  tabIndex={6 + tableIndex}
                                  value={amountArr[tableIndex]?.value}
                                  onChange={(e) => {
                                    setParticularError(false);
                                    setAmountError(false);
                                    setDueDateError(false);
                                    handleUnSavedChanges(1);
                                    if (
                                      preFunction.amountValidation(
                                        e.target.value
                                      )
                                    ) {
                                      amountArr[tableIndex].value =
                                        e.target.value;
                                      setAmountArr([...amountArr]);
                                      sessionStorage.setItem(
                                        "unSavedChanges",
                                        true
                                      );
                                      setUnSavedChanges(true);
                                    }
                                  }}
                                />
                              </td>
                            )
                          )
                        )}
                        <td style={{ textAlign: "center" }}>
                          <Button
                            className="plus-button"
                            frmButton={false}
                            type="button"
                            text="+"
                            tabIndex={
                              collegeConfig.institution_type === 1 ||
                              collegeConfig.institution_type == 5
                                ? 7
                                : 6 + courseDuration
                            }
                            isTable={true}
                            onClick={(e) => {
                              handleParticular(formikRef.current.values);
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <ErrorMessage
                  Message={"Please enter valid Amount"}
                  view={amountError}
                />
                <ErrorMessage Message={message} view={showError} />
                <Button
                  type="button"
                  isTable={true}
                  id="save"
                  text="F4 - Save"
                  onClick={() => handleSave(formikRef.current.values, 0)}
                />
              </div>
            </div>
          ) : null}
        </div>
        <Modal
          show={openModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={(e) => setOpenModal(false)}
        >
          <Modal.Header>
            <Modal.Title>Leave Page?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="">
              Changes you made may not be saved. Are you sure you want to change
              the filter?
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              text="Yes"
              frmButton={false}
              onClick={() => {
                setOpenModal(false);
                setUnSavedChanges(false);
                setShowres(false);
                if (courseModal) {
                  if (collegeConfig.institution_type == 1)
                    getClassData(courseModal);
                  else handleCourse(courseModal);
                  formikRef.current.setFieldValue("course", courseModal);
                  formikRef.current.setFieldValue("batch", null);
                  formikRef.current.setFieldValue(
                    "admissionType",
                    admissionTypeList.length === 1 ? admissionTypeList[0] : null
                  );
                  setCourseModal();
                }
                if (admissionModal) {
                  formikRef.current.setFieldValue(
                    "admissionType",
                    admissionModal
                  );
                  setShowres(false);
                }
                handleUnSavedChanges(0);
                setFilterChange(true);
              }}
            />
            &nbsp;&nbsp;
            <Button
              autoFocus
              text="No"
              frmButton={false}
              onClick={() => {
                setOpenModal(false);
              }}
            />
          </Modal.Footer>
        </Modal>
        <Modal
          show={openFullFeeModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={(e) => setOpenFullFeeModal(false)}
        >
          <Modal.Header>
            <Modal.Title>Full Fees Discount</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formik
              innerRef={modalFormikRef}
              enableReinitialize={false}
              initialValues={{
                payFee: "",
                discountAmount: payFeeConcessionAmt,
                discountPercent: payFeeDisPercent ?? null,
                discountDate: payFeeDueDate ?? null,
              }}
              validationSchema={FullFeeFormSchema}
              onSubmit={handleAddPayFullFeeDiscount}
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
                    <div className="row no-gutters">
                      <div className="row no-gutters mt-1">
                        <div
                          className={`col-lg-5 ${
                            window.innerWidth > 992 ? "text-right" : ""
                          } pe-3 mt-2`}
                        >
                          <label>Pay Full Fees</label>
                        </div>
                      </div>
                      <div className="row no-gutters mt-1">
                        <div
                          className={`col-lg-5 ${
                            window.innerWidth > 992 ? "text-right" : ""
                          } pe-3`}
                        ></div>

                        <div className={`col-lg-7`}>
                          {oldParticulars.map((item, index) => {
                            return (
                              <CheckboxField
                                label={
                                  item.particularName + " (₹ " + item.sem1 + ")"
                                }
                                isTable={true}
                                id={"fullFee" + index}
                                checked={item.payFullFee}
                                onChange={(e) => {
                                  setPayFullFeeError(false);
                                  handleUnSavedChanges(1);
                                  oldParticulars[index].payFullFee =
                                    !oldParticulars[index].payFullFee;
                                  setOldParticulars([...oldParticulars]);
                                  sessionStorage.setItem(
                                    "unSavedChanges",
                                    true
                                  );
                                  setUnSavedChanges(true);
                                  calculateTotalPayFullFee();
                                }}
                              />
                            );
                          })}
                          <ErrorMessage
                            Message={"Please select atleast one particular"}
                            view={payFullFeeError}
                          />
                        </div>
                      </div>
                      <DisplayText
                        label={"Pay Full Fees Total (₹)"}
                        value={totalPayFullFee}
                      />
                      <div className="row no-gutters mt-1">
                        <div
                          className={`col-lg-5 ${
                            window.innerWidth > 992 ? "text-right" : ""
                          } pe-3 mt-2`}
                        >
                          <label>Discount Amount (₹)</label>
                        </div>
                        <div className={`col-lg-7 row no-gutters`}>
                          <div className={`col-lg-3`}>
                            <TextFieldFormik
                              labelSize={2}
                              placeholder={" "}
                              id="discountAmount"
                              mandatory={1}
                              tabIndex={8}
                              maxlength={6}
                              isAmount={true}
                              error={
                                disAmountError
                                  ? "Please enter valid Amount"
                                  : ""
                              }
                              onChange={(e) => {
                                if (
                                  preFunction.amountValidation(e.target.value)
                                ) {
                                  setFieldValue(
                                    "discountAmount",
                                    e.target.value
                                  );
                                  handleDiscount(
                                    totalPayFullFee,
                                    e.target.value,
                                    values.discountPercent,
                                    0
                                  );
                                }
                              }}
                              style={{ width: "85%" }}
                            />
                          </div>
                          <div className={`col-lg-1`}></div>
                          <div className={`col-lg-4`}>
                            <TextFieldFormik
                              label={"%"}
                              labelSize={2}
                              placeholder={" "}
                              id="discountPercent"
                              mandatory={1}
                              tabIndex={8}
                              maxlength={3}
                              isAmount={true}
                              error={
                                disPercentError
                                  ? "Please enter valid Percentage"
                                  : ""
                              }
                              onChange={(e) => {
                                if (
                                  preFunction.amountValidation(e.target.value)
                                ) {
                                  setFieldValue(
                                    "discountPercent",
                                    e.target.value
                                  );
                                  handleDiscount(
                                    totalPayFullFee,
                                    values.discountAmount,
                                    e.target.value,
                                    1
                                  );
                                }
                              }}
                              style={{ width: "55%" }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-1">
                        <DateFieldFormik
                          label={"Offer Ends On"}
                          id={"discountDate"}
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("discountDate", e.target.value);
                          }}
                          minDate={moment()
                            .subtract(1, "months")
                            .format("YYYY-MM-DD")}
                          maxDate={moment()
                            .add(1, "years")
                            .format("YYYY-MM-DD")}
                          style={{ width: "50%" }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <Button
                        text="Save"
                        frmButton={false}
                        type="submit"
                        onClick={() => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                      &nbsp;&nbsp;
                      <Button
                        autoFocus
                        type="button"
                        text="Close"
                        frmButton={false}
                        onClick={() => {
                          setOpenFullFeeModal(false);
                        }}
                      />
                    </div>
                  </form>
                );
              }}
            </Formik>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default OpeningFees;
