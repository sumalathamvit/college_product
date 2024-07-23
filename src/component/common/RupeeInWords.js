import React from "react";

const RupeeInWords = ({ number, needOnly = false }) => {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "Ten",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convert = (num) => {
    if (num < 10) {
      return units[num];
    } else if (num >= 11 && num <= 19) {
      return teens[num - 10];
    } else if (num % 10 === 0 && num < 100) {
      return tens[num / 10];
    } else {
      return tens[Math.floor(num / 10)] + " " + units[num % 10];
    }
  };

  const inWords = (num) => {
    if (num === 0) return "Zero";
    let words = "";
    if (num >= 10000000) {
      words += inWords(Math.floor(num / 10000000)) + " Crore ";
      num %= 10000000;
    }
    if (num >= 100000) {
      words += inWords(Math.floor(num / 100000)) + " Lakh ";
      num %= 100000;
    }
    if (num >= 1000) {
      words += inWords(Math.floor(num / 1000)) + " Thousand ";
      num %= 1000;
    }
    if (num >= 100) {
      words += inWords(Math.floor(num / 100)) + " Hundred ";
      num %= 100;
    }
    if (num > 0) {
      if (words !== "") words += "and ";
      words += convert(num);
    }
    return words;
  };

  return (
    <>
      {needOnly ? (
        <span>{inWords(number).toUpperCase()}</span>
      ) : (
        <span>
          {inWords(number)}
          {" Only"}
        </span>
      )}
    </>
  );
};

export default RupeeInWords;
