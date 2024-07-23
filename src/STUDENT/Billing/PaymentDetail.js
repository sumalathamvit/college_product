import React, { useState } from "react";
import { useSelector } from "react-redux";

import TextField from "../../component/FormField/TextField";
import ErrorMessage from "../../component/common/ErrorMessage";
import preFunction from "../../component/common/CommonFunction";

function PaymentDetails({
  item,
  index,
  handleAmount,
  closeErrors,
  tabIndex = 0,
}) {
  const collegeConfig = useSelector((state) => state.web.college);
  const [amount, setAmount] = useState("0");
  return (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>
        {collegeConfig.institution_type === 1 ? item.className : item.semester}
      </td>
      <td>
        {item.particular}{" "}
        {item.boardingPlace ? "( " + item.boardingPlace + " )" : null}
      </td>
      <td align="right">{item.openingBalance}</td>
      <td align="right">{item.concession}</td>
      <td align="right">{item.paid}</td>
      <td align="right">{item.refund}</td>
      <td align="right">{item.balance}</td>
      <td align="right">
        <TextField
          tabIndex={tabIndex + index}
          isAmount={true}
          maxlength={7}
          id={`amount${index}`}
          placeholder=" "
          value={item.amount}
          mandatory={1}
          onChange={(e) => {
            closeErrors();
            if (preFunction.amountValidation(e.target.value)) {
              setAmount(e.target.value);
              handleAmount(item, index, e.target.value);
            }
          }}
          style={{ width: "70%" }}
        />
        <ErrorMessage
          Message={item.amountErrorMessage}
          view={item.amountError}
        />
      </td>
    </tr>
  );
}

export default PaymentDetails;
