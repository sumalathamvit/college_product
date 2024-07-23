import string from "../string";
import client from "./client";

const uploadFile = async (screenName, fileType, file) => {
  const data = await client.post(
    "/api/method/education.smvss.student.upload_file",
    {
      screenName,
      fileType,
      file,
    }
  );
  return data;
};

const markAttendance = async (shiftData) => {
  const data = await client.post(`/api/method/run_doc_method`, {
    docs: shiftData,
    method: "process_auto_attendance",
  });
  return data;
};

const getLatestCheckinDate = async (from_date, to_date) => {
  const data = await client.get(
    `/api/resource/Employee Checkin?fields=["name","employee", "time", "shift_end", "shift_start", "skip_auto_attendance", "attendance"]&filters=[["time", ">", "${from_date}"], ["time", "<", "${to_date}"], ["skip_auto_attendance", "=", 0]]&order_by=employee,time&limit_page_length=None`
  );
  return data;
};

const getLatestCheckinDateWithoutattendance = async (from_date, to_date) => {
  const data = await client.get(
    `/api/resource/Employee Checkin?fields=["name", "employee", "employee_name", "time"]&filters=[["time", ">", "${from_date}"], ["time", "<", "${to_date}"], ["skip_auto_attendance", "=", false], ["attendance", "is", "not set"]]&order_by=employee,time&limit_page_length=None`
  );
  return data;
};

const addAttendance = async (
  employee,
  attendance_date,
  in_time,
  out_time,
  working_hours,
  status,
  shift,
  late_entry,
  early_exit,
  custom_short_excess
) => {
  const data = await client.post(`/api/resource/Attendance`, {
    employee,
    attendance_date,
    in_time,
    out_time,
    working_hours,
    status,
    shift,
    late_entry,
    early_exit,
    custom_short_excess,
    docstatus: "1",
  });
  return data;
};

const addAttendanceWithLeaveType = async (
  employee,
  attendance_date,
  in_time,
  out_time,
  working_hours,
  status,
  shift,
  late_entry,
  early_exit,
  custom_short_excess,
  leave_application,
  leave_type
) => {
  const data = await client.post(`/api/resource/Attendance`, {
    employee,
    attendance_date,
    in_time,
    out_time,
    working_hours,
    status,
    shift,
    late_entry,
    early_exit,
    custom_short_excess,
    leave_application,
    leave_type,
    docstatus: "1",
  });
  return data;
};

const deleteAttendance = async (id) => {
  const data = await client.delete(`/api/resource/Attendance/${id}`);
  return data;
};

const editPermission = async (id) => {
  const data = await client.put(`/api/resource/Attendance/${id}`, {
    custom_is_permission: 1,
  });
  return data;
};

const editAttendanceStatus = async (id, status) => {
  const data = await client.put(`/api/resource/Attendance/${id}`, {
    status,
  });
  return data;
};

const getEmpAttendance = async (attendance_date, employee) => {
  const data = await client.get(
    `/api/resource/Attendance?filters=[["attendance_date","=","${attendance_date}"],["employee","=","${employee}"],["docstatus","=","1"]]&fields=["name","status","custom_is_permission", "attendance_date"]`
  );
  return data;
};

const getPermissionCnt = async (employee, fromDate, toDate) => {
  const data = await client.get(
    `/api/resource/Attendance?fields=["custom_is_permission", "name"]&filters=[["employee", "=", "${employee}"], ["attendance_date",">=","${fromDate}"], ["attendance_date","<=","${toDate}"], ["custom_is_permission", "=", "1"]]&order_by=attendance_date asc&limit_page_length=None`
  );
  return data;
};

const updatePermission = async (id) => {
  const data = await client.put(`/api/resource/Attendance/${id}`, {
    custom_is_permission: 1,
  });
  return data;
};

const updateSkipAttendance = async (id) => {
  const data = await client.put(`/api/resource/Employee Checkin/${id}`, {
    skip_auto_attendance: 1,
  });
  return data;
};

const updateAttendanceStatus = async (id, custom_short_excess, status) => {
  const data = await client.put(`/api/resource/Attendance/${id}`, {
    custom_short_excess,
    status,
  });
  return data;
};

