import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";

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

function HostelOccupancyReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const { collegeId, collegeName } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [buildingList, setBuildingList] = useState([]);
  const [roomCategoryList, setRoomCategoryList] = useState([]);
  const [roomNoList, setRoomNoList] = useState([]);

  const [showRes, setShowRes] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearList = [];
  for (let year = currentYear; year >= currentYear - 50; year--) {
    yearList.push({ label: year, value: year });
  }

  const handleCSVData = async (values, report) => {
    try {
      setLoad(true);
      console.log("reportValues---", values);

      let csvData = [
        [
          "No.",
          "Student No.",
          "Student Name",
          "Room No",
          RENAME?.batch,
          "Admission Date",
          "Vacate Date",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.enrollNo,
          item.name,
          item.roomNo,
          item.batch,
          moment(item.admissionDate).format("DD-MM-yyyy"),
          item.vacateDate ? item.vacateDate : "-",
        ];
      });
      if (report == 1) {
        preFunction.generatePDF(
          collegeName,
          "Hostel Occupancy Report",
          csvData
        );
      } else {
        preFunction.downloadCSV(csvData, "Hostel Occupancy Report.csv");
      }
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleShow = async (values, showAll, report) => {
    if (load) return;
    try {
      setLoad(true);
      console.log(values, "values");
      setShowRes(true);
      if (report == 0) {
        setData([]);
      }
      setShowRes(true);
      const occupancyRes = await StudentApi.getOccupancyDetail(
        values.buildingName.id,
        values.roomCategory ? values.roomCategory.id : null,
        values.roomNumber ? values.roomNumber.id : null,
        values.year ? values.year.value : null,
        showAll
      );
      console.log("occupancyRes---", occupancyRes);

      if (report) {
        handleCSVData(
          occupancyRes.data.message.hostel_occupancy_details_report,
          report
        );
      } else {
        setData(occupancyRes.data.message.hostel_occupancy_details_report);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleRoomNo = async (building, roomCategory) => {
    setRoomNoList([]);
    try {
      const roomNoRes = await StudentApi.getRoomNo(
        7,
        building.id,
        roomCategory ? roomCategory.id : null
      );
      console.log("roomRes---", roomNoRes);
      setRoomNoList(roomNoRes.data.message.data);
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
                        handleRoomNo(text, values.roomCategory);
                      }}
                    />
                    <SelectFieldFormik
                      label="Room Category"
                      labelSize={3}
                      tabIndex={3}
                      clear={true}
                      id="roomCategory"
                      options={roomCategoryList}
                      getOptionLabel={(option) => option.roomCategory}
                      getOptionValue={(option) => option.id}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("roomCategory", text);
                        handleRoomNo(values.buildingName, text);
                      }}
                    />

                    <SelectFieldFormik
                      label="Room Number"
                      labelSize={3}
                      tabIndex={4}
                      id="roomNumber"
                      clear={true}
                      options={roomNoList}
                      getOptionLabel={(option) => option.roomNo}
                      getOptionValue={(option) => option.id}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("roomNumber", text);
                      }}
                    />

                    <SelectFieldFormik
                      label={RENAME?.year}
                      labelSize={3}
                      tabIndex={5}
                      id="year"
                      clear={true}
                      options={yearList}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("year", text);
                      }}
                    />
                  </div>
                  <Button
                    text="Show"
                    isTable={true}
                    tabIndex={6}
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
                              <th width="5%">Student No.</th>
                              <th>Student Name</th>
                              <th width="5%">Room No.</th>
                              <th width="5%">Batch</th>
                              <th width="7%">Admission Date</th>
                              <th width="7%">Vacate Date</th>
                            </tr>
                          </thead>
                          {data.length === 0 ? (
                            <tbody>
                              <tr>
                                <td colSpan="7" className="text-center">
                                  No records Found
                                </td>
                              </tr>
                            </tbody>
                          ) : (
                            <tbody>
                              {data.map((item, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.enrollNo}</td>
                                    <td>{item.name}</td>
                                    <td>{item.roomNo}</td>
                                    <td>{item.batch}</td>
                                    <td>
                                      {moment(item.admissionDate).format(
                                        "DD-MM-yyyy"
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {item.vacateDate ? item.vacateDate : "-"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          )}
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
export default HostelOccupancyReport;
