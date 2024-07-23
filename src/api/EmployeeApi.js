import client from "./client";
import string from "../string";

const loginTOWebsite = async (email, password) => {
  const data = await client.post(
    "api/method/education.smvss.library.user_login",
    {
      email,
      password,
    }
  );
  return data;
};

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

const getAllColleges = async () => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_all_colleges`
  );
  return data;
};

const getAllMasters = async (screenNo, collegeID) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_master_data`,
    {
      screenNo,
      collegeID,
    }
  );
  return data;
};

const getQualificationList = async () => {
  const data = await client.get(
    `/api/resource/Qualification?fields=["name"]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const getAllSalaryComponent = async () => {
  const data = await client.get(
    `/api/resource/Salary Component?fields=["name", "salary_component", "salary_component_abbr", "statistical_component", "depends_on_payment_days", "is_tax_applicable", "type"]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const getAllowanceList = async (structure = 0) => {
  const data = await client.get(
    `/api/resource/Salary Component?fields=["name", "salary_component", "salary_component_abbr", "statistical_component", "depends_on_payment_days", "is_tax_applicable", "type"]&filters=[["salary_component", "!=", "Arrear"], ["salary_component", "!=", "LOP"], ["custom_is_salary_structure", "=", "${structure}"]]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const getAllEmployee = async () => {
  const data = await client.get(
    `/api/resource/Employee?fields=["name", "custom_employeeid", "first_name", "last_name", "employee_name", "department", "designation", "date_of_joining"]&filters=[["status","=", "Active"]]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const getAllSalaryStructureofEmployees = async (employees) => {
  const data = await client.get(
    `/api/resource/Salary Structure?fields=["name"]&filters=[["name","in","${employees}"]]`
  );
  return data;
};

const getEmployeeByNames = async (employees) => {
  const data = await client.get(
    `/api/resource/Employee?fields=["name", "custom_employeeid"]&filters=[["name","in","${employees}"]]`
  );
  return data;
};

const getAllEmployeeForPayRoll = async (company, date) => {
  const data = await client.get(
    `/api/resource/Employee?fields=["name", "first_name", "last_name", "employee_name", "department", "designation", "date_of_joining"]&filters=[["company", "=", "${company}"], ["status","=", "Active"], ["date_of_joining", "<=", "${date}"]]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

// const getEmployeeJoinedPayRollMonth = async (from_date, to_date) => {
//   const data = await client.get(
//     `/api/resource/Employee?fields=["name", "date_of_joining"]&filters=[["status","=", "Active"], ["date_of_joining", ">", "${from_date}"], ["date_of_joining", "<=", "${to_date}"]]&order_by=name asc&limit_page_length=None`
//   );
//   return data;
// };

const viewEmployeeLeveAllocation = async (employee, date) => {
  const data = await client.post(
    `/api/method/hrms.hr.doctype.leave_application.leave_application.get_leave_details`,
    {
      employee,
      date,
    }
  );
  return data;
};

const getLeaveType = async () => {
  const data = await client.get(
    `/api/resource/Leave Type?fields=["name as value","name as label","is_lwp"]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const getLeaveTypeWithoutPay = async () => {
  const data = await client.get(
    `/api/resource/Leave Type?fields=["name as value","name as label", "is_lwp"]&filters=[["is_lwp","=",1]]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const addLeaveEntry = async (
  employee,
  leave_type,
  from_date,
  to_date,
  half_day,
  description,
  half_day_date
) => {
  const data = await client.post("/api/resource/Leave Application", {
    employee,
    leave_type,
    from_date,
    to_date,
    half_day,
    description,
    half_day_date,
    status: "Approved",
    docstatus: "1",
  });
  return data;
};

const getLeaveEntryList = async (from_date, to_date) => {
  const data = await client.get(
    `/api/resource/Leave Application?fields=["name","employee", "employee_name", "department", "leave_type", "from_date", "to_date", "leave_balance", "total_leave_days"]&filters=[["from_date","<=", "${to_date} 23:59:59.000000"],["to_date", ">=", "${from_date} 00:00:00.000000"],["docstatus", "=", 1]]&limit_page_length=None&order_by=creation desc`
  );
  return data;
};

const checkLeave = async (employee, leave_type) => {
  const data = await client.get(
    `/api/resource/Leave Allocation?filters=[["employee","=","${employee}"],["leave_type","=","${leave_type}"]]&fields=["name","new_leaves_allocated","from_date","to_date","total_leaves_allocated"]`
  );
  return data;
};

// const getAllLeaveAllocation = async () => {
//   const data = await client.get(
//     `/api/resource/Leave Allocation?filters=[["docstatus","=",1], ["leave_type", "!=", "Tour"], ["new_leaves_allocated", ">", 0]]&fields=["employee", "leave_type", "new_leaves_allocated","from_date","to_date","total_leaves_allocated"]&limit_page_length=None&order_by=employee asc`
//   );
//   return data;
// };

const editLeaveAllocation = async (
  id,
  new_leaves_allocated,
  custom_authorized_by,
  custom_note
) => {
  const data = await client.put(`/api/resource/Leave Allocation/${id}`, {
    new_leaves_allocated,
    custom_authorized_by,
    custom_note,
  });
  return data;
};

const getLeaveTypeCount = async (leave_type) => {
  const data = await client.get(
    `/api/resource/Leave Type?filters=[["name","=","${leave_type}"]]&fields=["max_leaves_allowed"]`
  );
  return data;
};

const getLeaveUpdationList = async (from_date, to_date) => {
  const data = await client.get(
    `/api/resource/Leave Allocation?fields=["name", "employee", "employee_name", "department", "leave_type", "from_date", "to_date", "new_leaves_allocated"]&filters=[["creation",">=", "${from_date} 00:00:00.000000"],["creation", "<=", "${to_date} 23:59:59.000000"]]&limit_page_length=None&order_by=creation desc`
  );
  return data;
};

// const getCheckInByAttendanceDate = async (attendance_date, employee) => {
//   const data = await client.get(
//     `/api/resource/Employee Checkin?fields=["name", "time"]&filters=[["time", ">=", "${attendance_date} 00:00:00"], ["time", "<=", "${attendance_date} 23:59:59"], ["employee", "=", "${employee}"], ["skip_auto_attendance", "=", false]]&order_by=time asc`
//   );
//   return data;
// };

// const getCheckInByAttendance = async (attendance) => {
//   const data = await client.get(
//     `/api/resource/Employee Checkin?fields=["name", "time"]&filters=[["attendance","=","${attendance}"], ["skip_auto_attendance", "=", 0]]&order_by=time asc`
//   );
//   return data;
// };

const createCheckIn = async (
  employee,
  time,
  device_id,
  skip_auto_attendance
) => {
  const data = await client.post(`/api/resource/Employee Checkin`, {
    employee,
    time,
    device_id,
    skip_auto_attendance,
  });
  return data;
};

const getLeave = async () => {
  const data = await client.get(
    `/api/resource/Leave Type?fields=["name as label", "name as value", "leave_type_name", "name"]&filters=[["is_lwp", "=", false]]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const getEmployeeById = async (id) => {
  const data = await client.get(`/api/resource/Employee/${id}`);
  return data;
};

const getAllPendingEmployee = async () => {
  const data = await client.get(
    `/api/resource/Employee?fields=["custom_employeeid", "name", "salutation", "employee_name", "first_name", "designation", "department", "cell_number", "personal_email", "status"]&filters=[["status","=","Inactive"]]&limit_page_length=None&order_by=Creation desc`
  );
  return data;
};

const getAttendanceCompOff = async (searchstr) => {
  const data = await client.get(
    `/api/resource/Attendance?fields=["employee", "name", "employee_name", "department", "attendance_date", "status", "in_time", "out_time", "employee.custom_employeeid"]&filters=[${searchstr}]&order_by=attendance_date&limit_page_length=None`
  );
  return data;
};

const editAttendanceCompOff = async (id) => {
  const data = await client.put(`/api/resource/Attendance/${id}`, {
    custom_is_compensation_off: 1,
  });
  return data;
};

const salaryStructureCancelReassign = async (
  employee,
  earnings,
  deductions,
  company,
  joinDate
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.salary_structure_cancel_and_reassign`,
    {
      employee,
      user: sessionStorage.getItem("email"),
      joinDate,
      salaryStructureParam: {
        company,
        earnings,
        deductions,
      },
    }
  );
  return data;
};

const insertSalaryStructureAssignment = async (
  employee,
  earnings,
  deductions,
  company,
  joinDate
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.create_salary_structure_assignment`,
    {
      employee,
      salaryStructureParam: {
        company,
        earnings,
        deductions,
      },
      joinDate,
    }
  );
  return data;
};

const addEmployeeSalaryDetail = async (
  employee,
  joinDate,
  company,
  earnings,
  deductions
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.salary_structure_create_and_assign`,

    {
      employee,
      joinDate,
      salaryStructureParam: {
        company,
        earnings,
        deductions,
      },
    }
  );
  return data;
};

const editEmployeeExperience = async (employeeId, external_work_history) => {
  const data = await client.put(`/api/resource/Employee/${employeeId}`, {
    external_work_history,
  });
  return data;
};

const editEmployeeQualification = async (id, education) => {
  const data = await client.put(`/api/resource/Employee/${id}`, {
    education,
  });
  return data;
};

const editEmployeeWorkDetail = async (
  id,
  employment_type,
  date_of_joining,
  custom_increment_date,
  custom_designation_category,
  designation,
  custom_is_teaching,
  department,
  reports_to,
  passport_number,
  place_of_issue,
  date_of_issue,
  valid_upto,
  custom_aadhaar_card,
  salary_mode,
  bank_name,
  bank_ac_no,
  ifsc_code,
  custom_bank_branch_name,
  pan_number,
  provident_fund_account,
  person_to_be_contacted,
  relation,
  emergency_phone_number,
  custom_emergency_contact_name_2,
  custom_relation_2,
  custom_emergency_phone_2,
  current_address,
  custom_current_place,
  custom_current_city,
  custom_current_state,
  custom_current_country,
  custom_current_pincode,
  permanent_address,
  custom_permanent_place,
  custom_permanent_city,
  custom_permanent_state,
  custom_permanent_country,
  custom_permanent__pincode
) => {
  const data = await client.put(`/api/resource/Employee/${id}`, {
    employment_type,
    date_of_joining,
    custom_increment_date,
    custom_designation_category,
    designation,
    custom_is_teaching,
    department,
    reports_to,
    passport_number,
    place_of_issue,
    date_of_issue,
    valid_upto,
    custom_aadhaar_card,
    salary_mode,
    bank_name,
    bank_ac_no,
    ifsc_code,
    custom_bank_branch_name,
    pan_number,
    provident_fund_account,
    person_to_be_contacted,
    relation,
    emergency_phone_number,
    custom_emergency_contact_name_2,
    custom_relation_2,
    custom_emergency_phone_2,
    current_address,
    custom_current_place,
    custom_current_city,
    custom_current_state,
    custom_current_country,
    custom_current_pincode,
    permanent_address,
    custom_permanent_place,
    custom_permanent_city,
    custom_permanent_state,
    custom_permanent_country,
    custom_permanent__pincode,
  });
  return data;
};

const imageUploadProfile = async (filename, filedata) => {
  const data = await client.post("/api/method/upload_file", {
    cmd: "uploadfile",
    filename,
    from_form: 1,
    filedata,
  });
  return data;
};

const checkEmployeePersonal = async (personal_email, cell_number, name) => {
  const data = await client.get(
    `/api/resource/Employee?filters=[["name","!=","${name}"]]&or_filters=[["personal_email","=", "${personal_email}"], ["cell_number","=","${cell_number}"]]`
  );
  return data;
};

const checkUserEmail = async (email) => {
  const data = await client.get(
    `/api/resource/User?filters=[["email","=", "${email}"]]`
  );
  return data;
};

const editEmployeePersonal = async (
  employeeId,
  salutation,
  first_name,
  custom_father_name,
  date_of_birth,
  gender,
  marital_status,
  custom_mother_name,
  custom_spouse_name,
  blood_group,
  custom_community,
  custom_caste,
  custom_religion,
  custom_nationality,
  custom_mother_tongue,
  custom_language_known,
  cell_number,
  custom_mobile_2,
  personal_email,
  image,
  company,
  custom_college_id
) => {
  const params = image
    ? {
        salutation,
        first_name,
        custom_father_name,
        date_of_birth,
        gender,
        marital_status,
        custom_mother_name,
        custom_spouse_name,
        blood_group,
        custom_community,
        custom_caste,
        custom_religion,
        custom_nationality,
        custom_mother_tongue,
        custom_language_known,
        cell_number,
        custom_mobile_2,
        personal_email,
        image,
        company,
        custom_college_id,
      }
    : {
        salutation,
        first_name,
        custom_father_name,
        date_of_birth,
        gender,
        marital_status,
        custom_mother_name,
        custom_spouse_name,
        blood_group,
        custom_community,
        custom_caste,
        custom_religion,
        custom_nationality,
        custom_mother_tongue,
        custom_language_known,
        cell_number,
        custom_mobile_2,
        personal_email,
        company,
        custom_college_id,
      };
  console.log("params------", params);
  const data = await client.put(`/api/resource/Employee/${employeeId}`, params);
  return data;
};

const confirmEmployee = async (employeeID, email, password) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.confirm_employee`,
    {
      employeeID,
      email,
      password,
    }
  );
  return data;
};

const addEmployeePersonal = async (
  salutation,
  first_name,
  custom_father_name,
  date_of_birth,
  gender,
  marital_status,
  custom_mother_name,
  custom_spouse_name,
  blood_group,
  custom_community,
  custom_caste,
  custom_religion,
  custom_nationality,
  custom_mother_tongue,
  custom_language_known,
  cell_number,
  custom_mobile_2,
  personal_email,
  image,
  date_of_joining,
  company,
  custom_college_id
) => {
  const data = await client.post(`/api/resource/Employee`, {
    salutation,
    first_name,
    custom_father_name,
    date_of_birth,
    gender,
    marital_status,
    custom_mother_name,
    custom_spouse_name,
    blood_group,
    custom_community,
    custom_caste,
    custom_religion,
    is_teaching: 1,
    custom_nationality,
    custom_mother_tongue,
    custom_language_known,
    cell_number,
    custom_mobile_2,
    personal_email,
    image,
    default_shift: sessionStorage.getItem("DEFAULT_SHIFT"),
    date_of_joining,
    company,
    custom_college_id,
    status: "Inactive",
  });
  return data;
};

const getAllowanceDetail = async (value) => {
  const data = client.get(`/api/resource/Salary Component/${value}`);
  return data;
};

const holidayList = async (year) => {
  const data = client.get(
    `/api/resource/Holiday List?fields=["name","holidays.holiday_date","holidays.description","holidays.weekly_off"]&filters=[["name","=","${year}"]]&limit_page_length=None&order_by=name&include_docs=1`
  );
  return data;
};

// const holidayListByDate = async (year, from_date, to_date) => {
//   const data = client.get(`/api/resource/Holiday List/${year}`);
//   return data;
// };

const getLeaveApplication = async (from_date, to_date, employee) => {
  const data = await client.get(
    `/api/resource/Leave Application?fields=["name","from_date","to_date","status","leave_type","total_leave_days","half_day"]&filters=[["status","=","Approved"],["from_date",">=","${from_date} 00:00:00.000000"],["to_date","<=","${to_date} 23:59:59.000000"],["employee","=","${employee}"]]&limit_page_length=None&order_by=from_date desc`
  );
  return data;
};

const cancelLeaveApplication = async (id, custom_cancel_reason) => {
  const data = await client.put(`/api/resource/Leave Application/${id}`, {
    custom_cancel_reason,
  });
  return data;
};

const fiterAttendence = async (leaveApplicationId) => {
  const data = await client.get(
    `/api/resource/Attendance?filters=[["leave_application","=","${leaveApplicationId}"]]&fields=["name"]`
  );
  return data;
};

const cancelDoctype = async (doctype, name) => {
  const data = await client.put(`/api/method/frappe.desk.form.save.cancel`, {
    doctype,
    name,
  });
  return data;
};

// const getShiftTypeByName = async (shiftName) => {
//   const data = await client.get(`/api/resource/Shift Type/${shiftName}`);
//   return data;
// };

const viewSalary = async (id) => {
  const data = await client.get(`/api/resource/Salary Structure/${id}`);
  return data;
};

const getEmployeeCheckin = async (from_date, to_date) => {
  const data = await client.get(
    `/api/resource/Employee Checkin?fields=["employee", "employee_name", "shift", "time", "device_id", "skip_auto_attendance", "custom_is_modified", "custom_reason"]&filters=[["time",">=", "${from_date} 00:00:00.000000"],["time", "<=", "${to_date} 23:59:59.000000"]]&limit_page_length=None&order_by=creation desc`
  );
  return data;
};

const getEmployeeforTour = async (value) => {
  const data = await client.get(
    `/api/resource/Employee?filters=[["name","=","${value}"]]&fields=["employee_name","designation","department"]`
  );
  return data;
};

const getTourDetails = async (value) => {
  const data = await client.get(
    `/api/resource/Leave Application?filters=[["employee","=","${value}"],["leave_type","=","Tour"],["status","=","Approved"],["status","!=","Cancelled"]]&fields=["from_date","to_date","total_leave_days"]&order_by=from_date asc`
  );
  return data;
};

const getAttendanceByEmployee = async (empid, from_date, to_date) => {
  const data = await client.get(
    `/api/resource/Attendance?fields=["attendance_date", "name", "status", "employee", "in_time", "out_time", "working_hours", "shift", "late_entry", "early_exit", "custom_short_excess"]&filters=[["employee","=","${empid}"],["attendance_date",">=","${from_date}"],["attendance_date","<=","${to_date}"],["docstatus","=","1"]]&or_filters=[["status","=","Present"],["status","=","On Leave"],["status","=","Half Day"]]&order_by=attendance_date asc&limit_page_length=None`
  );
  return data;
};

// const getAbsentAttendance = async (from_date, to_date, employee) => {
//   const data = await client.get(
//     `/api/resource/Attendance?fields=["attendance_date", "name", "status", "employee", "in_time", "out_time", "working_hours", "shift", "late_entry", "early_exit", "custom_short_excess", "employee.custom_employeeid", "employee.first_name"]&filters=[${employee}["attendance_date",">=","${from_date}"],["attendance_date","<=","${to_date}"],["docstatus","=","1"]]&or_filters=[["status","=","Absent"], ["status","=","Half Day"]]&order_by=employee,attendance_date asc&limit_page_length=None`
//   );
//   return data;
// };

const calculateDays = async (employee, leave_type, from_date, to_date) => {
  const data = await client.post(
    `/api/method/hrms.hr.doctype.leave_application.leave_application.get_number_of_leave_days`,
    {
      employee,
      leave_type,
      from_date,
      to_date,
    }
  );
  return data;
};

const addTour = async (employee, leave_type, from_date, to_date, status) => {
  const data = await client.post(`/api/resource/Leave Application`, {
    employee,
    leave_type,
    from_date,
    to_date,
    status,
    docstatus: "1",
  });
  return data;
};

const getAllTourEntry = async (from_date, to_date) => {
  const data = await client.get(
    `/api/resource/Leave Application?fields=["name", "employee_name", "department","from_date","to_date","total_leave_days"]&filters=[["from_date",">=", "${from_date} 00:00:00.000000"],["to_date", "<=", "${to_date} 23:59:59.000000"],["leave_type","=","Tour"]]&limit_page_length=None&order_by=from_date asc`
  );
  return data;
};

const calculateLeaveDays = async (
  employee,
  leave_type,
  from_date,
  to_date,
  half_day,
  half_day_date
) => {
  const data = await client.post(
    `/api/method/hrms.hr.doctype.leave_application.leave_application.get_number_of_leave_days`,
    {
      employee,
      leave_type,
      from_date,
      to_date,
      half_day,
      half_day_date,
    }
  );
  return data;
};

const getLeaveDetails = async (value) => {
  const data = await client.get(
    `/api/resource/Leave Application?filters=[["employee","=","${value}"],["leave_type","!=","Tour"],["status","=","Approved"],["status","!=","Cancelled"]]&fields=["from_date","leave_type","to_date","total_leave_days"]&order_by=from_date desc`
  );
  return data;
};

// const checkEmployeeCheckin = async (employee, time) => {
//   const data = await client.get(
//     `/api/resource/Employee Checkin?fields=["name"]&filters=[["employee", "=", "${employee}"], ["time", "=", "${time}"]]`
//   );
//   return data;
// };

// const addEmployeeCheckin = async (employee, time, reason) => {
//   const data = await client.post("/api/resource/Employee Checkin", {
//     employee,
//     time,
//     reason,
//   });
//   return data;
// };

// const checkForPermission = async (employee, date) => {
//   const data = await client.get(
//     `/api/resource/Permission Application?filters=[["employee","=","${employee}"],["date","=","${date}"], ["status", "=", "Approved"]]&fields=["name"]`
//   );
//   return data;
// };

const checkForSameTimePermission = async (employee, startDate, endDate) => {
  const data = await client.get(
    `/api/resource/Permission Application?filters=[["employee","=","${employee}"],["date",">=","${startDate}"],["date","<=","${endDate}"],["status","=","Approved"]]&fields=["name","date","from_time","to_time"]`
  );
  return data;
};

const checkPermissionSameDay = async (employee, date) => {
  const data = await client.get(
    `/api/resource/Permission Application?filters=[["employee","=","${employee}"],["date","in","${date}"],["status","=","Approved"]]&fields=["name","date","from_time","to_time"]`
  );
  return data;
};

// const getPermission = async (fromDate, toDate) => {
//   const data = await client.get(
//     `/api/resource/Permission Application?filters=[["date",">=","${fromDate}"],["date","<","${toDate}"]]&fields=["name","date", "employee"]`
//   );
//   return data;
// };

const addPermission = async (
  employee,
  date,
  department,
  from_time,
  to_time,
  reason
) => {
  const data = await client.post("/api/resource/Permission Application", {
    employee,
    date,
    department,
    from_time,
    to_time,
    reason,
    status: "Approved",
  });
  return data;
};

const addAdditionalSalary = async (
  company,
  employee,
  payroll_date,
  amount,
  custom_reason,
  salary_component
) => {
  const data = await client.post("/api/resource/Additional Salary", {
    employee,
    company,
    payroll_date,
    salary_component,
    amount,
    custom_reason,
    overwrite_salary_structure_amount: true,
    docstatus: 1,
  });
  return data;
};

const getAdditionalSalary = async (start_date, end_date) => {
  const data = await client.get(
    `/api/resource/Additional Salary?fields=["employee_name", "salary_component", "payroll_date", "amount"]&filters=[["salary_component", "!=", "Arrear"], ["payroll_date",">=","${start_date}"], ["payroll_date","<=","${end_date}"], ["docstatus","=","1"]]`
  );
  return data;
};

const getAdditionalSalaryComponent = async (
  start_date,
  end_date,
  salary_component,
  employee
) => {
  const data = await client.get(
    `/api/resource/Additional Salary?fields=["name"]&filters=[["payroll_date",">=","${start_date}"], ["payroll_date","<=","${end_date}"], ["salary_component", "=", "${salary_component}"],["employee", "=", "${employee}"], ["docstatus","=","1"]]`
  );
  return data;
};

// const getAllArrearSplitUp = async (start_date, end_date) => {
//   const data = await client.get(
//     `/api/resource/Additional Salary?fields=["employee_name","payroll_date","custom_reason","amount","department"]&filters=[["salary_component", "=", "Arrear"], ["payroll_date",">=","${start_date}"], ["payroll_date","<=","${end_date}"]]`
//   );
//   return data;
// };

const addHoliday = async (year, from_date, to_date, holidays) => {
  const data = await client.post("/api/resource/Holiday List", {
    holiday_list_name: year,
    from_date,
    to_date,
    holidays,
    get_weekly_off_dates: true,
  });
  return data;
};

const getHolidayDetailList = async () => {
  const data = await client.get(
    `/api/resource/Holiday List?fields=["holiday_list_name","from_date","to_date","name"]&order_by = name asc &limit_page_length=None`
  );
  return data;
};

const employeeSearch = async (searchValue, isActive = 1) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.employee_search`,
    {
      searchValue,
      isActive,
    }
  );
  return data;
};

const editHoliday = async (holidays, id) => {
  const data = await client.put(`/api/resource/Holiday List/${id}`, {
    holidays,
  });
  return data;
};

const viewHolidayListDetail = async (id) => {
  const data = await client.get(`/api/resource/Holiday List/${id}`);
  return data;
};

const checkSameMonthArrearSplitup = async (employee, date) => {
  const data = await client.get(
    `/api/resource/Additional Salary?filters=[["employee","=","${employee}"],["payroll_date","=","${date}"], ["salary_component", "=", "Arrear"]]&fields=["name"]`
  );
  return data;
};

const checkSameMonthAdditionalSalary = async (
  employee,
  salary_component,
  startDate,
  endDate
) => {
  const data = await client.get(
    `/api/resource/Additional Salary?filters=[["employee","=","${employee}"],["salary_component", "=", "${salary_component}"],["payroll_date",">=","${startDate}"], ["payroll_date","<=","${endDate}"]]&fields=["name"]`
  );
  return data;
};

// const saveDoc = async () => {
//   const data = await client.post(`/api/method/frappe.desk.form.save.savedocs`, {
//     doc: {
//       doctype: "Data Import",
//       import_type: "Insert New Records",
//       status: "Pending",
//       reference_doctype: "Employee Checkin",
//     },
//     action: "Save",
//   });
//   return data;
// };

const getReasonlist = async () => {
  const data = await client.get(
    `/api/resource/LeaveReason?fields=["name as value","name as label"]`
  );
  return data;
};

const getPermissionEntryList = async (from_date, to_date) => {
  const data = await client.get(
    `/api/resource/Permission Application?fields=["name","employee", "employee_name", "department", "date", "from_time", "to_time", "reason", "status"]&filters=[["date",">=", "${from_date} 00:00:00.000000"],["date", "<=", "${to_date} 23:59:59.000000"]]&limit_page_length=None&order_by=creation desc`
  );
  return data;
};

const editIncrementDate = async (employee_id, custom_increment_date) => {
  const data = await client.put(`/api/resource/Employee/${employee_id}`, {
    custom_increment_date,
  });
  return data;
};

const getIncrementDateDetails = async (
  collegeID,
  fromDate,
  toDate,
  employeeID,
  designation,
  designationCategory,
  department
) => {
  const data = await client.post(
    "/api/method/education.smvss.staff.get_increment_date_details",
    {
      collegeID,
      fromDate,
      toDate,
      employeeID,
      designation,
      designationCategory,
      department,
    }
  );
  return data;
};

const filterDesignation = async (designationCategory) => {
  const data = await client.get(
    `/api/resource/Designation?fields=["name"]&filters=[["custom_designation_category","=","${designationCategory}"]]&limit_page_length=None`
  );
  return data;
};

const getPromotionListByEmployee = async (employeeID) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_employee_promotion_history`,
    {
      employeeID,
    }
  );
  return data;
};

const addPromotion = async (
  employee,
  promotion_date,
  promotion_details,
  custom_remarks
) => {
  const data = await client.post(`/api/resource/Employee Promotion`, {
    employee,
    promotion_date,
    promotion_details,
    custom_remarks,
    docstatus: "1",
  });
  return data;
};

const getNOCMaster = async () => {
  const data = await client.get(
    `/api/resource/NOCMaster?limit_page_length=None`
  );
  return data;
};

const relieveEmployee = async (
  reason_for_leaving,
  resignation_letter_date,
  relieving_date,
  id
) => {
  const data = await client.put(`/api/resource/Employee/${id}`, {
    reason_for_leaving,
    resignation_letter_date,
    relieving_date,
    status: "Left",
  });
  return data;
};

const filterEmployeeDetail = async (selectFields, searchstr, search, limit) => {
  const data = await client.get(
    `/api/resource/Employee?fields=[${selectFields}]&filters=[${searchstr}]${search}&order_by=creation asc&limit_page_length=${limit}`
  );
  return data;
};

const getEmployeeAttendanceDetail = async (
  collegeID,
  attendanceStatus,
  fromDate,
  toDate,
  department,
  designation,
  designationCategory,
  employeeID,
  showAll
) => {
  const data = await client.post(
    "/api/method/education.smvss.staff.get_attendance_report_details",
    {
      collegeID,
      attendanceStatus,
      fromDate,
      toDate,
      department,
      designation,
      designationCategory,
      employeeID,
      showAll,
    }
  );
  return data;
};

const checkLeaveEntry = async (employee, attendance_date) => {
  const data = await client.get(
    `/api/resource/Attendance?filters=[["employee","=","${employee}"],["attendance_date","=","${attendance_date}"],["status","=","On Leave"],["docstatus","=","1"]]&fields=["name"]`
  );
  return data;
};

const getHolidayName = async (fromDate, toDate) => {
  const data = await client.get(
    `/api/resource/Holiday List?filters=[["from_date","=","${fromDate}"],["to_date","=","${toDate}"]]&fields=["name"]`
  );
  return data;
};

const getCompanyByCompanyName = async (companyName) => {
  const data = await client.get(`/api/resource/Company/${companyName}`);
  return data;
};

// add new employee activity group
const addEmployeeActivityGroup = async (
  collegeID,
  employeeActivityGroupName
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.add_employee_activity_group`,
    {
      collegeID,
      employeeActivityGroupName,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

// get all employee activity group
const getAllEmployeeActivityGroup = async (collegeID) => {
  const data = await client.get(
    `/api/method/education.smvss.staff.get_all_employee_activity_group`,
    {
      collegeID,
    }
  );
  return data;
};

// assign employee to activity group
const assignEmployeeToActivityGroup = async (
  employeeActivityGroupID,
  employees
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.assign_employee_to_activity_group`,
    {
      employeeActivityGroupID,
      employees,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

// get all assigned students
const getAllAssignedGroupEmployee = async (employeeActivityGroupID) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_all_activity_group_detail`,
    {
      employeeActivityGroupID,
    }
  );
  return data;
};

const getEarlyDepartList = async (
  collegeID,
  fromDate,
  toDate,
  department,
  designation,
  customemployeeid
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_employee_early_departure_details`,
    {
      collegeID,
      fromDate,
      toDate,
      department,
      designation,
      customemployeeid,
    }
  );
  return data;
};

const getLateArrivalList = async (
  collegeID,
  fromDate,
  toDate,
  department,
  designation,
  customemployeeid
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_employee_late_arrival_details`,
    {
      collegeID,
      fromDate,
      toDate,
      department,
      designation,
      customemployeeid,
    }
  );
  return data;
};

const inOutStatement = async (collegeID, fromDate, toDate, showAll) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_attendance_in_out_statement_report`,
    {
      collegeID,
      fromDate,
      toDate,
      showAll,
    }
  );
  return data;
};

const monthlyActivityList = async (
  collegeID,
  employeeID,
  department,
  fromDate,
  toDate,
  showAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_attendance_monthly_activity_report`,
    {
      collegeID,
      employeeID,
      department,
      fromDate,
      toDate,
      showAll,
    }
  );
  return data;
};

const getAbsentAttendanceReport = async (
  collegeID,
  leaveType,
  fromDate,
  toDate,
  department,
  designation,
  employeeID,
  showAll
) => {
  const data = await client.post(
    "/api/method/education.smvss.staff.get_absent_detail_report",
    {
      collegeID,
      leaveType,
      fromDate,
      toDate,
      department,
      designation,
      employeeID,
      showAll,
    }
  );
  return data;
};

const getNewJoiningReport = async (
  collegeID,
  fromDate,
  toDate,
  department,
  designation,
  isShowAll
) => {
  const data = await client.post(
    "/api/method/education.smvss.staff.get_newly_joining_report",
    {
      collegeID,
      fromDate,
      toDate,
      department,
      designation,
      isShowAll,
    }
  );
  return data;
};

const getRelivingReport = async (
  collegeID,
  fromDate,
  toDate,
  department,
  designation,
  isShowAll
) => {
  const data = await client.post(
    "/api/method/education.smvss.staff.get_reliving_report",
    {
      collegeID,
      fromDate,
      toDate,
      department,
      designation,
      isShowAll,
    }
  );
  return data;
};

const getStudentMasterReport = async (
  institutionType,
  courseID,
  enrollNo,
  admissionTypeID,
  genderID,
  communityID,
  religionID,
  section,
  fromDate,
  toDate,
  semester,
  showAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_master_report`,
    {
      institutionType,
      courseID,
      enrollNo,
      admissionTypeID,
      genderID,
      communityID,
      religionID,
      section,
      fromDate,
      toDate,
      semester,
      showAll,
    }
  );
  return data;
};

const addNewLeaveTypeToAllocation = async (
  leave_type,
  employee,
  from_date,
  to_date,
  new_leaves_allocated
) => {
  const data = await client.post(`/api/resource/Leave Allocation`, {
    leave_type,
    employee,
    from_date,
    to_date,
    new_leaves_allocated,
    total_leaves_allocated: 12,
    docstatus: 1,
  });
  return data;
};

const getCurrentWorkingEmployee = async (searchstr, limitValue) => {
  const data = await client.get(
    `/api/resource/Employee?fields=["name","employee_name","department","designation","status","cell_number","date_of_joining","custom_employeeid"]&filters=[${searchstr}]&order_by=department asc&limit_page_length=${limitValue}`
  );
  return data;
};

const getLeaveEntryReport = async (collegeID, fromDate, toDate, showAll) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_leave_entry_details`,
    {
      collegeID,
      fromDate,
      toDate,
      showAll,
    }
  );
  return data;
};

const getLeaveDetailReport = async (
  collegeID,
  fromDate,
  toDate,
  department,
  designation,
  employeeID,
  isShowAl
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_employee_leave_details`,
    {
      collegeID,
      fromDate,
      toDate,
      department,
      designation,
      employeeID,
      isShowAl,
    }
  );
  return data;
};

