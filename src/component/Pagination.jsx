import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

const Pagination = (props) => {
  const { itemsCount, pageSize, currentPage, onPageChange } = props;
  const pageCount = Math.ceil(itemsCount / pageSize);
  if (pageCount === 1) return null;
  const pages = _.range(1, pageCount + 1);
  return (
    <nav>
      <ul className="pagination pointer" style={{ marginBottom: 0 }}>
        <li className={currentPage === 1 ? "page-item active" : "page-item"}>
          <a
            className="page-link"
            onClick={currentPage === 1 ? null : () => onPageChange(1)}
          >
            {"<<"}
          </a>
        </li>
        <li className="page-item">
          <a
            className="page-link"
            onClick={
              currentPage === 1 ? null : () => onPageChange(currentPage - 1)
            }
          >
            {"<"}
          </a>
        </li>
        {pages
          .slice(
            pages.length < 6
              ? 0
              : currentPage > pages.length - 4
              ? pages.length - 5
              : currentPage > 3
              ? currentPage - 2
              : 0,
            currentPage > 3 ? currentPage + 3 : 5
          )
          .map((page) => (
            <li
              className={
                page === currentPage ? "page-item active" : "page-item"
              }
              key={page}
            >
              <a
                href="javascript:void(0)"
                className="page-link"
                onClick={() => onPageChange(page)}
              >
                {page}
              </a>
            </li>
          ))}
        <li className="page-item">
          <a
            className="page-link"
            onClick={
              currentPage === pages.length
                ? null
                : () => onPageChange(currentPage + 1)
            }
          >
            {">"}
          </a>
        </li>
        <li
          className={
            currentPage === pages.length ? "page-item active" : "page-item"
          }
        >
          <a
            className="page-link"
            onClick={
              currentPage === pages.length
                ? null
                : () => onPageChange(pages.length)
            }
          >
            {">>"}
          </a>
        </li>
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  itemsCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
