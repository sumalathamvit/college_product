import React from "react";

function TableHeader({ columns }) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            className="clickable"
            // key={column.path || column.key}
            // onClick={() => this.raiseSort(column.path)}
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default TableHeader;
