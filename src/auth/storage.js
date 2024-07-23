const tokenkey = "token";
const fieldkey = "FIELD_COL";
const sideMenuKey = "SIDE_MENU";
const selectedMenuKey = "SELECTED_MENU";
const roleKey = "ROLE";
const userRoleKey = "USER_ROLE";
const employeeIdKey = "EMPLOYEE_ID";
const collegeIdKey = "COLLEGE_ID";
const collegeNameKey = "COLLEGE_NAME";
const departmentIdKey = "DEPARTMENT_ID";
const employeeNameKey = "EMPLOYEE_NAME";
const topMenuDataKey = "TOP_MENU_DATA";
const employeeDetailKey = "EMPLOYEE_DETAIL";
const emailKey = "email";
const companyKey = "COMPANY";
const defaultShiftKey = "DEFAULT_SHIFT";
const payrollPayableAccountKey = "PAYROLL_PAYABLE_ACCOUNT";
const costCenterKey = "COST_CENTER";
const noOfPeriodKey = "NO_OF_PERIOD";
const mainTitleKey = "MAIN_TITLE";
const subTitleKey = "SUB_TITLE";
const adminTokenKey = "ADMIN_TOKEN";

const studentName = "studentName";
const studentEmail = "studentEmail";
const studentIdkey = "studentId";
const studentRegisterNumber = "studentRegisterNumber";
const studentEnrollNumber = "studentEnrollNumber";
const studentClassId = "studentClassId";
const studentBatchId = "studentBatchId";
const studentCourseId = "studentCourseId";
const studentCollegeId = "studentCollegeId";
const studentSemester = "studentSemester";
const studentDate = "studentDate";
const studentPhoto = "studentPhoto";
const studentClassName = "studentClassName";
const studentToken = "studentToken";
const studentStudyYear = "studentStudyYear";
const pageConfigKey = "PAGE_CONFIG";
const cacheClearKey = "CACHE_CLEAR";
const instituteArray = "INSTITUTE_ARR";
const instituteName = "INSTITUTE_NAME";
const studentListKey = "STUDENT_LIST";

const storeField = (field) => {
  try {
    sessionStorage.setItem(fieldkey, field);
  } catch (error) {
    console.log("Error storing the Field", error);
  }
};

const storeToken = (token) => {
  try {
    sessionStorage.setItem(tokenkey, token);
  } catch (error) {
    console.log("Error storing the token", error);
  }
};

const getField = () => {
  const field = sessionStorage.getItem(fieldkey);
  return field ? field : null;
};

const getToken = () => {
  const token = sessionStorage.getItem(tokenkey);
  return token ? token : null;
};

const removeField = () => {
  try {
    sessionStorage.removeItem(fieldkey);
  } catch (error) {
    console.log("Error removing the Field", error);
  }
};

const removeToken = () => {
  try {
    sessionStorage.removeItem(tokenkey);
  } catch (error) {
    console.log("Error removing the token", error);
  }
};
const storeMenuData = (data) => {
  try {
    sessionStorage.setItem(sideMenuKey, JSON.stringify(data));
  } catch (error) {
    console.log("Error storing the store Menu Data", error);
  }
};
const getMenuData = () => {
  const data = sessionStorage.getItem(sideMenuKey);
  return data ? JSON.parse(data) : [];
};

const removeMenuData = () => {
  try {
    sessionStorage.removeItem(sideMenuKey);
  } catch (error) {
    console.log("Error removing the remove Menu Data", error);
  }
};

const storeSelectedMenu = (data) => {
  try {
    sessionStorage.setItem(selectedMenuKey, JSON.stringify(data));
  } catch (error) {
    console.log("Error storing the store Menu Data", error);
  }
};
const getSelectedMenu = () => {
  const data = sessionStorage.getItem(selectedMenuKey);
  return data ? JSON.parse(data) : [];
};

const removeSelectedMenu = () => {
  try {
    sessionStorage.removeItem(selectedMenuKey);
  } catch (error) {
    console.log("Error removing the remove Menu Data", error);
  }
};
const storeRole = (data) => {
  try {
    sessionStorage.setItem(roleKey, data);
  } catch (error) {
    console.log("Error storing the store role", error);
  }
};
const getRole = () => {
  const data = sessionStorage.getItem(roleKey);
  return data ? data : null;
};

const removeRole = () => {
  try {
    sessionStorage.removeItem(roleKey);
  } catch (error) {
    console.log("Error removing the remove role", error);
  }
};

