export const authNotNeedPaths = [
  "/",
  "/logout",
  "/login",
  "/institutereg",
  "/registration",
  "/institute-confirmation",
  "/page-not-found",
];

export const nationalityList = [
  { label: "Indian", value: "Indian" },
  { label: "Other", value: "Other" },
];
export const days = [
  { label: "Sunday", value: "Sunday" },
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
];
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export let YOE = [];
for (let index = 0; index < 50; index++) {
  YOE = [...YOE, { name: index }];
}

export const authorTypeList = [
  { value: "Indian", label: "Indian" },
  { value: "Foreign", label: "Foreign" },
];

export const maritalStatusList = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

export const bloodGroupList = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "A1+", label: "A1+" },
  { value: "A1-", label: "A1-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "A1B+", label: "A1B+" },
  { value: "A1B-", label: "A1B-" },
];

export const studyingYearList = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
];

export const salaryModeList = [
  { value: "Bank", label: "Bank" },
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
];
export const timePickerList = [
  { id: 1, label: "09:00 AM", value: "09:00" },
  { id: 2, label: "09:30 AM", value: "09:30" },
  { id: 3, label: "10:00 AM", value: "10:00" },
  { id: 4, label: "10:30 AM", value: "10:30" },
  { id: 5, label: "11:00 AM", value: "11:00" },
  { id: 6, label: "11:30 AM", value: "11:30" },
  { id: 7, label: "12:00 PM", value: "12:00" },
  { id: 8, label: "12:30 PM", value: "12:30" },
  { id: 9, label: "01:00 PM", value: "13:00" },
  { id: 10, label: "01:30 PM", value: "13:30" },
  { id: 11, label: "02:00 PM", value: "14:00" },
  { id: 12, label: "02:30 PM", value: "14:30" },
  { id: 13, label: "03:00 PM", value: "15:00" },
  { id: 14, label: "03:30 PM", value: "15:30" },
  { id: 15, label: "04:00 PM", value: "16:00" },
  { id: 16, label: "04:30 PM", value: "16:30" },
  { id: 17, label: "05:00 PM", value: "17:00" },
  // { id: 18, label: "05:30 PM", value: "17:30" },
  // { id: 19, label: "06:00 PM", value: "18:00" },
  // { id: 20, label: "06:30 PM", value: "18:30" },
  // { id: 21, label: "07:00 PM", value: "19:00" },
  // { id: 22, label: "07:30 PM", value: "19:30" },
  // { id: 23, label: "08:00 PM", value: "20:00" },
  // { id: 24, label: "08:30 PM", value: "20:30" },
  // { id: 25, label: "09:00 PM", value: "21:00" },
];

export const authorizedByList = [
  { value: "Chairman", label: "Chairman" },
  { value: "Vice Chairman", label: "Vice Chairman" },
  { value: "AO", label: "AO" },
  { value: "Director", label: "Director" },
  { value: "Principal", label: "Principal" },
  { value: "Dean", label: "Dean" },
  { value: "Manager", label: "Manager" },
];

export const relationList = [
  { value: "Father", label: "Father" },
  { value: "Mother", label: "Mother" },
  { value: "Spouse", label: "Spouse" },
  { value: "Son", label: "Son" },
  { value: "Daughter", label: "Daughter" },
  { value: "Other", label: "Other" },
];

export const compensationDayList = [
  { value: 0.5, label: "Half Day" },
  { value: 1, label: "One Day" },
  { value: 2, label: "Two Day" },
];

export const reportTypeList = [
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
  { value: "On Leave", label: "On Leave" },
  { value: "Half Day", label: "Half Day" },
  { value: "Work From Home", label: "Work From Home" },
];

export const attendanceList = [
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
];

export const arreatReasonList = [
  { value: "", label: "Select" },
  { value: "Pay Hike", label: "Pay Hike" },
  { value: "Increment", label: "Increment" },
  { value: "Loss of Pay", label: "Loss of Pay" },
  { value: "Salary Difference", label: "Salary Difference" },
];

export const purchaseOrderByList = [
  { value: "Title", label: "Title" },
  { value: "Subject", label: "Subject" },
  { value: "Author", label: "Author" },
];

export const orderbyList = [
  { value: "Access Number", label: "Access Number" },
  { value: "Title", label: "Title" },
  { value: "Subject", label: "Subject" },
  { value: "Author", label: "Author" },
];

export const orderbyAccNo = [
  { value: "access_number", label: "Access Number" },
];

export const orderbyTitle = [{ value: "main_title", label: "Title" }];