const updateShortExcess = async (
  id,
  custom_short_excess,
  custom_is_permission = 0
) => {
  const data = await client.put(`/api/resource/Attendance/${id}`, {
    custom_short_excess,
    custom_is_permission,
  });
  return data;
};

const updateCheckInById = async (id, attendance) => {
  const data = await client.put(`/api/resource/Employee Checkin/${id}`, {
    attendance,
  });
  return data;
};

const updateOddPunch = async (employee, time, reason) => {
  const data = await client.post(`/api/resource/Employee Checkin`, {
    employee,
    time,
    reason,
    is_modified: 1,
  });
  return data;
};

const getShortHalfDay = async (leastTime, maxTime, fromDate, toDate) => {
  const data = await client.get(
    `/api/resource/Attendance?fields=["name", "working_hours"]&filters=[["working_hours", ">", "${leastTime}"], ["working_hours", "<", "${maxTime}"], ["custom_short_excess", "=", ""], ["attendance_date",">=","${fromDate}"], ["attendance_date","<=","${toDate}"], ["custom_is_permission", "=", "0"]]&order_by=attendance_date asc&limit_page_length=None`
  );
  return data;
};

const getShortFullDay = async (time, fromDate, toDate) => {
  const data = await client.get(
    `api/resource/Attendance?fields=["name", "working_hours", "employee", "attendance_date", "custom_short_excess"]&filters=[["status","=","Present"],["working_hours", "<", ${time}],["custom_short_excess", "=", 0], ["attendance_date", ">=", "${fromDate}"] , ["attendance_date", "<=", "${toDate}"], ["docstatus", "=", 1]]&order_by=attendance_date asc&limit_page_length=None`
  );
  return data;
};

const getExcessFullDay = async (maxTime, fromDate, toDate) => {
  const data = await client.get(
    `/api/resource/Attendance?fields=["name", "working_hours", "in_time", "employee", "attendance_date", "custom_short_excess"]&filters=[["working_hours", ">", "${maxTime}"], ["custom_short_excess", "=", ""], ["attendance_date",">=","${fromDate}"], ["attendance_date","<=","${toDate}"], ["custom_is_permission", "=", 0], ["docstatus", "=", 1]]&order_by=attendance_date asc&limit_page_length=None`
  );
  return data;
};

const getAttendanceOddPunch = async (
  shiftId,
  workingHours,
  from_date,
  to_date
) => {
  const data = await client.get(
    `/api/resource/Attendance?fields=["name", "employee", "employee_name", "department", "attendance_date", "working_hours", "status", "late_entry", "early_exit", "custom_is_compensation_off", "in_time", "out_time", "custom_is_permission", "custom_short_excess"]&filters=[["attendance_date",">=", "${from_date}"],["attendance_date", "<=", "${to_date}"],["docstatus", "=", 1], ["working_hours", "<", ${workingHours}], ["status","=","Absent"], ["shift", "=", "${shiftId}"], ["custom_short_excess", "=", ""], ["in_time","!=",""], ["out_time","=",""]]&or_filters=[]&order_by=attendance_date asc&limit_page_length=None`
  );
  return data;
};

const getAttendanceHalfDay = async (
  shiftId,
  workingHours,
  from_date,
  to_date
) => {
  const data = await client.get(
    `/api/resource/Attendance?fields=["name", "employee", "employee_name", "department", "attendance_date", "working_hours", "status", "late_entry", "early_exit", "custom_is_compensation_off", "in_time", "out_time", "custom_is_permission", "custom_short_excess"]&filters=[["attendance_date",">=", "${from_date}"],["attendance_date", "<=", "${to_date}"],["docstatus", "=", 1], ["working_hours", "<", ${workingHours}], ["status","=","Half Day"], ["shift", "=", "${shiftId}"], ["custom_short_excess", "=", ""]]&order_by=attendance_date asc&limit_page_length=None`
  );
  return data;
};

