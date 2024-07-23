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

const imageUploadProfile = async (filename, filedata) => {
  const data = await client.post("/api/method/upload_file", {
    cmd: "uploadfile",
    filename,
    from_form: 1,
    filedata,
  });
  return data;
};

const getAllDueParticularWise = async (
  enrollNo,
  courseID,
  batchID,
  semester,
  admissionTypeID,
  orderBy,
  collegeID,
  institutionType
) => {
  const data = await client.post(
    "api/method/education.smvss.student.all_due_particularwise_report",
    {
      enrollNo,
      courseID,
      batchID,
      semester,
      admissionTypeID,
      orderBy,
      collegeID,
      institutionType,
    }
  );
  return data;
};

const getDueParticularWise = async (
  courseID,
  batchID,
  semester,
  admissionTypeID,
  particularID,
  enrollNo,
  isShowAll,
  collegeID
) => {
  const data = await client.post(
    `api/method/education.smvss.student.due_particularwise_report`,
    {
      enrollNo,
      batchID,
      semester,
      courseID,
      isShowAll,
      admissionTypeID,
      particularID,
      collegeID,
    }
  );
  return data;
};

const getDueSummaryReport = async (
  courseID,
  batchID,
  semester,
  isShowAll,
  collegeID
) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_due_summary_report`,
    {
      batchID,
      courseID,
      semester,
      isShowAll,
      collegeID,
    }
  );
  return data;
};

const getStudentStrength = async (courseID, duration) => {
  const data = await client.post(
    "api/method/education.smvss.student.student_strength_report",
    {
      courseID,
      duration,
    }
  );
  return data;
};

const getStatistics = async (
  institutionType,
  courseID,
  batchID,
  semester,
  showAll = 0
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_statistics_report`,
    { institutionType, courseID, batchID, semester, showAll }
  );
  return data;
};

const getYearWiseDueReport = async (
  enrollNo,
  batchID,
  semester,
  courseID,
  admissionTypeID,
  collegeID
) => {
  const data = await client.post(
    `api/method/education.smvss.student.yearwise_due_report`,
    {
      enrollNo,
      batchID,
      semester,
      courseID,
      admissionTypeID,
      collegeID,
    }
  );
  return data;
};

/************************************************new api*************************/

const allStudentDetails = async (searchValue) => {
  const data = await client.post(
    `/api/method/education.smvss.student.all_student_details`,
    {
      searchValue,
    }
  );
  return data;
};

const allFeesStructures = async (
  institutionType,
  batchID,
  studyYear,
  courseID,
  showAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.all_fees_structures`,
    { institutionType, batchID, studyYear, courseID, showAll }
  );
  return data;
};

const feesStructureDetailByid = async (feesStructureID, institutionType) => {
  const data = await client.post(
    `/api/method/education.smvss.student.fees_structure_detail`,
    {
      feesStructureID,
      institutionType,
    }
  );
  return data;
};

const feesStructureDetail = async (
  institutionType,
  courseID,
  batchID,
  studyYear,
  admissionTypeID
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.fees_structure_detail",
    {
      institutionType,
      courseID,
      batchID,
      studyYear,
      admissionTypeID,
    }
  );
  return data;
};

const studentDetailById = async (studentID) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_detail`,
    {
      studentID,
    }
  );
  return data;
};

const trainingStudentDetail = async (studentID) => {
  const data = await client.post(
    `/api/method/education.smvss.student.training_student_detail`,
    {
      studentID,
    }
  );
  return data;
};

const updatePayFullFeeDiscount = async (feesStructureID, jsonDiscount) => {
  const data = await client.post(
    `/api/method/education.smvss.student.update_fees_structure_discount`,
    {
      feesStructureID,
      jsonDiscount,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const updateFeesStructure = async (
  institutionType,
  studyYear,
  courseID,
  duration,
  batchID,
  admissionTypeID,
  feesStructureID,
  feesStructureDetail
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.update_fees_structure",
    {
      institutionType,
      studyYear,
      courseID,
      duration,
      batchID,
      admissionTypeID,
      feesStructureID,
      modifiedBy: sessionStorage.getItem("email"),
      feesStructureDetail,
    }
  );
  return data;
};

const addFeesStructure = async (
  institutionType,
  studyYear,
  courseID,
  duration,
  batchID,
  admissionTypeID,
  feesStructureDetail
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.add_fees_structure",
    {
      institutionType,
      studyYear,
      courseID,
      duration,
      batchID,
      admissionTypeID,
      modifiedBy: sessionStorage.getItem("email"),
      feesStructureDetail,
    }
  );
  return data;
};

const getTransportStrengthReport = async (page = 1) => {
  const data = await client.post(
    `/api/method/education.smvss.student.transport_strength_report`,
    {
      limitValue: string.PAGE_LIMIT,
      page,
    }
  );
  return data;
};

const searchStudent = async (searchValue, collegeID) => {
  const data = await client.post(
    `/api/method/education.smvss.student.search_student`,
    {
      searchValue,
      collegeID,
    }
  );
  return data;
};

const getFeeDue = async (
  institutionType,
  courseID,
  batchID,
  semester,
  admissionTypeID,
  particularID
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_fees_due`,
    {
      institutionType,
      courseID,
      batchID,
      semester,
      admissionTypeID,
      particularID,
    }
  );
  return data;
};

const addFeesDue = async (
  batchID,
  semester,
  studyYear,
  particularID,
  feesDue
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.add_fees_due",
    {
      batchID,
      semester,
      studyYear,
      particularID,
      modifiedBy: sessionStorage.getItem("email"),
      feesDue,
    }
  );
  return data;
};

const getStudentFeeDueDetail = async (studentID, institutionType) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_student_and_fees_due_detail`,
    {
      studentID,
      institutionType,
    }
  );
  return data;
};

