import React from "react";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";

function Table({ data, columns, className, ...otherProps }) {
  return (
    <table className={className} {...otherProps}>
      <TableHeader columns={columns} />
      <TableBody columns={columns} data={data} />
    </table>
  );
}

export default Table;
