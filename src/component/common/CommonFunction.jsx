import React, { forwardRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import calendarIcon from "../../assests/svg/calendar.svg";
import moment from "moment";
import storage from "../../auth/storage";
import { Padding } from "@mui/icons-material";

const displayTimeFormat = (time) => {
  return time.split(":")[0] + ":" + time.split(":")[1];
};

const hideNavbar = () => {
  if (document.getElementById("SideNavBar"))
    document.getElementById("SideNavBar").className =
      "menulistshow navbarvertical";

  if (document.getElementById("dropdownId"))
    document.getElementById("dropdownId").style.display = "none";
};

const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

const DateCustomInput = forwardRef(
  (
    {
      id = "",
      value,
      onClick,
      mandatory = 0,
      setFieldTouched = "",
      touchId = "",
      monthCal = false,
    },
    ref
  ) => (
    <button
      type="button"
      id={id}
      className={`datepicker form-input ${!mandatory && "non-mandatory-input"}`}
      onClick={onClick}
      onBlur={() => (setFieldTouched ? setFieldTouched(touchId) : null)}
      ref={ref}
    >
      {value ? value : monthCal ? "MMM-YYYY" : "DD-MM-YYYY"}{" "}
      <img src={calendarIcon} />
    </button>
  )
);

const capitalizeFirst = (str) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
};

const capitalizeFirstLowerOther = (str) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
};

const formatIndianNumber = (number) => {
  return Intl.NumberFormat("en-IN").format(number);
};

const isEmail = (email) => {
  const regex = /^([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+)\.([a-zA-Z]{2,6})$/;
  return regex.test(email);
};

const isMobile = (phone) => {
  const regex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return regex.test(phone);
};

const handleSpaceInData = (value) => {
  value = value.trim(value);
  value = value.replace(/\s+/g, " ");
  return value;
};

const isPassportNo = (passport) => {
  const regex = /^[A-PR-WY][1-9]\d\s?\d{4}[1-9]$/;
  return regex.test(passport);
};

const isPfNo = (pfNo) => {
  const regex =
    /^[A-Z]{2}[\\s\\/]?[A-Z]{3}[\\s\\/]?[0-9]{7}[\\s\\/]?[0-9]{3}[\\s\\/]?[0-9]{7}$/;
  return regex.test(pfNo);
};

const isPanNo = (pan) => {
  const regex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
  return regex.test(pan);
};

function downloadCSV(data, filename) {
  let csvContent =
    "data:text/csv;charset=utf-8," +
    data.map((row) => row.join(",")).join("\n");
  //replace # with NO:
  csvContent = csvContent.replace(/#/g, "NO:");

  console.log("csvContent---", csvContent);
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();
}

const generatePDF = (
  collegeName,
  filename,
  data,
  columnWidths = [],
  border = false,
  pageOrientation = "Portrait",
  headingWidth = false,
  pageFormat = "a3",
  toPrint = false
) => {
  const doc = new jsPDF({
    orientation: pageOrientation,
    font: "helvetica",
    format: pageFormat,
  });
  const pageWidth = doc.internal.pageSize.getWidth();

  const imgUrl = sessionStorage.getItem("LOGO_BASE64") ?? "/pdf_logo.png";
  if (pageOrientation == "Portrait") {
    doc.addImage(imgUrl, "PNG", 30, 5, 10, 10);
  } else {
    doc.addImage(imgUrl, "PNG", 73, 5, 10, 10);
  }
  doc.setFontSize(15);
  doc.text(collegeName, pageWidth / 2, 9, {
    align: "center",
    fontStyle: "bold",
  });
  const headingStyles = {
    fontSize: 12, // Adjust the font size as needed
    color: [1, 0, 0], // RGB color for text (e.g., black)
    fontStyle: "bold", // Make the text bold
    align: "center", // Center the text
  };
  doc.setFontSize(headingStyles.fontSize);
  doc.setTextColor(
    headingStyles.color[0],
    headingStyles.color[1],
    headingStyles.color[2]
  );
  doc.text(filename, pageWidth / 2, 14, headingStyles);
  doc.setFontSize(10);

  var totalWidth = doc.internal.pageSize.getWidth(); // Get the width of the page

  var columnStyles = [];
  if (columnWidths?.length > 0) {
    for (let i = 0; i < columnWidths.length - 1; i++) {
      columnStyles.push({
        columnWidth: totalWidth * columnWidths[i],
      });
    }
  }
  console.log("columnStyles--", columnStyles);

  doc.setLineWidth(0.5);
  const tableWidth = pageWidth - 3;
  const calculatedWidths = columnWidths.map(
    (width) => (width / 100) * tableWidth
  );
  const columnStyles11 = {};
  calculatedWidths.forEach((width, index) => {
    columnStyles11[index] = { columnWidth: width };
  });

  console.log("columnStyles11--", columnStyles11);

  if (data.length > 0) {
    doc.autoTable({
      head: [data[0]], // The header row
      body: data.slice(1), // The data rows (excluding the header)
      startY: 15,
      margin: { left: 2, right: 2 },
      theme: border ? "grid" : "plain",
      styles: {
        cellPadding: 0.5,
        cellSpacing: 0,
        hlineWidth: 0,
        vlineWidth: 0,
      },
      //set color for table body
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [50, 50, 50],
        // minCellHeight: 6,
        cellPadding: {
          top: 1,
          left: border ? 1 : 0,
          right: border ? 1 : 0,
          bottom: 0,
        },
      },

      headStyles: {
        cellSpacing: 0,
        minCellHeight: 8,
        valign: "middle",
      },
      didDrawCell: (data) => {
        doc.setDrawColor(0);
        doc.setLineWidth(0.1);
        if (data.section === "head") {
          doc.setDrawColor(0);
          doc.setLineWidth(0.1);
          doc.line(
            data.cell.x,
            data.cell.y,
            data.cell.x + data.cell.width,
            data.cell.y
          );
          doc.setDrawColor(0);
          doc.setLineWidth(1);
          doc.line(
            data.cell.x,
            data.cell.y + data.cell.height,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height
          );
        }
      },
    });
  }

  let totalPages = doc.internal.getNumberOfPages();
  const pageNumberStyle = {
    align: "right",
    fontSize: 8,
  };
  doc.setFontSize(pageNumberStyle.fontSize);
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text(
      moment().format("DD-MM-yyyy"),
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `(C) Copyrights to ${sessionStorage.getItem("COMPANY")}.`,
      15,
      doc.internal.pageSize.getHeight() - 10
    );
  }
  doc.save(filename + ".pdf");

  // Open the generated PDF in a new tab and print
  if (toPrint) {
    const printWindow = window.open(doc.output("bloburl"));
    printWindow.onload = function () {
      printWindow.print();
    };
  }
};