export const orderbyAuthor = [{ value: "author_name", label: "Author" }];

export const orderbyPendingBooks = [
  { value: "issue_date", label: "Issue Date" },
  { value: "access_number", label: "Access Number" },
];

export const dayFilterList = [
  { value: "All", label: "All" },
  { value: "Today", label: "Today" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
];

export const memberShipList = [
  { value: "Open", label: "Open" },
  { value: "Close", label: "Close" },
];

export const masterList = [
  { value: "Author", label: "Author" },
  { value: "Book Type", label: "Book Type" },
  { value: "Department", label: "Department" },
  { value: "Main Title", label: "Main Title" },
  { value: "Publisher", label: "Publisher" },
  { value: "Supplier", label: "Supplier" },
  { value: "Subject", label: "Subject" },
];

export const libraryReportList = [
  {
    value: "book_detail",
    label: "Book Details",
  },
  {
    value: "book_detail_by_access_number",
    label: "Book Details By AccessNo.",
  },
  {
    value: "book_title_by_subject",
    label: "Book Details Title SubjectWise",
  },
  {
    value: "book_title",
    label: "Book Details TitleWise",
  },
  {
    value: "book_detail_by_subject",
    label: "Book Details SubjectWise AccessNo.",
  },
];

export const onHandBookReportList = [
  {
    value: "access_number_wise",
    label: "On Hand Book Details Access No. Wise",
    key: 1,
  },
  {
    value: "book_title_wise_qty",
    label: "On Hand Book Details Title Wise Quantity",
    key: 2,
  },
  {
    value: "book_subject_wise_qty",
    label: "On Hand Book Details Subject Wise Quantity",
    key: 3,
  },
  {
    value: "book_subject_wise_access_number",
    label: "On Hand Book Details Subject Wise With Access No.",
    key: 4,
  },
];

export const journalReportList = [
  {
    value: "title",
    label: "Journal Title Wise",
    key: 1,
  },
  {
    value: "subject",
    label: "Journal Subject Wise",
    key: 2,
  },
  {
    value: "publisher",
    label: "Journal Publisher Wise",
    key: 3,
  },
  {
    value: "supplier",
    label: "Journal Supplier Wise",
    key: 4,
  },
  {
    value: "frequency",
    label: "Journal Frequency Wise",
    key: 5,
  },
];

export const BookReportList = [
  { value: "book_return", label: "Book Return Report" },
  { value: "book_fine", label: "Book Return With Fine Amount" },
];

export const orderbyIssue = [
  { value: "Asc", label: "Asc by Issue Date" },
  { value: "Desc", label: "Desc by Issue Date" },
];

export const statusList = [
  { value: null, label: "All" },
  { value: "1", label: "Enabled" },
  { value: "0", label: "Disabled" },
];

export const dueReportList = [
  { value: 1, label: "Due Abstract" },
  { value: 2, label: "Due Particulars wise" },
  { value: 3, label: "All Due ParticularWise" },
  { value: 4, label: "Year wise Due" },
  { value: 5, label: "Due Summary" },
  { value: 6, label: "Overall Due Abstract" },
  { value: 7, label: "All Due Particulars Name Wise" },
  { value: 8, label: "All Due Particulars Department Wise" },
  { value: 9, label: "All Due Particulars Year Wise" },
  { value: 10, label: "Due Particular wise  Non - Payer" },
];

export const dueSchoolReportList = [
  { value: 1, label: "Due Abstract" },
  // { value: 2, label: "Due Particulars wise" },
  // { value: 3, label: "All Due ParticularWise" },
  // { value: 4, label: "Year wise Due" },
  // { value: 5, label: "Due Summary" },
  // { value: 6, label: "Overall Due Abstract" },
  // { value: 7, label: "All Due Particulars Name Wise" },
  // { value: 8, label: "All Due Particulars Department Wise" },
  // { value: 9, label: "All Due Particulars Year Wise" },
  // { value: 10, label: "Due Particular wise  Non - Payer" },
];

export const studentReportList = [
  { value: 1, label: "Student Detail" },
  { value: 2, label: "Student Admission Detail" },
];

export const holidayTypeList = [{ value: 1, label: "Employee" }];

export const weekOffList = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export const supplierTypeList = [
  { value: "Company", label: "Company" },
  { value: "Individual", label: "Individual" },
];

export const findByList = [
  { value: 1, label: "Access Number" },
  { value: 2, label: "Title" },
];

export const studentOrderbyList = [
  { label: "Student No.", value: "Student No." },
  { label: "Register Number", value: "Register Number" },
  { label: "Student Name", value: "Student Name" },
];

export const billCollectionSortBy = [
  { value: "Bill Number", label: "Bill Number" },
  { value: "Pay Mode", label: "Pay Mode" },
  { value: "Particular", label: "Particular" },
  { value: "Student No.", label: "Student No." },
];

export const dueOrderByList = [
  { label: "Register Number", value: "custom_registration_number" },
];

export const orderByAllDue = [
  { label: "Student No.", value: "Student No." },
  { label: "Student Name", value: "Student Name" },
];

export const billCollectionReportList = [
  { value: 3, label: "Student Payment & Due Report" },
  { value: 2, label: "OverAll Bill Collection Report" },
  { value: 1, label: "Collection Report" },
  { value: 11, label: "Collection Report Bill No. Wise" },
  { value: 9, label: "Collection Report Univ. No. Wise" },
  { value: 12, label: "Transport Collection Overall" },
  { value: 5, label: "Collection PayMode Details Report" },
  { value: 6, label: "Bill Transfer & Refund Abstract Report" },
  { value: 13, label: "Bill Transfer & Refund  Summary" },
  // { value: 4, label: "Excess Fees Report" },
  { value: 7, label: "Particulars Wise Abstract Report" },
  { value: 8, label: "Billing Abstract MIS Report" },
];

export const billCollectionSchoolReportList = [
  { value: 3, label: "Student Payment & Due Report" },
  { value: 2, label: "OverAll Bill Collection Report" },
  // { value: 1, label: "Collection Report" },
  // { value: 11, label: "Collection Report Bill No. Wise" },
  // { value: 12, label: "Transport Collection Overall" },
  // { value: 5, label: "Collection PayMode Details Report" },
  // { value: 6, label: "Bill Transfer & Refund Abstract Report" },
  // { value: 13, label: "Bill Transfer & Refund  Summary" },
  // { value: 4, label: "Excess Fees Report" },
  // { value: 7, label: "Particulars Wise Abstract Report" },
  // { value: 8, label: "Billing Abstract MIS Report" },
];

export const mediumList = [{ label: "English", value: 1 }];

export const sessionList = [
  { label: "Morning", value: "Morning" },
  { label: "Evening", value: "Evening" },
];

export const arrearReasonList = [
  { value: "Pay Hike", label: "Pay Hike" },
  { value: "Increment", label: "Increment" },
  { value: "Loss of Pay", label: "Loss of Pay" },
  { value: "Salary Difference", label: "Salary Difference" },
];

export const incTypeList = [
  {
    value: "Promotion",
    label: "Promotion",
  },
  {
    value: "Increment",
    label: "Increment",
  },
];

// export const sectionList = [
//   { label: "Jan Week 1", value: "Jan Week 1" },
//   { label: "Jan Week 2", value: "Jan Week 2" },
//   { label: "Jan Week 3", value: "Jan Week 3" },
//   { label: "Jan Week 4", value: "Jan Week 4" },
// ];

export const sectionList = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
  { label: "D", value: "D" },
  { label: "E", value: "E" },
  { label: "F", value: "F" },
  { label: "G", value: "G" },
  { label: "H", value: "H" },
  { label: "I", value: "I" },
  { label: "J", value: "J" },
  { label: "K", value: "K" },
  { label: "L", value: "L" },
  { label: "M", value: "M" },
  { label: "N", value: "N" },
];