const getLeaveReasonReport = async (
  collegeID,
  fromDate,
  toDate,
  department,
  designation,
  employeeID,
  leave_type,
  isShowAl
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_employee_leave_with_reason`,
    {
      collegeID,
      fromDate,
      toDate,
      department,
      designation,
      employeeID,
      leave_type,
      isShowAl,
    }
  );
  return data;
};

const getOtherDeductionReport = async (collegeID, fromDate, toDate) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_other_deduction_report`,
    {
      collegeID,
      fromDate,
      toDate,
    }
  );
  return data;
};

const getArrearReport = async (collegeID, fromDate, toDate) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_arrear_report`,
    {
      collegeID,
      fromDate,
      toDate,
    }
  );
  return data;
};

const getLeaveBalanceReport = async (
  company,
  from_date,
  to_date,
  department,
  employee
) => {
  const data = await client.post(`api/method/frappe.desk.query_report.run`, {
    report_name: "Employee Leave Balance",
    filters: {
      company: company,
      from_date: from_date,
      to_date: to_date,
      department: department,
      employee: employee,
      employee_status: "Active",
    },
    order_by: "employee_name asc",
  });
  return data;
};

const getDataForCustomField = async (field, doctype, names) => {
  const data = await client.post(
    `/api/method/frappe.desk.query_report.get_data_for_custom_field`,
    {
      field,
      doctype,
      names,
    }
  );
  return data;
};

const getEmployeeID = async (name) => {
  const data = await client.get(
    `/api/resource/Employee?filters=[["name","=","${name}"]]&fields=["custom_employeeid","employee_name"]`
  );
  return data;
};

const getEmployeeByEmployeeID = async (custom_employeeid) => {
  const data = await client.get(
    `/api/resource/Employee?filters=[["custom_employeeid","=","${custom_employeeid}"]]&fields=["*"]`
  );
  return data;
};

// const picture = async () => {
//   const data = await client.get("/files/profile.jpg");
//   return data;
// };

const getPayModeReport = async (
  collegeID,
  fromDate,
  toDate,
  payMode,
  bankName,
  department,
  designation,
  employeeID,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_pay_mode_bank_detail_report`,
    {
      collegeID,
      fromDate,
      toDate,
      payMode,
      bankName,
      department,
      designation,
      employeeID,
      isShowAll,
    }
  );
  return data;
};

