import { useContext } from "react";
import AuthContext from "./context";
import authStorage from "./storage";

const useAuth = () => {
  const {
    role,
    setRole,
    employeeId,
    setEmployeeId,
    collegeId,
    setCollegeId,
    collegeName,
    setCollegeName,
    department,
    setDepartment,
    employeeName,
    setEmployeeName,
    token,
    setToken,
    userRole,
    setUserRole,
    setStudentName,
    setStudentEmail,
    setStudentId,
    setStudentRegisterNumber,
    setStudentEnrollNumber,
    setStudentClassId,
    setStudentBatchId,
    setStudentCourseId,
    setStudentCollegeId,
    setStudentSemester,
    setStudentDate,
    setStudentPhoto,
    setStudentClassName,
    setStudentToken,
    setStudentStudyYear,
  } = useContext(AuthContext);

  const logIn = (
    authToken,
    employeeName,
    role,
    employeeId,
    collegeId,
    collegeName,
    department,
    userRole
  ) => {
    setToken(authToken);
    setRole(role);
    setEmployeeId(employeeId);
    setCollegeId(collegeId);
    setCollegeName(collegeName);
    setDepartment(department);
    setUserRole(userRole);
    setEmployeeName(employeeName);
    authStorage.storeToken(authToken);
    authStorage.storeRole(role);
    authStorage.storeUserRole(userRole);
    authStorage.storeEmployeeId(employeeId);
    authStorage.storeCollegeId(collegeId);
    authStorage.storeCollegeName(collegeName);
    authStorage.storeDepartmentId(department);
    authStorage.storeEmployeeName(employeeName);
  };

  const logOut = () => {
    setToken(null);
    setRole(null);
    setUserRole(null);
    setEmployeeId(null);
    setCollegeId(null);
    setDepartment(null);
    setEmployeeName(null);
    authStorage.removeToken();
    authStorage.removeRole();
    authStorage.removeEmployeeId();
    authStorage.removeCollegeId();
    authStorage.removeCollegeName();
    authStorage.removeDepartmentId();
    authStorage.removeEmployeeName();
  };

  const studentLogIn = (
    studentName,
    studentEmail,
    studentId,
    studentRegisterNumber,
    studentEnrollNumber,
    studentClassId,
    studentBatchId,
    studentCourseId,
    studentCollegeId,
    studentSemester,
    studentDate,
    studentPhoto,
    studentClassName,
    studentToken,
    studentStudyYear
  ) => {
    setToken(studentToken);
    setStudentToken(studentToken);
    setStudentName(studentName);
    setStudentEmail(studentEmail);
    setStudentId(studentId);
    setStudentRegisterNumber(studentRegisterNumber);
    setStudentEnrollNumber(studentEnrollNumber);
    setStudentClassId(studentClassId);
    setStudentBatchId(studentBatchId);
    setStudentCourseId(studentCourseId);
    setStudentCollegeId(studentCollegeId);
    setStudentSemester(studentSemester);
    setStudentDate(studentDate);
    setStudentPhoto(studentPhoto);
    setStudentClassName(studentClassName);
    setStudentStudyYear(studentStudyYear);
    setCollegeId(studentCollegeId);
    authStorage.storeStudentId(
      studentName,
      studentEmail,
      studentId,
      studentRegisterNumber,
      studentEnrollNumber,
      studentClassId,
      studentBatchId,
      studentCourseId,
      studentCollegeId,
      studentSemester,
      studentDate,
      studentPhoto,
      studentClassName,
      studentToken,
      studentStudyYear
    );
  };

  const studentLogout = () => {
    setStudentToken(null);
    setStudentName(null);
    setStudentEmail(null);
    setStudentId(null);
    setStudentRegisterNumber(null);
    setStudentEnrollNumber(null);
    setStudentClassId(null);
    setStudentBatchId(null);
    setStudentCourseId(null);
    setStudentCollegeId(null);
    setStudentSemester(null);
    setStudentDate(null);
    setStudentPhoto(null);
    setStudentClassName(null);
    setStudentStudyYear(null);
    authStorage.removeStudentId();
  };

  return {
    logIn,
    logOut,
    studentLogIn,
    studentLogout,
  };
};

export default useAuth;
