import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import moment from "moment";

import empApi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import DisplayText from "../../component/FormField/DisplayText";
import CommonApi from "../../component/common/CommonApi";

import string from "../../string";

import ScreenTitle from "../../component/common/ScreenTitle";
import { boldStyle } from "../../component/common/CommonArray";

import AuthContext from "../../auth/context";
import employeeApi from "../../api/EmployeeApi";

function EmployeeProfile() {
  const location = useLocation();
  const { collegeName, collegeId } = useContext(AuthContext);

  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [data, setData] = useState();
  const [salary, setSalary] = useState([]);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [staffNo, setStaffNo] = useState("");
  const [reportTo, setReportTo] = useState();
  const [base64Image, setBase64Image] = useState();

  const searchEmployee = async (text) => {
    const empList = await CommonApi.searchEmployee(text);
    setEmpCodeList(empList);
    if (location?.state?.id) {
      setStaffNo(empList[0]);
      getViewEmployee(empList[0]);
      location.state = null;
    }
  };

  async function getImageBase64(url) {
    try {
      const response = await employeeApi.convertToBase64(url);
      console.log("response---", response);
      setBase64Image();
      if (response.data.message.success)
        setBase64Image(response.data.message.base64);
    } catch (error) {
      console.log("error---", error);
    }
  }

  const handleExportPdf = () => {
    let filterContent = [];
    filterContent.push([
      {
        content: "Employee Profile Details for - " + data?.custom_employeeid,
        styles: boldStyle,
      },
    ]);

    let pdfData = [
      [
        {
          colSpan: 4,
          content: "",
        },
      ],
      [
        {
          colSpan: 2,
          content: "Employee Details",
          styles: boldStyle,
        },
        {
          rowSpan: 9,
          image: base64Image,
          content: "",
          width: 40,
          height: 40,
          styles: { halign: "right" },
        },
      ],
      [{ content: "College" }, { content: data?.company }],
      [{ content: "Employee No." }, { content: data?.custom_employeeid }],
      [
        { content: "Employee Name" },
        { content: data?.salutation + " " + data?.first_name },
      ],
      [{ content: "Designation" }, { content: data?.designation }],
      [{ content: "Department" }, { content: data?.department?.split("-")[0] }],
      [{ content: "Employee Type" }, { content: data?.employment_type }],
      [
        { content: "Teaching Staff" },
        { content: data?.custom_is_teaching ? "YES" : "NO" },
      ],
      [{ content: "Report To" }, { content: reportTo }],
      [
        {
          colSpan: 2,
          content: "Personal Details",
          styles: boldStyle,
        },
      ],
      [
        { content: "Father Name" },
        { content: data?.custom_father_name },
        {
          content: "Permanant Address",
          styles: boldStyle,
        },
      ],
      [
        { content: "Mother Name" },
        { content: data?.custom_mother_name },
        {
          content: data?.permanent_address + ",",
        },
      ],
      [
        { content: "Spouse Name" },
        { content: data?.custom_spouse_name },
        {
          content: data?.custom_permanent_place + ",",
        },
      ],
      [
        { content: "Gender" },
        { content: data?.gender },
        {
          content: data?.custom_permanent_city + ",",
        },
      ],
      [
        { content: "Marital Status" },
        { content: data?.marital_status },
        {
          content: data?.custom_permanent_state + ",",
        },
      ],
      [
        { content: "Blood Group" },
        { content: data?.blood_group },
        {
          content:
            data?.custom_permanent_country +
            " - " +
            data?.custom_permanent__pincode,
        },
      ],
      [
        { content: "Date of Birth" },
        {
          content: moment(data?.date_of_birth).format("DD-MM-YYYY"),
        },
      ],
      [
        { content: "Caste" },
        { content: data?.custom_caste },
        {
          content: "Temporary Address",
          styles: boldStyle,
        },
      ],
      [
        { content: "Religion" },
        { content: data?.custom_religion },
        {
          content: data?.current_address + ",",
        },
      ],
      [
        { content: "Community" },
        { content: data?.custom_community },
        {
          content: data?.custom_current_place + ",",
        },
      ],
      [
        { content: "Mother Tongue" },
        { content: data?.custom_mother_tongue },
        {
          content: data?.custom_current_city + ",",
        },
      ],
      [
        { content: "Language Known" },
        { content: data?.custom_language_known },
        {
          content: data?.custom_current_state + ",",
        },
      ],
      [
        { content: "Date of Joining" },
        {
          content: moment(data?.date_of_joining).format("DD-MM-YYYY"),
        },
        {
          content:
            data?.custom_current_country + " - " + data?.custom_current_pincode,
        },
      ],
      [{ content: "PF No." }, { content: data?.provident_fund_account }],
      [{ content: "Nationality" }, { content: data?.custom_nationality }],
      [
        { content: "Aadhaar No." },
        {
          content: data?.custom_aadhaar_card,
        },
      ],
      [
        {
          colSpan: 2,
          content: "Bank Details",
          styles: boldStyle,
        },
      ],
      [{ content: "Bank Account Number" }, { content: data?.bank_ac_no }],
      [{ content: "Bank Name" }, { content: data?.bank_name }],
      [{ content: "IFSC Code" }, { content: data?.ifsc_code }],
      [{ content: "Branch Name" }, { content: data?.custom_bank_branch_name }],
      [{ content: "PAN" }, { content: data?.pan_number }],
      [
        {
          colSpan: 2,
          content: "Contact Details",
          styles: boldStyle,
        },
      ],
      [{ content: "Email" }, { content: data?.personal_email }],
      [{ content: "Mobile No." }, { content: data?.cell_number }],
      [{ content: "Alternate Mobile No." }, { content: data?.custom_mobile_2 }],
      [
        { content: "Contact Person 1" },
        { content: data?.person_to_be_contacted },
      ],
      [{ content: "Relation 1" }, { content: data?.relation }],
      [{ content: "Contact No. 1" }, { content: data?.emergency_phone_number }],
      [
        { content: "Contact Person 2" },
        { content: data?.custom_emergency_contact_name_2 },
      ],
      [{ content: "Relation 2" }, { content: data?.custom_relation_2 }],
      [
        { content: "Contact No. 2" },
        { content: data?.custom_emergency_phone_2 },
      ],
      [
        {
          colSpan: 2,
          content: "Qualification Details",
          styles: boldStyle,
        },
      ],
    ];
    {
      data?.education?.map((item, index) =>
        pdfData.push([
          { content: `Qualification ${index + 1}` },
          { content: item.qualification },
        ])
      );
    }
    {
      data?.external_work_history?.map((item, index) =>
        pdfData.push([
          { content: `Experience ${index + 1}` },
          {
            content:
              item.designation +
              ", " +
              item.company_name +
              ", " +
              item.custom_location,
          },
        ])
      );
    }

    pdfData.push([
      {
        colSpan: 2,
        content: "Salary Details",
        styles: boldStyle,
      },
    ]);
    pdfData.push([{ content: "Salary Mode" }, { content: data?.salary_mode }]);
    pdfData.push([
      { content: "Allowance Detail" },
      {
        content: salary?.earnings?.map(
          (item, index) => item.salary_component + "- " + item.amount
        ),
      },
    ]);
    pdfData.push([
      { content: "Deduction Detail" },
      {
        content: salary?.deductions?.map(
          (item, index) => item.salary_component + "- " + item.amount
        ),
      },
    ]);

    let pdfHeadToPass = [];
    let pdfDataToPass = [[], [...pdfData]];
    let colWidthToPass = [[], [20, 40, 40]];

    preFunction.generatePDFContent(
      collegeName,
      "Employee Profile - " + data?.custom_employeeid,
      pdfHeadToPass,
      pdfDataToPass,
      colWidthToPass
    );
    return;
  };

  const getViewEmployee = async (emp) => {
    try {
      setData();
      setSalary([]);
      if (emp) {
        setLoad(true);
        const getEmployee = await empApi.getEmployeeById(emp.name);
        console.log("getEmployee----", getEmployee);
        setData(getEmployee.data.data);

        await getImageBase64(string.TESTBASEURL + getEmployee.data.data.image);

        if (getEmployee.data.data.reports_to) {
          const getReportToRes = await empApi.getEmployeeforTour(
            getEmployee.data.data.reports_to
          );
          setReportTo(getReportToRes.data.data[0].employee_name);
        }

        const getSalary = await empApi.viewSalary(emp.name);
        console.log("getSalary----", getSalary);
        setSalary(getSalary.data.data);
        setShowRes(true);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-2">
          <div className="col-lg-10 pe-2">
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
                setStaffNo(text);
                setShowRes(false);
              }}
            />
          </div>
          <Button
            tabIndex={2}
            onClick={(e) => {
              getViewEmployee(staffNo);
            }}
            type="button"
            text={"Show"}
          />
        </div>

        {showRes ? (
          <div className="row no-gutters border p-3 mt-2">
            <div className="text-right mb-2">
              <Button
                type="button"
                isTable={true}
                frmButton={false}
                onClick={(e) => {
                  handleExportPdf();
                }}
                text="Export PDF"
              />
            </div>
            <div className="col-lg-9 pe-2" style={{ marginTop: "-20px" }}>
              <div className="subhead-row">
                <div className="subhead">Employee Detail</div>
                <div className="col line-div"></div>
              </div>
              <DisplayText label="College" value={data?.company} />
              <DisplayText
                label="Employee No."
                value={data?.custom_employeeid}
              />
              <DisplayText
                label="Employee Name"
                value={data?.salutation + " " + data?.first_name}
              />
              <DisplayText label="Designation" value={data?.designation} />
              <DisplayText
                label="Department"
                value={data?.department?.split("-")[0]}
              />
              <DisplayText
                label="Employee Type"
                value={data?.employment_type}
              />
              <DisplayText
                label="Teaching Staff"
                value={data?.custom_is_teaching ? "YES" : "NO"}
              />
              <DisplayText label="Report To" value={reportTo} />
              <div className="subhead-row">
                <div className="subhead">Personal Detail</div>
                <div className="col line-div"></div>
              </div>
              <DisplayText
                label="Father Name"
                value={data?.custom_father_name}
              />
              <DisplayText
                label="Mother Name"
                value={data?.custom_mother_name}
              />
              <DisplayText
                label="Spouse Name"
                value={data?.custom_spouse_name}
              />
              <DisplayText label="Gender" value={data?.gender} />
              <DisplayText
                label="Marital Status"
                value={data?.marital_status}
              />
              <DisplayText label="Blood Group" value={data?.blood_group} />
              <DisplayText
                label="Date of Birth"
                value={moment(data?.date_of_birth).format("DD-MM-YYYY")}
              />
              <DisplayText label="Caste" value={data?.custom_caste} />
              <DisplayText label="Religion" value={data?.custom_religion} />
              <DisplayText label="Community" value={data?.custom_community} />
              <DisplayText
                label="Mother Tongue"
                value={data?.custom_mother_tongue}
              />
              <DisplayText
                label="Language Known"
                value={data?.custom_language_known}
              />
              <DisplayText
                label="Date of Joining"
                value={moment(data?.date_of_joining).format("DD-MM-YYYY")}
              />
              <DisplayText
                label="PF No."
                value={data?.provident_fund_account}
              />
              <DisplayText
                label="Nationality"
                value={data?.custom_nationality}
              />
              <DisplayText
                label="Aadhaar No."
                value={data?.custom_aadhaar_card}
              />
              <div className="subhead-row">
                <div className="subhead">Bank Detail</div>
                <div className="col line-div"></div>
              </div>
              <DisplayText
                label="Bank Account Number"
                value={data?.bank_ac_no}
              />
              <DisplayText label="Bank Name" value={data?.bank_name} />
              <DisplayText label="IFSC Code" value={data?.ifsc_code} />
              <DisplayText
                label="Branch Name"
                value={data?.custom_bank_branch_name}
              />
              <DisplayText label="PAN" value={data?.pan_number} />
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
                <div className="subhead">Contact Detail</div>
                <div className="col line-div"></div>
              </div>
              <DisplayText label="Email" value={data?.personal_email} />
              <DisplayText label="Mobile No." value={data?.cell_number} />
              <DisplayText
                label="Alternate Mobile No."
                value={data?.custom_mobile_2}
              />
              <DisplayText
                label="Contact Person 1"
                value={data?.person_to_be_contacted}
              />
              <DisplayText label="Relation 1" value={data?.relation} />
              <DisplayText
                label="Contact No. 1"
                value={data?.emergency_phone_number}
              />
              <DisplayText
                label="Contact Person 2"
                value={data?.custom_emergency_contact_name_2}
              />
              <DisplayText label="Relation 2" value={data?.custom_relation_2} />
              <DisplayText
                label="Contact No. 2"
                value={data?.custom_emergency_phone_2}
              />
              <div className="subhead-row">
                <div className="subhead">Qualification Detail</div>
                <div className="col line-div"></div>
              </div>

              <div className="row no-gutters">
                {data?.education?.map((item, index) => (
                  <DisplayText
                    label={`Qualification ${index + 1}`}
                    value={item.qualification}
                  />
                ))}
              </div>
              {data?.external_work_history &&
              data?.external_work_history.length > 0 ? (
                <>
                  <div className="subhead-row">
                    <div className="subhead">Experience Detail</div>
                    <div className="col line-div"></div>
                  </div>

                  {data?.external_work_history?.map((item, index) => (
                    <DisplayText
                      label={`Experience ${index + 1}`}
                      value={
                        item.designation +
                        ", " +
                        item.company_name +
                        ", " +
                        item.custom_location
                      }
                    />
                  ))}
                </>
              ) : null}
              <div className="subhead-row">
                <div className="subhead">Salary Detail</div>
                <div className="col line-div"></div>
              </div>
              <DisplayText label="Salary Mode" value={data?.salary_mode} />
              <DisplayText
                label="Allowance Detail"
                value={salary?.earnings?.map((item, index) => (
                  <span>
                    {item.salary_component + "- " + item.amount}
                    &nbsp;&nbsp;
                  </span>
                ))}
              />
              <DisplayText
                label="Deduction Detail"
                value={salary?.deductions?.map((item, index) => (
                  <span>
                    {item.salary_component + "- " + item.amount}
                    &nbsp;&nbsp;
                  </span>
                ))}
              />
            </div>
            <div className="col-lg-3">
              <div className=" ps-2 mt-2">
                <img
                  src={string.TESTBASEURL + data?.image}
                  alt=""
                  height="150"
                  width="150"
                  id="imgid"
                />
              </div>
              <div className="subhead-row mt-5 pt-5">
                <div className="subhead">Permanent Address Detail</div>
                <div className="col line-div"></div>
              </div>
              <DisplayText value={data?.permanent_address + ","} />
              <DisplayText value={data?.custom_permanent_place + ","} />
              <DisplayText value={data?.custom_permanent_city + ","} />
              <DisplayText value={data?.custom_permanent_state + ","} />
              <DisplayText
                value={
                  data?.custom_permanent_country +
                  " - " +
                  data?.custom_permanent__pincode
                }
              />

              <div className="subhead-row mt-4">
                <div className="subhead">Temporary Address Detail</div>
                <div className="col line-div"></div>
              </div>
              <DisplayText value={data?.current_address + ","} />
              <DisplayText value={data?.custom_current_place + ","} />
              <DisplayText value={data?.custom_current_city + ","} />
              <DisplayText value={data?.custom_current_state + ", "} />
              <DisplayText
                value={
                  data?.custom_current_country +
                  " - " +
                  data?.custom_current_pincode
                }
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default EmployeeProfile;
