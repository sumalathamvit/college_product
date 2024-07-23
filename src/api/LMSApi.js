import client from "./client";

const getAllCourses = async () => {
  const data = await client.get(
    `/api/resource/LMS Course?fields=["*"]&order_by=title asc&limit_page_length=None`
  );
  return data;
};

const getAllChapterByCourse = async (course) => {
  const data = await client.get(
    `/api/resource/Course Chapter?fields=["name", "title", "description","serial_number", "course"]&filters=[["course", "=", "${course}"]]&order_by=serial_number asc&limit_page_length=None`
  );
  return data;
};

const checkForDuplocateTopic = async (chapter, title, name) => {
  const data = await client.get(
    `/api/resource/Course Lesson?fields=["name", "title"]&filters=[["chapter", "=", "${chapter}"],["title", "=", "${title}"],["name", "!=", "${name}"]]`
  );
  return data;
};

const checkForDuplocateChapterExceptName = async (course, title, name) => {
  const data = await client.get(
    `/api/resource/Course Chapter?fields=["name", "title"]&filters=[["course", "=", "${course}"],["title", "=", "${title}"],["name", "!=", "${name}"]]`
  );
  return data;
};

const checkForDuplocateChapter = async (course, title) => {
  const data = await client.get(
    `/api/resource/Course Chapter?fields=["name", "title"]&filters=[["course", "=", "${course}"],["title", "=", "${title}"]]`
  );
  return data;
};

const addChapter = async (course, title, description) => {
  const data = await client.post(`/api/resource/Course Chapter`, {
    course,
    title,
    description,
  });
  return data;
};

const updateChapter = async (name, title, description) => {
  const data = await client.put(`/api/resource/Course Chapter/${name}`, {
    title,
    description,
  });
  return data;
};

const updateLessonIndexLabel = async (name, serial_number) => {
  const data = await client.put(`/api/resource/Course Lesson/${name}`, {
    serial_number,
  });
  return data;
};
const updateChapterIndexLabel = async (name, serial_number) => {
  const data = await client.put(`/api/resource/Course Chapter/${name}`, {
    serial_number,
  });
  return data;
};
const getAllTopicByChapter = async (name) => {
  const data = await client.get(
    `/api/resource/Course Lesson?fields=["*"]&filters=[["chapter", "=", "${name}"]]&order_by=serial_number asc&limit_page_length=None`
  );
  return data;
};

const getHighestSortOrder = async (chapter) => {
  const data = await client.get(
    `/api/resource/Course Lesson?fields=["name", "index_label"]&filters=[["chapter", "=", "${chapter}"]]&order_by=index_label desc&limit_page_length=1`
  );
  return data;
};

const searchInstructor = async (text) => {
  const data = await client.get(
    `/api/resource/User?fields=["full_name as label","full_name as value","name"]&filters=[["name", "like", "%${text}%"]]&order_by = name asc&limit_page_length=None`
  );
  return data;
};

const getLMSCourseDetail = async (searchStr) => {
  const data = await client.get(
    `/api/resource/LMS Course?fields=["*"]&or_filters=[${searchStr}]&order_by = name asc&limit_page_length=None`
  );
  return data;
};

const getLMSCoursewithInstructor = async (courseName) => {
  const data = await client.get(
    `/api/method/education.smvss.staff.get_lms_course`,
    {
      courseName,
    }
  );
  return data;
};

const addEditLMSCourse = async (
  title,
  video_link,
  image,
  published,
  upcoming,
  disable_self_learning,
  short_introduction,
  description,
  // paid_course,
  // course_price,
  instructors
) => {
  const data = await client.post(`/api/resource/LMS Course`, {
    title,
    video_link,
    image,
    status: "Approved",
    published,
    upcoming,
    disable_self_learning,
    short_introduction,
    description,
    // paid_course,
    // course_price,
    instructors,
  });
  return data;
};
const EditLMSCourse = async (
  courseName,
  video_link,
  image,
  published,
  upcoming,
  disable_self_learning,
  short_introduction,
  description,
  instructors
) => {
  const data = await client.put(`/api/resource/LMS Course/${courseName}`, {
    video_link,
    image,
    status: "Approved",
    published,
    upcoming,
    disable_self_learning,
    short_introduction,
    description,
    instructors,
  });
  return data;
};
const addTopic = async (
  chapter,
  title,
  body,
  instructor_notes,
  youtube,
  index_label,
  custom_private_video
) => {
  const data = await client.post(`/api/resource/Course Lesson`, {
    chapter,
    title,
    body,
    instructor_notes,
    youtube,
    index_label,
    custom_private_video,
  });
  return data;
};