export const employeeNOCSelectList = [
  { value: "Cleared", label: "Cleared" },
  { value: "Not Cleared", label: "Not Cleared" },
];

export const employeeStatus = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "Suspended", value: "Suspended" },
  { label: "Left", value: "Left" },
];

export const resultList = [
  { label: "Pass", value: 0 },
  { label: "Fail", value: 1 },
];

export const showList = [
  {
    label: "Syllabus",
    value: "Syllabus",
    icon: "Class",
    link: "/syllabus-list",
    subData: [
      { title: "Regulation", link: "/regulation", icon: "School" },

      { title: "Subject Master", link: "/subject-list", icon: "School" },
      {
        link: "/add-subject",
        title: "Subject",
        icon: "School",
      },
      {
        title: "Batch X Subject",
        link: "/batch-subject",
        icon: "School",
      },
      {
        title: "Subject X Staff",
        link: "/subject-allotment",
        icon: "School",
      },
      {
        title: "Subject X Student",
        link: "/student-allotment",
        icon: "School",
      },

      {
        link: "/topic-upload",
        title: "Subject X Topic",
        icon: "School",
      },
      {
        link: "/topic-list",
        title: "Subject Topic List",
        icon: "School",
      },

      {
        title: "Subject X Syllabus",
        link: "/syllabus-upload",
        icon: "School",
      },
      {
        link: "/syllabus-list",
        title: "Syllabus List",
        icon: "School",
      },
      {
        title: "Upload Study Material",
        link: "/material-upload",
        icon: "School",
      },
      {
        link: "/material-list",
        title: "Material List",
        icon: "School",
      },

      {
        link: "/qp-upload",
        title: "Upload Question Paper",
        icon: "School",
      },
      {
        link: "/qp-list",
        title: "Question Paper List",
        icon: "School",
      },
      {
        link: "/timetable-upload",
        title: "Time Table Upload",
        icon: "Assessment",
      },
      {
        link: "/timetable-list",
        title: "Time Table List",
        icon: "Assessment",
      },

      {
        link: "/assign-student-group",
        title: "Student Group",
        icon: "School",
      },
      {
        link: "/student-group-list",
        title: "Student Group List",
        icon: "School",
      },
      {
        link: "/test-master",
        title: "Test Master",
        icon: "School",
      },
      {
        link: "/test-detail-list",
        title: "Assign Subject to Test List",
        icon: "School",
      },
    ],
  },

  {
    label: "Subject Material",
    value: "Subject Material",
    icon: "Note",
    link: "/material-list",
    subData: [
      { title: "Regulation", link: "/regulation", icon: "School" },

      { title: "Subject Master", link: "/subject-list", icon: "School" },
      {
        link: "/add-subject",
        title: "Subject",
        icon: "School",
      },
      {
        title: "Batch X Subject",
        link: "/batch-subject",
        icon: "School",
      },
      {
        title: "Subject X Staff",
        link: "/subject-allotment",
        icon: "School",
      },
      {
        title: "Subject X Student",
        link: "/student-allotment",
        icon: "School",
      },

      {
        link: "/topic-upload",
        title: "Subject X Topic",
        icon: "School",
      },
      {
        link: "/topic-list",
        title: "Subject Topic List",
        icon: "School",
      },

      {
        title: "Subject X Syllabus",
        link: "/syllabus-upload",
        icon: "School",
      },
      {
        link: "/syllabus-list",
        title: "Syllabus List",
        icon: "School",
      },
      {
        title: "Upload Study Material",
        link: "/material-upload",
        icon: "School",
      },
      {
        link: "/material-list",
        title: "Material List",
        icon: "School",
      },

      {
        link: "/qp-upload",
        title: "Upload Question Paper",
        icon: "School",
      },
      {
        link: "/qp-list",
        title: "Question Paper List",
        icon: "School",
      },
      {
        link: "/timetable-upload",
        title: "Time Table Upload",
        icon: "Assessment",
      },
      {
        link: "/timetable-list",
        title: "Time Table List",
        icon: "Assessment",
      },

      {
        link: "/assign-student-group",
        title: "Student Group",
        icon: "School",
      },
      {
        link: "/student-group-list",
        title: "Student Group List",
        icon: "School",
      },
      {
        link: "/test-master",
        title: "Test Master",
        icon: "School",
      },
      {
        link: "/test-detail-list",
        title: "Assign Subject to Test List",
        icon: "School",
      },
    ],
  },
  {
    label: "Circular",
    value: "Circular",
    icon: "CircleNotifications",
    link: "/circular-list",
    subData: [
      {
        link: "/circular-upload",
        title: "Circular Upload",
        icon: "School",
      },
      {
        link: "/circular-list",
        title: "Circular List",
        icon: "School",
      },
      {
        link: "/events",
        title: "Events",
        icon: "School",
      },
      {
        link: "/events-list",
        title: "Events List",
        icon: "School",
      },
      {
        link: "/calendar",
        title: "Calendar",
        icon: "School",
      },
    ],
  },
  {
    label: "Time Table",
    value: "Time Table",
    icon: "EventNote",
    link: "/timetable-list",
    subData: [
      { title: "Regulation", link: "/regulation", icon: "School" },

      { title: "Subject Master", link: "/subject-list", icon: "School" },
      {
        link: "/add-subject",
        title: "Subject",
        icon: "School",
      },
      {
        title: "Batch X Subject",
        link: "/batch-subject",
        icon: "School",
      },
      {
        title: "Subject X Staff",
        link: "/subject-allotment",
        icon: "School",
      },
      {
        title: "Subject X Student",
        link: "/student-allotment",
        icon: "School",
      },

      {
        link: "/topic-upload",
        title: "Subject X Topic",
        icon: "School",
      },
      {
        link: "/topic-list",
        title: "Subject Topic List",
        icon: "School",
      },

      {
        title: "Subject X Syllabus",
        link: "/syllabus-upload",
        icon: "School",
      },
      {
        link: "/syllabus-list",
        title: "Syllabus List",
        icon: "School",
      },
      {
        title: "Upload Study Material",
        link: "/material-upload",
        icon: "School",
      },
      {
        link: "/material-list",
        title: "Material List",
        icon: "School",
      },

      {
        link: "/qp-upload",
        title: "Upload Question Paper",
        icon: "School",
      },
      {
        link: "/qp-list",
        title: "Question Paper List",
        icon: "School",
      },
      {
        link: "/timetable-upload",
        title: "Time Table Upload",
        icon: "Assessment",
      },
      {
        link: "/timetable-list",
        title: "Time Table List",
        icon: "Assessment",
      },

      {
        link: "/assign-student-group",
        title: "Student Group",
        icon: "School",
      },
      {
        link: "/student-group-list",
        title: "Student Group List",
        icon: "School",
      },
      {
        link: "/test-master",
        title: "Test Master",
        icon: "School",
      },
      {
        link: "/test-detail-list",
        title: "Assign Subject to Test List",
        icon: "School",
      },
    ],
  },
  {
    label: "Question Papers",
    value: "Question Paper",
    icon: "QuestionAnswer",
    link: "/qp-list",
    subData: [
      { title: "Regulation", link: "/regulation", icon: "School" },

      { title: "Subject Master", link: "/subject-list", icon: "School" },
      {
        link: "/add-subject",
        title: "Subject",
        icon: "School",
      },
      {
        title: "Batch X Subject",
        link: "/batch-subject",
        icon: "School",
      },
      {
        title: "Subject X Staff",
        link: "/subject-allotment",
        icon: "School",
      },
      {
        title: "Subject X Student",
        link: "/student-allotment",
        icon: "School",
      },

      {
        link: "/topic-upload",
        title: "Subject X Topic",
        icon: "School",
      },
      {
        link: "/topic-list",
        title: "Subject Topic List",
        icon: "School",
      },

      {
        title: "Subject X Syllabus",
        link: "/syllabus-upload",
        icon: "School",
      },
      {
        link: "/syllabus-list",
        title: "Syllabus List",
        icon: "School",
      },
      {
        title: "Upload Study Material",
        link: "/material-upload",
        icon: "School",
      },
      {
        link: "/material-list",
        title: "Material List",
        icon: "School",
      },

      {
        link: "/qp-upload",
        title: "Upload Question Paper",
        icon: "School",
      },
      {
        link: "/qp-list",
        title: "Question Paper List",
        icon: "School",
      },
      {
        link: "/timetable-upload",
        title: "Time Table Upload",
        icon: "Assessment",
      },
      {
        link: "/timetable-list",
        title: "Time Table List",
        icon: "Assessment",
      },

      {
        link: "/assign-student-group",
        title: "Student Group",
        icon: "School",
      },
      {
        link: "/student-group-list",
        title: "Student Group List",
        icon: "School",
      },
      {
        link: "/test-master",
        title: "Test Master",
        icon: "School",
      },
      {
        link: "/test-detail-list",
        title: "Assign Subject to Test List",
        icon: "School",
      },
    ],
  },
  {
    label: "Library",
    value: "Library",
    icon: "LibraryBooks",
    link: "/library-detail",
    subData: [
      {
        title: "Library Detail",
        link: "/library-detail",
        icon: "LocalLibrary",
      },
    ],
  },
];

