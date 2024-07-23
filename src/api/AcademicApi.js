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

const getMasterSubjectStaff = async (
  collegeID,
  docType,
  courseID,
  batchID,
  semester,
  ShowAllTypes,
  subjectID,
  classID
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_master_for_assign_staff_to_subject",
    {
      docType,
      collegeID,
      courseID,
      batchID,
      semester,
      ShowAllTypes,
      subjectID,
      classID,
    }
  );
  return data;
};

const getCourseList = async (collegeID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_master_for_assign_staff_to_subject",
    {
      docType: "course",
      collegeID,
    }
  );
  return data;
};

const assignBatchSubject = async (
  courseID,
  batchID,
  semester,
  subjectDetails
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.assign_subject_to_batch",
    {
      courseID,
      batchID,
      semester,
      modifiedBy: sessionStorage.getItem("email"),
      subjectDetails,
    }
  );
  return data;
};

const assignStaffSubject = async (
  classID,
  staffAndSubjectDetails,
  primaryTeacher,
  secondaryTeacher
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.assign_subject_to_staff",
    {
      classID,
      staffAndSubjectDetails,
      primaryTeacher,
      secondaryTeacher,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
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

const getBatchSubject = async (courseID, batchID, semester) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_subject_with_course",
    {
      courseID,
      batchID,
      semester,
    }
  );
  return data;
};

const getStaffSubject = async (classID, semester) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_staff_with_subject",
    {
      classID,
      semester,
    }
  );
  return data;
};

const getMaterialList = async (batchID, courseID, semester) => {
  const data = await client.post(
    "api/method/education.smvss.staff.notes_upload_and_view",
    {
      batchID,
      courseID,
      semester,
    }
  );
  return data;
};

// const getSyllabusList = async (batchID, courseID, semester) => {
//   const data = await client.post(
//     "api/method/education.smvss.staff.syllabus_upload_and_view",
//     {
//       batchID,
//       courseID,
//       semester,
//     }
//   );
//   return data;
// };

// const syllabusUpdate = async (syllabusID, description, filePath) => {
//   const data = await client.post(
//     "api/method/education.smvss.staff.syllabus_upload_and_view",
//     {
//       syllabusID,
//       description,
//       filePath,
//       modifiedBy: sessionStorage.getItem("email"),
//       isUpdate: 1,
//     }
//   );
//   return data;
// };

// const syllabusUploadView = async (subjectID, description, filePath) => {
//   const data = await client.post(
//     "api/method/education.smvss.staff.syllabus_upload_and_view",
//     {
//       subjectID,
//       description,
//       filePath,
//       modifiedBy: sessionStorage.getItem("email"),
//     }
//   );
//   return data;
// };