const updateTopic = async (
  name,
  title,
  body,
  instructor_notes,
  youtube,
  custom_private_video
) => {
  console.log("name--", title, body, instructor_notes);
  const data = await client.put(`/api/resource/Course Lesson/${name}`, {
    title,
    body,
    instructor_notes,
    youtube,
    custom_private_video,
  });
  return data;
};
const addQuestion = async (passingParam) => {
  const data = await client.post("/api/resource/LMS Question", {
    ...passingParam,
  });
  return data;
};
const editQuestion = async (question, passingParam) => {
  const data = await client.put(`/api/resource/LMS Question/${question}`, {
    ...passingParam,
  });
  return data;
};
const getQuizList = async () => {
  const data = await client.get(
    `/api/resource/LMS Quiz?fields=["name","title","show_answers","max_attempts","show_submission_history","passing_percentage","total_marks","lesson","course","time"]&limit_page_length=None`
  );
  return data;
};

const editQuizDetail = async (quizName, title) => {
  const data = await client.put(`/api/resource/LMS Quiz/${quizName}`, {
    title,
  });
  return data;
};
const getQuestionDetail = async () => {
  const data = await client.get(
    `/api/resource/LMS Question?fields=["question","name"]&limit_page_length=None`
  );
  return data;
};
const savequestionarray = async (title, passing_percentage, questions) => {
  const data = await client.post(`/api/resource/LMS Quiz`, {
    title,
    passing_percentage,
    questions,
  });
  return data;
};
const updatequestionarray = async (
  name,
  title,
  passing_percentage,
  questions
) => {
  const data = await client.put(`/api/resource/LMS Quiz/${name}`, {
    title,
    passing_percentage,
    questions,
  });
  return data;
};
const editCourseName = async (courseName, title) => {
  const data = await client.put(`/api/resource/LMS Course/${courseName}`, {
    title,
  });
  return data;
};
const editCourseLessonName = async (courseLessonName, title) => {
  const data = await client.put(
    `/api/resource/Course Lesson/${courseLessonName}`,
    {
      title,
    }
  );
  return data;
};
const viewQuizDetail = async (quizName) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_quiz_question`,
    {
      quizName,
    }
  );
  return data;
};

const getLMSCourseList = async () => {
  const data = await client.get(
    `/api/resource/LMS Course?fields=["name","title"]`
  );
  return data;
};

// const viewStudentDetail = async (courseID, batchID, classID) => {
//   const data = await client.post(
//     `/api/method/education.smvss.staff.get_student_list`,
//     {
//       courseID,
//       batchID,
//       classID,
//     }
//   );
//   return data;
// };
const viewStudentDetailSchool = async (standard, classID) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_student_list`,
    {
      standard,
      classID,
    }
  );
  return data;
};

const viewStudentCourseAssign = async (
  userData,
  title,
  start_date,
  end_date,
  courses
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.bulk_user_creation`,
    {
      user: sessionStorage.getItem("email"),
      userData,
      title,
      start_date,
      end_date,
      start_time: "8:30:00",
      end_time: "18:00:00",
      courses,
    }
  );
  return data;
};

const getEvaluator = async (email) => {
  const data = await client.get(
    `/api/resource/Course Evaluator?fields=["evaluator"]&filters=[[ "name","=","${email}"]]`
  );
  return data;
};

const createNewEvaluator = async (evaluator) => {
  const data = await client.post(`/api/resource/Course Evaluator`, {
    evaluator,
  });
  return data;
};

// const batchListing = async () => {
//   const data = await client.get(
//     `/api/resource/LMS Batch?fields=["name","title"]`
//   );
//   return data;
// };

const batchListing = async (searchValue) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_lms_batch_list`,
    {
      searchValue,
    }
  );
  return data;
};