export let periodList = [];
for (let i = 1; i <= sessionStorage.getItem("NO_OF_PERIOD"); i++) {
  const obj = {
    label: "Period-" + i,
    value: i,
  };
  // periodList.push(obj);
  periodList = [...periodList, obj];
}

export const gradeList = [
  { label: "S", value: "S" },
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
  { label: "D", value: "D" },
  { label: "E", value: "E" },
  { label: "F", value: "F" },
  { label: "FA", value: "FA" },
];

export const passGradeArray = ["S", "A", "B", "C", "D", "E"];

export const hostelAttendanceList = [
  { value: 1, label: "Hostel Report - Attendance Details" },
  { value: 2, label: "Hostel Report - Attendance Statistics" },
];

export const hostelOccupancyList = [
  { value: 1, label: "Hostel Report - Occupancy Details" },
  { value: 2, label: "Hostel Report - Occupancy Statistics" },
];

export const YesNoList = [
  { value: "0", label: "No" },
  { value: "1", label: "Yes" },
];

export const subjectUnitList = [
  { unit: "1" },
  { unit: "2" },
  { unit: "3" },
  { unit: "4" },
  { unit: "5" },
];

export const chartColors = [
  "#53a8fb",
  "#e49307",
  "#4374e0",
  "#f1ca3a",
  "#990099",
  "#5f9654",
  "#53a8fb",
  "#e49307",
  "#4374e0",
  "#f1ca3a",
  "#990099",
  "#5f9654",
  "#53a8fb",
  "#e49307",
  "#4374e0",
  "#f1ca3a",
  "#990099",
  "#5f9654",
  "#53a8fb",
  "#e49307",
  "#4374e0",
  "#f1ca3a",
  "#990099",
  "#5f9654",
  "#53a8fb",
  "#e49307",
  "#4374e0",
  "#f1ca3a",
  "#990099",
  "#5f9654",
  "#53a8fb",
  "#e49307",
  "#4374e0",
  "#f1ca3a",
  "#990099",
  "#5f9654",
];
export const departmentBookReportList = [
  {
    value: "book_detail_by_access_number",
    label: "Book By AccessNo",
  },
  {
    value: "book_detail_by_subject",
    label: "Book By SubjectWise",
  },
  {
    value: "book_title_wise_qty",
    label: "Book By TitleWise",
  },
  {
    value: "book_subject_wise_qty",
    label: "Book Details Dept With SubjectWise",
  },
];

