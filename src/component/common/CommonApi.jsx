import React from "react";
import EmployeeApi from "../../api/EmployeeApi";
import StudentApi from "../../api/StudentApi";

const searchEmployee = async (text) => {
  if (text && text.length > 2) {
    const employeeRes = await EmployeeApi.employeeSearch(text);
    console.log("empList", employeeRes);
    return employeeRes.data.message.employee_data;
  } else {
    return [];
  }
};

const searchStudent = async (value, collegeID) => {
  if (value && value.length > 2) {
    try {
      const searchStudentRes = await StudentApi.searchStudent(value, collegeID);
      console.log("searchStudentRes--", searchStudentRes);
      return searchStudentRes.data.message.student;
    } catch (error) {
      console.log("error--", error);
    }
  } else {
    return [];
  }
};

export default {
  searchEmployee,
  searchStudent,
};