const getFeesCollectionRefund = async (billingID, institutionType) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_fees_collection_detail_for_refund`,
    {
      billingID,
      institutionType,
    }
  );
  return data;
};

const feesCollectionDetailCancel = async (billingID, toTransfer) => {
  const data = await client.post(
    `/api/method/education.smvss.student.fees_collection_detail`,
    {
      billingID,
      toTransfer,
    }
  );
  return data;
};

// if screenNo == 1:
// response["data"] = get_course_data()
// elif screenNo == 2:
// response["data"] = get_academic_data(collegeID, courseID, semester)
// elif screenNo == 3:
// response["data"] = get_communication_data(stateID)
// elif screenNo == 4:
// response["data"] = get_qualification_data()
// elif screenNo == 5:
// response["data"] = get_student_detail_report_master(collegeID, courseID)
// elif screenNo == 6:
// response["data"] = get_sem_subject_year_master(qualifiedExamID)
// elif screenNo == 7:
// response["data"] = get_hostel_room_master(buildingID, roomCategoryID, isShowAll)
// elif screenNo == 8:
// response["data"] = get_school_master(collegeID, semester, courseID)
// else:
// response["success"] = False
const getMaster = async (
  screenNo,
  collegeID,
  courseID = null,
  semester = null
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_student_master`,
    { screenNo, collegeID, courseID, semester }
  );
  return data;
};

const getYearSemList = async (qualifiedExamID) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_student_master`,
    {
      screenNo: 6,
      qualifiedExamID,
    }
  );
  return data;
};

const getHostelStudenMaster = async (buildingID, roomCategoryID) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_student_master`,
    {
      screenNo: 7,
      buildingID,
      roomCategoryID,
    }
  );
  return data;
};

const getRoomNo = async (screenNo, buildingID, roomCategoryID) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_student_master`,
    {
      screenNo,
      buildingID,
      roomCategoryID,
      isShowAll: 1,
    }
  );
  return data;
};

const getCityMaster = async (screenNo, stateID) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_student_master`,
    { screenNo, stateID }
  );
  return data;
};

const addSchoolStudent = async (
  studentID,
  enrollNo,
  name,
  fatherName,
  user,
  photo,
  email,
  DOB,
  studentMobile,
  genderID,
  gender,
  bloodGroupID,
  bloodGroup,
  communityID,
  community,
  religionID,
  religion,
  nationalityID,
  nationality,
  aadhaar,
  medicalHistory,
  applicationNo,
  admissionTypeID,
  courseID,
  semester,
  institutionType
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_insert_or_update`,
    {
      studentID,
      enrollNo,
      name,
      fatherName,
      user,
      photo,
      email,
      DOB,
      studentMobile,
      genderID,
      gender,
      bloodGroupID,
      bloodGroup,
      communityID,
      community,
      religionID,
      religion,
      nationalityID,
      nationality,
      aadhaar,
      medicalHistory,
      applicationNo,
      admissionTypeID,
      courseID,
      semester,
      institutionType,
      mediumID: 1,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const addStudentPersonal = async (
  studentID,
  enrollNo,
  name,
  fatherName,
  user,
  photo,
  email,
  DOB,
  genderID,
  gender,
  studentMobile,
  bloodGroupID,
  bloodGroup,
  communityID,
  community,
  religionID,
  religion,
  nationalityID,
  nationality,
  counsellingReferenceNo,
  isTransport,
  isHostel,
  aadhaar,
  pan,
  applicationNo,
  registrationNo,
  admissionTypeID,
  courseID,
  batchID,
  classID,
  semester,
  mediumID
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_insert_or_update`,
    {
      studentID,
      enrollNo,
      name,
      fatherName,
      user,
      photo,
      email,
      DOB,
      genderID,
      gender,
      studentMobile,
      bloodGroupID,
      bloodGroup,
      communityID,
      community,
      religionID,
      religion,
      nationalityID,
      nationality,
      counsellingReferenceNo,
      isTransport,
      isHostel,
      aadhaar,
      pan,
      applicationNo,
      registrationNo,
      admissionTypeID,
      courseID,
      batchID,
      semester,
      classID,
      mediumID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const addStudentAcademic = async (
  studentID,
  courseID,
  mediumID,
  admissionModeID,
  admissionMode,
  admissionTypeID,
  scholarshipID,
  isFirstGraduate,
  transferYear,
  modifiedBy
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_update_academic`,
    {
      studentID,
      courseID,
      mediumID,
      admissionModeID,
      admissionMode,
      admissionTypeID,
      scholarshipID,
      isFirstGraduate,
      transferYear,
      modifiedBy,
    }
  );
  return data;
};

const viewStudent = async (studentID, screenNo) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_detail`,
    {
      studentID,
    }
  );
  return data;
};

const addCommunication = async (
  guardianID,
  studentID,
  fatherMobile,
  fatherEmail,
  fatherOccupation,
  fatherQualification,
  fatherIncome,
  motherName,
  motherMobile,
  motherEmail,
  motherQualification,
  motherOccupation,
  motherIncome,
  guardianName,
  guardianMobile,
  guardianEmail,
  guardianQualification,
  guardianOccupation,
  guardianIncome,
  address1,
  address2,
  place,
  cityID,
  city,
  stateID,
  state,
  countryID,
  country,
  pincode,
  taddress1,
  taddress2,
  tplace,
  tcityID,
  tcity,
  tstateID,
  tstate,
  tcountryID,
  tcountry,
  tpincode,
  siblingStudentID,
  staffID
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.add_or_update_guardian`,
    {
      guardianID,
      studentID,
      fatherMobile,
      fatherEmail,
      fatherOccupation,
      fatherQualification,
      fatherIncome,
      motherName,
      motherMobile,
      motherEmail,
      motherQualification,
      motherOccupation,
      motherIncome,
      guardianName,
      guardianMobile,
      guardianEmail,
      guardianQualification,
      guardianOccupation,
      guardianIncome,
      address1,
      address2,
      place,
      cityID,
      city,
      stateID,
      state,
      countryID,
      country,
      pincode,
      taddress1,
      taddress2,
      tplace,
      tcityID,
      tcity,
      tstateID,
      tstate,
      tcountryID,
      tcountry,
      tpincode,
      siblingStudentID,
      staffID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const addQualification = async (
  studentID,
  qualifiedExamID,
  schoolCollegeName,
  boardUniversity,
  qualifiedSubjectYearID,
  maximumMark,
  markObtained,
  markPercentage,
  monthYear,
  modifiedBy
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.add_academic_qualification_detail`,
    {
      studentID,
      qualifiedExamID,
      schoolCollegeName,
      boardUniversity,
      qualifiedSubjectYearID,
      maximumMark,
      markObtained,
      markPercentage,
      monthYear,
      modifiedBy,
    }
  );
  return data;
};