export const titleWiseQtyReportList = [
  {
    value: "title_qty_subject_wise",
    label: "Title Qty SubjectWise",
  },
  {
    value: "title_wise_qty",
    label: "TitleWise Qty",
  },
  {
    value: "subject_author_wise_qty",
    label: "Title Qty AuthorWise",
  },
  {
    value: "subject_edition_wise_qty",
    label: "Title Qty EditionWise",
  },
];

export const statisticsReportList = [
  {
    value: "list_of_books_report",
    label: "Library Book List",
  },
  {
    value: "library_issue_return_statistic_report",
    label: "Library Issue / Return Statistics",
  },
];

export const libraryIssueReportList = [
  {
    value: "issue_day_wise",
    label: "Book Issue DayWise",
  },
  {
    value: "issue_week_wise",
    label: "Book Issue WeekWise",
  },
  {
    value: "issue_month_wise",
    label: "Book Issue MonthWise",
  },
  {
    value: "issue_student_day_wise",
    label: "Student Book Issue DayWise",
  },
  {
    value: "issue_student_week_wise",
    label: "Student Book Issue WeekWise",
  },
  {
    value: "issue_student_month_wise",
    label: "Student Book Issue MonthWise",
  },
  {
    value: "issue_staff_day_wise",
    label: "Staff Book Issue DayWise",
  },
  {
    value: "issue_staff_week_wise",
    label: "Staff Book Issue WeekWise",
  },
  {
    value: "issue_staff_month_wise",
    label: "Staff Book Issue MonthWise",
  },
];