const storeEmployeeId = (data) => {
  try {
    sessionStorage.setItem(employeeIdKey, data);
  } catch (error) {
    console.log("Error storing the store employeeid", error);
  }
};

const getEmployeeId = () => {
  const data = sessionStorage.getItem(employeeIdKey);
  return data ? data : null;
};
const removeEmployeeId = () => {
  try {
    sessionStorage.removeItem(employeeIdKey);
  } catch (error) {
    console.log("Error removing the remove employeeid", error);
  }
};

const storeCollegeId = (data) => {
  try {
    sessionStorage.setItem(collegeIdKey, data);
  } catch (error) {
    console.log("Error storing the store collegeId", error);
  }
};

const getCollegeId = () => {
  const data = sessionStorage.getItem(collegeIdKey);
  return data ? data : null;
};

const removeCollegeId = () => {
  try {
    sessionStorage.removeItem(collegeIdKey);
  } catch (error) {
    console.log("Error removing the remove collegeId", error);
  }
};

const storeCollegeName = (data) => {
  try {
    sessionStorage.setItem(collegeNameKey, data);
  } catch (error) {
    console.log("Error storing the store collegeId", error);
  }
};

const getCollegeName = () => {
  const data = sessionStorage.getItem(collegeNameKey);
  return data ? data : null;
};

const removeCollegeName = () => {
  try {
    sessionStorage.removeItem(collegeNameKey);
  } catch (error) {
    console.log("Error removing the remove collegeId", error);
  }
};

const storeDepartmentId = (data) => {
  try {
    sessionStorage.setItem(departmentIdKey, data);
  } catch (error) {
    console.log("Error storing the store departmentId", error);
  }
};

const getDepartmentId = () => {
  const data = sessionStorage.getItem(departmentIdKey);
  return data ? data : null;
};
const removeDepartmentId = () => {
  try {
    sessionStorage.removeItem(departmentIdKey);
  } catch (error) {
    console.log("Error removing the remove departmentId", error);
  }
};

const storeEmployeeName = (data) => {
  try {
    sessionStorage.setItem(employeeNameKey, data);
  } catch (error) {
    console.log("Error storing the store employeeName", error);
  }
};

const getEmployeeName = () => {
  const data = sessionStorage.getItem(employeeNameKey);
  return data ? data : null;
};

const removeEmployeeName = () => {
  try {
    sessionStorage.removeItem(employeeNameKey);
  } catch (error) {
    console.log("Error removing the remove employeeName", error);
  }
};

const storeTopMenuData = (data) => {
  try {
    sessionStorage.setItem(topMenuDataKey, JSON.stringify(data));
  } catch (error) {
    console.log("Error storing the store topMenuData", error);
  }
};
const getTopMenuData = () => {
  const data = sessionStorage.getItem(topMenuDataKey);
  return data ? JSON.parse(data) : [];
};
const removeTopMenuData = () => {
  try {
    sessionStorage.removeItem(topMenuDataKey);
  } catch (error) {
    console.log("Error removing the remove topMenuData", error);
  }
};

const storeEmployeeDetail = (data) => {
  try {
    sessionStorage.setItem(employeeDetailKey, JSON.stringify(data));
  } catch (error) {
    console.log("Error storing the store employeeDetail", error);
  }
};
const getEmployeeDetail = () => {
  const data = sessionStorage.getItem(employeeDetailKey);
  return data ? JSON.parse(data) : [];
};
const removeEmployeeDetail = () => {
  try {
    sessionStorage.removeItem(employeeDetailKey);
  } catch (error) {
    console.log("Error removing the remove employeeDetail", error);
  }
};
const storeEmail = (data) => {
  try {
    sessionStorage.setItem(emailKey, data);
  } catch (error) {
    console.log("Error storing the store email", error);
  }
};
const getEmail = () => {
  const data = sessionStorage.getItem(emailKey);
  return data ? data : null;
};
const removeEmail = () => {
  try {
    sessionStorage.removeItem(emailKey);
  } catch (error) {
    console.log("Error removing the remove email", error);
  }
};

