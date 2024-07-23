import React, { useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";

import { ComponentToPrint } from "./ComponentToPrint";
import Button from "../FormField/Button";

const PdfComponent = ({
  printContent,
  handleClick,
  paperSize = "a4",
  orientation = "portrait",
}) => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
    @page {
      size: ${paperSize} ${orientation};
      color-adjust: exact;
    }
    /* Hide header and footer */
    @media print {
      @page {
        margin-top: ${paperSize === "a5" ? "4%" : "2%"};
        margin-bottom: 0;
      }
      .hide-on-print {
        display: none !important; /* Hide elements with this class when printing */
      }
    }
  `,
  });

  useEffect(() => {
    handlePrint();
  }, []);

  return (
    <div>
      <ComponentToPrint ref={componentRef} content={printContent} />
      <div className="text-center">
        <Button
          frmButton={false}
          tabIndex={1}
          type="button"
          onClick={handlePrint}
          text="Print"
        />
        <Button
          autoFocus
          tabIndex={2}
          className={"btn ms-2"}
          frmButton={false}
          text={"Close"}
          onClick={() => handleClick()}
        />
      </div>
    </div>
  );
};
export default PdfComponent;