export const libraryReturnReportList = [
  {
    value: "return_day_wise",
    label: "Book Return DayWise",
  },
  {
    value: "return_week_wise",
    label: "Book Return WeekWise",
  },
  {
    value: "return_month_wise",
    label: "Book Return MonthWise",
  },
  {
    value: "return_student_day_wise",
    label: "Student Book Return DayWise",
  },
  {
    value: "return_student_week_wise",
    label: "Student Book Return WeekWise",
  },
  {
    value: "return_student_month_wise",
    label: "Student Book Return MonthWise",
  },
  {
    value: "return_staff_day_wise",
    label: "Staff Book Return DayWise",
  },
  {
    value: "return_staff_week_wise",
    label: "Staff Book Return WeekWise",
  },
  {
    value: "return_staff_month_wise",
    label: "Staff Book Return MonthWise",
  },
];

export const libraryBookOendingReportList = [
  {
    value: "pending_day_wise",
    label: "Pending Book DayWise",
  },
  {
    value: "pending_week_wise",
    label: "Pending Book WeekWise",
  },
  {
    value: "pending_month_wise",
    label: "Pending Book MonthWise",
  },
  {
    value: "pending_student_day_wise",
    label: "Student Pending Book DayWise",
  },
  {
    value: "pending_student_week_wise",
    label: "Student Pending Book WeekWise",
  },
  {
    value: "pending_student_month_wise",
    label: "Student Pending Book MonthWise",
  },
  {
    value: "pending_staff_day_wise",
    label: "Staff Pending Book DayWise",
  },
  {
    value: "pending_staff_week_wise",
    label: "Staff Pending Book WeekWise",
  },
  {
    value: "pending_staff_month_wise",
    label: "Staff Pending Book MonthWise",
  },
];
export const boldStyle = {
  textColor: [50, 50, 50],
  fontStyle: "bold",
  fillColor: [255, 255, 255],
  lineColor: [255, 255, 255],
};
export const lineWhiteStyle = {
  fillColor: [255, 255, 255],
  lineColor: [255, 255, 255],
};
export const topLineStyle = {
  textColor: [50, 50, 50],
  fontStyle: "bold",
  fillColor: [255, 255, 255],
  lineColor: [255, 255, 255],
  topLine: 1,
};

