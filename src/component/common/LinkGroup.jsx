import React from "react";
import { Link, useLocation } from "react-router-dom";

function LinkGroup({
  to,
  className,
  title,
  onClick,
  icon,
  src,
  link,
  preTitle = "",
  ...otherProps
}) {
  const location = useLocation();
  // console.log(location.pathname, "useLocation");
  return (
    <ul className="list-group">
      <Link
        to={to}
        className={
          location.pathname === link
            ? "list-group-item list-group-item-action active"
            : "list-group-item list-group-item-action "
        }
        aria-current="true"
        onClick={onClick}
        {...otherProps}
      >
        {preTitle != "" ? (
          <span style={{ fontSize: "13px" }}>{preTitle} &nbsp;</span>
        ) : (
          icon
        )}
        {src && <img src={src} />}
        {"    "}
        {title}
      </Link>
    </ul>
  );
}

export default LinkGroup;