const getPermissionApplication = async (from_date, to_date, employee) => {
  const data = await client.get(
    `/api/resource/Permission Application?fields=["name","date","employee_name","status","employee","from_time","to_time","reason","department"]&filters=[["status","=","Approved"],["date",">=","${from_date} 00:00:00.000000"],["date","<=","${to_date} 23:59:59.000000"],["employee","=","${employee}"]]&limit_page_length=None&order_by=date desc`
  );
  return data;
};

const cancelPermissionApplication = async (id, cancel_reason) => {
  const data = await client.put(`/api/resource/Permission Application/${id}`, {
    cancel_reason,
    status: "Cancelled",
  });
  return data;
};

const getPermissionAttendence = async (employeeID, attendance_date) => {
  const data = await client.get(
    `/api/resource/Attendance?filters=[["employee","=","${employeeID}"],["attendance_date","=","${attendance_date}"]]`
  );
  return data;
};
// cancel permission attendance
const cancelPermisssionAttendance = async (id) => {
  const data = await client.put(`/api/resource/Attendance/${id}`, {
    custom_is_permission: false,
  });
  return data;
};

const getEmployeePermissionReport = async (
  collegeID,
  fromDate,
  toDate,
  status,
  department,
  designation,
  employeeID,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_employee_permission_report`,
    {
      collegeID,
      fromDate,
      toDate,
      status,
      department,
      designation,
      employeeID,
      isShowAll,
    }
  );
  return data;
};

const getEmployeeSalaryReport = async (
  collegeID,
  fromDate,
  toDate,
  designation,
  employeeID,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_employee_salary_register_report`,
    {
      collegeID,
      fromDate,
      toDate,
      designation,
      employeeID,
      isShowAll,
    }
  );
  return data;
};