export const topLineStyleWithBorder = {
  textColor: [50, 50, 50],
  fontStyle: "bold",
  fillColor: [255, 255, 255],
  lineColor: [128, 128, 128],
};

export const bottomLineStyle = {
  fontStyle: "bold",
  cellPadding: [30, 0, 0, 0],
  topLine: 2,
  halign: "center",
};
export const totStyle = {
  fillColor: [255, 255, 255],
  lineColor: [255, 255, 255],
  fontStyle: "bold",
  textColor: [50, 50, 50],
  topLine: 1,
  halign: "right",
  minCellHeight: 8,
  valign: "middle",
};

export const informationReportList = [
  // {
  //   value: "student_sms_details",
  //   label: "Student SMS Details",
  //   key: 1,
  // },
  {
    value: "student_detail",
    label: "Student Details",
    key: 2,
  },
  {
    value: "student_admission_detail",
    label: "Student Admission Details",
    key: 3,
  },
  // {
  //   value: "student_admission_statistics",
  //   label: "Student Admission Statistics",
  //   key: 4,
  // },
  {
    value: "student_address",
    label: "Student Address",
    key: 5,
  },
  // {
  //   value: "student_hsc_marks",
  //   label: "Student HSC Marks",
  //   key: 6,
  // },
  // {
  //   value: "student_admission_card",
  //   label: "Student Admission Card",
  //   key: 7,
  // },
  // {
  //   value: "student_hostel_admission_card",
  //   label: "Student Hostel Admission Card",
  //   key: 8,
  // },
  {
    value: "student_type",
    label: "Student Type",
    key: 9,
  },
  // {
  //   value: "student_discontinued_details",
  //   label: "Student DisContinued Details",
  //   key: 10,
  // },
  {
    value: "student_scholarship",
    label: "Student Scholarship Details",
    key: 11,
  },
  // {
  //   value: "student_scholarship_acquittance",
  //   label: "Student Scholarship Acquittance",
  //   key: 12,
  // },
  // {
  //   value: "student_acknowledgement_details",
  //   label: "Student Acknowledgement Details",
  //   key: 13,
  // },
  // {
  //   value: "student_permission_details",
  //   label: "Student Permission Details",
  //   key: 14,
  // },
  // {
  //   value: "student_bus_pass",
  //   label: "Student Bus Pass Form",
  //   key: 15,
  // },
  // {
  //   value: "student_hostel_form",
  //   label: "Student Hostel Form",
  //   key: 16,
  // },
];