const trainingStudentEditDetail = async (
  studentID,
  screenNo,
  institutionType
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.training_student_edit_detail`,
    {
      studentID,
      screenNo,
      institutionType,
    }
  );
  return data;
};

const editStudent = async (studentID, screenNo, institutionType) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_edit_detail`,
    {
      studentID,
      screenNo,
      institutionType,
    }
  );
  return data;
};

const allFeesCollections = async (fromDate, toDate, showAll) => {
  const data = await client.post(
    `/api/method/education.smvss.student.all_fees_collections`,
    {
      fromDate,
      toDate,
      showAll,
    }
  );
  return data;
};

const MISBillDetail = async (billingID, collegeID) => {
  const data = await client.post(
    `/api/method/education.smvss.student.miscellaneous_fees_collection_detail`,
    {
      billingID,
      collegeID,
    }
  );
  return data;
};

const feesCollectionDetail = async (billingID, collegeID) => {
  const data = await client.post(
    `/api/method/education.smvss.student.fees_collection_detail`,
    {
      billingID,
      collegeID,
    }
  );
  return data;
};

const addFeesCollection = async (
  studentID,
  name,
  studyYear,
  batchID,
  paymentModeID,
  paymentMode,
  courseID,
  semester,
  totalAmount,
  bankPaidDate,
  bankID,
  branch,
  referenceNo,
  excessAmount,
  collegeID,
  feeCollection,
  fullDiscount
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.add_fees_collection",
    {
      studentID,
      name,
      studyYear,
      batchID,
      paymentModeID,
      paymentMode,
      courseID,
      semester,
      totalAmount,
      bankPaidDate,
      bankID,
      branch,
      referenceNo,
      excessAmount,
      collegeID,
      fullDiscount,
      feeCollection,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const refundFeesCollection = async (
  billingID,
  totalRefundAmount,
  note,
  approvedBy,
  approvedFile,
  paymentModeID,
  paymentMode,
  bankID,
  branch,
  referenceNo,
  paidDate,
  refundDetail,
  toCancelConcession
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.refund_bill`,
    {
      billingID,
      totalRefundAmount,
      note,
      approvedBy,
      approvedFile,
      paymentModeID,
      paymentMode,
      bankID,
      branch,
      referenceNo,
      paidDate,
      refundDetail,
      toCancelConcession,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const refundAllFeesCollection = async (
  toCancelConcession,
  studentID,
  semester,
  totalRefundAmount,
  note,
  approvedBy,
  approvedFile,
  paymentModeID,
  paymentMode,
  bankID,
  branch,
  referenceNo,
  paidDate,
  refundDetails
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.refund_multiple_bill`,
    {
      toCancelConcession,
      studentID,
      semester,
      totalRefundAmount,
      note,
      approvedBy,
      approvedFile,
      paymentModeID,
      paymentMode,
      bankID,
      branch,
      referenceNo,
      paidDate,
      refundDetails,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getDueCollegeHostel = async (collegeID, courseID, batchID, showAll) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_due_college_and_hostel_report`,
    {
      collegeID,
      courseID,
      batchID,
      showAll,
    }
  );
  return data;
};

const getConsolidatedDueCollegeHostel = async (
  collegeID,
  courseID,
  batchID,
  showAll
) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_consolidated_due_college_and_hostel_report`,
    {
      collegeID,
      courseID,
      batchID,
      showAll,
    }
  );
  return data;
};

const getDueAbstract = async (
  courseID,
  batchID,
  classID,
  semester,
  admissionTypeID,
  particularID,
  enrollNo,
  isShowAll,
  collegeID
) => {
  const data = await client.post(
    `api/method/education.smvss.student.due_abstract`,
    {
      enrollNo,
      batchID,
      classID,
      semester,
      courseID,
      isShowAll,
      admissionTypeID,
      particularID,
      collegeID,
    }
  );
  return data;
};

const getOverallDueAbstract = async (
  courseID,
  batchID,
  semester,
  classID,
  admissionTypeID,
  particularID,
  enrollNo,
  isShowAll,
  collegeID
) => {
  const data = await client.post(
    `api/method/education.smvss.student.due_abstract_only `,
    {
      enrollNo,
      batchID,
      semester,
      classID,
      courseID,
      isShowAll,
      admissionTypeID,
      particularID,
      collegeID,
    }
  );
  return data;
};

const getNonPayerDueReport = async (
  courseID,
  batchID,
  semester,
  particularID,
  isShowAll,
  collegeID
) => {
  const data = await client.post(
    `api/method/education.smvss.student.due_particularwise_non_payer_report `,
    {
      courseID,
      batchID,
      semester,
      particularID,
      isShowAll,
      collegeID,
    }
  );
  return data;
};

const addMisellaneousBilling = async (
  name,
  paymentModeID,
  paymentMode,
  totalAmount,
  bankID,
  branch,
  referenceNo,
  bankPaidDate,
  collegeID,
  miscellaneousFeeCollection
) => {
  const data = await client.post(
    `api/method/education.smvss.student.add_miscellaneous_fees_collection`,
    {
      name,
      paymentModeID,
      paymentMode,
      totalAmount,
      bankID,
      branch,
      referenceNo,
      bankPaidDate,
      collegeID,
      miscellaneousFeeCollection,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const addFeesPermission = async (
  feesPermissionID,
  studentID,
  semester,
  amount,
  permissionUpto,
  remarks,
  filepath
) => {
  const data = await client.post(
    `api/method/education.smvss.student.add_fees_permission`,
    {
      feesPermissionID,
      studentID,
      semester,
      amount,
      permissionUpto,
      remarks,
      filepath,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getStudentFeePermissionDetail = async (studentID) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_student_and_fees_permissions_detail`,
    {
      studentID,
    }
  );
  return data;
};

const getStudentFeeModificationDetail = async (
  collegeID,
  studentID,
  ack = 0
) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_student_fees_modification_detail`,
    {
      studentID,
      ack,
      collegeID,
    }
  );
  return data;
};

const getConcessionDetail = async (studentID, ack = 0) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_student_fees_concession_detail`,
    {
      studentID,
      ack,
    }
  );
  return data;
};

const addStudentFeeConcession = async (
  studentID,
  batchID,
  semester,
  studyYear,
  authorizedBy,
  filePath,
  referenceNo,
  referenceDate,
  note,
  feesConcessionDetail
) => {
  const data = await client.post(
    `api/method/education.smvss.student.add_student_fees_concession`,
    {
      studentID,
      batchID,
      semester,
      studyYear,
      authorizedBy,
      filePath,
      referenceNo,
      referenceDate,
      note,
      feesConcessionDetail,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const addStudentFeesModification = async (
  studentID,
  batchID,
  authorizedBy,
  referenceNo,
  referenceDate,
  letterDoc,
  note,
  feesModificationDetail
) => {
  const data = await client.post(
    `api/method/education.smvss.student.add_student_fees_modification`,
    {
      studentID,
      batchID,
      authorizedBy,
      referenceNo,
      referenceDate,
      letterDoc,
      isDiscount: 1,
      note,
      modifiedBy: sessionStorage.getItem("email"),
      feesModificationDetail,
    }
  );
  return data;
};

const collectionReport = async (
  collegeID,
  fromDate,
  toDate,
  paymentModeID,
  particularID,
  batchID,
  courseID,
  isShowAll,
  isUniversityNo,
  isBillWise,
  cashierID
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.cumulative_collection_report`,
    {
      collegeID,
      fromDate,
      toDate,
      paymentModeID,
      particularID,
      batchID,
      courseID,
      isShowAll,
      isUniversityNo,
      isBillWise,
      cashierID,
    }
  );
  return data;
};

const billCollectionReport = async (
  collegeID,
  fromDate,
  toDate,
  paymentModeID,
  particularID,
  batchID,
  courseID,
  isShowAll,
  isUniversityNo,
  isBillWise
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.collection_report`,
    {
      collegeID,
      fromDate,
      toDate,
      paymentModeID,
      particularID,
      batchID,
      courseID,
      isShowAll,
      isUniversityNo,
      isBillWise,
    }
  );
  return data;
};

const billCollectionUnivWiseReport = async (
  fromDate,
  toDate,
  paymentModeID,
  particularID,
  batchID,
  courseID,
  isUniversityNo,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.collection_report`,
    {
      fromDate,
      toDate,
      paymentModeID,
      particularID,
      batchID,
      courseID,
      isUniversityNo,
      isShowAll,
    }
  );
  return data;
};

const overallBillCollectionReport = async (
  collegeID,
  fromDate,
  toDate,
  paymentModeID,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.overall_collection_report`,
    {
      collegeID,
      fromDate,
      toDate,
      paymentModeID,
      isShowAll,
    }
  );
  return data;
};

const studentBillDetail = async (enrollNo) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_bill_details`,
    {
      enrollNo,
    }
  );
  return data;
};

const studentPaymentReport = async (enrollNo) => {
  const data = await client.post(
    `/api/method/education.smvss.student.payment_report`,
    {
      enrollNo,
    }
  );
  return data;
};

const excessFeesReport = async (
  collegeID,
  enrollNo,
  batchID,
  courseID,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.excess_fees_report`,
    {
      collegeID,
      enrollNo,
      batchID,
      courseID,
      isShowAll,
    }
  );
  return data;
};

const paymodeDetailReport = async (
  collegeID,
  fromDate,
  toDate,
  paymentModeID,
  particularID,
  batchID,
  courseID,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.paymode_detail_report`,
    {
      collegeID,
      fromDate,
      toDate,
      paymentModeID,
      particularID,
      courseID,
      batchID,
      isShowAll,
    }
  );
  return data;
};

const getFeesConcessionData = async (
  accountantApproval,
  administrativeOfficer,
  feesConcessionID,
  collegeID
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_fees_concession_data`,
    {
      feesConcessionID,
      accountantApproval,
      administrativeOfficer,
      collegeID,
    }
  );
  return data;
};
const getFeesModificationData = async (
  accountantApproval,
  administrativeOfficer,
  feesModificationID,
  collegeID
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_fees_modification_data`,
    {
      feesModificationID,
      accountantApproval,
      administrativeOfficer,
      collegeID,
    }
  );
  return data;
};