const hrmsConfigData = async (collegeID) => {
  const data = await client.post(
    `/api/method/education.smvss.library.get_config_data`,
    {
      collegeID,
    }
  );
  return data;
};

const getLOPSalary = async (company, start_date, end_date) => {
  const data = await client.get(
    `/api/resource/Additional Salary?fields=["name", "amount"]&filters=[["company", "=", "${company}"], ["payroll_date",">=","${start_date}"], ["payroll_date","<=","${end_date}"], ["docstatus","=","1"]]&or_filters=[["salary_component", "=", "${string.LOP_COMPONENT}"], ["amount", "=", 0]]`
  );
  return data;
};

const convertToBase64 = async (image_url) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.convert_to_base64`,
    {
      image_url,
    }
  );
  return data;
};

const getSalaryStatement = async (
  collegeID,
  fromDate,
  toDate,
  designationCategory
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_employee_salary_statement_report`,
    {
      collegeID,
      fromDate,
      toDate,
      designationCategory,
    }
  );
  return data;
};

const getAbsenteeEmployeeLeaveEntry = async (collegeID, fromDate, toDate) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_absentee_employee_leave_entry`,
    {
      collegeID,
      fromDate,
      toDate,
    }
  );
  return data;
};

const getEmployeeAttendance = async (collegeID, attendanceDate) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_employee_for_attendance`,
    {
      collegeID,
      attendanceDate,
    }
  );
  return data;
};