const getAttendance = async (shiftId, workingHours, from_date, to_date) => {
  const data = await client.get(
    `/api/resource/Attendance?fields=["name", "employee", "employee_name", "department", "attendance_date", "working_hours", "status", "late_entry", "early_exit", "custom_is_compensation_off", "in_time", "out_time", "custom_is_permission", "custom_short_excess"]&filters=[["attendance_date",">=", "${from_date}"],["attendance_date", "<=", "${to_date}"],["docstatus", "=", 1], ["working_hours", "<", ${workingHours}], ["status","=","Present"], ["shift", "=", "${shiftId}"], ["custom_short_excess", "=", ""]]&order_by=attendance_date asc&limit_page_length=None`
  );
  return data;
};

const getAttendanceInId = async (attendanceIds) => {
  const data = await client.get(
    `/api/resource/Attendance?fields=["name", "employee", "employee_name", "department", "attendance_date", "working_hours", "status", "late_entry", "early_exit", "custom_is_compensation_off", "in_time", "out_time", "custom_is_permission", "custom_short_excess"]&filters=[["name","in", "${attendanceIds}"]]&order_by=attendance_date asc&limit_page_length=None`
  );
  return data;
};

const ERPBulkcancel = async (doctype, ids) => {
  const data = await client.post(
    `/api/method/frappe.desk.doctype.bulk_update.bulk_update.submit_cancel_or_update_docs`,
    {
      doctype: doctype,
      docnames: ids,
      action: "cancel",
    }
  );
  return data;
};

