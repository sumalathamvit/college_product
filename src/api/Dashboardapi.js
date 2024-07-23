import client from "./client";

const getBookIssueCount = async () => {
  const data = await client.post(
    `api/method/education.smvss.library.get_book_and_issue_count`
  );
  return data;
};

const getDepartmentWiseBookCount = async () => {
  const data = await client.post(
    `api/method/education.smvss.library.get_department_wise_book_count`
  );
  return data;
};

const getTopIssueBookCount = async () => {
  const data = await client.post(
    `api/method/education.smvss.library.get_top_issue_book_count`
  );
  return data;
};

const getLastPurchaseBooks = async () => {
  const data = await client.post(
    `api/method/education.smvss.library.get_last_purchase_books`
  );
  return data;
};

const getSchoolAdmissionCount = async () => {
  const data = await client.post(
    `api/method/education.smvss.student.get_school_admission_count`
  );
  return data;
};

const getLast4YearAdmissionCount = async () => {
  const data = await client.post(
    `api/method/education.smvss.student.get_last_4_year_admission_count`
  );
  return data;
};

const getClasswiseCount = async (institutionType) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_classwise_count`,
    {
      institutionType,
    }
  );
  return data;
};

const getSchoolFeesDueCollection = async () => {
  const data = await client.post(
    `api/method/education.smvss.student.get_school_fees_due_and_collection`
  );
  return data;
};

const getFeesDueCollection = async () => {
  const data = await client.post(
    `api/method/education.smvss.student.get_fees_due_and_collection`
  );
  return data;
};

const getActivityGroupsFeesDueAlert = async () => {
  const data = await client.post(
    "/api/method/education.smvss.student.get_activity_groups_for_fees_due_alert"
  );
  return data;
};

export default {
  getBookIssueCount,
  getDepartmentWiseBookCount,
  getTopIssueBookCount,
  getLastPurchaseBooks,
  getLast4YearAdmissionCount,
  getClasswiseCount,
  getFeesDueCollection,
  getSchoolAdmissionCount,
  getSchoolFeesDueCollection,
  getActivityGroupsFeesDueAlert,
};