const generatePDFContent = async (
  collegeName,
  filename,
  thead,
  data,
  columnWidths = [],
  pageOrientation = "Portrait",
  pageFormat = "a4",
  border = false,
  filterAlign = "center"
) => {
  const institueArr = storage.getInstituteArray();

  console.log("institueArr--", institueArr);

  const doc = new jsPDF({
    orientation: pageOrientation,
    font: "helvetica",
    format: pageFormat,
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  console.log("pageWidth--", pageWidth);

  let imgUrl = "";

  if (institueArr) {
    const logoObj = institueArr.find((obj) => obj.name == collegeName);
    imgUrl = logoObj?.base64;
  }

  console.log("imgUrl--", imgUrl);
  if (pageOrientation == "Portrait") {
    doc.addImage(imgUrl, "PNG", 30, 5, 10, 10);
  } else {
    doc.addImage(imgUrl, "PNG", 73, 5, 10, 10);
  }
  doc.setFontSize(15);
  doc.text(collegeName.toUpperCase(), pageWidth / 2, 9, {
    align: "center",
    fontStyle: "bold",
  });
  const headingStyles = {
    fontSize: 12, // Adjust the font size as needed
    color: [1, 0, 0], // RGB color for text (e.g., black)
    fontStyle: "bold", // Make the text bold
    align: "center", // Center the text
  };
  doc.setFontSize(headingStyles.fontSize);
  doc.setTextColor(
    headingStyles.color[0],
    headingStyles.color[1],
    headingStyles.color[2]
  );
  doc.text(filename, pageWidth / 2, 15, headingStyles);
  doc.setFontSize(10);

  doc.setLineWidth(0.5);
  const tableWidth = parseInt(pageWidth) - 3;
  console.log("tableWidth--", tableWidth);
  let colStyle = [];
  for (let i = 0; i < columnWidths.length; i++) {
    const calculatedWidths = columnWidths[i].map(
      (width) => (width / 100) * tableWidth
    );
    const columnStyles11 = {};
    calculatedWidths.forEach((width, index) => {
      columnStyles11[index] = {
        cellWidth: parseInt(width),
        color: [0, 0, 0],
      };
    });
    colStyle.push(columnStyles11);
  }
  let startYOffset = 16;
  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      doc.autoTable({
        head: thead[i],
        repeatHeaders: true,
        body: data[i],
        startY: startYOffset,
        margin: { left: 2, right: 3 },
        theme: border ? "grid" : "plain", // theme: "grid",
        styles: {
          cellPadding: 0.5,
          cellSpacing: 0,
          hlineWidth: 0,
          vlineWidth: 0,
          halign: i === 0 ? filterAlign : "left",
        },
        //set color for table body
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [50, 50, 50],
          // minCellHeight: 5,
          valign: "middle",
          // apply styles to padding of cell
          cellPadding: {
            top: 2,
            left: border ? 1 : 0,
            right: border ? 1 : 0,
            bottom: 0,
          },
        },

        headStyles: {
          // cellSpacing: 0,
          // minCellHeight: 8,
          valign: "middle",
          // cellPadding: border ? { left: 1, right: 1 } : 0,
          cellPadding: {
            top: 2,
            left: border ? 1 : 0,
            right: border ? 1 : 0,
            bottom: 2,
          },
        },
        columnStyles: colStyle[i],
        didDrawCell: (data) => {
          doc.setDrawColor(0);
          doc.setLineWidth(0.1);
          if (data.section === "head") {
            doc.setLineWidth(0.1);
            if (border) {
              doc.setDrawColor(158);
              //put lines on all sides of cell
              doc.line(
                data.cell.x,
                data.cell.y,
                data.cell.x + data.cell.width,
                data.cell.y
              );
              doc.line(
                data.cell.x,
                data.cell.y,
                data.cell.x,
                data.cell.y + data.cell.height
              );
              doc.line(
                data.cell.x + data.cell.width,
                data.cell.y,
                data.cell.x + data.cell.width,
                data.cell.y + data.cell.height
              );
              doc.line(
                data.cell.x,
                data.cell.y + data.cell.height,
                data.cell.x + data.cell.width,
                data.cell.y + data.cell.height
              );
            } else {
              doc.setDrawColor(0);
              doc.line(
                data.cell.x,
                data.cell.y,
                data.cell.x + data.cell.width,
                data.cell.y
              );
              // doc.setDrawColor(0);
              doc.setLineWidth(1);
              doc.line(
                data.cell.x,
                data.cell.y + data.cell.height,
                data.cell.x + data.cell.width,
                data.cell.y + data.cell.height
              );
            }
          }
          if (data.section === "body") {
            // if (data?.row?.index === 0) {
            //   console.log("hello data---", data.row);
            //   data.cell.y += 100; // Increase the top margin by 10 units (adjust as needed)
            // }
            if (data?.row?.raw[0]?.styles?.topLine === 1) {
              doc.setDrawColor(0);
              doc.setLineWidth(0.1);
              doc.line(
                data.cell.x,
                data.cell.y,
                data.cell.x + data.cell.width,
                data.cell.y
              );
              doc.line(
                data.cell.x,
                data.cell.y + data.cell.height,
                data.cell.x + data.cell.width,
                data.cell.y + data.cell.height
              );
            } else if (data?.row?.raw[0]?.styles?.topLine === 2) {
              doc.setDrawColor(0);
              doc.setLineWidth(0.1);
              doc.line(
                data.cell.x,
                data.cell.y,
                data.cell.x + data.cell.width,
                data.cell.y
              );
            }

            data?.row?.raw.map((cell, index) => {
              if (cell?.image) {
                doc.addImage(
                  cell.image,
                  data.cell.x + 5,
                  data.cell.y + 5,
                  cell.width,
                  cell.height
                );
              }
            });
          }
        },
      });
      //get content height only
      startYOffset = doc.previousAutoTable.finalY + 1;
    }
  }

  let totalPages = doc.internal.getNumberOfPages();
  const pageNumberStyle = {
    align: "right",
    fontSize: 8,
  };
  doc.setFontSize(pageNumberStyle.fontSize);
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text(
      moment().format("DD-MM-yyyy"),
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 30,
      doc.internal.pageSize.getHeight() - 5
    );
    doc.text(
      `(C) Copyrights to ${sessionStorage.getItem("COMPANY")}.`,
      15,
      doc.internal.pageSize.getHeight() - 5
    );
  }
  doc.save(filename + ".pdf");
};