const storeCompany = (data) => {
  try {
    sessionStorage.setItem(companyKey, data);
  } catch (error) {
    console.log("Error storing the store company", error);
  }
};
const getCompany = () => {
  const data = sessionStorage.getItem(companyKey);
  return data ? data : [];
};
const removeCompany = () => {
  try {
    sessionStorage.removeItem(companyKey);
  } catch (error) {
    console.log("Error removing the remove company", error);
  }
};
const storeDefaultShift = (data) => {
  try {
    sessionStorage.setItem(defaultShiftKey, data);
  } catch (error) {
    console.log("Error storing the store defaultShift", error);
  }
};
const getDefaultShift = () => {
  const data = sessionStorage.getItem(defaultShiftKey);
  return data ? data : null;
};
const removeDefaultShift = () => {
  try {
    sessionStorage.removeItem(defaultShiftKey);
  } catch (error) {
    console.log("Error removing the remove defaultShift", error);
  }
};

const storePayrollPayableAccount = (data) => {
  try {
    sessionStorage.setItem(payrollPayableAccountKey, data);
  } catch (error) {
    console.log("Error storing the store payrollPayableAccount", error);
  }
};
const getPayrollPayableAccount = () => {
  const data = sessionStorage.getItem(payrollPayableAccountKey);
  return data ? data : null;
};
const removePayrollPayableAccount = () => {
  try {
    sessionStorage.removeItem(payrollPayableAccountKey);
  } catch (error) {
    console.log("Error removing the remove payrollPayableAccount", error);
  }
};
const storeCostCenter = (data) => {
  try {
    sessionStorage.setItem(costCenterKey, data);
  } catch (error) {
    console.log("Error storing the store costCenter", error);
  }
};
const getCostCenter = () => {
  const data = sessionStorage.getItem(costCenterKey);
  return data ? data : null;
};
const removeCostCenter = () => {
  try {
    sessionStorage.removeItem(costCenterKey);
  } catch (error) {
    console.log("Error removing the remove costCenter", error);
  }
};
const storeNoOfPeriod = (data) => {
  try {
    sessionStorage.setItem(noOfPeriodKey, data);
  } catch (error) {
    console.log("Error storing the store noOfPeriod", error);
  }
};
const getNoOfPeriod = () => {
  const data = sessionStorage.getItem(noOfPeriodKey);
  return data ? data : null;
};
const removeNoOfPeriod = () => {
  try {
    sessionStorage.removeItem(noOfPeriodKey);
  } catch (error) {
    console.log("Error removing the remove noOfPeriod", error);
  }
};

const storeMainTitle = (data) => {
  try {
    sessionStorage.setItem(mainTitleKey, data);
  } catch (error) {
    console.log("Error storing the store mainTitle", error);
  }
};
const getMainTitle = () => {
  const data = sessionStorage.getItem(mainTitleKey);
  return data ? data : null;
};
const removeMainTitle = () => {
  try {
    sessionStorage.removeItem(mainTitleKey);
  } catch (error) {
    console.log("Error removing the remove mainTitle", error);
  }
};

const storeSubTitle = (data) => {
  try {
    sessionStorage.setItem(subTitleKey, data);
  } catch (error) {
    console.log("Error storing the store subTitle", error);
  }
};
const getSubTitle = () => {
  const data = sessionStorage.getItem(subTitleKey);
  return data ? parseInt(data) : null;
};
const removeSubTitle = () => {
  try {
    sessionStorage.removeItem(subTitleKey);
  } catch (error) {
    console.log("Error removing the remove subTitle", error);
  }
};

const storeAdminToken = (data) => {
  try {
    sessionStorage.setItem(adminTokenKey, data);
  } catch (error) {
    console.log("Error storing the store adminToken", error);
  }
};

const getAdminToken = () => {
  const data = sessionStorage.getItem(adminTokenKey);
  return data ? data : null;
};

const removeAdminToken = () => {
  try {
    sessionStorage.removeItem(adminTokenKey);
  } catch (error) {
    console.log("Error removing the remove adminToken", error);
  }
};

const storeStudentId = (
  name,
  email,
  studentId,
  registernumber,
  enrollnumber,
  classID,
  batchID,
  courseID,
  collegeID,
  semester,
  date,
  photo,
  className,
  token,
  studyYear
) => {
  try {
    sessionStorage.setItem(studentName, name);
    sessionStorage.setItem(studentEmail, email);
    sessionStorage.setItem(studentIdkey, studentId);
    sessionStorage.setItem(studentRegisterNumber, registernumber);
    sessionStorage.setItem(studentEnrollNumber, enrollnumber);
    sessionStorage.setItem(studentClassId, classID);
    sessionStorage.setItem(studentBatchId, batchID);
    sessionStorage.setItem(studentCourseId, courseID);
    sessionStorage.setItem(studentCollegeId, collegeID);
    sessionStorage.setItem(collegeIdKey, collegeID);
    sessionStorage.setItem(studentSemester, semester);
    sessionStorage.setItem(studentDate, date);
    sessionStorage.setItem(studentPhoto, photo);
    sessionStorage.setItem(studentClassName, className);
    sessionStorage.setItem(tokenkey, token);
    sessionStorage.setItem(studentStudyYear, studyYear);
    sessionStorage.setItem(tokenkey, token);
    sessionStorage.setItem(emailKey, email);
    sessionStorage.setItem(roleKey, "student");
  } catch (error) {
    console.log("Error at store user details", error);
  }
};

