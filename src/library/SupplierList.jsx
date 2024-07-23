import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import libraryapi from "../api/libraryapi";

import headingSvg from "../assests/svg/book-library-memberlist-head.svg";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import string from "../string";
import TextField from "../component/FormFieldLibrary/TextField";
import ScreenTitle from "../component/common/ScreenTitle";

function SupplierList() {
  //#region const
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [supplierNameError, setSupplierNameError] = useState(false);
  const [supplierNameLength, setSupplierNameLength] = useState(false);
  const [changes, setChanges] = useState(true);

  const handleSearchSupplier = async (value) => {
    console.log("value---", value, showLoadMore);
    document.getElementById("supplierName")?.focus();
    setShowLoadMore(false);
    setSupplierNameError(false);
    if (value == "") {
      setSupplierNameError(true);
      console.log("value---", supplierName);
      document.getElementById("supplierName")?.focus();
      return;
    }
    if (value.length < 3) {
      setSupplierNameLength(true);
      console.log("value---", supplierName);
      document.getElementById("supplierName")?.focus();
      return;
    }
    if (!changes) return;
    try {
      setLoad(true);
      const supplierSearchRes = await libraryapi.getAllSupplierList(
        string.PAGE_LIMIT,
        value
      );
      console.log("supplierSearchRes---", supplierSearchRes);
      setData(supplierSearchRes.data.message);
      document.getElementById("supplierName").select();
      setChanges(false);
      if (supplierSearchRes.data.message.length === string.PAGE_LIMIT) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const getSupplierList = async (showAll, value) => {
    console.log("value---", value, changes);
    document.getElementById("supplierName")?.focus();
    setSupplierNameError(false);
    setSupplierNameLength(false);
    setShowLoadMore(false);
    try {
      setLoad(true);
      setShowRes(true);
      const supplierRes = await libraryapi.getAllSupplierList(
        showAll == 1 ? null : string.PAGE_LIMIT,
        value
      );
      console.log("supplier---", supplierRes);
      setData(supplierRes.data.message);
      document.getElementById("supplierName").select();
      setChanges(false);
      if (supplierRes.data.message.length === string.PAGE_LIMIT) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
      document.getElementById("supplierName")?.focus();
      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  useEffect(() => {
    setChanges(true);
    getSupplierList(0);
  }, []);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <div className="row no-gutters">
            <div className="col-lg-3 pe-2">
              <TextField
                autoFocus
                label="Supplier Name"
                id="supplierName"
                mandatory={1}
                value={supplierName}
                onChange={(e) => {
                  if (!e.target.value || e.target.value === "") {
                    setSupplierName("");
                    getSupplierList(0, e.target.value);
                  } else setSupplierName(e.target.value);
                  setSupplierNameError(false);
                  setSupplierNameLength(false);
                  setChanges(true);
                }}
                error={
                  supplierNameError
                    ? "Please enter Supplier Name"
                    : supplierNameLength
                    ? "Please enter min 3 character to search"
                    : ""
                }
                touched={
                  supplierNameError ? true : supplierNameLength ? true : false
                }
                onKeyUp={(e) =>
                  e.keyCode == 13 && handleSearchSupplier(e.target.value)
                }
              />
            </div>
            <div className="col-lg-2 ps-2">
              <Button
                type="button"
                label={true}
                isTable={true}
                isCenter={false}
                onClick={() => {
                  handleSearchSupplier(supplierName ? supplierName : "");
                }}
                text="Search"
              />
            </div>
          </div>
          {showRes && (
            <>
              <div className="row no-gutters">
                <div className="row totcntstyle"></div>
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          <th width="1%">No.</th>
                          <th width="20%">Supplier Name</th>
                          <th width="5%">Phone Number</th>
                          <th>Address</th>
                          <th width="15%">State</th>
                          <th width="15%">City</th>
                          <th width="5%">Pincode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.length == 0 ? (
                          <tr>
                            <td colSpan="10" className="text-center">
                              No Supplier found
                            </td>
                          </tr>
                        ) : (
                          data.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.supplier_name}</td>
                                <td>{item.mobile_no}</td>
                                <td>{item.address_line1}</td>
                                <td>{item.state}</td>
                                <td>{item.city}</td>
                                <td>{item.pincode}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {showLoadMore && (
                    <Button
                      text="Show All"
                      type="button"
                      className={"btn mt-2"}
                      isTable={true}
                      onClick={(e) => {
                        getSupplierList(1, supplierName);
                      }}
                    />
                  )}
                </>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default SupplierList;