const handleErrorFocus = (errors) => {
  console.log("errors---", errors);
  if (Object.keys(errors).length > 0) {
    const firstErrorField = Object.keys(errors)[0];
    console.log("firstErrorField---", firstErrorField);
    document.getElementById(firstErrorField)?.focus();
  }
};

const validateText = (text) => {
  return text?.trim();
};

const reactSelectNoOptionsMessage = (text) => {
  if (text.inputValue.length > 2) return <div>No options</div>;
  else return <div>Type to search</div>;
};

const periodList = (num) => {
  let periodList = [];
  for (let i = 1; i <= num; i++) {
    const obj = {
      label: "Period-" + i,
      value: i,
      periodID: i,
    };
    // periodList.push(obj);
    periodList = [...periodList, obj];
  }
  return periodList;
};

const amountValidation = (value) => {
  return !isNaN(value) && !value.includes(" ") && !value.includes(".");
};

function slideToTarget(targetElement) {
  targetElement?.scrollIntoView({ behavior: "smooth" });
}

const numberToWordsWithOrdinal = (number) => {
  const words = [
    "",
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "eleventh",
    "twelfth",
    "thirteenth",
    "fourteenth",
    "fifteenth",
    "sixteenth",
    "seventeenth",
    "eighteenth",
    "nineteenth",
    "twentieth",
    "twenty-first",
    "twenty-second",
    "twenty-third",
    "twenty-fourth",
    "twenty-fifth",
    "twenty-sixth",
    "twenty-seventh",
    "twenty-eighth",
    "twenty-ninth",
    "thirtieth",
    "thirty-first",
  ];
  if (number < 32) {
    return words[number]?.toUpperCase();
  }
};

