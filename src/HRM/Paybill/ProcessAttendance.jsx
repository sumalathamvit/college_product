import React, { useContext, useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import moment from "moment";
import * as Yup from "yup";

import employeeApi from "../../api/EmployeeApi";
import attendanceApi from "../../api/attendanceapi";

import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import preFunction from "../../component/common/CommonFunction";
import ScreenTitle from "../../component/common/ScreenTitle";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";

import AuthContext from "../../auth/context";

import string from "../../string";
import storage from "../../auth/storage";

function ProcessAttendance() {
  const formifRef = useRef();
  const [load, setLoad] = useState(false);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const [FormSchema, setFormSchema] = useState();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const institueArr = storage.getInstituteArray();
  console.log("institueArr---", institueArr);

  const handleSchema = (PAYROLL_DATE) => {
    if (PAYROLL_DATE == "") return;
    console.log("PAYROLL_DATE", PAYROLL_DATE);

    let schema = Yup.object().shape({
      college: collegeConfig.is_university
        ? Yup.object().required("Please select College")
        : Yup.mixed().notRequired(),
      payrollMonth: Yup.date()
        .min(
          moment(PAYROLL_DATE),
          `Payroll Month must be after ${moment(PAYROLL_DATE).format(
            "MMM-YYYY"
          )}`
        )
        .max(
          moment(),
          `Payroll Month must be before ${moment()
            .add(1, "months")
            .format("MMM-YYYY")}`
        )
        .required("Please select Valid Month"),
    });
    setFormSchema(schema);
  };

  const handleProcessAttendance = async (values, employees) => {
    try {
      const monthlyActivityListRes = await employeeApi.monthlyActivityList(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        null,
        null,
        moment(values.payrollMonth).startOf("month").format("yyyy-MM-DD"),
        moment(values.payrollMonth).endOf("month").format("yyyy-MM-DD"),
        0
      );
      console.log("monthlyActivityListRes---", monthlyActivityListRes);
      console.log("employees---", employees);
      console.log(
        "monthlyActivityListRes---",
        monthlyActivityListRes.data.message.data.leave_count_details.length,
        "employees---",
        employees.length
      );
      if (
        monthlyActivityListRes.data.message.data.leave_count_details.length !=
        employees.length
      ) {
        const array2Names =
          monthlyActivityListRes.data.message.data.leave_count_details.map(
            (item) => item.name
          );
        const filterArr = employees.filter(
          (item) => !array2Names.includes(item.name)
        );
        const empNames = filterArr.map((item) => item.employee_name).join(", ");

        setModalErrorOpen(true);
        setModalMessage(
          "No Attendance data found for the Employee(s) <br/>" + empNames
        );
        setModalTitle("Message");
        setLoad(false);
        return false;
      }
      let filterArr = [];
      let empNames = "";

      filterArr =
        monthlyActivityListRes.data.message.data.leave_count_details.filter(
          (item) => item["Absent"] > 0
        );
      console.log("filterArr---", filterArr);
      empNames = filterArr.map((item) => item.custom_employeeid).join(", ");
      console.log("empNames---", empNames);

      if (filterArr.length > 0) {
        setModalErrorOpen(true);
        setModalMessage(
          "Please Check Attendance. <br /> Absent status found for the Employee(s) <br/>" +
            empNames
        );
        setModalTitle("Message");
        setLoad(false);
        return false;
      }

      for (
        let i = 0;
        i < monthlyActivityListRes.data.message.data.leave_count_details.length;
        i++
      ) {
        const getEmployeeByIdRes = await employeeApi.getEmployeeById(
          monthlyActivityListRes.data.message.data.leave_count_details[i].name
        );
        console.log("getEmployeeByIdRes---", getEmployeeByIdRes);
        console.log(
          "employee---",
          getEmployeeByIdRes.data.data.name,
          getEmployeeByIdRes.data.data.first_name,
          getEmployeeByIdRes.data.data.date_of_joining
        );

        const endOfMonth = moment(values.payrollMonth).endOf("month");
        const startOfMonth = moment(values.payrollMonth)
          .startOf("month")
          .subtract(1, "days");
        let totalDaysInMonth =
          moment(endOfMonth) > moment()
            ? moment().diff(moment(startOfMonth), "days") - 1
            : moment(endOfMonth).diff(moment(startOfMonth), "days");
        let reasonalWorkingDays = totalDaysInMonth;
        if (
          moment(getEmployeeByIdRes.data.data.date_of_joining) >=
            moment(startOfMonth) &&
          moment(getEmployeeByIdRes.data.data.date_of_joining) <=
            moment(endOfMonth)
        ) {
          reasonalWorkingDays = moment(endOfMonth).diff(
            moment(getEmployeeByIdRes.data.data.date_of_joining).subtract(
              1,
              "days"
            ),
            "days"
          );
        }
        console.log("totalDaysInMonth---", totalDaysInMonth);
        console.log("reasonalWorkingDays---", reasonalWorkingDays);
        const notJoinedDays = totalDaysInMonth - reasonalWorkingDays;

        let lopDays =
          notJoinedDays +
          monthlyActivityListRes.data.message.data.leave_count_details[i][
            "Absent"
          ] +
          monthlyActivityListRes.data.message.data.leave_count_details[i][
            "Leave Without Pay"
          ];
        console.log("notJoinedDays---", notJoinedDays);
        console.log("lopDays---", lopDays);
        if (lopDays > 0) {
          const getSalaryStructureByIdRes = await employeeApi.viewSalary(
            monthlyActivityListRes.data.message.data.leave_count_details[i].name
          );
          console.log(
            "getSalaryStructureByIdRes-----------------------",
            getSalaryStructureByIdRes
          );
          if (!getSalaryStructureByIdRes.ok) {
            setModalErrorOpen(true);
            setModalMessage(
              "Salary Structure not found for the Employee " +
                monthlyActivityListRes.data.message.data.leave_count_details[i]
                  .custom_employeeid
            );
            setLoad(false);
            return false;
          }
          let earningTotal = 0;
          for (
            let j = 0;
            j < getSalaryStructureByIdRes.data.data.earnings.length;
            j++
          ) {
            earningTotal +=
              getSalaryStructureByIdRes.data.data.earnings[j].amount;
          }
          console.log("earningTotal---", earningTotal);
          let deductionTotal = 0;
          for (
            let j = 0;
            j < getSalaryStructureByIdRes.data.data.deductions.length;
            j++
          ) {
            deductionTotal +=
              getSalaryStructureByIdRes.data.data.deductions[j].amount;
          }
          console.log("deductionTotal---", deductionTotal);

          let oneDaySal = (earningTotal / totalDaysInMonth).toFixed(2);
          console.log("oneDaySal---", oneDaySal);

          if (notJoinedDays > 0) {
            const workedDays = totalDaysInMonth - lopDays;
            console.log("workedDays---", workedDays);
            let newJoinEarningTotal = 0;
            for (
              let p = 0;
              p < getSalaryStructureByIdRes.data.data.earnings.length;
              p++
            ) {
              console.log(
                "earnings[p]---",
                getSalaryStructureByIdRes.data.data.earnings[p]
              );
              const forWorkedDays =
                (getSalaryStructureByIdRes.data.data.earnings[p].amount /
                  totalDaysInMonth) *
                workedDays;
              console.log("forWorkedDays---", forWorkedDays);
              newJoinEarningTotal += forWorkedDays;

              const getAdditionalSalaryComponentRes =
                await employeeApi.getAdditionalSalaryComponent(
                  moment(values.payrollMonth)
                    .startOf("month")
                    .format("yyyy-MM-DD"),
                  moment(values.payrollMonth)
                    .endOf("month")
                    .format("yyyy-MM-DD"),
                  getSalaryStructureByIdRes.data.data.earnings[p]
                    .salary_component,
                  getEmployeeByIdRes.data.data.name
                );
              console.log(
                "getAdditionalSalaryComponentRes---",
                getAdditionalSalaryComponentRes
              );
              if (getAdditionalSalaryComponentRes.data.data.length > 0) {
                const ERPBulkcancelRes = await attendanceApi.ERPBulkcancel(
                  "Additional Salary",
                  [getAdditionalSalaryComponentRes.data.data[0].name]
                );
                console.log("ERPBulkcancelRes---", ERPBulkcancelRes);
              }
              const addAdditionalSalaryRes =
                await employeeApi.addAdditionalSalary(
                  collegeConfig.is_university
                    ? values.college.collegeName
                    : collegeName,
                  getEmployeeByIdRes.data.data.name,
                  moment(values.payrollMonth)
                    .endOf("month")
                    .format("yyyy-MM-DD"),
                  Math.round(forWorkedDays),
                  "",
                  getSalaryStructureByIdRes.data.data.earnings[p]
                    .salary_component
                );
              console.log("addAdditionalSalaryRes---", addAdditionalSalaryRes);

              lopDays =
                monthlyActivityListRes.data.message.data.leave_count_details[i][
                  "Absent"
                ] +
                monthlyActivityListRes.data.message.data.leave_count_details[i][
                  "Leave Without Pay"
                ];
            }
            oneDaySal = (newJoinEarningTotal / totalDaysInMonth).toFixed(2);
            earningTotal = newJoinEarningTotal;
            console.log("earningTotal---", earningTotal);
          } else {
            const lopDeduction = Math.round(lopDays * oneDaySal);
            console.log("lopDeduction---", lopDeduction);

            if (lopDeduction + deductionTotal > earningTotal) {
              for (
                let j = 0;
                j < getSalaryStructureByIdRes.data.data.deductions.length;
                j++
              ) {
                const addAdditionalSalaryRes =
                  await employeeApi.addAdditionalSalary(
                    collegeConfig.is_university
                      ? values.college.collegeName
                      : collegeName,
                    getEmployeeByIdRes.data.data.name,
                    moment(values.payrollMonth)
                      .endOf("month")
                      .format("yyyy-MM-DD"),
                    0,
                    "",
                    getSalaryStructureByIdRes.data.data.deductions[j]
                      .salary_component
                  );
                console.log(
                  "addAdditionalSalaryRes---",
                  addAdditionalSalaryRes
                );
                if (!addAdditionalSalaryRes.ok) {
                  setModalErrorOpen(true);
                  setModalMessage(
                    JSON.parse(
                      JSON.parse(
                        addAdditionalSalaryRes.data._server_messages
                      )[0]
                    ).message.split("<Br>")[0]
                  );
                  setLoad(false);
                  return false;
                }
              }
            }
            const addAdditionalSalaryRes =
              await employeeApi.addAdditionalSalary(
                collegeConfig.is_university
                  ? values.college.collegeName
                  : collegeName,
                getEmployeeByIdRes.data.data.name,
                moment(values.payrollMonth).endOf("month").format("yyyy-MM-DD"),
                Math.round(lopDeduction),
                "",
                string.LOP_COMPONENT
              );
            console.log("addAdditionalSalaryRes---", addAdditionalSalaryRes);
            if (!addAdditionalSalaryRes.ok) {
              setModalErrorOpen(true);
              setModalMessage(
                JSON.parse(
                  JSON.parse(addAdditionalSalaryRes.data._server_messages)[0]
                ).message.split("<Br>")[0]
              );
              setLoad(false);
              return false;
            }
          }
        }
      }
      return true;
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const handlePayrollEntry = async (values) => {
    const fromdt = moment(values.payrollMonth)
      .startOf("month")
      .format("yyyy-MM-DD");
    const todt = moment(values.payrollMonth)
      .endOf("month")
      .format("yyyy-MM-DD");
    console.log("fromdt---", fromdt, todt);

    if (load) return;
    try {
      setLoad(true);

      const checkPayrollEntryRes = await attendanceApi.checkPayrollEntry(
        collegeConfig.is_university ? values.college.collegeName : collegeName,
        fromdt,
        todt
      );
      console.log("checkPayrollEntryRes---", checkPayrollEntryRes);
      if (checkPayrollEntryRes.data.data.length > 0) {
        const cancelPayrollEntryRes = await employeeApi.cancelDoctype(
          "Payroll Entry",
          checkPayrollEntryRes.data.data[0].name
        );
        console.log("cancelPayrollEntryRes---", cancelPayrollEntryRes);

        //get Additional Salary
        const getLOPSalaryRes = await employeeApi.getLOPSalary(
          collegeConfig.is_university
            ? values.college.collegeName
            : collegeName,
          fromdt,
          todt
        );
        console.log("getLOPSalaryRes---", getLOPSalaryRes);
        if (getLOPSalaryRes.data.data.length > 0) {
          let idArr = [];
          for (let i = 0; i < getLOPSalaryRes.data.data.length; i++) {
            idArr.push(getLOPSalaryRes.data.data[i].name);
          }
          console.log("idArr---", idArr);

          const ERPBulkcancelRes = await attendanceApi.ERPBulkcancel(
            "Additional Salary",
            idArr
          );
          console.log("ERPBulkcancelRes---", ERPBulkcancelRes);
        }
      }
      let getAllEmployeeRes = await employeeApi.getAllEmployeeForPayRoll(
        collegeConfig.is_university ? values.college.collegeName : collegeName,
        todt
      );
      console.log("getAllEmployeeRes---", getAllEmployeeRes);
      if (getAllEmployeeRes.data.data.length === 0) {
        setModalErrorOpen(true);
        setModalMessage("No Employee Found for the Payroll");
        setModalTitle("Error");
        setLoad(false);
        return;
      }

      if (await handleProcessAttendance(values, getAllEmployeeRes.data.data)) {
        let empArr = [],
          emplIdArr = [];
        for (let i = 0; i < getAllEmployeeRes.data.data.length; i++) {
          emplIdArr.push(getAllEmployeeRes.data.data[i].name);
        }

        const filterEmployees =
          await employeeApi.getAllSalaryStructureofEmployees(emplIdArr);
        console.log("filterEmployees---", filterEmployees);
        for (let i = 0; i < filterEmployees.data.data.length; i++) {
          empArr.push({ employee: filterEmployees.data.data[i].name });
        }

        console.log("empArr---", empArr);

        const getCompanyRes = await employeeApi.getCompanyByCompanyName(
          collegeConfig.is_university ? values.college.collegeName : collegeName
        );
        console.log("getCompanyRes---", getCompanyRes);

        const addPayrollEntryManualRes =
          await attendanceApi.addPayrollEntryManualWithDetail(
            empArr,
            collegeConfig.is_university
              ? values.college.collegeName
              : collegeName,
            string.DEFAULT_CURRENCY,
            getCompanyRes.data.data.default_payroll_payable_account,
            getCompanyRes.data.data.cost_center,
            moment(values.payrollMonth).startOf("month").format("yyyy-MM-DD"),
            moment(values.payrollMonth).endOf("month").format("yyyy-MM-DD"),
            moment(values.payrollMonth)
              .add(1, "month")
              .startOf("month")
              .format("yyyy-MM-DD")
          );
        console.log("addPayrollEntryManualRes---", addPayrollEntryManualRes);
        if (!addPayrollEntryManualRes.ok) {
          setModalMessage(
            "Problem in Creating Payroll. Please try again later"
          );
          setModalTitle("Error");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }

        toast.success("Salary Slips Generated Successfully");
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  // const manualLeaveAllocation = async () => {
  //   //get all employees
  //   const getAllEmployeeRes = await employeeApi.getAllEmployee();
  //   console.log("getAllEmployeeRes---", getAllEmployeeRes);
  //   //get all leave types
  //   const getAllLeaveTypeRes = await employeeApi.getLeave();
  //   console.log("getAllLeaveTypeRes---", getAllLeaveTypeRes);

  //   for (let j = 0; j < getAllLeaveTypeRes.data.data.length; j++) {
  //     for (let i = 0; i < getAllEmployeeRes.data.data.length; i++) {
  //       const checkLeaveAllocationRes = await employeeApi.checkLeave(
  //         getAllEmployeeRes.data.data[i].name,
  //         getAllLeaveTypeRes.data.data[j].name
  //       );
  //       console.log("checkLeaveAllocationRes---", checkLeaveAllocationRes);
  //       if (checkLeaveAllocationRes.data.data.length === 0) {
  //         const addLeaveAllocationRes =
  //           await employeeApi.addNewLeaveTypeToAllocation(
  //             getAllLeaveTypeRes.data.data[j].name,
  //             getAllEmployeeRes.data.data[i].name,
  //             getAllEmployeeRes.data.data[i].date_of_joining,
  //             moment().endOf("year").format("yyyy-MM-DD"),
  //             12
  //           );
  //         console.log("addLeaveAllocationRes---", addLeaveAllocationRes);
  //       }
  //     }
  //   }
  // };

  useEffect(() => {
    institueArr.map((item) => {
      if (item.collegeID === collegeId) {
        handleSchema(
          item.PAYROLL_DATE ? moment(item.PAYROLL_DATE, "DD-MM-YYYY") : ""
        );
      }
    });
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => setModalErrorOpen(false)}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <Formik
          innerRef={formifRef}
          enableReinitialize={true}
          initialValues={{
            college: null,
            payrollMonth: moment().subtract(1, "month").format("yyyy-MM-DD"),
          }}
          validationSchema={FormSchema}
          onSubmit={handlePayrollEntry}
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
                <div className="col-lg-10">
                  {collegeConfig.is_university && (
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={0}
                      labelSize={2}
                      label="College"
                      id="college"
                      mandatory={1}
                      matchFrom="start"
                      options={collegeConfig?.collegeList}
                      getOptionLabel={(option) => option?.collegeName}
                      getOptionValue={(option) => option?.collegeID}
                      searchIcon={false}
                      clear={false}
                      style={{ width: "75%" }}
                      onChange={(text) => {
                        setFieldValue("college", text);
                        setFieldTouched("payrollMonth", false);
                        institueArr.map((item) => {
                          if (item.collegeID === text.collegeID) {
                            handleSchema(
                              item.PAYROLL_DATE
                                ? moment(item.PAYROLL_DATE, "DD-MM-YYYY")
                                : ""
                            );
                          }
                        });
                      }}
                    />
                  )}
                  <DateFieldFormik
                    autoFocus={!collegeConfig.is_university}
                    label="Month"
                    labelSize={2}
                    type="month"
                    id="payrollMonth"
                    tabIndex={4}
                    style={{ width: "35%" }}
                    maxDate={null}
                    minDate={null}
                    mandatory={1}
                    onChange={(e) => {
                      setFieldValue("payrollMonth", e.target.value);
                    }}
                  />
                </div>
                <div className="text-center">
                  {/* <Button
                    frmButton={false}
                    type="button"
                    tabIndex={3}
                    onClick={(e) => handleChechInCron(values)}
                    text="Manual Checkin Cron"
                  />
                  &nbsp;&nbsp; */}
                  <Button
                    frmButton={false}
                    tabIndex={5}
                    text="Generate Pay Bill"
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                  />
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default ProcessAttendance;
