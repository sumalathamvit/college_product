import React, { useState, useRef, useContext } from "react";
import moment from "moment";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";

import libraryApi from "../api/libraryapi";
import StudentApi from "../api/StudentApi";

import AuthContext from "../auth/context";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import TextField from "../component/FormFieldLibrary/TextField";
import ReactSelectField from "../component/FormFieldLibrary/ReactSelectField";
import DateField from "../component/FormFieldLibrary/DateField";
import Button from "../component/FormField/Button";
import RadioInputField from "../component/FormFieldLibrary/RadioInputField";
import SelectFieldFormik from "../component/FormFieldLibrary/SelectFieldFormik";
import ModalComponent from "../component/ModalComponent";

import ScreenTitle from "../component/common/ScreenTitle";
import SupplierComponent from "../component/SupplierComponent";
import BookTitleComponent from "./../component/BookTitleComponent";
import FileField from "../component/FormFieldLibrary/FileField";
import ErrorMessage from "../component/common/ErrorMessage";

import deleteIcon from "../assests/svg/delete-icon.svg";
import penIcon from "../assests/svg/pen.svg";
import { allowedFileExtensions } from "../component/common/CommonArray";
import string from "../string";

function BookDetail() {
  //#region  declaration
  const [load, setLoad] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [showBookIdError, setShowBookIdError] = useState(false);
  const [bookId, setBookId] = useState("");
  const [selectedBook, setSelectedBook] = useState();

  const [mainTitleList, setMainTitleList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [college, setCollege] = useState();
  const [bookAccessNoArr, setBookAccessNoArr] = useState([]);
  const [totalAdded, setTotalAdded] = useState(0);
  const [totalMRP, setTotalMRP] = useState(0);

  const [message, setMessage] = useState("");

  const [titleOpenModal, setTitleOpenModal] = useState(false);
  const [openSuggessionModal, setOpenSuggessionModal] = useState(false);
  const [bookList, setBookList] = useState([]);

  const [supplierOpenModal, setSupplierOpenModal] = useState(false);

  const [supplier, setSupplier] = useState();
  const [invoiceNumber, setInvoiceNumber] = useState();

  const [supplierError, setSupplierError] = useState(false);
  const [invoiceNumberError, setInvoiceNumberError] = useState(false);
  const [invoiceDateError, setInvoiceDateError] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [fileType, setFileType] = useState();
  const [puchaseCopy, setPuchaseCopy] = useState();

  const currentYear = new Date().getFullYear();
  const [unitPriceError, setUnitPriceError] = useState(false);
  const { unSavedChanges, setUnSavedChanges, collegeId } =
    useContext(AuthContext);

  const collegeConfig = useSelector((state) => state.web.college);

  const handleFileUpload = (e) => {
    console.log(e.target.files[0]);
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      setModalMessage("Please choose file size less than 2MB");
      setModalErrorOpen(true);
      setModalTitle("File Size");
      setLoad(false);

      return false;
    }

    if (!allowedFileExtensions.includes(e.target.files[0].name.split(".")[1])) {
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      setModalErrorOpen(true);
      setModalTitle("File Type");
      setLoad(false);

      return false;
    }
    setFileType(e.target.files[0].name.split(".")[1]);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setPuchaseCopy(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    return true;
  };

  const handleCloseTitle = () => {
    setTitleOpenModal(false);
  };

  const handleCloseSupplier = () => {
    setSupplierOpenModal(false);
  };

  const bookPurchaseSchema = () => {
    if (collegeConfig.is_university) {
      return Yup.object().shape({
        college: Yup.object().required("Please select College"),
        supplier: Yup.object().required("Please select Supplier"),
        poNumber: Yup.string().test(
          "is-valid-pan",
          "Enter Valid PO Number",
          (value) => {
            if (value && value.trim() !== "") {
              return /^[a-zA-Z0-9-]+$/.test(String(value));
            }
            return true;
          }
        ),
        invoiceNumber: Yup.string()
          .min(3, "Must be at least 3 characters long")
          .matches(/^[a-zA-Z0-9-]+$/, "Please enter valid Invoice Number")
          .required("Please enter valid Invoice Number")
          .trim(),

        invoiceDate: Yup.string().required("Please select Invoice Date"),
        // price: Yup.number()
        //   .typeError("Please enter valid Amount")
        //   .min(1, "Please enter valid Total Amount")
        //   .required("Please enter Total Amount"),
        // discountAmount: Yup.number().required("Please enter Discount Amount"),
        mainTitle: Yup.object().required("Please select Title"),
        edition: Yup.string()
          .matches(/^[a-zA-Z0-9\s]+$/, "Please enter valid Edition")
          .required("Please enter Edition"),
        pages: Yup.number()
          .typeError("Please enter valid number")
          .min(1, "Please enter valid page")
          .required("Please enter Pages"),
        accessNumber: Yup.number()
          .typeError("Please enter valid Number")
          .min(1, "Please enter valid Number")
          .required("Please enter Access Number"),
        quantity: Yup.number()
          .typeError("Please enter valid Quantity")
          .required("Please enter Quantity")
          .min(1, "Please enter valid Quantity"),
        mrp: Yup.number()
          .typeError("Please enter valid MRP")
          .min(1, "Please enter valid MRP")
          .required("Please enter MRP"),
        unitPrice: Yup.number()
          .typeError("Please enter valid Amount")
          .max(999999, "Please enter valid Amount")
          .required("Please enter Amount"),
      });
    } else {
      return Yup.object().shape({
        supplier: Yup.object().required("Please select Supplier"),
        poNumber: Yup.string().test(
          "is-valid-pan",
          "Enter Valid PO Number",
          (value) => {
            if (value && value.trim() !== "") {
              return /^[a-zA-Z0-9-]+$/.test(String(value));
            }
            return true;
          }
        ),
        invoiceNumber: Yup.string()
          .min(3, "Must be at least 3 characters long")
          .matches(/^[a-zA-Z0-9-]+$/, "Please enter valid Invoice Number")
          .required("Please enter valid Invoice Number")
          .trim(),

        invoiceDate: Yup.string().required("Please select Invoice Date"),
        // price: Yup.number()
        //   .typeError("Please enter valid Amount")
        //   .min(1, "Please enter valid Total Amount")
        //   .required("Please enter Total Amount"),
        // discountAmount: Yup.number().required("Please enter Discount Amount"),
        mainTitle: Yup.object().required("Please select Title"),
        edition: Yup.string()
          .matches(/^[a-zA-Z0-9\s]+$/, "Please enter valid Edition")
          .required("Please enter Edition"),
        pages: Yup.number()
          .typeError("Please enter valid number")
          .min(1, "Please enter valid page")
          .required("Please enter Pages"),
        accessNumber: Yup.number()
          .typeError("Please enter valid Number")
          .min(1, "Please enter valid Number")
          .required("Please enter Access Number"),
        quantity: Yup.number()
          .typeError("Please enter valid Quantity")
          .required("Please enter Quantity")
          .min(1, "Please enter valid Quantity"),
        mrp: Yup.number()
          .typeError("Please enter valid MRP")
          .min(1, "Please enter valid MRP")
          .required("Please enter MRP"),
        unitPrice: Yup.number()
          .typeError("Please enter valid Amount")
          .max(999999, "Please enter valid Amount")
          .required("Please enter Amount"),
      });
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

  const years = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push({ label: year, value: year });
  }
  const formikRef = useRef();
  //#endregion

  const closeErrors = () => {
    setSupplierError(false);
    setInvoiceNumberError(false);
    setInvoiceDateError(false);
    setUnitPriceError(false);
    setShowBookIdError(false);
  };

  const handleSearchSupplier = async (text) => {
    if (text.length > 2) {
      try {
        const supplierRes = await libraryApi.getSupplierBySearch(text);
        console.log("supplierRes---------", supplierRes);
        setSupplierList(supplierRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleSearchTitleWithAuthor = async (text) => {
    if (text.length > 2) {
      try {
        const mainTitleRes = await libraryApi.getBookAuthorPublisherByKeyword(
          text
        );
        console.log("mainTitleRes---", mainTitleRes);
        setMainTitleList(mainTitleRes.data.message);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleEditBook = async (item) => {
    console.log("item---", item);
    if (formikRef.current) {
      console.log("here");
      setMainTitleList([
        {
          search: item.mainTitle,
          book_id: bookId,
        },
      ]);
      formikRef.current.setFieldValue("mainTitle", {
        search: item.mainTitle,
        book_id: bookId,
      });

      formikRef.current.setFieldValue("bookId", bookId);
      formikRef.current.setFieldValue("mrp", item.mrp);
      item.yearOfPublish &&
        formikRef.current.setFieldValue("yearOfPublish", {
          label: item.yearOfPublish,
          value: item.yearOfPublish,
        });
      formikRef.current.setFieldValue("quantity", item.quantity);
      formikRef.current.setFieldValue("discPercent", item.discPercent);
      formikRef.current.setFieldValue("edition", item.edition);
      formikRef.current.setFieldValue("pages", item.pages);
      formikRef.current.setFieldValue("unitPrice", item.unitPrice);
      formikRef.current.setFieldValue("accessNumber", item.accNoList[0]);

      formikRef.current.setFieldValue("remarks", item.remarks);

      formikRef.current.setFieldTouched("mainTitle", false);
      formikRef.current.setFieldTouched("bookId", false);
      formikRef.current.setFieldTouched("mrp", false);
      formikRef.current.setFieldTouched("yearOfPublish", false);
      formikRef.current.setFieldTouched("quantity", false);
      formikRef.current.setFieldTouched("edition", false);
      formikRef.current.setFieldTouched("pages", false);
      formikRef.current.setFieldTouched("unitPrice", false);
      formikRef.current.setFieldTouched("accessNumber", false);
      formikRef.current.setFieldTouched("remarks", false);
    }
    const deleteArr = bookAccessNoArr.filter((m) => m !== item);
    setBookAccessNoArr(deleteArr);
    let totAdded = 0,
      actualTotal = 0;
    for (let i = 0; i < deleteArr.length; i++) {
      totAdded += parseFloat(deleteArr[i].total);
      actualTotal += deleteArr[i].quantity * deleteArr[i].mrp;
    }
    setTotalAdded(totAdded);
    setTotalMRP(actualTotal);
  };

  const handleDeleteBook = async (item) => {
    const deleteArr = bookAccessNoArr.filter((m) => m !== item);
    setBookAccessNoArr(deleteArr);
    let totAdded = 0,
      actualTotal = 0;
    for (let i = 0; i < deleteArr.length; i++) {
      totAdded += parseFloat(deleteArr[i].total);
      actualTotal += deleteArr[i].quantity * deleteArr[i].mrp;
    }
    setTotalAdded(totAdded);
    setTotalMRP(actualTotal);
  };

  const handlePurchaseAdd = async () => {
    if (load) return;
    console.log("handlePurchaseAdd");
    formikRef.current.setFieldTouched("college", false);
    formikRef.current.setFieldTouched("supplier", false);
    formikRef.current.setFieldTouched("invoiceNumber", false);
    formikRef.current.setFieldTouched("invoiceDate", false);
    formikRef.current.setFieldTouched("price", false);
    formikRef.current.setFieldTouched("discountAmount", false);
    formikRef.current.setFieldTouched("mainTitle", false);
    formikRef.current.setFieldTouched("mrp", false);
    formikRef.current.setFieldTouched("unitPrice", false);
    formikRef.current.setFieldTouched("quantity", false);
    formikRef.current.setFieldTouched("edition", false);
    formikRef.current.setFieldTouched("pages", false);
    formikRef.current.setFieldTouched("accessNumber", false);

    let err = false;
    closeErrors();

    if (
      !formikRef.current.values.invoiceDate ||
      formikRef.current.values.invoiceDate <
        moment().subtract(1, "months").format("yyyy-MM-DD") ||
      formikRef.current.values.invoiceDate > moment().format("yyyy-MM-DD")
    ) {
      err = true;
      document.getElementById("invoiceDate")?.focus();
      setInvoiceDateError(true);
    }
    if (
      !formikRef.current.values.invoiceNumber ||
      formikRef.current.values.invoiceNumber.length < 3 ||
      !/^[a-zA-Z0-9-]+$/.test(formikRef.current.values.invoiceNumber)
    ) {
      err = true;
      document.getElementById("invoiceNumber")?.focus();
      setInvoiceNumberError(true);
    }

    if (!supplier) {
      err = true;
      document.getElementById("supplier")?.focus();
      setSupplierError(true);
    }
    console.log("err--", err);
    console.log("err--", formikRef.current.values);
    let tempBookAccessNoArr = bookAccessNoArr;

    if (formikRef.current.values.mainTitle) {
      if (
        !formikRef.current.values.unitPrice ||
        isNaN(formikRef.current.values.unitPrice) ||
        formikRef.current.values.unitPrice.includes(" ") ||
        formikRef.current.values.unitPrice < 1
      ) {
        formikRef.current.setErrors({
          unitPrice: "Please Enter valid Amount",
        });
        formikRef.current.setFieldTouched("unitPrice", true);
        document.getElementById("unitPrice")?.select();
        err = true;
      }
      if (
        !formikRef.current.values.mrp ||
        !preFunction.amountValidation(formikRef.current.values.mrp) ||
        formikRef.current.values.mrp < 1
      ) {
        formikRef.current.setErrors({
          mrp: "Please Enter valid MRP",
        });
        formikRef.current.setFieldTouched("mrp", true);
        document.getElementById("mrp")?.select();
        err = true;
      }
      if (
        !formikRef.current.values.quantity ||
        !preFunction.amountValidation(formikRef.current.values.quantity) ||
        formikRef.current.values.quantity < 1
      ) {
        formikRef.current.setErrors({
          mrp: "Please Enter valid Quantity",
        });
        formikRef.current.setFieldTouched("quantity", true);
        document.getElementById("quantity")?.select();
        err = true;
      }
      if (
        !formikRef.current.values.accessNumber ||
        !preFunction.amountValidation(formikRef.current.values.accessNumber) ||
        formikRef.current.values.accessNumber < 1
      ) {
        formikRef.current.setErrors({
          mrp: "Please Enter valid Access Number",
        });
        formikRef.current.setFieldTouched("accessNumber", true);
        document.getElementById("accessNumber")?.select();
        err = true;
      }
      if (
        !formikRef.current.values.pages ||
        !preFunction.amountValidation(formikRef.current.values.pages) ||
        formikRef.current.values.pages < 1
      ) {
        formikRef.current.setErrors({
          mrp: "Please Enter valid Pages",
        });
        formikRef.current.setFieldTouched("pages", true);
        document.getElementById("pages")?.select();
        err = true;
      }
      if (
        !formikRef.current.values.edition ||
        !/^[a-zA-Z0-9-]+$/.test(formikRef.current.values.edition)
      ) {
        formikRef.current.setErrors({
          edition: "Please Enter valid edition",
        });
        formikRef.current.setFieldTouched("edition", true);
        document.getElementById("edition")?.select();
        err = true;
      }
      if (err) return;
      tempBookAccessNoArr = await handleSubmit(formikRef.current.values);
      if (tempBookAccessNoArr == bookAccessNoArr) return;
    }
    console.log("err--", formikRef.current.errors);
    if (err) return;

    console.log("validation checked");
    console.log("tempBookAccessNoArr--", tempBookAccessNoArr);
    let tot = 0;
    for (let i = 0; i < tempBookAccessNoArr.length; i++) {
      tot = tot + parseFloat(tempBookAccessNoArr[i].unitPrice);
    }
    console.log("totalAdded--", totalAdded);
    console.log("totalMRP--", totalMRP);
    let discAmt = totalMRP - totalAdded;
    console.log("discAmt--", discAmt);
    // return;
    try {
      setLoad(true);
      console.log("puchaseCopy--", puchaseCopy);
      // return;
      let proofUrl = "";
      if (puchaseCopy) {
        const response = await StudentApi.uploadFile(
          "book_purchase",
          fileType,
          puchaseCopy.split(",")[1]
        );
        console.log("response--", response);
        if (!response.data.message.success) {
          setModalMessage(response.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        proofUrl = response.data.message.data.file_url;
      }

      const libPurchaseRes = await libraryApi.libPurchase(
        collegeConfig.is_university
          ? formikRef.current.values.college.collegeID
          : collegeId,
        formikRef.current.values.poNumber,
        supplier.value,
        moment(formikRef.current.values.invoiceDate).format("yyyy-MM-DD"),
        moment().format("yyyy-MM-DD"),
        invoiceNumber,
        totalMRP,
        discAmt,
        Math.round(totalAdded),
        proofUrl
      );
      console.log("libPurchaseRes----------", libPurchaseRes);
      if (!libPurchaseRes.ok) {
        setLoad(false);
        console.log(libPurchaseRes.data.data);
        return;
      }

      for (let i = 0; i < tempBookAccessNoArr.length; i++) {
        console.log("tempBookAccessNoArr----", tempBookAccessNoArr[i]);
        const libPurchaseDetailRes = await libraryApi.libPurchaseDetail(
          tempBookAccessNoArr[i].bookId,
          libPurchaseRes.data.data.name,
          tempBookAccessNoArr[i].yearOfPublish,
          tempBookAccessNoArr[i].edition,
          tempBookAccessNoArr[i].pages,
          tempBookAccessNoArr[i].quantity,
          tempBookAccessNoArr[i].mrp,
          tempBookAccessNoArr[i].discPercent,
          tempBookAccessNoArr[i].unitPrice,
          tempBookAccessNoArr[i].remarks
        );
        console.log("libPurchaseDetailRes----------", libPurchaseDetailRes);

        for (let j = 0; j < tempBookAccessNoArr[i].accNoList.length; j++) {
          const addAccessNumberRes = await libraryApi.addAccessNumber(
            libPurchaseDetailRes.data.data.name,
            tempBookAccessNoArr[i].accNoList[j]
          );
          console.log("addAccessNumberRes---", addAccessNumberRes);
        }
      }
      handleUnSavedChanges(0);
      toast.success("Book Purchase Done Successfully");
      clearAllValues();
      setLoad(false);
    } catch (error) {
      console.log("error--", error);
      setLoad(false);
    }
  };

  const handleSubmit = async (values) => {
    if (load) return;
    console.log("values---", values);
    console.log("bookId---", bookId);
    if (values.discPercent < 0 || values.discPercent > 100) {
      setMessage("Please enter valid Amount");
      setUnitPriceError(true);
      document.getElementById("unitPrice")?.focus();
      return;
    }
    try {
      if (!bookId || bookId == "") {
        if (values.mainTitle && bookList.length == 0)
          setMessage("Couldnt find book with this Title. Please add the book");
        else setMessage("Please select the book");
        setShowBookIdError(true);
        setOpenSuggessionModal(true);
        return bookAccessNoArr;
      }

      var list = [];
      for (let i = 0; i < values.quantity; i++) {
        var n = parseInt(values.accessNumber) + i;
        list.push(n);
      }
      console.log("list---", list);
      setLoad(true);
      const checkAccessNumberRes = await libraryApi.checkAccessNumber(list);
      console.log("checkAccessNumberRes---", checkAccessNumberRes);
      if (checkAccessNumberRes.data.data.length > 0) {
        let existsList = [];
        for (let i = 0; i < checkAccessNumberRes.data.data.length; i++) {
          existsList.push(checkAccessNumberRes.data.data[i].name);
        }
        console.log("existsList---", existsList);

        setModalMessage(`Access Numbers ${existsList} already exists`);
        setModalTitle("Already Exists");
        setModalErrorOpen(true);
        document.getElementById("accessNumber")?.focus();
        setLoad(false);
        return bookAccessNoArr;
      }
      for (let j = 0; j < bookAccessNoArr.length; j++) {
        const anyElementInArray1IsInArray2 = list.some((element) =>
          bookAccessNoArr[j].accNoList.includes(element)
        );
        console.log(
          "anyElementInArray1IsInArray2---",
          anyElementInArray1IsInArray2
        );
        if (anyElementInArray1IsInArray2) {
          setModalMessage(`Access Number already given in books added`);
          setModalTitle("Already Exists");
          setModalErrorOpen(true);
          setLoad(false);
          return bookAccessNoArr;
        }
      }
      let tempBookAccessNoArr = bookAccessNoArr;
      tempBookAccessNoArr.push({
        bookId: bookId,
        mainTitle: values.mainTitle.search,
        yearOfPublish: values?.yearOfPublish?.value,
        edition: values.edition,
        pages: values.pages,
        quantity: values.quantity,
        discPercent: values.discPercent,
        mrp: values.mrp,
        unitPrice: values.unitPrice,
        remarks: values.remarks,
        accNoList: list,
        total: values.unitPrice,
      });
      console.log("tempBookAccessNoArr---", tempBookAccessNoArr);

      let totAdded = 0,
        actualTotal = 0;
      for (let i = 0; i < tempBookAccessNoArr.length; i++) {
        totAdded += parseFloat(tempBookAccessNoArr[i].total);
        actualTotal +=
          tempBookAccessNoArr[i].quantity * tempBookAccessNoArr[i].mrp;
      }
      setTotalAdded(totAdded);
      setTotalMRP(actualTotal);
      setBookList([]);
      clearValues();

      setLoad(false);
      return tempBookAccessNoArr;
    } catch (error) {
      console.log("error--", error);
      setLoad(false);
    }
  };

  const clearAllValues = () => {
    if (formikRef.current) {
      formikRef.current.setFieldValue("mainTitle", "");
      formikRef.current.setFieldValue("bookId", "");
      formikRef.current.setFieldValue("mrp", "");
      formikRef.current.setFieldValue("yearOfPublish", "");
      formikRef.current.setFieldValue("quantity", "");
      formikRef.current.setFieldValue("edition", "");
      formikRef.current.setFieldValue("pages", "");
      formikRef.current.setFieldValue("unitPrice", "");
      formikRef.current.setFieldValue("accessNumber", "");
      formikRef.current.setFieldValue("remarks", "");
      formikRef.current.setFieldValue("discPercent", "");
      formikRef.current.setFieldValue("supplier", "");
      formikRef.current.setFieldValue("college", college);
      formikRef.current.setFieldValue("invoiceNumber", "");
      formikRef.current.setFieldValue("poNumber", "");
      formikRef.current.setFieldValue("invoiceDate", new Date());
      formikRef.current.setFieldValue("price", "");
      formikRef.current.setFieldValue("discountAmount", "");
      formikRef.current.setFieldTouched("mainTitle", false);
      formikRef.current.setFieldTouched("bookId", false);
      formikRef.current.setFieldTouched("mrp", false);
      formikRef.current.setFieldTouched("yearOfPublish", false);
      formikRef.current.setFieldTouched("quantity", false);
      formikRef.current.setFieldTouched("edition", false);
      formikRef.current.setFieldTouched("pages", false);
      formikRef.current.setFieldTouched("unitPrice", false);
      formikRef.current.setFieldTouched("accessNumber", false);
      formikRef.current.setFieldTouched("remarks", false);
      formikRef.current.setFieldTouched("discPercent", false);
      formikRef.current.setFieldTouched("supplier", false);
      formikRef.current.setFieldTouched("college", false);
      formikRef.current.setFieldTouched("invoiceNumber", false);
      formikRef.current.setFieldTouched("poNumber", false);
      formikRef.current.setFieldTouched("invoiceDate", false);
      formikRef.current.setFieldTouched("price", false);
      formikRef.current.setFieldTouched("discountAmount", false);
    }

    setShowBookIdError(false);
    setBookId("");
    setSelectedBook();
    setMainTitleList([]);
    setSupplierList([]);
    setBookAccessNoArr([]);
    setTotalAdded(0);
    setTotalMRP(0);
    setMessage("");
    setTitleOpenModal(false);
    setOpenSuggessionModal(false);
    setBookList([]);
    setSupplierOpenModal(false);
    setSupplier();
    setInvoiceNumber();
    setSupplierError(false);
    setInvoiceNumberError(false);
    setInvoiceDateError(false);
    setUnitPriceError(false);
  };

  const clearValues = () => {
    if (formikRef.current) {
      formikRef.current.setFieldValue("mainTitle", "");
      formikRef.current.setFieldValue("bookId", "");
      formikRef.current.setFieldValue("mrp", "");
      formikRef.current.setFieldValue("yearOfPublish", "");
      formikRef.current.setFieldValue("quantity", "");
      formikRef.current.setFieldValue("edition", "");
      formikRef.current.setFieldValue("pages", "");
      formikRef.current.setFieldValue("unitPrice", "");
      formikRef.current.setFieldValue("accessNumber", "");
      formikRef.current.setFieldValue("remarks", "");
      formikRef.current.setFieldValue("discPercent", "");

      formikRef.current.setFieldTouched("mainTitle", false);
      formikRef.current.setFieldTouched("bookId", false);
      formikRef.current.setFieldTouched("mrp", false);
      formikRef.current.setFieldTouched("yearOfPublish", false);
      formikRef.current.setFieldTouched("quantity", false);
      formikRef.current.setFieldTouched("edition", false);
      formikRef.current.setFieldTouched("pages", false);
      formikRef.current.setFieldTouched("unitPrice", false);
      formikRef.current.setFieldTouched("accessNumber", false);
      formikRef.current.setFieldTouched("remarks", false);
      formikRef.current.setFieldTouched("discPercent", false);
    }
  };

  const handleDiscountPercent = (qty, mrp, unitPrice) => {
    setUnitPriceError(false);
    if (mrp != "" && unitPrice != "") {
      console.log("mrp, unitPrice----", mrp, unitPrice);
      const discPercent =
        100 - (parseFloat(unitPrice) / (qty * parseInt(mrp))) * 100;
      console.log("discPercent---", discPercent.toFixed(0));
      formikRef.current.setFieldValue("discPercent", discPercent.toFixed(0));
      if (discPercent < 0 || discPercent > 100) {
        console.log("here---");
        setMessage("Please enter valid Amount");
        setUnitPriceError(true);
        return;
      }
    }
  };

  // useEffect(() => {
  //   getAllList();
  // }, []);

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
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <Formik
            innerRef={formikRef}
            enableReinitialize={false}
            initialValues={{
              supplier: "",
              college: college,
              invoiceNumber: "",
              poNumber: "",
              invoiceDate: new Date(),
              price: "",
              discountAmount: "",
              mainTitle: "",
              bookId: "",
              mrp: "",
              discPercent: "",
              unitPrice: "",
              yearOfPublish: "",
              quantity: "",
              edition: "",
              pages: "",
              accessNumber: "",
              remarks: "",
              refDoc: "",
            }}
            validationSchema={bookPurchaseSchema}
            onSubmit={handleSubmit}
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
                    <div className="col-lg-6">
                      {collegeConfig.is_university && (
                        <SelectFieldFormik
                          autoFocus
                          label="College"
                          id="college"
                          mandatory={1}
                          title={true}
                          clear={false}
                          tabIndex={1}
                          maxLength={15}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          options={collegeConfig.collegeList}
                          onChange={(text) => {
                            handleUnSavedChanges(1);
                            closeErrors();
                            setCollege(text);
                            setFieldValue("college", text);
                          }}
                        />
                      )}
                    </div>
                    <div
                      className="col-lg-6  text-right"
                      style={{ paddingTop: "20px" }}
                    >
                      <Button
                        type="button"
                        frmButton={false}
                        className={"btn-green me-3"}
                        text="New Book"
                        onClick={() => setTitleOpenModal(true)}
                      />
                      <Button
                        type="button"
                        frmButton={false}
                        className={"btn-green"}
                        text="New Supplier"
                        onClick={() => setSupplierOpenModal(true)}
                      />
                    </div>
                  </div>
                  <div className="subhead-row mt-2 pt-1">
                    <div className="subhead">Invoice Detail </div>
                    <div className="col line-div"></div>
                  </div>
                  <div className="row no-gutters">
                    <div className="col-lg-6 pe-2">
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        label="Supplier Name"
                        id="supplier"
                        clear={false}
                        mandatory={1}
                        title={true}
                        tabIndex={2}
                        maxLength={15}
                        options={supplierList}
                        searchIcon={true}
                        onChange={(text) => {
                          closeErrors();
                          setSupplier(text);
                          setSupplierList([]);
                          setFieldValue("supplier", text);
                          handleUnSavedChanges(1);
                        }}
                        onInputChange={(inputValue) => {
                          inputValue.length > 0 &&
                            handleSearchSupplier(inputValue);
                        }}
                      />
                      <ErrorMessage
                        Message={"Please select Supplier"}
                        view={supplierError}
                      />
                    </div>
                    <div className="col-lg-2 ps-2 pe-2">
                      <TextField
                        id="poNumber"
                        placeholder="PO Number"
                        label="PO Number"
                        title={true}
                        tabIndex={3}
                        value={values.poNumber}
                        error={errors.poNumber}
                        touched={touched.poNumber}
                        // style={{ width: "65%" }}
                        onChange={(e) => {
                          setFieldValue("poNumber", e.target.value);
                          handleUnSavedChanges(1);
                        }}
                        maxlength={10}
                      />
                    </div>
                    <div className="col-lg-2 ps-2 pe-2">
                      <TextField
                        id="invoiceNumber"
                        placeholder="Invoice No."
                        label="Invoice Number"
                        value={values.invoiceNumber}
                        title={true}
                        tabIndex={4}
                        error={errors.invoiceNumber}
                        touched={touched.invoiceNumber}
                        onChange={(e) => {
                          closeErrors();
                          setInvoiceNumber(e.target.value);
                          setFieldValue("invoiceNumber", e.target.value);
                          handleUnSavedChanges(1);
                        }}
                        // style={{ width: "70%" }}
                        maxlength={10}
                        mandatory={1}
                      />
                      <ErrorMessage
                        Message={"Please enter valid Invoice Number"}
                        view={invoiceNumberError}
                      />
                    </div>
                    <div className="col-lg-2 ps-2">
                      <DateField
                        label="Invoice Date"
                        id="invoiceDate"
                        maxDate={new Date()}
                        mandatory={1}
                        title={true}
                        tabIndex={5}
                        error={errors.invoiceDate}
                        touched={touched.invoiceDate}
                        minDate={moment().subtract(1, "months")._d}
                        value={values.invoiceDate}
                        style={{ width: "70%" }}
                        onChange={(e) => {
                          closeErrors();
                          setFieldValue("invoiceDate", e.target.value);
                          handleUnSavedChanges(1);
                        }}
                      />
                      <ErrorMessage
                        Message={"Please select valid Invoice Date"}
                        view={invoiceDateError}
                      />
                    </div>
                  </div>
                  <div className="row no-gutters">
                    <div className="col-lg-3 pe-2">
                      <FileField
                        label="Purchase Copy"
                        labelSize={4}
                        tabIndex={6}
                        type="file"
                        id="refDoc"
                        name="refDoc"
                        accept=".pdf, image/*"
                        onChange={(event) => {
                          setFileError(false);
                          if (event.target.files[0] && handleFileUpload(event))
                            setFieldValue("refDoc", event.target.files[0]);
                          else setFieldValue("refDoc", null);
                        }}
                        error={
                          errors.refDoc
                            ? errors.refDoc
                            : fileError
                            ? "Please choose Proof document"
                            : ""
                        }
                        touched={
                          touched.refDoc
                            ? touched.refDoc
                            : fileError
                            ? true
                            : false
                        }
                      />
                    </div>
                  </div>
                  <div className="subhead-row mt-4 pt-1">
                    <div className="subhead">Book Detail </div>
                    <div className="col line-div"></div>
                  </div>
                  <div className="row no-gutters">
                    <div className="col-lg-6 pe-2">
                      <ReactSelectField
                        placeholder="Title"
                        label="Title"
                        id="mainTitle"
                        mandatory={1}
                        title={true}
                        searchIcon={true}
                        tabIndex={7}
                        maxLength={15}
                        error={errors.mainTitle}
                        touched={touched.mainTitle}
                        value={values.mainTitle}
                        getOptionLabel={(option) => option.search}
                        getOptionValue={(option) => option.book_id}
                        options={mainTitleList}
                        onInputChange={(inputValue) => {
                          handleSearchTitleWithAuthor(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("mainTitle", text);
                          setBookId(text?.book_id);
                          setMainTitleList([]);
                          handleUnSavedChanges(1);
                        }}
                      />
                    </div>
                    <div className="col-lg-1 pe-2 ps-2">
                      <TextField
                        id="edition"
                        label="Edition"
                        placeholder="Edition"
                        title={true}
                        tabIndex={8}
                        value={values.edition}
                        error={errors.edition}
                        touched={touched.edition}
                        onChange={(e) => {
                          closeErrors();
                          setFieldValue("edition", e.target.value);
                          handleUnSavedChanges(1);
                        }}
                        maxlength={6}
                        mandatory={1}
                        style={{ minWidth: "65px" }}
                      />
                    </div>
                    <div className="col-lg-1 pe-2 ps-2">
                      <TextField
                        id="pages"
                        label="Pages"
                        placeholder="Pages"
                        title={true}
                        tabIndex={9}
                        value={values.pages > 0 ? values.pages : ""}
                        error={errors.pages}
                        touched={touched.pages}
                        onChange={(e) => {
                          closeErrors();
                          if (preFunction.amountValidation(e.target.value)) {
                            setFieldValue("pages", e.target.value);
                          }
                          handleUnSavedChanges(1);
                        }}
                        maxlength={4}
                        mandatory={1}
                        style={{ minWidth: "65px" }}
                      />
                    </div>
                    <div className="row col-lg-4 no-gutters">
                      <div className="col-lg-4 pe-2 ps-2">
                        <ReactSelectField
                          label="YOP"
                          placeholder="Year"
                          id="yearOfPublish"
                          title={true}
                          tabIndex={10}
                          maxLength={4}
                          error={errors.yearOfPublish}
                          touched={touched.yearOfPublish}
                          value={values.yearOfPublish}
                          options={years}
                          maxlength={4}
                          onChange={(text) => {
                            closeErrors();
                            setFieldValue("yearOfPublish", text);
                            handleUnSavedChanges(1);
                          }}
                        />
                      </div>
                      <div className="col-lg-3 ps-2">
                        <TextField
                          id="accessNumber"
                          label="Access No."
                          placeholder="Start No"
                          title={true}
                          tabIndex={11}
                          value={
                            values.accessNumber > 0 ? values.accessNumber : ""
                          }
                          error={errors.accessNumber}
                          touched={touched.accessNumber}
                          onChange={(e) => {
                            closeErrors();
                            if (preFunction.amountValidation(e.target.value)) {
                              setFieldValue("accessNumber", e.target.value);
                            }
                            handleUnSavedChanges(1);
                          }}
                          mandatory={1}
                          maxlength={7}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row no-gutters">
                    <div className="row no-gutters">
                      <div className="col-lg-5">
                        <div className="row no-gutters">
                          <div className="col-lg-2 pe-2">
                            <TextField
                              id="quantity"
                              label="Qty"
                              placeholder="Qty"
                              tabIndex={12}
                              value={values.quantity > 0 ? values.quantity : ""}
                              error={errors.quantity}
                              touched={touched.quantity}
                              onChange={(e) => {
                                closeErrors();
                                setFieldValue("quantity", e.target.value);
                                handleUnSavedChanges(1);
                              }}
                              maxlength={3}
                              mandatory={1}
                            />
                          </div>
                          <div className="col-lg-3 ps-2 pe-2">
                            <TextField
                              id="mrp"
                              label="MRP (₹)"
                              placeholder="MRP"
                              value={values.mrp > 0 ? values.mrp : ""}
                              error={errors.mrp}
                              touched={touched.mrp}
                              tabIndex={13}
                              onChange={(e) => {
                                closeErrors();
                                handleUnSavedChanges(1);
                                if (
                                  preFunction.amountValidation(e.target.value)
                                ) {
                                  setFieldValue("mrp", e.target.value);
                                  handleDiscountPercent(
                                    values.quantity,
                                    e.target.value,
                                    values.unitPrice
                                  );
                                }
                              }}
                              maxlength={5}
                              mandatory={1}
                            />
                          </div>
                          <div className="col-lg-2 ps-2 pe-2">
                            <div className="row">
                              <div className={"row no-gutters mt-3"}>
                                <label>Disc %</label>
                              </div>
                              <div className="row no-gutters mt-1">
                                {values.discPercent > 0
                                  ? values.discPercent
                                  : "-"}
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-5 ps-2 pe-2">
                            <TextField
                              id="unitPrice"
                              label="Amount (₹) (Qty * 1 Unit)"
                              placeholder=" "
                              tabIndex={14}
                              value={values.unitPrice}
                              error={errors.unitPrice}
                              touched={touched.unitPrice}
                              onChange={(e) => {
                                handleUnSavedChanges(1);
                                closeErrors();
                                if (
                                  !isNaN(e.target.value) &&
                                  !e.target.value.includes(" ")
                                ) {
                                  setFieldValue("unitPrice", e.target.value);
                                  handleDiscountPercent(
                                    values.quantity,
                                    values.mrp,
                                    e.target.value
                                  );
                                }
                              }}
                              maxlength={8}
                              mandatory={1}
                            />
                            {unitPriceError ? (
                              <ErrorMessage Message={message} view={true} />
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-5 pe-2 ps-2">
                        <TextField
                          id="remarks"
                          label="Remarks"
                          placeholder="Remarks"
                          tabIndex={15}
                          value={values.remarks}
                          error={errors.remarks}
                          touched={touched.remarks}
                          onChange={(e) => {
                            handleUnSavedChanges(1);
                            setFieldValue("remarks", e.target.value);
                          }}
                          style={{ minWidth: "120px" }}
                          maxlength={140}
                        />
                      </div>
                      <div className="col-lg-2 mt-4 pt-2 ps-2">
                        <Button
                          text={"Add Book"}
                          label={true}
                          tabIndex={16}
                          frmButton={false}
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                        />
                      </div>
                    </div>
                  </div>

                  {bookAccessNoArr.length > 0 && (
                    <div className="row no-gutters mt-3 pt-1">
                      <div className="subhead-row mt-2">
                        <div className="subhead">Books Added</div>
                        <div className="col line-div"></div>
                      </div>

                      <div className="table-responsive mt-2">
                        <table className="table table-bordered m-0">
                          <thead>
                            <tr>
                              <th>Book Name</th>
                              <th width="5%">Edition</th>
                              <th width="5%">Pages</th>
                              <th width="4%">YOP</th>
                              <th width="12%">Access Number</th>
                              <th>Remarks</th>
                              <th width="3%">Qty</th>
                              <th width="5%">MRP (₹)</th>
                              <th width="3%">Disc %</th>
                              <th width="6%">Total (₹)</th>
                              <th width="8%" colSpan={2}>
                                Update
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookAccessNoArr.map((item, index) => {
                              return (
                                <tr>
                                  <td>{item.mainTitle}</td>

                                  <td>{item.edition}</td>
                                  <td>{item.pages}</td>
                                  <td>{item.yearOfPublish}</td>
                                  <td className="now">
                                    {item.accNoList[0]} {" - "}
                                    {item.accNoList[item.accNoList.length - 1]}
                                  </td>
                                  <td>{item.remarks}</td>
                                  <td align="right">{item.quantity}</td>
                                  <td align="right">{item.mrp}</td>
                                  <td align="right">{item.discPercent}</td>
                                  <td align="right">
                                    {parseFloat(item.unitPrice).toFixed(2)}
                                  </td>
                                  <td align="center">
                                    <img
                                      src={penIcon}
                                      className="delete-icon"
                                      onClick={(e) => handleEditBook(item)}
                                    />
                                  </td>
                                  <td align="center">
                                    <img
                                      src={deleteIcon}
                                      className="delete-icon"
                                      onClick={(e) => handleDeleteBook(item)}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                            <tr>
                              <td
                                colSpan={9}
                                align="right"
                                className=" student-text"
                              >
                                Total
                              </td>
                              <td align="right" className="student-text">
                                {Math.round(totalAdded)}
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </form>
              );
            }}
          </Formik>
          {bookAccessNoArr.length > 0 && (
            <Button
              type="button"
              text={"F4 - Save"}
              onClick={(e) => handlePurchaseAdd()}
              id="save"
            />
          )}
          <Modal
            show={titleOpenModal}
            dialogClassName="title-modal"
            onEscapeKeyDown={() => setTitleOpenModal(false)}
          >
            <Modal.Header>
              <Modal.Title>Title</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <BookTitleComponent
                handleClose={handleCloseTitle}
                titleModal={true}
              />
            </Modal.Body>
          </Modal>
          <Modal
            show={supplierOpenModal}
            dialogClassName="title-modal"
            onEscapeKeyDown={() => setSupplierOpenModal(false)}
          >
            <Modal.Header>
              <Modal.Title>Supplier</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <SupplierComponent
                handleClose={handleCloseSupplier}
                supplierModal={true}
              />
            </Modal.Body>
          </Modal>
          <Modal
            show={openSuggessionModal}
            dialogClassName="title-modal"
            onEscapeKeyDown={() => setOpenSuggessionModal(false)}
          >
            <Modal.Header>
              <Modal.Title>Suggestions</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <div className="mb-2">
                Author/Publisher details of{" "}
                <b>{formikRef?.current?.values?.mainTitle?.label}</b>,
              </div>
              {bookList.length > 0 ? (
                <div className="row no-gutters">
                  <div className="row no-gutters border p-2 px-3">
                    <table className="table table-bordered table-hover">
                      <tr>
                        <th width="25%">Author</th>
                        <th>Publisher</th>
                        <th width="30%">Subject</th>
                        <th width="10%">ISBN</th>
                        <th width="1%">Choose</th>
                      </tr>

                      {bookList.map((item, index) => (
                        <tr>
                          <td>{item.author_name}</td>
                          <td>{item.publisher}</td>
                          <td>{item.subject_name}</td>
                          <td>{item.isbn}</td>
                          <td align="center">
                            <RadioInputField
                              type="radio"
                              id={"bookId"}
                              name={"bookId"}
                              className="radio-input"
                              value={item.name}
                              checked={item.name === bookId}
                              onClick={(e) => {
                                setShowBookIdError(false);
                                setBookId(item.name);
                                setSelectedBook(item);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </table>
                  </div>
                  <ErrorMessage
                    Message={"Please choose the book"}
                    view={showBookIdError}
                  />
                </div>
              ) : (
                <ErrorMessage
                  Message="Author / Publisher details not Available"
                  view={true}
                />
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button
                text={"Add new Title"}
                frmButton={false}
                isTable={true}
                className={"btn-green"}
                onClick={(e) => {
                  setOpenSuggessionModal(false);
                  setTitleOpenModal(true);
                }}
              />
              {bookList.length > 0 && (
                <Button
                  frmButton={false}
                  isTable={true}
                  text={"Choose"}
                  onClick={(e) => {
                    setShowBookIdError(false);
                    if (!bookId) {
                      setShowBookIdError(true);
                    } else {
                      setOpenSuggessionModal(false);
                      console.log("selectedBook--", selectedBook);
                    }
                  }}
                />
              )}
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
