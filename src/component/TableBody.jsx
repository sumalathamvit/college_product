import React from "react";
import _ from "lodash";

function TableBody({ data, columns }) {
  const renderCell = (item, column) => {
    if (column.content) return column.content(item);

    return _.get(item, column.path);
  };
  return (
    <tbody>
      {data.map((item) => (
        <tr>
          {columns.map((column) => (
            <td
            // key={this.createKey(item, column)}
            >
              {renderCell(item, column)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export default TableBody;