// export const informationReportList = [
//   // {
//   //   value: "student_sms_details",
//   //   label: "Student SMS Details",
//   //   key: 1,
//   // },
//   {
//     value: "student_detail",
//     label: "Student Details",
//     key: 2,
//   },
//   // {
//   //   value: "student_admission_details",
//   //   label: "Student Admission Details",
//   //   key: 3,
//   // },
//   // {
//   //   value: "student_admission_statistics",
//   //   label: "Student Admission Statistics",
//   //   key: 4,
//   // },
//   {
//     value: "student_address",
//     label: "Student Address",
//     key: 5,
//   },
//   // {
//   //   value: "student_hsc_marks",
//   //   label: "Student HSC Marks",
//   //   key: 6,
//   // },
//   // {
//   //   value: "student_admission_card",
//   //   label: "Student Admission Card",
//   //   key: 7,
//   // },
//   // {
//   //   value: "student_hostel_admission_card",
//   //   label: "Student Hostel Admission Card",
//   //   key: 8,
//   // },
//   // {
//   //   value: "student_type",
//   //   label: "Student Type",
//   //   key: 9,
//   // },
//   // {
//   //   value: "student_discontinued_details",
//   //   label: "Student DisContinued Details",
//   //   key: 10,
//   // },
//   // {
//   //   value: "student_scholarship_details",
//   //   label: "Student Scholarship Details",
//   //   key: 11,
//   // },
//   // {
//   //   value: "student_scholarship_acquittance",
//   //   label: "Student Scholarship Acquittance",
//   //   key: 12,
//   // },
//   // {
//   //   value: "student_acknowledgement_details",
//   //   label: "Student Acknowledgement Details",
//   //   key: 13,
//   // },
//   // {
//   //   value: "student_permission_details",
//   //   label: "Student Permission Details",
//   //   key: 14,
//   // },
//   // {
//   //   value: "student_bus_pass_form",
//   //   label: "Student Bus Pass Form",
//   //   key: 15,
//   // },
//   // {
//   //   value: "student_hostel_form",
//   //   label: "Student Hostel Form",
//   //   key: 16,
//   // },
// ];

export const transportReportList = [
  {
    value: "student_bus_pass",
    label: "Student Bus Pass",
  },
  {
    value: "student_bus_pass_register",
    label: "Student Bus Pass Register",
  },
  {
    value: "student_bus_pass_batch_wise",
    label: "Student Bus Pass Register Batch Wise",
  },
  {
    value: "student_admission_statistics",
    label: "Student Bus Pass Statistics",
  },
  {
    value: "student_address",
    label: "Student Bus Pass Statistics Gender Wise",
  },
];

export const allowedFileExtensions = ["jpg", "jpeg", "png", "pdf"];

export const leaveTypeList = [
  { label: "Week Off", value: "Week Off" },
  { label: "Festival", value: "Festival" },
];

export const lmsCourseStatusList = [
  { label: "Published", value: "Published" },
  { label: "Upcoming", value: "Upcoming" },
  { label: "Disable Self Learning", value: "Disable Self Learning" },
];

export const schoolSessionList = [
  { label: "FN", value: "FN" },
  { label: "AN", value: "AN" },
];
export const absentOptions = [
  { value: "Absent", label: "Absent Without Intimation" },
  { value: "On Leave", label: "Leave With Intimation" },
];
export const applicantStatusList = [
  { value: "Student", label: "Student" },
  { value: "Working Professional", label: "Working Professional" },
  { value: "Other", label: "Other" },
];
export const screenList = [{ value: "add-student", label: "Add Student" }];

export const chooseFieldList = [
  { value: "Default", label: "Default" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

export const permissionStatusList = [
  { value: "Approved", label: "Approved" },
  { value: "Cancelled", label: "Cancelled" },
];

export const absentTypeList = [
  { label: "All", value: "" },
  { label: "Full Day", value: 1 },
  { label: "Half Day", value: 2 },
  { label: "Permission", value: 3 },
];

export const punchTypeList = [
  { label: "All", value: "" },
  { label: "Single", value: 1 },
  { label: "Double", value: 2 },
  { label: "Multiple", value: 3 },
];

export const absentTypeConfirmList = [
  { label: "Present", value: "Present" },
  { label: "Half Day Absent", value: "Half Day" },
  { label: "Full Day Absent", value: "Absent" },
];

export const employeeAttendanceList = [
  { label: "Present", value: "Present", bgcolor: "#ccffcc" },
  { label: "Absent", value: "Absent", bgcolor: "#ffdab3" },
  {
    label: "Forenoon Absent",
    value: "Forenoon Absent",
    bgcolor: "#eeef74",
  },
  {
    label: "Afternoon Absent",
    value: "Afternoon Absent",
    bgcolor: "#eeef74",
  },
];

export const qualificationList = [
  { value: "Diploma", label: "Diploma" },
  { value: "Degree", label: "Degree" },
  { value: "PG", label: "PG" },
];

export const motherTongueList = [
  { value: "Tamil", label: "Tamil" },
  { value: "English", label: "English" },
];

export const feesType = [
  { value: "Miscellaneous", label: "Miscellaneous" },
  { value: "Common Fees", label: "Common Fees" },
  { value: "Yearly Fees", label: "Yearly Fees" },
];

export const activityFeesTypeList = [
  { label: "One Time", value: "one_time" },
  { label: "Monthly", value: "monthly" },
];

export const componentTypeList = [
  { value: "select", label: "Select" },
  { value: "text", label: "Text" },
];
