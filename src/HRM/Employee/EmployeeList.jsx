import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeadingIcon from "@mui/icons-material/FormatListBulleted";
import moment from "moment";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";

import employeeapi from "../../api/EmployeeApi";

import Button from "../../component/FormField/Button";
import string from "../../string";
import ScreenTitle from "../../component/common/ScreenTitle";

function EmployeeList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const getEmployeeList = async () => {
    try {
      setLoad(true);
      const employeeRes = await employeeapi.getAllPendingEmployee();
      console.log("employeeRes---", employeeRes);
      if (employeeRes.ok) setData(employeeRes.data.data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getEmployeeList();
  }, []);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-3">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th width="1%">No.</th>
                  {/* <th width="11%">Code</th> */}
                  <th width="15%">Name</th>
                  <th width="15%">Designation</th>
                  <th>Department</th>
                  <th width="8%">Mobile</th>
                  <th width="5%">Email</th>
                  <th width="5%">Edit</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colspan={9} align="center">
                      No Employee found
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        {/* <td>
                          {item.custom_employeeid == 0
                            ? "NA"
                            : item.custom_employeeid}
                        </td> */}
                        <td>
                          {item.salutation} {item.first_name}
                        </td>
                        <td>{item.designation}</td>
                        <td>{item?.department?.split("-")[0]}</td>
                        <td>{item.cell_number}</td>
                        <td>{item.personal_email}</td>
                        <td>
                          <Button
                            isTable={true}
                            className={"btn-3"}
                            text={"Edit"}
                            onClick={() =>
                              navigate("/add-employee", {
                                state: {
                                  id: item.name,
                                },
                              })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EmployeeList;