const saveEmployeeAttendance = async (
  id,
  company,
  employee,
  department,
  attendance_date,
  custom_attendance_session,
  status
) => {
  const endpoint = `/api/resource/Attendance${id ? `/${id}` : ""}`;
  const method = id ? "put" : "post";
  const data = await client[method](endpoint, {
    company,
    employee,
    department,
    attendance_date,
    custom_attendance_session,
    status,
    docstatus: 1,
  });
  return data;
};

const getSalaryStructureAssignment = async (employee) => {
  const data = await client.get(
    `/api/resource/Salary Structure Assignment?fields=["name"]&filters=[["employee","=","${employee}"], ["docstatus","=","1"]]`
  );
  return data;
};

const renameSalaryStructure = async (doctype, docname, name) => {
  const data = await client.put(
    `/api/method/frappe.model.rename_doc.update_document_title`,
    {
      doctype,
      docname,
      name,
    }
  );
  return data;
};

const getAllParticular = async (isShowAll) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_all_particulars`,
    {
      isShowAll,
    }
  );
  return data;
};

const addOrUpdateParticular = async (
  particularID,
  particular,
  isMisc,
  isDeduct,
  isFeesStructure,
  isTuitionFees,
  term,
  isActive
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.add_or_update_particular`,
    {
      particularID,
      particular,
      isMisc,
      isDeduct,
      isFeesStructure,
      isTuitionFees,
      term,
      isActive,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const searchParticular = async (searchValue) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.search_particular`,
    {
      searchValue,
    }
  );
  return data;
};

const getSectionBatchMaster = async (
  docType,
  collegeID,
  courseID = null,
  batchID = null,
  semester = null
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_master_for_class_creation`,
    {
      docType,
      collegeID,
      courseID,
      batchID,
      semester,
    }
  );
  return data;
};