const attendanceBulkDelete = async (attendanceIds) => {
  const formData = new FormData();
  formData.append("doctype", "Attendance");
  formData.append("items", attendanceIds);

  const data = await client.post(
    `/api/method/frappe.desk.reportview.delete_items`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};

const getAllAttendance = async (from_date, to_date) => {
  const data = await client.get(
    `/api/resource/Attendance?fields=["name", "attendance_date", "employee"]&filters=[["attendance_date",">=", "${from_date} 00:00:00.000000"],["attendance_date", "<=", "${to_date} 23:59:59.000000"],["docstatus", "=", 1],["status","!=","On Leave"]]&order_by=attendance_date&limit_page_length=None`
  );
  return data;
};

const getMonthlyReport = async (month, year) => {
  const data = await client.get(`/api/method/frappe.desk.query_report.run`, {
    report_name: "Monthly Attendance Sheet",
    filters: {
      month,
      year,
      company: sessionStorage.getItem("COMPANY"),
    },
  });
  return data;
};

const checkPayrollEntry = async (company, start_date, end_date) => {
  const data = await client.get(
    `/api/resource/Payroll Entry?fields=["name"]&filters=[["company", "=", "${company}"], ["start_date", "=", "${start_date}"], ["end_date", "=", "${end_date}"], ["status", "=" , "Submitted"]]`
  );
  return data;
};

const getPayrollEntryEmployees = async (docs) => {
  const response = await client.post("/api/method/run_doc_method", {
    docs,
    method: "fill_employee_details",
  });
  return response.data;
};

const addPayrollEntryManualWithDetail = async (
  employees,
  company,
  currency,
  payroll_payable_account,
  cost_center,
  start_date,
  end_date,
  posting_date
) => {
  const data = await client.post(`/api/resource/Payroll Entry`, {
    doctype: "Payroll Entry",
    employees,
    start_date,
    end_date,
    posting_date,
    payroll_frequency: "Monthly",
    company,
    currency,
    exchange_rate: 1,
    payroll_payable_account,
    cost_center,
    validate_attendance: 0,
    docstatus: 1,
  });
  return data;
};

const addPayrollEntryManual = async (doc) => {
  const formData = new FormData();
  formData.append("doc", JSON.stringify(doc));
  formData.append("action", "Submit");

  const response = await client.post(
    "/api/method/frappe.desk.form.save.savedocs",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  console.log("response---", response);
  return response.data;
};

const addPayrollEntry = async (employees, start_date, end_date) => {
  const data = await client.post(`/api/resource/Payroll Entry`, {
    doctype: "Payroll Entry",
    employees,
    start_date,
    end_date,
    payroll_frequency: "Monthly",
    company: sessionStorage.getItem("COMPANY"),
    currency: "INR",
    exchange_rate: 1,
    payroll_payable_account: sessionStorage.getItem("PAYROLL_PAYABLE_ACCOUNT"),
    cost_center: sessionStorage.getItem("COST_CENTER"),
    docstatus: 1,
  });
  return data;
};

const getAllSalarySlips = async (start_date, end_date, collegeName) => {
  // const data = await client.get(
  //   `/api/resource/Salary Slip?fields=["name", "payment_days", "absent_days", "leave_without_pay", "employee", "gross_pay", "earnings.salary_component", "earnings.amount", "earnings.abbr"]&filters=[["start_date","=","${start_date}"], ["end_date","=","${end_date}"]]&order_by=name asc&limit_page_length=None`
  // );
  const data = await client.get(
    `/api/resource/Salary Slip?fields=["*"]&filters=[["start_date","=","${start_date}"], ["end_date","=","${end_date}"], ["company", "=", "${collegeName}"]]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const getSalarySlipById = async (id) => {
  const data = await client.get(`/api/resource/Salary Slip/${id}`);
  return data;
};

const salSlipUpdate = async (id, deductions, net_pay) => {
  const data = await client.put(`/api/resource/Salary Slip/${id}`, {
    deductions,
  });
  return data;
};
const salSlipUpdateEarning = async (id, earnings) => {
  const data = await client.put(`/api/resource/Salary Slip/${id}`, {
    earnings,
  });
  return data;
};

const salSlipUpdateEarningDeduction = async (id, earnings, deductions) => {
  const data = await client.put(`/api/resource/Salary Slip/${id}`, {
    earnings,
    deductions,
  });
  return data;
};

const submitSalarySlip = async (id) => {
  const data = await client.put(`/api/resource/Salary Slip/${id}`, {
    docstatus: 1,
  });
  return data;
};

const shiftTypeUpdate = async (
  id,
  process_attendance_after,
  last_sync_of_checkin
) => {
  const data = await client.put(`/api/resource/Shift Type/${id}`, {
    process_attendance_after,
    last_sync_of_checkin,
  });
  return data;
};

const shiftTypeUpdateDate = async (id, last_sync_of_checkin) => {
  const data = await client.put(`/api/resource/Shift Type/${id}`, {
    last_sync_of_checkin,
  });
  return data;
};

const processEmployeeAttendance = async () => {
  const data = await client.post(
    `/api/method/education.smvss.staff.process_employee_attendance`
  );
  return data;
};

const getAttendanceDataModification = async (
  fromDate,
  toDate,
  absentType,
  punchType,
  employeeID
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_attendance_data_for_modification`,
    {
      fromDate,
      toDate,
      absentType,
      punchType,
      employeeID,
    }
  );
  return data;
};

export default {
  markAttendance,
  getLatestCheckinDate,
  getEmpAttendance,
  editAttendanceStatus,
  addAttendance,
  addAttendanceWithLeaveType,
  updateCheckInById,
  updateOddPunch,
  updateSkipAttendance,
  updateShortExcess,
  updateAttendanceStatus,
  getPermissionCnt,
  updatePermission,
  getShortFullDay,
  getExcessFullDay,
  getShortHalfDay,
  getAttendance,
  editPermission,
  getAllAttendance,
  getMonthlyReport,
  addPayrollEntry,
  getAllSalarySlips,
  getSalarySlipById,
  salSlipUpdate,
  submitSalarySlip,
  salSlipUpdateEarningDeduction,
  shiftTypeUpdate,
  shiftTypeUpdateDate,
  deleteAttendance,
  checkPayrollEntry,
  uploadFile,
  addPayrollEntryManual,
  getPayrollEntryEmployees,
  getAttendanceHalfDay,
  getAttendanceOddPunch,
  addPayrollEntryManualWithDetail,
  salSlipUpdateEarning,
  getAttendanceInId,
  ERPBulkcancel,
  attendanceBulkDelete,
  getLatestCheckinDateWithoutattendance,
  processEmployeeAttendance,
  getAttendanceDataModification,
};