const getSyllabusList = async (regulation) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_syllabus",
    {
      regulation,
    }
  );
  return data;
};
const syllabusUpdate = async (syllabusID, subjectID, description, filePath) => {
  const data = await client.post(
    "api/method/education.smvss.staff.upload_or_edit_syllabus",
    {
      syllabusID,
      subjectID,
      description,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const syllabusUploadView = async (subjectID, description, filePath) => {
  const data = await client.post(
    "api/method/education.smvss.staff.upload_or_edit_syllabus",
    {
      subjectID,
      description,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const uploadTopic = async (subjectID, unit, topics, topicID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.add_or_update_topics",
    {
      subjectID,
      unit,
      topics,
      topicID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getAllTopicList = async (subjectID, unit) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_topics",
    {
      subjectID,
      unit,
    }
  );
  return data;
};

const materialUploadView = async (subjectCourseID, description, filePath) => {
  const data = await client.post(
    "api/method/education.smvss.staff.notes_upload_and_view",
    {
      subjectCourseID,
      description,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const qpUploadView = async (subjectCourseID, description, filePath) => {
  const data = await client.post(
    "api/method/education.smvss.staff.question_paper_upload_and_view",
    {
      subjectCourseID,
      description,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getQPList = async (batchID, courseID, semester) => {
  const data = await client.post(
    "api/method/education.smvss.staff.question_paper_upload_and_view",
    {
      batchID,
      courseID,
      semester,
    }
  );
  return data;
};

const qpUpdate = async (questionPaperID, description, filePath) => {
  const data = await client.post(
    "api/method/education.smvss.staff.question_paper_upload_and_view",
    {
      questionPaperID,
      description,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
      isUpdate: 1,
    }
  );
  return data;
};
const materialUpdate = async (notesID, description, filePath) => {
  const data = await client.post(
    "api/method/education.smvss.staff.notes_upload_and_view",
    {
      notesID,
      description,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
      isUpdate: 1,
    }
  );
  return data;
};

const uploadTimeTable = async (
  timeTableID,
  classID,
  semester,
  description,
  filePath,
  isUpdate
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.timetable_upload_and_view",
    {
      timeTableID,
      classID,
      semester,
      description,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
      isUpdate,
    }
  );
  return data;
};

const getTimeTableList = async (batchID, courseID, semester) => {
  const data = await client.post(
    "api/method/education.smvss.staff.timetable_upload_and_view",
    {
      batchID,
      courseID,
      semester,
    }
  );
  return data;
};

const getAttendanceDetails = async (
  isAdmin,
  courseID,
  semester,
  classID,
  subjectID,
  isMandatory,
  attendanceDate,
  period,
  staffID,
  groupID,
  groupClassID
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_attendance_details",
    {
      isAdmin,
      courseID,
      semester,
      classID,
      subjectID,
      isMandatory,
      attendanceDate,
      period,
      staffID,
      groupID,
      groupClassID,
    }
  );
  return data;
};

const getUniversityPerformance = async (
  studentID,
  semester,
  institutionType
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_university_performance_grade_details",
    {
      studentID,
      semester,
      institutionType,
    }
  );
  return data;
};

const insertUpdateUniversityPerformance = async (
  studentID,
  examMonthYear,
  semester,
  studentDetails,
  isMark,
  institutionType
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.insert_or_update_university_performance",

    {
      studentID,
      examMonthYear,
      semester,
      studentDetails,
      isMark,
      institutionType,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getStudentUniversityPerformanceReport = async (
  courseID,
  batchID,
  classID,
  semester
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_student_college_university_performance_report",
    {
      courseID,
      batchID,
      classID,
      semester,
    }
  );
  return data;
};

const attendanceInsertUpdate = async (
  attendanceID,
  topicID,
  classID,
  staffID,
  subjectID,
  semester,
  attendanceDate,
  period,
  attendanceDetails,
  isAdmin,
  isMandatory,
  groupID
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.attendance_insert_or_update",
    {
      attendanceID,
      topicID,
      classID,
      staffID,
      subjectID,
      semester,
      attendanceDate,
      period,
      modifiedBy: sessionStorage.getItem("email"),
      attendanceDetails,
      isAdmin,
      isMandatory,
      groupID,
    }
  );
  return data;
};

const getAllCircularTopics = async () => {
  const data = await client.get(
    "api/method/education.smvss.staff.get_all_circular_topics"
  );
  return data;
};

const uploadCircular = async (
  circularTopicID,
  circularTopic,
  description,
  filePath,
  ShowUpto
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.add_student_circular",
    {
      circularTopicID,
      circularTopic,
      description,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
      ShowUpto,
    }
  );
  return data;
};

// const getCircularList = async (circularTopicID, fromDate, toDate) => {
//   const data = await client.post(
//     "api/method/education.smvss.staff.get_all_student_circulars",
//     {
//       circularTopicID,
//       fromDate,
//       toDate,
//     }
//   );
//   return data;
// };

const getCircularList = async (fromDate, toDate) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_circulars",
    {
      fromDate,
      toDate,
    }
  );
  return data;
};

// const addFeedback = async (staffID, rating, errorScreen, comment) => {
//   const data = await client.post(
//     `/api/method/education.smvss.staff.add_staff_feedback`,
//     {
//       staffID,
//       rating,
//       errorScreen,
//       comment,
//     }
//   );
//   return data;
// };

const sendFeedbackEmail = async (
  subject,
  body,
  attachment_names,
  attachment_data
) => {
  const data = await client.post(
    `/api/method/education.smvss.app_api.send_email`,
    {
      subject,
      body,
      attachment_names,
      attachment_data,
    }
  );
  return data;
};

const getAllFeedback = async (fromDate, toDate) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_all_feedback`,
    {
      fromDate,
      toDate,
    }
  );
  return data;
};

const getAttendanceReport = async (classID, attendanceDate) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_student_attendance",
    {
      classID,
      attendanceDate,
    }
  );
  return data;
};

const createNewTest = async (collegeID, test, minMark, maxMark) => {
  const data = await client.post(
    "api/method/education.smvss.staff.create_new_test",
    {
      collegeID,
      test,
      minMark,
      maxMark,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getAllTest = async (collegeID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_test",
    {
      collegeID,
    }
  );
  return data;
};

const getEventCalendar = async (collegeID, courseID, semester) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_calender_events",
    {
      collegeID,
      courseID,
      semester,
    }
  );
  return data;
};

const createTestDetail = async (
  testID,
  semester,
  courseID,
  batchID,
  classID,
  testDetail
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.create_test_detail",
    {
      testID,
      semester,
      courseID,
      batchID,
      classID,
      testDetail,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const aquiredbooks = async (enrollment_number) => {
  const data = await client.post(
    "/api/method/education.smvss.app_api.lended_book",
    {
      enrollment_number,
    }
  );
  return data;
};

const bookSearch = async (keyword) => {
  const data = await client.post(
    "api/method/education.smvss.app_api.find_book_title",
    {
      keyword,
    }
  );
  return data;
};

const returnBooks = async (enrollment_number) => {
  const data = await client.post(
    "/api/method/education.smvss.app_api.returned_book",
    {
      enrollment_number,
    }
  );
  return data;
};

const getTestDetailList = async (
  classID,
  semester,
  testID,
  staffID,
  inCharge
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_test_detail",
    {
      classID,
      semester,
      testID,
      staffID,
      inCharge,
    }
  );
  return data;
};

const getStudentFeesReport = async (classID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_fees_due",
    {
      classID,
    }
  );
  return data;
};

const viewStudentFeesDetail = async (student_id, semester) => {
  const data = await client.post(
    "api/method/education.smvss.app_api.student_fees_detail",
    {
      student_id,
      semester,
    }
  );
  return data;
};

const viewStudentDetail = async (studentID) => {
  const data = await client.post(
    "api/method/education.smvss.app_api.student_profile",
    {
      studentID,
    }
  );
  return data;
};

const addUpdateSubject = async (
  collegeID,
  regulation,
  subjectTypeID,
  subjectName,
  subjectCode,
  minMark,
  maxMark,
  creditPoint
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.add_or_update_subject",
    {
      collegeID,
      subjectTypeID,
      subjectName,
      regulation,
      subjectCode,
      minMark,
      maxMark,
      creditPoint,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getAllSubjectType = async () => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_subject_types"
  );
  return data;
};

const getStudentPerformance = async (
  subjectCourseID,
  classID,
  semester,
  subjectID,
  testDetailID,
  reTest
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_student_performance_mark",
    {
      subjectCourseID,
      classID,
      semester,
      subjectID,
      testDetailID,
      reTest,
    }
  );
  return data;
};

const addInternalMarks = async (
  testDetailID,
  minMark,

  markDetail
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.insert_or_update_student_internal_performance_mark",
    {
      testDetailID,
      minMark,
      modifiedBy: sessionStorage.getItem("email"),
      markDetail,
    }
  );
  return data;
};

const getStudentInternal = async (testID, classID, semester) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_student_internal_performance_report",
    {
      testID,
      classID,
      semester,
    }
  );
  return data;
};

const getStudentUniversityMarks = async (studentID, semester) => {
  const data = await client.post(
    `/api/method/education.smvss.app_api.get_student_university_marks`,
    {
      studentID,
      semester,
    }
  );
  return data;
};

const pushNotification = async (
  student_id,
  college_id,
  course_id,
  batch_id,
  title,
  body,
  image
) => {
  const data = await client.post(
    `/api/method/education.smvss.app_api.pushnotification`,
    {
      student_id,
      college_id,
      course_id,
      batch_id,
      title,
      body,
      image,
      user_id: "admin@smvss.com",
    }
  );
  return data;
};

const searchStudent = async (searchValue) => {
  const data = await client.post(
    `/api/method/education.smvss.student.search_student`,
    {
      searchValue,
    }
  );
  return data;
};

const createStudentGroup = async (
  groupID,
  groupName,
  classID,
  subjectID,
  toDate
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.create_student_group",
    {
      groupID,
      groupName,
      classID,
      subjectID,
      toDate,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getStudentGroup = async (classID, subjectID) => {
  const data = await client.get(
    "api/method/education.smvss.staff.get_all_student_group",
    {
      classID,
      subjectID,
    }
  );
  return data;
};

const getStudentGroupDetail = async (classID, subjectID, groupID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_student_group_detail",
    {
      classID,
      subjectID,
      // groupID,
    }
  );
  return data;
};

const createStudentGroupDetail = async (students, classID, subjectID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.create_student_group_detail",
    {
      students,
      classID,
      subjectID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};
const getAllSubjectsByRegulation = async (regulation, collegeID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_subjects",
    {
      regulation,
      collegeID,
    }
  );
  return data;
};

const addRegulation = async (regulation, description) => {
  const data = await client.post(
    "api/method/education.smvss.staff.create_new_regulation",
    {
      regulation: regulation,
      description: description,
      modifiedBy: "reactapp@smvss.com",
    }
  );
  return data;
};
const getAllColleges = async () => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_colleges"
  );
  return data;
};
const getAllRegulation = async () => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_regulation"
  );
  return data;
};
const getAssignRegulation = async (
  institutionType,
  regulation,
  batchID,
  courseID
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.assign_regulation_to_course_and_batch",
    {
      institutionType,
      regulation,
      batchID,
      courseID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};
const updateTestDetail = async (testDetailID, testDate, minMark, maxMark) => {
  const data = await client.post(
    "api/method/education.smvss.staff.update_test_detail",
    {
      testDetailID,
      testDate,
      minMark,
      maxMark,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getAllSubjectByRegulationCourse = async (
  courseID,
  semester,
  regulation
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_subjects_by_course",
    {
      courseID,
      semester,
      regulation,
    }
  );
  return data;
};
const uploadMaterial = async (
  subjectCourseID,
  description,
  filePath,
  subjectNotesID
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.upload_or_edit_subject_notes",
    {
      subjectCourseID,
      description,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};
const editMaterial = async (
  subjectCourseID,
  description,
  filePath,
  subjectNotesID
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.upload_or_edit_subject_notes",
    {
      subjectCourseID,
      description,
      filePath,
      subjectNotesID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};
const materialList = async (courseID, semester, regulation) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_subject_notes_by_course",
    {
      courseID,
      semester,
      regulation,
    }
  );
  return data;
};

const uploadQP = async (subjectCourseID, description, filePath) => {
  const data = await client.post(
    "api/method/education.smvss.staff.upload_or_edit_question_paper",
    {
      subjectCourseID,
      description,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const editQP = async (
  subjectCourseID,
  description,
  filePath,
  questionPaperID
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.upload_or_edit_question_paper",
    {
      subjectCourseID,
      description,
      filePath,
      questionPaperID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};
const QPList = async (courseID, semester, regulation) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_question_paper_by_course",
    {
      courseID,
      semester,
      regulation,
    }
  );
  return data;
};

const QPListBySubject = async (subjectCourseID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_question_papers",
    {
      subjectCourseID,
    }
  );
  return data;
};
const getMyClass = async (staffID) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_my_assigned_subjects`,
    {
      staffID,
    }
  );
  return data;
};
const get_attendance_config = async (courseID, batchID, semester) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_attendance_config`,
    {
      courseID,
      batchID,
      semester,
    }
  );
  return data;
};
const getMySubjectAndClass = async (staffID, subjectID) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_subjects_for_attendance`,
    {
      staffID,
      subjectID,
    }
  );
  return data;
};
const getStudentSubject = async (classID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_students_for_subject_assign",
    {
      classID,
    }
  );
  return data;
};
const assignStudentCommonSubjects = async (classID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.assign_subject_to_student",
    {
      classID,
      isCommonSubject: 1,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};
const assignStudentElectiveSubjects = async (
  classID,
  semester,
  studentDetails,
  electiveGroupNo,
  electiveName
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.assign_subject_to_student",
    {
      classID,
      semester,
      isCommonSubject: 0,

      studentDetails,
      electiveGroupNo,
      electiveName,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const addCircularTopic = async (circularTopic) => {
  const data = await client.post(
    "api/method/education.smvss.staff.add_circular_topic",
    {
      circularTopic,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};
const addCircular = async (
  collegeID,
  departmentID,
  courseID,
  semester,
  circularTopicID,
  circularTopic,
  description,
  filePath,
  isStaffOnly
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.add_circular",
    {
      collegeID,
      departmentID,
      courseID,
      semester,
      circularTopicID,
      circularTopic,
      description,
      filePath,
      isStaffOnly,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getMasterCircular = async (docType, collegeID, departmentID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_master_for_circular",
    {
      docType,
      collegeID,
      departmentID,
    }
  );
  return data;
};
const addEvent = async (
  collegeID,
  departmentID,
  courseID,
  semester,
  eventTopic,
  eventDate,
  description,
  filePath,
  isStaffOnly
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.add_event_notice",
    {
      collegeID,
      departmentID,
      courseID,
      semester,
      eventTopic,
      eventDate,
      description,
      filePath,
      isStaffOnly,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getEventList = async (fromDate, toDate) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_event_notices",
    {
      fromDate,
      toDate,
    }
  );
  return data;
};
const getStudentByClass = async (classID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_student_by_class",
    {
      classID,
    }
  );
  return data;
};

const getPreviousRegulation = async (courseID, batch, semester, regulation) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_previous_batch_subjects",
    {
      courseID,
      batch,
      semester,
      regulation,
    }
  );
  return data;
};

const getallSubjectwithCourse = async (
  courseID,
  batchID,
  semester,
  batch,
  regulation
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_subject_with_course",
    {
      courseID,
      batchID,
      semester,
      batch,
      regulation,
    }
  );
  return data;
};

const get_university_performance_mark_details = async (
  studentID,
  semester,
  institutionType
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_university_performance_mark_details",
    {
      studentID,
      semester,
      institutionType,
    }
  );
  return data;
};

const getAttendanceConfig = async (courseID, batchID, semester) => {
  const data = await client.post(
    "api/method/education.smvss.staff.insert_or_update_attendance_config",
    {
      courseID,
      batchID,
      semester,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const insertUpdateAttendanceConfig = async (
  courseID,
  batchID,
  semester,
  startDate = null,
  endDate = null,
  isSemesterComplete = null
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.insert_or_update_attendance_config",
    {
      courseID,
      batchID,
      semester,
      startDate,
      endDate,
      isSemesterComplete,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};
const getExamFeesReport = async (
  courseID,
  batchID,
  theory,
  practical,
  project,
  otherFees
) => {
  const data = await client.post(
    "api/method/education.smvss.staff.add_exam_fees",
    {
      courseID,
      batchID,
      theory,
      practical,
      project,
      otherFees,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};
const getallExamFees = async () => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_exam_fees"
  );
  return data;
};

const getExamFeesReportExport = async (batchID, courseID, semester) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_student_exam_fees_report",
    {
      batchID,
      courseID,
      semester,
    }
  );
  return data;
};

const getGroupMaster = async () => {
  const data = await client.get(
    "/api/method/education.smvss.staff.get_all_group_master"
  );
  return data;
};

const create_new_batch_and_class = async (
  collegeID,
  courseShort,
  duration,
  regulation
) => {
  const data = await client.post(
    "/api/method/education.smvss.staff.create_new_batch_and_class",
    {
      collegeID,
      courseShort,
      duration,
      regulation,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );

  return data;
};

const getConfig = async (college_id) => {
  const data = await client.post(
    "/api/method/education.smvss.staff.get_config_details",
    {
      college_id,
    }
  );
  return data;
};

const getTopicList = async (subjectID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_attendance_topic",
    {
      subjectID,
    }
  );
  return data;
};

const clearAttendance = async (attendanceID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.clear_attendance",
    {
      attendanceID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const checkDuplicateSubjectCode = async (subjectCode, collegeID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.check_subject_code_is_exist",
    {
      subjectCode,
      collegeID,
    }
  );
  return data;
};

const createDigitalDiary = async (classID, classWork, filePath) => {
  const data = await client.post(
    "api/method/education.smvss.staff.add_digital_diary",
    {
      classID,
      classWork,
      filePath,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getDigitalDiaryList = async (classID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_digital_diary",
    {
      classID,
    }
  );
  return data;
};

const getSchoolAttendance = async (attendanceDate, classID) => {
  const data = await client.post(
    "api/method/education.smvss.student.get_school_attendance_detail",
    {
      attendanceDate,
      classID,
    }
  );
  return data;
};

const addSchoolAttendance = async (
  attendanceDate,
  classID,
  forenoonStaffID,
  afternoonStaffID,
  semester,
  attendanceData
) => {
  const data = await client.post(
    "api/method/education.smvss.student.insert_or_update_school_attendance",
    {
      attendanceDate,
      classID,
      forenoonStaffID,
      afternoonStaffID,
      semester,
      attendanceData,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getClassbyStaff = async (staffID) => {
  const data = await client.post(
    "api/method/education.smvss.student.get_staff_class_by_id",
    {
      staffID,
    }
  );
  return data;
};

const getClassAdvisorbyStaff = async (classAdvisorID) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_class_data_by_classAdvisor",
    {
      classAdvisorID,
    }
  );
  return data;
};

const getSchoolAttendanceReport = async (
  semester,
  classID,
  fromDate,
  toDate,
  studentID
) => {
  const data = await client.post(
    "api/method/education.smvss.student.get_school_attendance_report",
    {
      fromDate,
      toDate,
      semester,
      classID,
      studentID,
    }
  );
  return data;
};

const getStudentCummulativeInternal = async (testID, classID, semester) => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_student_cumulative_internal_performance_report",
    {
      testID,
      classID,
      semester,
    }
  );
  return data;
};

export default {
  getMasterSubjectStaff,
  assignStaffSubject,
  imageUploadProfile,
  syllabusUploadView,
  getStaffSubject,
  getBatchSubject,
  assignBatchSubject,
  getSyllabusList,
  materialUploadView,
  getMaterialList,
  syllabusUpdate,
  qpUploadView,
  getQPList,
  materialUpdate,
  getTimeTableList,
  uploadTimeTable,
  getAttendanceDetails,
  attendanceInsertUpdate,
  uploadCircular,
  getAllCircularTopics,
  getAllFeedback,
  sendFeedbackEmail,
  getAttendanceReport,
  createNewTest,
  getAllTest,
  getEventCalendar,
  getUniversityPerformance,
  createTestDetail,
  returnBooks,
  bookSearch,
  aquiredbooks,
  getTestDetailList,
  insertUpdateUniversityPerformance,
  viewStudentDetail,
  viewStudentFeesDetail,
  getStudentFeesReport,
  getStudentUniversityPerformanceReport,
  addInternalMarks,
  getStudentPerformance,
  getStudentInternal,
  getStudentUniversityMarks,
  pushNotification,
  searchStudent,
  createStudentGroupDetail,
  getStudentGroupDetail,
  getStudentGroup,
  createStudentGroup,
  getAllSubjectsByRegulation,

  getAllSubjectType,
  addUpdateSubject,
  uploadTopic,
  getAllTopicList,
  uploadFile,

  addRegulation,
  getAllColleges,
  getAllRegulation,
  getAssignRegulation,
  updateTestDetail,
  getStudentSubject,
  assignStudentCommonSubjects,
  assignStudentElectiveSubjects,
  qpUpdate,
  getAllSubjectByRegulationCourse,
  uploadMaterial,
  editMaterial,
  materialList,
  uploadQP,
  editQP,
  QPList,
  QPListBySubject,
  getMyClass,
  get_attendance_config,
  getMySubjectAndClass,
  addCircularTopic,
  getMasterCircular,
  addCircular,
  getCircularList,
  addEvent,
  getEventList,
  getPreviousRegulation,
  getallSubjectwithCourse,
  getStudentByClass,
  get_university_performance_mark_details,
  getAttendanceConfig,
  insertUpdateAttendanceConfig,
  getExamFeesReport,
  getallExamFees,
  getExamFeesReportExport,
  getGroupMaster,
  create_new_batch_and_class,
  getCourseList,
  getConfig,
  getTopicList,
  clearAttendance,
  checkDuplicateSubjectCode,
  createDigitalDiary,
  getDigitalDiaryList,
  getSchoolAttendance,
  addSchoolAttendance,
  getClassbyStaff,
  getSchoolAttendanceReport,
  getStudentCummulativeInternal,
  getClassAdvisorbyStaff,
};