const addOrUpdateSectionBatchMaster = async (
  classID,
  courseID,
  batchID,
  batch,
  section
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.add_or_update_college_class`,
    {
      classID,
      courseID,
      batchID,
      batch,
      section,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getEmployeeDetailsByEmail = async (email) => {
  const data = await client.get(
    `/api/resource/Employee?fields=["name", "cell_number"]&filters=[["personal_email","=","${email}"]]`
  );
  return data;
};

const getWebErrorLog = async () => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_error_log_files`
  );
  return data;
};

const getActivityLog = async () => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_activity_log_files`
  );
  return data;
};

const getEmployeeQualificationList = async (limit) => {
  const data = await client.get(
    `/api/resource/Qualification?fields=["qualification"]&order_by=name asc&limit_page_length=${limit}`
  );
  return data;
};

const getSearchEmployeeQualification = async (search) => {
  const data = await client.get(
    `/api/resource/Qualification?fields=["qualification"]&filters=[["name","like","${search}%"]]`
  );
  return data;
};

const addEmployeeQualification = async (qualification) => {
  const data = await client.post(`/api/resource/Qualification`, {
    qualification,
  });
  return data;
};

const checkEmployeeQualification = async (qualificationName) => {
  const data = await client.get(
    `/api/resource/Qualification?fields=["qualification"]&filters=[["qualification","=","${qualificationName}"]]`
  );
  return data;
};

const updateEmployeeQualification = async (doctype, docname, name) => {
  const data = await client.post(
    `/api/method/frappe.model.rename_doc.update_document_title`,
    {
      doctype,
      docname,
      name,
    }
  );
  return data;
};

const getEmployeeDesignationList = async (limit) => {
  const data = await client.get(
    `/api/resource/Designation?fields=["designation_name","custom_designation_category"]&order_by=name asc&limit_page_length=${limit}`
  );
  return data;
};

const getSearchEmployeeDesignation = async (search) => {
  const data = await client.get(
    `/api/resource/Designation?fields=["designation_name","custom_designation_category"]&filters=[["name","like","${search}%"]]`
  );
  return data;
};

const addEmployeeDesignation = async (
  designation_name,
  custom_designation_category
) => {
  const data = await client.post(`/api/resource/Designation`, {
    designation_name,
    custom_designation_category,
  });
  return data;
};

const updateEmployeeDesignation = async (id, custom_designation_category) => {
  const data = await client.put(`/api/resource/Designation/${id}`, {
    custom_designation_category,
  });
  return data;
};

const checkEmployeeDesignation = async (designation) => {
  const data = await client.get(
    `/api/resource/Designation?fields=["designation_name","custom_designation_category"]&filters=[["name","=","${designation}"]]`
  );
  return data;
};

const getEmployeeDesignationCategoryList = async (limit) => {
  const data = await client.get(
    `/api/resource/Designation Category?order_by=name asc&limit_page_length=${limit}`
  );
  return data;
};

const getSearchDesignationCategory = async (search) => {
  const data = await client.get(
    `/api/resource/Designation Category?filters=[["name","like","${search}%"]]`
  );
  return data;
};

const addDesignationCategory = async (designation_category) => {
  const data = await client.post(`/api/resource/Designation Category`, {
    designation_category,
  });
  return data;
};

const checkDesignationCategory = async (designationCategory) => {
  const data = await client.get(
    `/api/resource/Designation Category?filters=[["name","=","${designationCategory}"]]`
  );
  return data;
};

const getDesignation = async (designationCategory) => {
  const data = await client.get(
    `/api/resource/Designation?fields=["name", "designation_name as designation", "custom_isteaching"]&filters=[["custom_designation_category","=","${designationCategory}"]]`
  );
  return data;
};

export default {
  hrmsConfigData,
  getQualificationList,
  getAllowanceList,
  getAllEmployee,
  viewEmployeeLeveAllocation,
  getLeaveType,
  addLeaveEntry,
  getAllowanceDetail,
  getLeave,
  getEmployeeById,
  getLeaveEntryList,
  checkLeave,
  editLeaveAllocation,
  getLeaveTypeCount,
  getLeaveUpdationList,
  holidayList,
  createCheckIn,
  getLeaveApplication,
  cancelLeaveApplication,
  fiterAttendence,
  cancelDoctype,
  viewSalary,
  // getShiftTypeByName,
  getEmployeeCheckin,
  // getCheckInByAttendance,
  getEmployeeforTour,
  getTourDetails,
  getAttendanceByEmployee,
  calculateDays,
  addTour,
  getAllTourEntry,
  calculateLeaveDays,
  getLeaveDetails,
  // addEmployeeCheckin,
  addPermission,
  checkForSameTimePermission,
  // getPermission,
  getLeaveTypeWithoutPay,
  // checkEmployeeCheckin,
  addAdditionalSalary,
  // getAllArrearSplitUp,
  addHoliday,
  getHolidayDetailList,
  loginTOWebsite,
  getAllMasters,
  addEmployeePersonal,
  imageUploadProfile,
  checkEmployeePersonal,
  editEmployeePersonal,
  employeeSearch,
  editEmployeeWorkDetail,
  editEmployeeQualification,
  editEmployeeExperience,
  addEmployeeSalaryDetail,
  editHoliday,
  viewHolidayListDetail,
  checkSameMonthArrearSplitup,
  // saveDoc,
  confirmEmployee,
  getAttendanceCompOff,
  editAttendanceCompOff,
  getPermissionEntryList,
  getReasonlist,
  checkSameMonthAdditionalSalary,
  getIncrementDateDetails,
  editIncrementDate,
  getAdditionalSalary,
  filterDesignation,
  salaryStructureCancelReassign,
  addPromotion,
  relieveEmployee,
  getNOCMaster,
  filterEmployeeDetail,
  checkLeaveEntry,
  getAllPendingEmployee,
  getHolidayName,
  getAllColleges,
  checkUserEmail,
  uploadFile,
  getCompanyByCompanyName,
  getEmployeeAttendanceDetail,
  getPromotionListByEmployee,
  getAllEmployeeForPayRoll,
  getAllSalaryStructureofEmployees,
  checkPermissionSameDay,
  // getCheckInByAttendanceDate,
  // checkForPermission,
  getEmployeeByNames,
  getAllSalaryComponent,
  getAllEmployeeActivityGroup,
  addEmployeeActivityGroup,
  assignEmployeeToActivityGroup,
  getAllAssignedGroupEmployee,
  getLateArrivalList,
  getEarlyDepartList,
  inOutStatement,
  monthlyActivityList,
  getAbsentAttendanceReport,
  getNewJoiningReport,
  getRelivingReport,
  getStudentMasterReport,
  addNewLeaveTypeToAllocation,
  getCurrentWorkingEmployee,
  getLeaveEntryReport,
  getLeaveDetailReport,
  getLeaveReasonReport,
  getOtherDeductionReport,
  getArrearReport,
  getLeaveBalanceReport,
  getEmployeeID,
  // picture,
  getPayModeReport,
  insertSalaryStructureAssignment,
  getPermissionApplication,
  cancelPermissionApplication,
  getPermissionAttendence,
  cancelPermisssionAttendance,
  // holidayListByDate,
  // getEmployeeJoinedPayRollMonth,
  getEmployeePermissionReport,
  getEmployeeSalaryReport,
  getLOPSalary,
  getAdditionalSalaryComponent,
  convertToBase64,
  getSalaryStatement,
  // getAbsentAttendance,
  // getAllLeaveAllocation,
  getAbsenteeEmployeeLeaveEntry,
  getEmployeeAttendance,
  saveEmployeeAttendance,
  getSalaryStructureAssignment,
  renameSalaryStructure,
  getDataForCustomField,
  getAllParticular,
  addOrUpdateParticular,
  searchParticular,
  getSectionBatchMaster,
  addOrUpdateSectionBatchMaster,
  getEmployeeDetailsByEmail,
  getEmployeeByEmployeeID,
  getWebErrorLog,
  getActivityLog,
  getEmployeeQualificationList,
  getSearchEmployeeQualification,
  addEmployeeQualification,
  checkEmployeeQualification,
  updateEmployeeQualification,
  getEmployeeDesignationList,
  getSearchEmployeeDesignation,
  addEmployeeDesignation,
  checkEmployeeDesignation,
  getEmployeeDesignationCategoryList,
  updateEmployeeDesignation,
  getSearchDesignationCategory,
  addDesignationCategory,
  checkDesignationCategory,
  getDesignation,
};
