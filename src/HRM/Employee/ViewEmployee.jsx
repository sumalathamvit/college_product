import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

import empApi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import DisplayText from "../../component/FormField/DisplayText";
import CommonApi from "../../component/common/CommonApi";
import ScreenTitle from "../../component/common/ScreenTitle";

import string from "../../string";

import blankProfile from "../../assests/png/blank-profile-picture.png";

function ViewEmployee() {
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState();
  const [salary, setSalary] = useState([]);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [staffNo, setStaffNo] = useState("");
  const [reportTo, setReportTo] = useState();

  const searchEmployee = async (text) => {
    console.log("text---", text);
    const empList = await CommonApi.searchEmployee(text.toString());
    setEmpCodeList(empList);
    if (location?.state?.id) {
      setStaffNo(empList[0]);
      getViewEmployee(empList[0]);
      location.state = null;
    }
  };

  const getViewEmployee = async (emp) => {
    try {
      setStaffNo(emp);
      console.log("emp--", emp);
      setData();
      setSalary([]);
      if (emp) {
        setLoad(true);
        const getEmployee = await empApi.getEmployeeById(emp.name);
        console.log("getEmployee----", getEmployee);
        setData(getEmployee.data.data);

        if (getEmployee.data.data.reports_to) {
          const getReportToRes = await empApi.getEmployeeforTour(
            getEmployee.data.data.reports_to
          );
          console.log("getReportToRes----", getReportToRes);
          setReportTo(getReportToRes.data.data[0].employee_name);
        }

        const getSalary = await empApi.viewSalary(emp.name);
        console.log("getSalary----", getSalary);
        setSalary(getSalary.data.data);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  useEffect(() => {
    console.log("enrollNumber", location.state);

    if (location?.state && location?.state?.id) {
      console.log("here-----");
      searchEmployee(location.state.id);
    }
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-2">
          <div className="col-lg-10 pe-2 mt-2">
            <ReactSelectField
              autoFocus
              label="Employee No. / Name"
              id="employeeCode"
              mandatory={1}
              options={empCodeList}
              searchIcon={true}
              clear={true}
              labelSize={4}
              value={staffNo}
              getOptionLabel={(option) =>
                option.custom_employeeid + " - " + option.employee_name
              }
              getOptionValue={(option) => option.name}
              onInputChange={(inputValue) => {
                searchEmployee(inputValue);
              }}
              onChange={(text) => {
                getViewEmployee(text);
              }}
            />
          </div>
          {staffNo ? (
            <div className="col-lg-2 ps-2">
              <Button
                tabIndex={2}
                className={"btn-green"}
                type="button"
                frmButton={false}
                text={"Edit"}
                onClick={() => {
                  navigate("/add-employee", {
                    state: { id: staffNo?.name },
                  });
                }}
              />
            </div>
          ) : null}
        </div>

        {staffNo && data ? (
          <div className="row no-gutters">
            <div className="subhead-row">
              <div className="subhead">Personal Detail</div>
              <div className="col line-div"></div>
            </div>
            <div className="row no-gutters">
              <div className="col-lg-9 pe-2">
                <DisplayText
                  label="Employee Name"
                  value={data?.salutation + " " + data?.first_name}
                />
                <DisplayText
                  label="Father Name"
                  value={data?.custom_father_name}
                />
                <DisplayText
                  label="Date of Birth"
                  value={moment(data?.date_of_birth).format("DD-MM-YYYY")}
                />
                <DisplayText label="Gender" value={data?.gender} />
                <DisplayText
                  label="Marital Status"
                  value={data.marital_status}
                />
                {data?.custom_mother_name && (
                  <DisplayText
                    label="Mother Name"
                    value={data?.custom_mother_name}
                  />
                )}
                {data?.custom_spouse_name && (
                  <DisplayText
                    label="Spouse Name"
                    value={data?.custom_spouse_name}
                  />
                )}
                <DisplayText label="Blood Group" value={data?.blood_group} />
                <DisplayText label="Community" value={data?.custom_community} />
                {data?.custom_caste && (
                  <DisplayText label="Caste" value={data?.custom_caste} />
                )}
                <DisplayText label="Religion" value={data?.custom_religion} />
                <DisplayText
                  label="Nationality"
                  value={data?.custom_nationality}
                />
                <DisplayText label="Mobile No. 1" value={data?.cell_number} />

                {data?.custom_mobile_2 && (
                  <DisplayText
                    label="Mobile No. 2"
                    value={data?.custom_mobile_2}
                  />
                )}
                <DisplayText label="Email" value={data?.personal_email} />
                {data?.custom_mother_tongue && (
                  <DisplayText
                    label="Mother Tongue"
                    value={data?.custom_mother_tongue}
                  />
                )}
                {data?.custom_language_known && (
                  <DisplayText
                    label="Language Known"
                    value={data?.custom_language_known}
                  />
                )}
              </div>
              <div className="col-lg-3 ps-2 mt-2">
                <img
                  src={
                    data?.image
                      ? string.TESTBASEURL + "" + data?.image
                      : blankProfile
                  }
                  alt=""
                  height="150"
                  width="150"
                />
              </div>
            </div>
            <div className="subhead-row">
              <div className="subhead">Employment Detail</div>
              <div className="col line-div"></div>
            </div>
            <div className="col-lg-9 pe-2">
              <DisplayText label="College" value={data?.company} />
              <DisplayText
                label="Employment Type"
                value={data?.employment_type}
              />
              <DisplayText
                label="Date of Joining"
                value={moment(data?.date_of_joining).format("DD-MM-YYYY")}
              />
              <DisplayText
                label="Designation Category"
                value={data?.custom_designation_category}
              />
              <DisplayText label="Designation" value={data?.designation} />
              <DisplayText
                label="Teaching Staff"
                value={data?.custom_is_teaching ? "YES" : "NO"}
              />
              <DisplayText
                label="Department"
                value={data?.department?.split("-")[0]}
              />
              {reportTo ? (
                <DisplayText label="Report To" value={reportTo} />
              ) : null}
            </div>
            {data?.passport_number && (
              <>
                <div className="subhead-row">
                  <div className="subhead">Passport Detail</div>
                  <div className="col line-div"></div>
                </div>
                <div className="col-lg-9 pe-2">
                  <DisplayText
                    label="Passport No."
                    value={data?.passport_number}
                  />
                  <DisplayText
                    label="Place of Issue"
                    value={data?.place_of_issue}
                  />
                  <DisplayText
                    label="Issue Date"
                    value={
                      data?.date_of_issue
                        ? moment(data?.date_of_issue).format("DD-MM-YYYY")
                        : ""
                    }
                  />
                  <DisplayText
                    label="Expiry Date"
                    value={
                      data?.valid_upto
                        ? moment(data?.valid_upto).format("DD-MM-YYYY")
                        : ""
                    }
                  />
                </div>
              </>
            )}
            <div className="subhead-row">
              <div className="subhead">Bank Detail</div>
              <div className="col line-div"></div>
            </div>
            <div className="col-lg-9 pe-2">
              <DisplayText
                label="Aadhaar No."
                value={data?.custom_aadhaar_card}
              />
              <DisplayText label="Salary Mode" value={data?.salary_mode} />
              {data?.salary_mode === "Bank" && (
                <>
                  <DisplayText label="Bank Name" value={data?.bank_name} />
                  <DisplayText
                    label="Bank Account Number"
                    value={data?.bank_ac_no}
                  />
                  <DisplayText label="IFSC Code" value={data?.ifsc_code} />
                  <DisplayText
                    label="Branch Name"
                    value={data?.custom_bank_branch_name}
                  />
                </>
              )}
              {data?.pan_number && (
                <DisplayText label="PAN" value={data?.pan_number} />
              )}
              {data?.provident_fund_account && (
                <DisplayText
                  label="PF No."
                  value={data?.provident_fund_account}
                />
              )}
            </div>
            <div className="subhead-row">
              <div className="subhead">Emergency Contact Detail</div>
              <div className="col line-div"></div>
            </div>
            <div className="col-lg-9 pe-2">
              <DisplayText
                label="Contact Name 1"
                value={data?.person_to_be_contacted}
              />
              <DisplayText label="Relation 1" value={data?.relation} />
              <DisplayText
                label="Contact No. 1"
                value={data?.emergency_phone_number}
              />
              {data?.custom_emergency_contact_name_2 && (
                <DisplayText
                  label="Contact Name 2"
                  value={data?.custom_emergency_contact_name_2}
                />
              )}
              {data?.custom_relation_2 && (
                <DisplayText
                  label="Relation 2"
                  value={data?.custom_relation_2}
                />
              )}
              {data?.custom_emergency_phone_2 && (
                <DisplayText
                  label="Contact No. 2"
                  value={data?.custom_emergency_phone_2}
                />
              )}
            </div>
            <div className="subhead-row">
              <div className="subhead">Permanent Address Detail</div>
              <div className="col line-div"></div>
            </div>
            <div className="col-lg-9 pe-2">
              <DisplayText
                label="Street/Land Mark"
                value={data?.permanent_address}
              />
              <DisplayText
                label="Area/Place"
                value={data?.custom_permanent_place}
              />
              <DisplayText
                label="City/District"
                value={data?.custom_permanent_city}
              />
              <DisplayText label="State" value={data?.custom_permanent_state} />
              <DisplayText
                label="Country"
                value={data?.custom_permanent_country}
              />
              <DisplayText
                label="Pincode"
                value={data?.custom_permanent__pincode}
              />
            </div>

            <div className="subhead-row">
              <div className="subhead">Temporary Address Detail</div>
              <div className="col line-div"></div>
            </div>
            <div className="col-lg-9">
              <DisplayText
                label="Street/Land Mark"
                value={data?.current_address}
              />
              <DisplayText
                label="Area/Place"
                value={data?.custom_current_place}
              />
              <DisplayText
                label="City/District"
                value={data?.custom_current_city}
              />
              <DisplayText label="State" value={data?.custom_current_state} />
              <DisplayText
                label="Country"
                value={data?.custom_current_country}
              />
              <DisplayText
                label="Pincode"
                value={data?.custom_current_pincode}
              />
            </div>

            {data.external_work_history &&
            data.external_work_history.length > 0 ? (
              <>
                <div className="subhead-row">
                  <div className="subhead">Experience Detail</div>
                  <div className="col line-div"></div>
                </div>

                <div className="row no-gutters mt-3">
                  <div className="table-responsive p-0">
                    <table className="table table-bordered ">
                      <thead>
                        <tr>
                          <th width="1%">No.</th>
                          <th width="15%">Organization Name</th>
                          <th width="15%">Location</th>
                          <th width="20%">Designation</th>
                          <th width="15%">From Date</th>
                          <th width="15%">To Date</th>
                          <th width="5%">Salary</th>
                          <th width="15%">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.external_work_history.map((item, index) => (
                          <tr className="tableColor" key={index}>
                            <td>{index + 1}</td>
                            <td>{item.company_name}</td>
                            <td>{item.custom_location}</td>
                            <td>{item.designation}</td>
                            <td>
                              {moment(item.custom_from_date).format(
                                "DD-MM-YYYY"
                              )}
                            </td>
                            <td>
                              {" "}
                              {moment(item.custom_to_date).format("DD-MM-YYYY")}
                            </td>
                            <td>{item.salary}</td>
                            <td>{item.custom_remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}

            {data.education && data.education.length > 0 ? (
              <>
                <div className="subhead-row">
                  <div className="subhead">Qualification Detail</div>
                  <div className="col line-div"></div>
                </div>

                <div className="row no-gutters">
                  <div className="table-responsive p-0">
                    <table className="table table-bordered ">
                      <thead>
                        <tr>
                          <th width="1%">No.</th>
                          <th width="15%">Qualification</th>
                          <th>Institution Name</th>
                          <th width="20%">Register No.</th>
                          <th width="15%">Year of Passing</th>
                          <th width="15%">File</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.education.map((item, index) => (
                          <tr className="tableColor" key={index}>
                            <td>{index + 1}</td>
                            <td>{item.qualification}</td>
                            <td>{item.school_univ}</td>
                            <td>{item.custom_reg_no}</td>
                            <td>
                              {item.year_of_passing ? item.year_of_passing : ""}
                            </td>
                            <td>
                              {item.custom_file && (
                                <Button
                                  type="button"
                                  isTable={true}
                                  className={"btn-3"}
                                  text={"View"}
                                  onClick={(e) =>
                                    window.open(
                                      string.FILEURL + item.custom_file,
                                      "_blank"
                                    )
                                  }
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}

            {salary && salary.earnings ? (
              <>
                <div className="subhead-row">
                  <div className="subhead">Allowance Detail</div>
                  <div className="col line-div"></div>
                </div>

                <div className="row no-gutters">
                  <div className="table-responsive p-0">
                    <table className="table table-bordered ">
                      <thead>
                        <tr>
                          <th width="1%">No.</th>
                          <th>Allowance</th>
                          <th width="5%">Allowance Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salary.earnings.map((item, index) => (
                          <tr className="tableColor" key={index}>
                            <td>{index + 1}</td>
                            <td>{item.salary_component}</td>
                            <td align="right">{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
            {salary && salary.earnings ? (
              <>
                <div className="subhead-row">
                  <div className="subhead">Deduction Detail</div>
                  <div className="col line-div"></div>
                </div>
                <div className="row no-gutters">
                  <div className="table-responsive p-0">
                    <table className="table table-bordered ">
                      <thead>
                        <tr>
                          <th width="1%">No.</th>
                          <th>Deduction</th>
                          <th width="5%">Deduction Amount (₹)</th>
                        </tr>
                      </thead>
                      {salary.deductions.length === 0 ? (
                        <tbody>
                          <tr>
                            <td colSpan={5} align="center">
                              No Deductions found
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody>
                          {salary.deductions.map((item, index) => (
                            <tr className="tableColor" key={index}>
                              <td>{index + 1}</td>
                              <td>{item.salary_component}</td>
                              <td align="right">{item.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>
                  </div>
                </div>
              </>
            ) : null}

            {/* <Button
                text={"Back"}
                isTable={true}
                onClick={(e) => window.history.back()}
              /> */}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ViewEmployee;