const removeStudentId = () => {
  try {
    sessionStorage.removeItem(studentName);
    sessionStorage.removeItem(studentEmail);
    sessionStorage.removeItem(studentIdkey);
    sessionStorage.removeItem(studentRegisterNumber);
    sessionStorage.removeItem(studentEnrollNumber);
    sessionStorage.removeItem(studentClassId);
    sessionStorage.removeItem(studentBatchId);
    sessionStorage.removeItem(studentCourseId);
    sessionStorage.removeItem(studentCollegeId);
    sessionStorage.removeItem(collegeIdKey);
    sessionStorage.removeItem(studentSemester);
    sessionStorage.removeItem(studentDate);
    sessionStorage.removeItem(studentPhoto);
    sessionStorage.removeItem(studentClassName);
    sessionStorage.removeItem(tokenkey);
    sessionStorage.removeItem(studentStudyYear);
  } catch (error) {
    console.log("Error at remove user details", error);
  }
};

const getStudentToken = () => {
  const data = sessionStorage.getItem(tokenkey);
  return data ? data : null;
};

const getStudentName = () => {
  const data = sessionStorage.getItem(studentName);
  return data ? data : null;
};

const getStudentEmail = () => {
  const data = sessionStorage.getItem(studentEmail);
  return data ? data : null;
};

const getStudentId = () => {
  const data = sessionStorage.getItem(studentIdkey);
  return data ? data : null;
};

const getStudentRegisterNumber = () => {
  const data = sessionStorage.getItem(studentRegisterNumber);
  return data ? data : null;
};

const getStudentEnrollNumber = () => {
  const data = sessionStorage.getItem(studentEnrollNumber);
  return data ? data : null;
};

const getStudentClassId = () => {
  const data = sessionStorage.getItem(studentClassId);
  return data ? data : null;
};

const getStudentBatchId = () => {
  const data = sessionStorage.getItem(studentBatchId);
  return data ? data : null;
};

const getStudentCourseId = () => {
  const data = sessionStorage.getItem(studentCourseId);
  return data ? data : null;
};

const getStudentCollegeId = () => {
  const data = sessionStorage.getItem(studentCollegeId);
  return data ? data : null;
};

const getStudentSemester = () => {
  const data = sessionStorage.getItem(studentSemester);
  return data ? data : null;
};

const getStudentDate = () => {
  const data = sessionStorage.getItem(studentDate);
  return data ? data : null;
};

const getStudentPhoto = () => {
  const data = sessionStorage.getItem(studentPhoto);
  return data ? data : null;
};

const getStudentClassName = () => {
  const data = sessionStorage.getItem(studentClassName);
  return data ? data : null;
};

const getStudentStudyYear = () => {
  const data = sessionStorage.getItem(studentStudyYear);
  return data ? data : null;
};

const storePageConfig = (data) => {
  try {
    sessionStorage.setItem(pageConfigKey, JSON.stringify(data));
  } catch (error) {
    console.log("Error storing the store pageConfig", error);
  }
};

const getPageConfig = () => {
  const data = sessionStorage.getItem(pageConfigKey);
  return data ? JSON.parse(data) : [];
};

const removePageConfig = () => {
  try {
    sessionStorage.removeItem(pageConfigKey);
  } catch (error) {
    console.log("Error removing the remove pageConfig", error);
  }
};

const storeCacheClear = (data) => {
  try {
    sessionStorage.setItem(cacheClearKey, data);
  } catch (error) {
    console.log("Error storing the store cacheClear", error);
  }
};

const getCacheClear = () => {
  const data = sessionStorage.getItem(cacheClearKey);
  return data ? data : null;
};

const removeCacheClear = () => {
  try {
    sessionStorage.removeItem(cacheClearKey);
  } catch (error) {
    console.log("Error removing the remove cacheClear", error);
  }
};

