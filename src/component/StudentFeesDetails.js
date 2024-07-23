import React, { useEffect, useState } from "react";
import TextField from "./FormField/TextField";
import preFunction from "./common/CommonFunction";

function StudentFeesDetails({
  item,
  index,
  handleAmount,
  particular,
  initialAmount,
}) {
  return (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>{item.enrollNo}</td>
      <td>{item.name}</td>
      <td>{particular}</td>
      <td>
        <TextField
          autoFocus={index == 0 ? true : false}
          id={"amount" + index}
          name="amount"
          placeholder=" "
          value={item.amount}
          mandatory={1}
          maxlength={7}
          isAmount={true}
          isTable={true}
          tabIndex={index + 6}
          onChange={(e) => {
            if (preFunction.amountValidation(e.target.value)) {
              handleAmount(item, index, e.target.value);
            }
          }}
        />
      </td>
    </tr>
  );
}

export default StudentFeesDetails;
