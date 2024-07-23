import React, { useEffect, useState } from "react";
import TextField from "./FormField/TextField";

function PaymentDetails({
  item,
  index,
  className,
  handleAmount,
  initialAmount,
}) {
  const [amount, setAmount] = useState("0");
  useEffect(() => {
    // setAmount(initialAmount);
  }, [initialAmount]);

  return (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>{item.particular}</td>
      <td align="right">{item.grand_total}</td>
      <td align="right">{item.outstanding_amount}</td>
      <td align="right">
        <TextField
          isAmount={true}
          maxlength={7}
          id="amount"
          name="amount"
          placeholder=" "
          value={item.amount > 0 ? item.amount : ""}
          mandatory={1}
          onChange={(e) => {
            if (!isNaN(e.target.value) && !e.target.value.includes(" ")) {
              setAmount(e.target.value);
              handleAmount(item, index, e.target.value);
            }
          }}
        />
      </td>
    </tr>
  );
}

export default PaymentDetails;