const storeInstituteArray = (data) => {
  try {
    sessionStorage.setItem(instituteArray, JSON.stringify(data));
  } catch (error) {
    console.log("Error storing the store instituteArray", error);
  }
};

const getInstituteArray = () => {
  const data = sessionStorage.getItem(instituteArray);
  return data ? JSON.parse(data) : [];
};

const removeInstituteArray = () => {
  try {
    sessionStorage.removeItem(instituteArray);
  } catch (error) {
    console.log("Error removing the remove instituteArray", error);
  }
};

const storeInstituteName = (data) => {
  try {
    sessionStorage.setItem(instituteName, data);
  } catch (error) {
    console.log("Error storing the store instituteName", error);
  }
};

const getInstituteName = () => {
  const data = sessionStorage.getItem(instituteName);
  return data ? data : null;
};

const removeInstituteName = () => {
  try {
    sessionStorage.removeItem(instituteName);
  } catch (error) {
    console.log("Error removing the remove instituteName", error);
  }
};

const storeStudentList = (data) => {
  try {
    sessionStorage.setItem(studentListKey, JSON.stringify(data));
  } catch (error) {
    console.log("Error storing the store studentList", error);
  }
};

const getStudentList = () => {
  const data = sessionStorage.getItem(studentListKey);
  return data ? JSON.parse(data) : [];
};

const removeStudentList = () => {
  try {
    sessionStorage.removeItem(studentListKey);
  } catch (error) {
    console.log("Error removing the remove studentList", error);
  }
};

const storeUserRole = (data) => {
  try {
    sessionStorage.setItem(userRoleKey, data);
  } catch (error) {
    console.log("Error storing the store role", error);
  }
};

const getUserRole = () => {
  const data = sessionStorage.getItem(userRoleKey);
  return data ? data : null;
};

const removeUserRole = () => {
  try {
    sessionStorage.removeItem(userRoleKey);
  } catch (error) {
    console.log("Error removing the remove role", error);
  }
};

export default {
  storeField,
  storeToken,
  getToken,
  getField,
  removeToken,
  removeField,
  storeMenuData,
  getMenuData,
  removeMenuData,
  storeSelectedMenu,
  getSelectedMenu,
  removeSelectedMenu,
  storeRole,
  getRole,
  removeRole,
  storeEmployeeId,
  getEmployeeId,
  removeEmployeeId,
  storeCollegeId,
  getCollegeId,
  storeCollegeName,
  getCollegeName,
  removeCollegeName,
  removeCollegeId,
  storeDepartmentId,
  getDepartmentId,
  removeDepartmentId,
  storeTopMenuData,
  getTopMenuData,
  removeTopMenuData,
  storeEmployeeDetail,
  getEmployeeDetail,
  removeEmployeeDetail,
  storeEmail,
  getEmail,
  removeEmail,
  storeCompany,
  getCompany,
  removeCompany,
  storeDefaultShift,
  getDefaultShift,
  removeDefaultShift,
  storePayrollPayableAccount,
  getPayrollPayableAccount,
  removePayrollPayableAccount,
  storeCostCenter,
  getCostCenter,
  removeCostCenter,
  storeNoOfPeriod,
  getNoOfPeriod,
  removeNoOfPeriod,
  storeMainTitle,
  getMainTitle,
  removeMainTitle,
  storeSubTitle,
  getSubTitle,
  removeSubTitle,
  storeAdminToken,
  getAdminToken,
  removeAdminToken,
  storeStudentId,
  removeStudentId,
  getStudentToken,
  getStudentName,
  getStudentEmail,
  getStudentId,
  getStudentRegisterNumber,
  getStudentEnrollNumber,
  getStudentClassId,
  getStudentBatchId,
  getStudentCourseId,
  getStudentCollegeId,
  getStudentSemester,
  getStudentDate,
  getStudentPhoto,
  getStudentClassName,
  getStudentStudyYear,
  storePageConfig,
  getPageConfig,
  removePageConfig,
  storeCacheClear,
  getCacheClear,
  removeCacheClear,
  storeInstituteArray,
  getInstituteArray,
  removeInstituteArray,
  storeInstituteName,
  getInstituteName,
  removeInstituteName,
  storeStudentList,
  getStudentList,
  removeStudentList,
  storeEmployeeName,
  getEmployeeName,
  removeEmployeeName,
  storeUserRole,
  getUserRole,
  removeUserRole,
};
