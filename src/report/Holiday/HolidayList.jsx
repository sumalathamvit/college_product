import React, { useEffect, useState } from "react";
import HeadingIcon from "@mui/icons-material/RecentActors";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import empApi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import Spinner from "../../component/Spinner";
import string from "../../string";
import ScreenTitle from "../../component/common/ScreenTitle";

function HolidayList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [page, setPage] = useState(1);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const getHolidayList = async () => {
    try {
      const HolidayRes = await empApi.getHolidayDetailList();
      console.log("HolidayRes", HolidayRes);
      if (HolidayRes.data.data.length > 0) {
        setData(HolidayRes.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleView = (id) => {
    navigate("/view-holiday-list", { state: { id } });
  };

  const handleEdit = (id) => {
    navigate("/holiday-master", { state: { id } });
  };

  useEffect(() => {
    getHolidayList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th width="1%">No.</th>
                <th>Holiday Name</th>
                <th width="10%">From Date</th>
                <th width="10%">To Date</th>
                <th width="10%">View</th>
              </tr>
            </thead>
            {data.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={9} align="center">
                    No records found
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.holiday_list_name}</td>
                    <td>{moment(item.from_date).format("DD-MM-yyyy")}</td>
                    <td> {moment(item.to_date).format("DD-MM-yyyy")}</td>
                    <td>
                      <Button
                        className="btn-3"
                        isTable={true}
                        title="View"
                        onClick={() => handleView(item.name)}
                        text={"View"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        {load ? (
          <Spinner sx={{ marginTop: 4 }} />
        ) : (
          showLoadMore && (
            <div className="row text-right">
              <a
                href="javascript:void(0)"
                onClick={(e) => getHolidayList(page + 1)}
              >
                Load More...
              </a>
            </div>
          )
        )}
      </div>
    </div>
  );
}
export default HolidayList;