const getStudentBatchList = async (batchName) => {
  const data = await client.get(`/api/resource/LMS Batch/${batchName}`);
  return data;
};

const getStudentBatchListdata = async (batchName) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.lms_batch_wise_student_progress`,
    {
      batchName,
    }
  );
  return data;
};

const assignChapter = async (chapters, courseName) => {
  const data = await client.put(`/api/resource/LMS Course/${courseName}`, {
    chapters,
  });
  return data;
};

const assignTopic = async (lessons, lessonName) => {
  // console.log("lChecking--", lessons, lessonName);
  const data = await client.put(`/api/resource/Course Chapter/${lessonName}`, {
    lessons,
  });
  return data;
};

const getLMSCourse = async (searchStr) => {
  const data = await client.get(
    `/api/resource/LMS Course?fields=["*"]&filters=[]&order_by = name asc&limit_page_length=None`
  );
  return data;
};

const getChapter = async (course) => {
  const data = await client.get(
    `/api/resource/Course Chapter?fields=["name", "title", "description", "course"]&filters=[["course", "=", "${course}"]]&order_by=creation asc&limit_page_length=None`
  );
  return data;
};
const getTopic = async (course) => {
  const data = await client.get(
    `/api/resource/Course Lesson?fields=["*"]&filters=[["course", "=", "${course}"]]&order_by=index_label asc&limit_page_length=None`
  );
  return data;
};

const getEnrolledCourse = async (email) => {
  const data = await client.get(
    `/api/resource/LMS Enrollment?fields=["*"] &filters=[["member","=","${email}"]]&limit_page_length=None`
  );
  return data;
};

const getCompletedTopicList = async (email, course) => {
  const data = await client.get(
    `/api/resource/LMS Course Progress?fields=["*"]&filters=[["member","=","${email}"], ["course", "=", "${course}"]]&limit_page_length=None`
  );
  return data;
};

const updateCurrentLesson = async (name, value) => {
  const data = await client.post(`/api/method/frappe.client.set_value`, {
    doctype: "LMS Enrollment",
    fieldname: "current_lesson",
    name,
    value,
  });
  return data;
};

const updateLessonProgress = async (course, lesson) => {
  const data = await client.post(
    `/api/method/lms.lms.doctype.course_lesson.course_lesson.save_progress`,
    {
      course,
      lesson,
    }
  );
  return data;
};

const viewTopic = async (lesson) => {
  const data = await client.get(`/api/resource/Course Lesson/${lesson}`);
  return data;
};
const getQuestionData = async (question) => {
  const data = await client.get(`/api/resource/LMS Question/${question}`);
  return data;
};
export default {
  getAllCourses,
  getAllChapterByCourse,
  checkForDuplocateChapter,
  addChapter,
  checkForDuplocateChapterExceptName,
  updateChapter,
  getAllTopicByChapter,
  searchInstructor,
  addEditLMSCourse,
  getLMSCourseDetail,
  updateLessonIndexLabel,
  checkForDuplocateTopic,
  getHighestSortOrder,
  addTopic,
  updateTopic,
  addQuestion,
  getQuizList,
  editQuizDetail,
  getQuestionDetail,
  savequestionarray,
  editCourseName,
  editCourseLessonName,
  viewQuizDetail,
  getLMSCourseList,
  viewStudentDetailSchool,
  viewStudentCourseAssign,
  getEvaluator,
  createNewEvaluator,
  batchListing,
  getStudentBatchList,
  getStudentBatchListdata,
  updateChapterIndexLabel,
  assignChapter,
  assignTopic,

  getLMSCourse,
  getChapter,
  getTopic,
  getEnrolledCourse,
  getCompletedTopicList,
  updateCurrentLesson,
  updateLessonProgress,
  viewTopic,
  getLMSCoursewithInstructor,
  EditLMSCourse,
  getQuestionData,
  editQuestion,
  updatequestionarray,
};