const calculateDifference = (fromTime, toTime) => {
  const time1 = fromTime.split(":");
  const time2 = toTime.split(":");
  console.log("time1---", time1);
  console.log("time2---", time2);
  const date1 = new Date(0, 0, 0, time1[0], time1[1], time1[2] || 0);
  const date2 = new Date(0, 0, 0, time2[0], time2[1], time2[2] || 0);

  const differenceInMillis = date2.getTime() - date1.getTime();
  console.log("differenceInMillis---", differenceInMillis);

  if (differenceInMillis < 0) {
    return "00:00:00";
  }

  const hours = Math.floor(differenceInMillis / 3600000)
    .toString()
    .padStart(2, "0");

  const minutes = Math.floor(differenceInMillis / 60000)
    .toString()
    .padStart(2, "0");

  const seconds = Math.floor((differenceInMillis % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

const getDaysPassed = (date) => {
  const startOfYear = new Date(new Date(date).getFullYear(), 0, 1);
  const diffTime = Math.abs(date - startOfYear);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
const convertDateFormat = (dateString) => {
  // Split the input date string into an array [YYYY, MM, DD]
  let date = moment(new Date(dateString), "YYYY-MM-DD");

  // Format the date to DD-MM-YYYY
  return date.format("DD-MM-YYYY");
};

const convertDecimalToTime = (decimalTime) => {
  const hours = Math.floor(decimalTime);
  const minutes = Math.round((decimalTime - hours) * 60);
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${formattedMinutes}`;
};

const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
};

export default {
  range,
  hideNavbar,
  DateCustomInput,
  displayTimeFormat,
  capitalizeFirst,
  isEmail,
  isMobile,
  handleSpaceInData,
  isPassportNo,
  isPfNo,
  isPanNo,
  generatePDF,
  handleErrorFocus,
  validateText,
  downloadCSV,
  reactSelectNoOptionsMessage,
  periodList,
  amountValidation,
  generatePDFContent,
  slideToTarget,
  capitalizeFirstLowerOther,
  formatIndianNumber,
  numberToWordsWithOrdinal,
  calculateDifference,
  getDaysPassed,
  convertDateFormat,
  convertDecimalToTime,
  arraysEqual,
};
