import React, { useContext, useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";

import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import preFunction from "../../component/common/CommonFunction";

import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import AuthContext from "../../auth/context";

const occupancySchema = Yup.object().shape({
  buildingName: Yup.object().required("Please select building"),
});

function HostelOccupancyStatistics() {
  const { collegeId, collegeName } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [buildingList, setBuildingList] = useState([]);
  const [roomCategoryList, setRoomCategoryList] = useState([]);

  const [showRes, setShowRes] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearList = [];
  for (let year = currentYear; year >= currentYear - 50; year--) {
    yearList.push({ label: year, value: year });
  }

  const handleCSVData = async (values, report) => {
    try {
      console.log("reportValues---", values);

      let csvData = [
        ["No.", "Room No.", "Room Category", "Occupied", "Available", "Total"],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.roomNo,
          item.roomCategory,
          item.occupied,
          item.available,
          item.total,
        ];
      });
      if (report == 1) {
        preFunction.generatePDF(
          collegeName,
          "Hostel Occupancy Statistics",
          csvData
        );
      } else {
        preFunction.downloadCSV(csvData, "Hostel Occupancy Statistics.csv");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleShow = async (values, showAll, report) => {
    if (load) return;

    try {
      if (report > 0) {
        handleCSVData(data, report);
        return;
      }
      setLoad(true);
      console.log(values, "values");
      setShowRes(true);
      if (report == 0) {
        setData([]);
      }
      setShowRes(true);
      const occupancyRes = await StudentApi.getOccupancyStatistics(
        values.buildingName.id,
        values.roomCategory ? values.roomCategory.id : null,
        showAll
      );
      console.log("occupancyRes---", occupancyRes);
      setData(occupancyRes.data.message.hostel_report);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getList = async () => {
    try {
      const masterRes = await StudentApi.getMaster(7);
      console.log("masterRes---", masterRes);
      setRoomCategoryList(masterRes.data.message.data.room_category);
      setBuildingList(masterRes.data.message.data.building);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position"} />
        <div className="row no-gutters mt-4">
          <Formik
            enableReinitialize={true}
            initialValues={{
              buildingName: "",
              roomCategory: "",
              year: "",
            }}
            validationSchema={occupancySchema}
            onSubmit={(values) => handleShow(values)}
          >
            {({
              errors,
              values,
              touched,
              setFieldTouched,
              handleSubmit,
              handleChange,
              handleBlur,
              setFieldValue,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="col-lg-9">
                    <SelectFieldFormik
                      autoFocus
                      label="Building Name"
                      labelSize={3}
                      tabIndex={2}
                      id="buildingName"
                      options={buildingList}
                      mandatory={1}
                      getOptionLabel={(option) => option.building}
                      getOptionValue={(option) => option.id}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("buildingName", text);
                      }}
                    />
                    <SelectFieldFormik
                      label="Room Category"
                      labelSize={3}
                      tabIndex={3}
                      id="roomCategory"
                      options={roomCategoryList}
                      getOptionLabel={(option) => option.roomCategory}
                      getOptionValue={(option) => option.id}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("roomCategory", text);
                      }}
                    />
                  </div>
                  <Button
                    text="Show"
                    tabIndex={4}
                    isTable={true}
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                  />

                  {showRes ? (
                    <div className="row border mt-4 p-3">
                      {data.length > 0 && (
                        <div className="row no-gutters totcntstyle  mb-2">
                          <div className="col-lg-6"></div>
                          <div className="col-lg-6 text-right">
                            <button
                              type="button"
                              className="btn"
                              onClick={(e) => {
                                handleShow(values, 1, 2);
                              }}
                            >
                              Export Excel
                            </button>
                            &nbsp; &nbsp;
                            <button
                              type="button"
                              className="btn"
                              onClick={(e) => {
                                handleShow(values, 1, 1);
                              }}
                            >
                              Export PDF
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="table-responsive p-0">
                        <table
                          className="table table-bordered report-table table-bordered"
                          id="pdf-table"
                        >
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th width="5%">Room No.</th>
                              <th>Room Category</th>
                              <th width="1%">Occupied</th>
                              <th width="1%">Available</th>
                              <th width="2%">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.map((item, index) => {
                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>{item.roomNo}</td>
                                  <td>{item.roomCategory}</td>
                                  <td align="right">{item.occupied}</td>
                                  <td align="right">{item.available}</td>
                                  <td align="right">{item.total}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default HostelOccupancyStatistics;
