import React, { useEffect, useState } from "react";
import string from "../string";

const PageHeader = () => {
  const [currentPage, setCurrentPage] = useState("");

  const handleToggle = () => {
    if (
      document.getElementById("mynavbar").style.display == "" ||
      document.getElementById("mynavbar").style.display == "none"
    )
      document.getElementById("mynavbar").style.display = "flex";
    else document.getElementById("mynavbar").style.display = "none";
  };

  useEffect(() => {
    const currentpage = window.location.href;
    const currPage = currentpage.substring(
      currentpage.lastIndexOf("/") + 1,
      currentpage.length
    );
    setCurrentPage(currPage);
  }, []);
  return (
    <>
      <div className="row no-gutters pageheader">
        <nav className="navbar navbar-expand-lg navbar">
          <div className="container-fluid p-0">
            <div className="row no-gutters">
              <div className="col-2">
                <button
                  className="navbar-toggler mt-2"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mynavbar"
                  onClick={(e) => handleToggle()}
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
              </div>
              <div className="col-10">
                <a className="navbar-brand" href="/">
                  <img
                    src={require("../assests/png/Cloud_Clinic.png")}
                    alt={string.INSTITUTE_NAME + " Home"}
                  />
                </a>
              </div>
            </div>
            <div className="row collapse navbar-collapse " id="mynavbar">
              <div className="col-lg-5 toptext" id="txtnav">
                <span style={{ marginLeft: "10%" }}>CLINIC MANAGEMENT</span>
              </div>
              <div className="col-lg-7">
                <ul className="navbar-nav" style={{ float: "right" }}>
                  <li className="welcome-nav-item">
                    <a
                      className={
                        currentPage == "doctormobileotp"
                          ? "nav-link navSelected"
                          : "nav-link"
                      }
                      href="/login"
                    >
                      LOGIN
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default PageHeader;
