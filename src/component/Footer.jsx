import React from "react";
import { NavLink } from "react-router-dom";
import moment from "moment";
import string from "../string";

function Footer() {
  return (
    <div className="footer">
      <footer>
        <div className="pt-3">
          Copyright © {moment(new Date()).format("yyyy")} &nbsp; SMV HealthCare
          Private Limited {string.version}
        </div>
        <div className="mb-1">
          <a href="./" style={{ color: "#000", textDecoration: "none" }}>
            Home
          </a>{" "}
          |{" "}
          <a
            href="./termsandcondition"
            style={{ color: "#000", textDecoration: "none" }}
          >
            Terms and Conditions
          </a>{" "}
          |{" "}
          <a href="/aboutus" style={{ color: "#000", textDecoration: "none" }}>
            About Us
          </a>{" "}
          |{" "}
          <a
            href="./privacypolicy"
            style={{ color: "#000", textDecoration: "none" }}
          >
            Privacy Policy
          </a>{" "}
          |{" "}
          <a href="./faq" style={{ color: "#000", textDecoration: "none" }}>
            FAQ
          </a>
          |{" "}
          <a href="./contact" style={{ color: "#000", textDecoration: "none" }}>
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