const updateConcessionApproval = async (
  feesConcessionID,
  accountantApproval,
  administrativeOfficer
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.update_concession_approval",
    {
      feesConcessionID,
      accountantApproval,
      administrativeOfficer,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const updateFeeModificationApproval = async (
  feesModificationID,
  accountantApproval,
  administrativeOfficer
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.update_modification_approval",
    {
      feesModificationID,
      accountantApproval,
      administrativeOfficer,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const rejectFeeModification = async (
  feesModificationID,
  accountantApproval,
  administrativeOfficer
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.cancel_fees_modification",
    {
      feesModificationID,
      accountantApproval,
      administrativeOfficer,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const studentConfirmAdmission = async (studentID, institutionType) => {
  const data = await client.post(
    "/api/method/education.smvss.student.student_confirm_admission",
    {
      studentID,
      institutionType,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const addorUpdateBusPassRegister = async (
  busPassRegisterID,
  no_of_terms,
  studentID,
  batchID,
  semester,
  studyYear,
  boardingPlaceID,
  amount,
  term,
  feesDue,
  institutionType
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.add_or_update_bus_pass_register",
    {
      busPassRegisterID,
      no_of_terms,
      studentID,
      batchID,
      semester,
      studyYear,
      boardingPlaceID,
      amount,
      term,
      feesDue,
      institutionType,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const cancelBusPassRegister = async (busPassRegisterID, feesDueID) => {
  const data = await client.post(
    "/api/method/education.smvss.student.cancel_bus_pass_register",
    {
      busPassRegisterID,
      feesDueID,
    }
  );
  return data;
};

const getBusPassRegisterDetail = async (studentID, institutionType) => {
  const data = await client.post(
    "/api/method/education.smvss.student.get_bus_pass_register_detail",
    {
      studentID,
      institutionType,
    }
  );
  return data;
};

const getStudentNameList = async (
  courseID,
  batchID,
  semester,
  classID,
  institutionType
) => {
  const data = await client.post(
    "api/method/education.smvss.student.student_name_list",
    {
      courseID,
      batchID,
      semester,
      classID,
      institutionType,
    }
  );
  return data;
};

const updateUniversityNumber = async (params) => {
  const data = await client.post(
    "api/method/education.smvss.student.get_and_update_student_universityNo_rollNo_class",
    {
      ...params,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getCourseCompletion = async (courseID, semester) => {
  const data = await client.post(
    "/api/method/education.smvss.student.course_completion_data",
    {
      courseID,
      semester,
    }
  );
  return data;
};

const courseCompletion = async (dateofCompletion, studentIDs, enrollNos) => {
  const data = await client.post(
    "/api/method/education.smvss.student.course_completion_update",
    {
      dateofCompletion,
      studentIDs,
      enrollNos,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getDateOfJoining = async (institutionType, courseID, semester) => {
  const data = await client.post(
    "/api/method/education.smvss.student.get_and_update_student_date_of_joining",
    {
      institutionType,
      courseID,
      semester,
    }
  );
  return data;
};

const courseDateOfJoining = async (studentID, DOJ) => {
  const data = await client.post(
    "/api/method/education.smvss.student.get_and_update_student_date_of_joining",
    {
      studentID,
      DOJ,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const particularWiseReport = async (
  collegeID,
  fromDate,
  toDate,
  particularID
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.billing_collection_particularwise_report",
    {
      collegeID,
      fromDate,
      toDate,
      particularID,
    }
  );
  return data;
};

const billAbstractMisReport = async (collegeID, fromDate, toDate) => {
  const data = await client.post(
    "/api/method/education.smvss.student.billing_abstract_mis_report",
    {
      collegeID,
      fromDate,
      toDate,
    }
  );
  return data;
};

const getMiscellaneousReport = async (collegeID, fromDate, toDate, showAll) => {
  const data = await client.post(
    `api/method/education.smvss.student.miscellaneous_billing_report`,
    {
      collegeID,
      fromDate,
      toDate,
      showAll,
    }
  );
  return data;
};

const getStudentHostelAdmissionDetail = async (studentID) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_student_and_hostel_admission_detail`,
    {
      studentID,
    }
  );
  return data;
};

const addUpdateHostelAdmission = async (
  hostelAdmissionID,
  studentID,
  roomID,
  roomRent,
  semester,
  batchID,
  studyYear,
  feesDueID,
  paidAmount,
  occupantTypeID,
  occupantType,
  admissionDate,
  modifiedBy,
  isVacate = null,
  vacateDate = null,
  vacateNote = null
) => {
  const data = await client.post(
    `api/method/education.smvss.student.add_or_update_hostel_admission`,
    {
      hostelAdmissionID,
      studentID,
      roomID,
      roomRent,
      semester,
      batchID,
      studyYear,
      feesDueID,
      paidAmount,
      occupantTypeID,
      occupantType,
      admissionDate,
      modifiedBy,
      isVacate,
      vacateDate,
      vacateNote,
    }
  );
  return data;
};

const studentAcknowledgement = async (
  studentID,
  categoryID,
  category,
  newBatchID,
  newCourseID,
  newAdmissionTypeID,
  newStudyYear,
  newSemester,
  refundAmount,
  remarks,
  filepath,
  modifiedBy
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.student_acknowledgement",
    {
      studentID,
      categoryID,
      category,
      newBatchID,
      newCourseID,
      newAdmissionTypeID,
      newStudyYear,
      newSemester,
      refundAmount,
      remarks,
      filepath,
      modifiedBy,
    }
  );
  return data;
};

const getUpdateStudentPromotion = async (
  batchID,
  courseID,
  courseDuration,
  feesPattern,
  nextSemester,
  reopenDate
) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_and_update_student_promotion`,
    {
      batchID,
      courseID,
      courseDuration,
      feesPattern,
      nextSemester,
      reopenDate,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const cancelRefundReport = async (
  collegeID,
  cashierID,
  fromDate,
  toDate,
  billTypeID,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.cancel_refund_report`,
    {
      collegeID,
      cashierID,
      fromDate,
      toDate,
      billTypeID,
      isShowAll,
    }
  );
  return data;
};

const studentAckApprovalList = async (acknowledgementID) => {
  const data = await client.post(
    "/api/method/education.smvss.student.get_student_acknowledgement",
    {
      acknowledgementID,
    }
  );
  return data;
};

const getHostelStudent = async (attendanceDate, session, buildingID) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_all_hostel_students`,
    {
      attendanceDate,
      session,
      buildingID,
    }
  );
  return data;
};

const addHostelAttendance = async (
  attendanceDate,
  session,
  attendanceDetail
) => {
  const data = await client.post(
    `api/method/education.smvss.student.add_hostel_attendance`,
    {
      attendanceDate,
      session,
      modifiedBy: sessionStorage.getItem("email"),
      attendanceDetail,
    }
  );
  return data;
};

const modifyHostelAttendance = async (attendanceDetails) => {
  const data = await client.post(
    `api/method/education.smvss.student.modify_hostel_attendance`,
    {
      modifiedBy: sessionStorage.getItem("email"),
      attendanceDetails,
    }
  );
  return data;
};

const admissionStatisticReport = async (courseID) => {
  const data = await client.post(
    "/api/method/education.smvss.student.admission_statistic_report",
    {
      courseID,
    }
  );
  return data;
};

const transportStrengthReport = async (
  batchID,
  courseID,
  Section,
  isShowAll
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.transport_strength_report",
    {
      batchID,
      courseID,
      Section,
      isShowAll,
    }
  );
  return data;
};

const getHostelAttendance = async (
  buildingID,
  batchID,
  session,
  isAttendance,
  enrollNo,
  fromDate,
  toDate,
  isLeave,
  IsEmployee,
  isShowAll
) => {
  const data = await client.post(
    `api/method/education.smvss.student.hostel_attendance_detail_report`,
    {
      buildingID,
      batchID,
      session,
      isAttendance,
      enrollNo,
      fromDate,
      toDate,
      isLeave,
      IsEmployee,
      isShowAll,
    }
  );
  return data;
};

const getHostelAttendanceStatistics = async (
  buildingID,
  batchID,
  session,
  enrollNo,
  fromDate,
  toDate,
  IsEmployee,
  isShowAll
) => {
  const data = await client.post(
    `api/method/education.smvss.student.hostel_attendance_statistics_report`,
    {
      buildingID,
      batchID,
      session,
      enrollNo,
      fromDate,
      toDate,
      IsEmployee,
      isShowAll,
    }
  );
  return data;
};

const getOccupancyDetail = async (
  buildingID,
  roomCategoryID,
  roomID,
  year,
  isShowAll
) => {
  const data = await client.post(
    `api/method/education.smvss.student.hostel_occupancy_details_report`,
    {
      buildingID,
      roomCategoryID,
      roomID,
      year,
      isShowAll,
    }
  );
  return data;
};

const getOccupancyStatistics = async (
  buildingID,
  roomCategoryID,
  isShowAll
) => {
  const data = await client.post(
    `api/method/education.smvss.student.hostel_occupancy_statistics_report`,
    {
      buildingID,
      roomCategoryID,
      isShowAll,
    }
  );
  return data;
};

const addBillTransfer = async (
  billingID,
  totalAmount,
  excessAmount,
  studentID,
  courseID,
  semester,
  batchID,
  studyYear,
  note,
  approvedBy,
  approvedFile,
  oldBillingDetail,
  newBillingDetail
) => {
  const data = await client.post(
    `api/method/education.smvss.student.transfer_bill`,
    {
      billingID,
      totalAmount,
      excessAmount,
      studentID,
      courseID,
      semester,
      batchID,
      studyYear,
      note,
      approvedBy,
      approvedFile,
      oldBillingDetail,
      newBillingDetail,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getFeesConcessionReport = async (
  institutionType,
  courseID,
  batchID,
  semester,
  particularID,
  admissionTypeID,
  concessionTypeID,
  isShowAll
) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_fees_concession_report`,
    {
      institutionType,
      courseID,
      batchID,
      semester,
      particularID,
      admissionTypeID,
      concessionTypeID,
      isShowAll,
    }
  );
  return data;
};

const rejectConcession = async (feesConcessionID) => {
  const data = await client.post(
    "/api/method/education.smvss.student.cancel_concession",
    {
      feesConcessionID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getStudentDetailReport = async (
  institutionType,
  collegeID,
  reportType,
  courseID,
  batchID,
  semester,
  classID,
  genderID,
  communityID,
  religionID,
  admissionModeID,
  admissionTypeID,
  enrollNo,
  categoryID,
  fromDate,
  toDate,
  showAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_information_report`,
    {
      institutionType,
      collegeID,
      reportType,
      batchID,
      semester,
      courseID,
      admissionTypeID,
      classID,
      genderID,
      communityID,
      religionID,
      admissionModeID,
      enrollNo,
      categoryID,
      fromDate,
      toDate,
      showAll,
    }
  );
  return data;
};

const getStudentTransportReport = async (
  collegeID,
  reportType,
  courseID,
  batchID,
  semester,
  enrollNo,
  boardingPlaceID,
  passNoFrom,
  passNoTo,
  fromDate,
  toDate,
  showAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_transport_report`,
    {
      collegeID,
      reportType,
      courseID,
      batchID,
      semester,
      enrollNo,
      boardingPlaceID,
      passNoFrom,
      passNoTo,
      fromDate,
      toDate,
      showAll,
    }
  );
  return data;
};

const getSectionList = async (courseID, batchID) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_class_by_batch_and_course`,
    {
      courseID,
      batchID,
    }
  );
  return data;
};

const getTermWiseDueReport = async (courseID, term, semester, showAll) => {
  const data = await client.post(
    `api/method/education.smvss.student.get_term_wise_report`,
    {
      courseID,
      term,
      semester,
      showAll,
    }
  );
  return data;
};

const getTransferCertificate = async (studentID, institutionType) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_transfer_certificate`,
    {
      studentID,
      institutionType,
    }
  );
  return data;
};

const getAllActivityType = async () => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_all_activity_type`
  );
  return data;
};

const addActivityGroup = async (
  collegeID,
  activityGroupID,
  activityGroupName,
  fromMonth,
  toMonth
) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.add_or_update_activity_group`,
    {
      collegeID,
      activityGroupID,
      activityGroupName,
      fromMonth,
      toMonth,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getAllActivityGroup = async (collegeID) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_all_activity_group`,
    {
      collegeID,
    }
  );
  return data;
};

const assignStudentToActivityGroup = async (activityGroupID, students) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.assign_student_to_activity_group`,
    {
      activityGroupID,
      students,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getAllAssignedStudents = async (activityGroupID) => {
  const data = await client.post(
    `/api/method/education.smvss.staff.get_all_students_for_activity_group`,
    {
      activityGroupID,
    }
  );
  return data;
};

const addSchoolStudentQualification = async (
  studentID,
  schoolCollegeName,
  boardUniversity,
  tcNo,
  tcPath,
  academicNote
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.insert_or_update_school_qualified_exam`,
    {
      studentID,
      schoolCollegeName,
      boardUniversity,
      tcNo,
      tcPath,
      academicNote,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getStudentMasterReport = async (
  institutionType,
  collegeID,
  courseID,
  batchID,
  enrollNo,
  admissionTypeID,
  genderID,
  communityID,
  religionID,
  section,
  // categoryID,
  fromDate,
  toDate,
  semester,
  admissionModeID,
  showAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_master_report`,
    {
      institutionType,
      collegeID,
      courseID,
      batchID,
      enrollNo,
      admissionTypeID,
      genderID,
      communityID,
      religionID,
      section,
      // categoryID,
      fromDate,
      toDate,
      semester,
      admissionModeID,
      showAll,
    }
  );
  return data;
};

const addIntituteStudent = async (
  studentID,
  name,
  studentMobile,
  fatherName,
  DOB,
  genderID,
  gender,
  religionID,
  religion,
  nationalityID,
  nationality,
  aadhaar,
  motherTongue,
  email,
  photo,
  bloodGroupID,
  bloodGroup,
  courseID
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.training_student_insert_or_update`,
    {
      studentID,
      name,
      studentMobile,
      fatherName,
      DOB,
      genderID,
      gender,
      religionID,
      religion,
      nationalityID,
      nationality,
      aadhaar,
      motherTongue,
      email,
      photo,
      bloodGroupID,
      bloodGroup,
      courseID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const addInstituteQualification = async (
  studentID,
  qualificationSubject,
  employmentStatus,
  qualification
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.training_student_qualification`,
    {
      studentID,
      qualificationSubject,
      employmentStatus,
      qualification,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getLogoDetails = async () => {
  const data = await client.get(
    "/api/method/education.smvss.student.get_logo_details"
  );
  return data;
};

const adjustStudentDue = async (
  studentID,
  semester,
  issueDate,
  dateofLeaving,
  dateofCompletion,
  reasonForLeavingID,
  approvalLetterPath,
  institutionType
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.adjust_student_due",
    {
      studentID,
      semester,
      issueDate,
      dateofLeaving,
      dateofCompletion,
      reasonForLeavingID,
      approvalLetterPath,
      institutionType,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const addNewLeavingReason = async (leavingReason, isAdmissionCancel) => {
  const data = await client.post(
    `/api/method/education.smvss.student.add_or_update_leaving_reason`,
    {
      leavingReason,
      isAdmissionCancel,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const studentAdmissionCancel = async (
  studentID,
  reasonForLeavingID,
  approvalLetterPath,
  institutionType
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.student_admission_cancel",
    {
      studentID,
      reasonForLeavingID,
      approvalLetterPath,
      institutionType,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getStudentConcessionList = async (
  studentID,
  semester,
  institutionType
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.get_student_concession_list",
    {
      studentID,
      semester,
      institutionType,
    }
  );
  return data;
};

const cancelStudentConcession = async (jsonConcession, institutionType) => {
  const data = await client.post(
    "/api/method/education.smvss.student.cancel_student_concession",
    {
      jsonConcession,
      institutionType,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getCashierList = async () => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_cashier_list`
  );
  return data;
};

const getAdmissionCancel = async (collegeID, admnYear, showAll) => {
  const data = await client.post(
    "/api/method/education.smvss.student.get_admission_cancel_report",
    {
      collegeID,
      admnYear,
      showAll,
    }
  );
  return data;
};

const addCommonFeesDueActivityGrp = async (
  activityGroupID,
  fromDate,
  feesType,
  particularID,
  amount,
  students
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.add_fees_due_for_activity_group",
    {
      activityGroupID,
      fromDate,
      feesType,
      particularID,
      amount,
      modifiedBy: sessionStorage.getItem("email"),
      students,
    }
  );
  return data;
};

const addStudentToActivityGroup = async (
  activityGroupID,
  particularID,
  amount,
  isMonthlyFees,
  enrollDate,
  studentID,
  semester,
  studyYear,
  batchID
) => {
  const data = await client.post(
    "/api/method/education.smvss.staff.add_student_to_activity_group",
    {
      activityGroupID,
      particularID,
      amount,
      isMonthlyFees,
      enrollDate,
      studentID,
      semester,
      studyYear,
      batchID,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getModificationDetail = async (studentID) => {
  const data = await client.post(
    "/api/method/education.smvss.student.get_fees_modification_screen_data",
    {
      studentID,
    }
  );
  return data;
};

const addFeeModification = async (
  studentID,
  batchID,
  authorizedBy,
  referenceNo,
  referenceDate,
  note,
  isDiscount,
  letterDoc,
  feesModificationDetail
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.add_student_fees_modification",
    {
      studentID,
      batchID,
      authorizedBy,
      referenceNo,
      referenceDate,
      note,
      isDiscount,
      letterDoc,
      feesModificationDetail,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const addorUpdateAdmissionFee = async (
  admissionFeesStructureID,
  courseID,
  studyYear,
  admissionTypeID,
  // particularID,
  fees,
  isActive
) => {
  const data = await client.post(
    "/api/method/education.smvss.student.insert_or_update_student_admission_fees_structure",
    {
      admissionFeesStructureID,
      courseID,
      studyYear,
      admissionTypeID,
      // particularID,
      fees,
      isActive,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getAdmissionFeesList = async (courseID, admissionTypeID, studyYear) => {
  const data = await client.post(
    "/api/method/education.smvss.student.get_admission_fees_structure",
    {
      courseID,
      admissionTypeID,
      studyYear,
    }
  );
  return data;
};

const getUserList = async (email) => {
  const data = await client.get(
    `/api/resource/User?fields=["name","email"]&filters=[["enabled","=","1"],["name","=","${email}"]]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const getAllGradeList = async (collegeID) => {
  const data = await client.post(
    "api/method/education.smvss.student.get_grade_list",
    {
      collegeID,
    }
  );
  return data;
};

const addorUpdateGrade = async (
  collegeID,
  gradeID,
  grade,
  gradePoint,
  minMark,
  maxMark,
  isActive
) => {
  const data = await client.post(
    "api/method/education.smvss.student.insert_or_update_grade",
    {
      collegeID,
      grade,
      gradePoint,
      minMark,
      maxMark,
      modifiedBy: sessionStorage.getItem("email"),
      isActive,
      gradeID,
    }
  );
  return data;
};

const getandSearchBoradingPlace = async (collegeID, search, isShowAll) => {
  const data = await client.post(
    `/api/method/education.smvss.student.get_boarding_place_list`,
    {
      collegeID,
      search,
      isShowAll,
    }
  );
  return data;
};

const addorUpdateBoardingPlace = async (
  boardingPlaceID,
  boardingPlace,
  term,
  amount,
  isActive
) => {
  const data = await client.post(
    `/api/method/education.smvss.student.insert_or_update_boarding_place`,
    {
      boardingPlaceID,
      boardingPlace,
      term,
      amount,
      modifiedBy: sessionStorage.getItem("email"),
      isActive,
    }
  );
  return data;
};

export default {
  viewStudent,
  addStudentAcademic,
  imageUploadProfile,
  addQualification,
  getDueParticularWise,
  getStudentStrength,
  getAllDueParticularWise,
  getStatistics,
  getYearWiseDueReport,
  allStudentDetails,
  allFeesStructures,
  feesStructureDetail,
  feesStructureDetailByid,
  studentDetailById,
  addFeesStructure,
  getTransportStrengthReport,
  searchStudent,
  getFeeDue,
  addFeesDue,
  getStudentFeeDueDetail,
  feesCollectionDetailCancel,
  getMaster,
  addStudentPersonal,
  addCommunication,
  editStudent,
  allFeesCollections,
  feesCollectionDetail,
  addFeesCollection,
  refundFeesCollection,
  refundAllFeesCollection,
  getDueAbstract,
  addMisellaneousBilling,
  getStudentFeeModificationDetail,
  addStudentFeesModification,
  billCollectionReport,
  overallBillCollectionReport,
  studentPaymentReport,
  excessFeesReport,
  paymodeDetailReport,
  getFeesModificationData,
  updateFeeModificationApproval,
  rejectFeeModification,
  studentConfirmAdmission,
  addorUpdateBusPassRegister,
  getBusPassRegisterDetail,
  getYearSemList,
  updateUniversityNumber,
  courseCompletion,
  getCourseCompletion,
  getStudentFeePermissionDetail,
  addFeesPermission,
  getDateOfJoining,
  courseDateOfJoining,
  billAbstractMisReport,
  particularWiseReport,
  getMiscellaneousReport,
  getHostelStudenMaster,
  getStudentHostelAdmissionDetail,
  addUpdateHostelAdmission,
  studentAcknowledgement,
  getUpdateStudentPromotion,
  cancelRefundReport,
  studentAckApprovalList,
  modifyHostelAttendance,
  addHostelAttendance,
  getHostelStudent,
  admissionStatisticReport,
  transportStrengthReport,
  getOccupancyStatistics,
  getOccupancyDetail,
  addBillTransfer,
  getCityMaster,
  getFeesConcessionReport,
  getFeesCollectionRefund,
  addStudentFeeConcession,
  getFeesConcessionData,
  uploadFile,
  updateConcessionApproval,
  getConcessionDetail,
  // getStudentMaster,
  rejectConcession,
  getHostelAttendance,
  billCollectionUnivWiseReport,
  getRoomNo,
  getStudentDetailReport,
  addSchoolStudent,
  getStudentTransportReport,
  getDueSummaryReport,
  getOverallDueAbstract,
  getNonPayerDueReport,
  updateFeesStructure,
  getStudentNameList,
  getHostelAttendanceStatistics,
  getDueCollegeHostel,
  getConsolidatedDueCollegeHostel,
  getSectionList,
  MISBillDetail,
  getTermWiseDueReport,
  getTransferCertificate,
  addActivityGroup,
  getAllActivityGroup,
  assignStudentToActivityGroup,
  getAllAssignedStudents,
  getAllActivityType,
  addSchoolStudentQualification,
  getStudentMasterReport,
  addIntituteStudent,
  addInstituteQualification,
  trainingStudentEditDetail,
  trainingStudentDetail,
  getLogoDetails,
  studentBillDetail,
  updatePayFullFeeDiscount,
  adjustStudentDue,
  addNewLeavingReason,
  studentAdmissionCancel,
  getStudentConcessionList,
  cancelStudentConcession,
  getCashierList,
  getAdmissionCancel,
  collectionReport,
  addCommonFeesDueActivityGrp,
  addStudentToActivityGroup,
  getModificationDetail,
  addFeeModification,
  addorUpdateAdmissionFee,
  getAdmissionFeesList,
  getUserList,
  cancelBusPassRegister,
  getAllGradeList,
  addorUpdateGrade,
  getandSearchBoradingPlace,
  addorUpdateBoardingPlace,
};
