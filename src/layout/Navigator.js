import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import ProtectedRoute from "../guards/ProtectedRoute";

import AssignFee from "../FeeStructure/CommonFees";
import OpeningFees from "../FeeStructure/OpeningFees";
import ExamFees from "../FeeStructure/ExamFees";

import BillRefundByStudent from "../STUDENT/Billing/BillRefundByStudent";
import FeeStructureList from "../STUDENT/Billing/FeeStructureList";
import Billing from "../STUDENT/Billing/Billing";
import PaymentEntryList from "../STUDENT/Billing/PaymentEntryList";
import ViewFeeStructure from "../STUDENT/Billing/ViewFeeStructure";
import ViewBill from "../STUDENT/Billing/ViewBill";
import MiscellaneousBilling from "../STUDENT/Billing/MiscellaneousBilling";
import FeeModification from "../STUDENT/Billing/FeeModification";
import FeeModificationAccountant from "../STUDENT/Billing/FeeModificationAccountant";
import FeeModificationView from "../STUDENT/Billing/FeeModificationView";
import FeeModificationAO from "../STUDENT/Billing/FeeModificationAO";
import AddFeePermission from "../STUDENT/Billing/AddFeePermission";
import BillTransfer from "../STUDENT/Billing/BillTransfer";
import BillRefund from "../STUDENT/Billing/BillRefund";
import FeeConcession from "../STUDENT/Billing/FeeConcession";
import FeeConcessionAccountant from "../STUDENT/Billing/FeeConcessionAccountant";
import FeeConcessionView from "../STUDENT/Billing/FeeConcessionView";
import FeeConcessionAO from "../STUDENT/Billing/FeeConcessionAO";
import ViewMISBill from "../STUDENT/Billing/ViewMISBill";
import ViewCourseCompletion from "../STUDENT/Billing/CourseCompletionCertificate";
import ViewTranferCertificate from "../STUDENT/Billing/ViewTranferCertificate";
import BonafideCertificate from "./../STUDENT/Billing/BonafideCertificate";

import AddStudent from "../STUDENT/Admission/AddStudent";
import StudentList from "../STUDENT/Admission/StudentList";
import ViewStudent from "../STUDENT/Admission/ViewStudent";
import DateOfJoining from "../STUDENT/Admission/DateOfJoining";
import AddSchoolStudent from "../STUDENT/Admission/AddSchoolStudent";
import ViewSchoolStudent from "../STUDENT/Admission/ViewSchoolStudent";
import AddInstituteStudent from "../STUDENT/Admission/AddInstituteStudent";
import CourseCompletion from "../STUDENT/Admission/CourseCompletion";
import StudentUpgrade from "../STUDENT/Admission/StudentUpgrade";
import InstituteConfirmationMessage from "../STUDENT/Admission/InstituteConfirmationMessage";
import AdmissionStatisticReport from "../STUDENT/AdmissionStatisticReport";

import HostelAttendance from "../STUDENT/Hostel/HostelAttendance";
import HostelAdmission from "../STUDENT/Hostel/HostelAdmission";

import StudentStatistics from "../STUDENT/StudentStatistics";
import StudentStrength from "../STUDENT/StudentStrength";
import TransportStrengthReport from "../STUDENT/TransportStrengthReport";
import MiscellaneousBillingReport from "../report/billing/MiscellaneousBillingReport";
import StudentBusPassRegister from "../STUDENT/BusPassRegister";
import Acknowledgement from "../STUDENT/Acknowledgement";
import StudentBusPassRegisterModification from "../STUDENT/BusPassRegisterModification";
import AcknowledgementList from "../STUDENT/AcknowledgementList";
import FeeModificationReport from "../STUDENT/FeeModificationReport";
import EditStudent from "../STUDENT/editStudent";
import ViewAcknowledgement from "../STUDENT/ViewAcknowledgement";
import EditSchoolStudent from "../STUDENT/EditSchoolStudent";

import Shift from "../HRM/Shift";
import BioMetricUpload from "../HRM/BioMetricUpload";
import AttendanceReport from "../HRM/AttendanceReport";
import AttendanceMonthlyReport from "../HRM/AttendanceMonthlyReport";
import CheckInList from "../HRM/CheckInList";
import HolidayMaster from "../HRM/HolidayMaster";

import AddEmployee from "../HRM/Employee/AddEmployee";
import EmployeeGroup from "../HRM/Employee/EmployeeGroup";
import EmployeeList from "../HRM/Employee/EmployeeList";
import EmployeeRelieve from "../HRM/Employee/EmployeeRelieve";
import ViewEmployee from "../HRM/Employee/ViewEmployee";

import ProcessAttendance from "../HRM/Paybill/ProcessAttendance";

import Increment from "../HRM/Increment/Increment";
import IncrementDateDetails from "../HRM/Increment/IncrementDateDetail";
import Promotion from "../HRM/Increment/Promotion";

import UpdateBioMetric from "../HRM/Leave/UpdateBioMetric";
import TourEntry from "../HRM/Leave/TourEntry";
import TourEntryList from "../HRM/Leave/TourEntryList";
import LeaveEntry from "../HRM/Leave/LeaveEntry";
import LeaveEntryList from "../HRM/Leave/LeaveEntryList";
import ELCLUpdation from "../HRM/Leave/ELCLUpdation";
import CompensationOff from "../HRM/Leave/CompensationOff";
import LeaveCancel from "../HRM/Leave/LeaveCancel";
import PermissionEntry from "../HRM/Leave/PermissionEntry";
import ViewHolidayList from "../HRM/Leave/ViewHolidayList";
import PermissionEntryList from "../HRM/Leave/PermissionEntryList";
import LeaveEntryAbsentee from "../HRM/Leave/LeaveEntryAbsentee";
import PermissionCancel from "./../HRM/Leave/PermissionCancel";
import AddEmployeeAttendance from "../HRM/Leave/AddEmployeeAttendance";

import ArrearSplitUp from "../HRM/Paybill/ArrearSplitUp";
import ResetAllowanceDeductionList from "../HRM/Paybill/ResetAllowanceDeductionList";
import SalarySlipList from "../HRM/Paybill/SalarySlipList";
import ViewSalarySlip from "../HRM/Paybill/ViewSalarySlip";
import ResetAllowanceDeduction from "../HRM/Paybill/ResetAllowanceDeduction";

import UserRight from "../SuperAdmin/UserRight";
import RoleSetting from "../SuperAdmin/RoleSetting";
import AddRoleSettingForm from "../SuperAdmin/AddRoleSettingForm";
import WebErrorLog from "./../SuperAdmin/WebErrorLog";
import ActivityLog from "./../SuperAdmin/ActivityLog";

import HolidayList from "../report/Holiday/HolidayList";
import ArrearReport from "../report/employee/Paybill/ArrearReport";
import EmployeeGeneralReport from "../report/employee/EmployeeGeneralReport";

import Feedback from "../Feedback/Feedback";
import FeedbackList from "../Feedback/FeedbackList";

import SyllabusUpload from "../STUDENT/Admin/Learning/SyllabusUpload";
import SyllabusList from "../STUDENT/Admin/Learning/SyllabusList";
import MaterialUpload from "../STUDENT/Admin/Learning/MaterialUpload";
import MaterialList from "../STUDENT/Admin/Learning/MaterialList";
import QPUpload from "../STUDENT/Admin/Learning/QPUpload";
import QPList from "../STUDENT/Admin/Learning/QPList";
import TimeTableList from "../STUDENT/Admin/Learning/TimeTableList";
import TimeTableUpload from "../STUDENT/Admin/Learning/TimeTableUpload";
import TestMaster from "../STUDENT/Admin/Assessment/TestMaster";
import CircularUpload from "../STUDENT/Admin/Circular/CircularUpload";
import CircularList from "../STUDENT/Admin/Circular/CircularList";
import TestDetailList from "../STUDENT/Admin/Assessment/TestDetailList";
import ViewCircular from "../STUDENT/Admin/Circular/ViewCircular";

import Calendar from "../STUDENT/StudentApp/Calendar";
import Learning from "../STUDENT/StudentApp/Learning";
import LibraryDetail from "../STUDENT/StudentApp/LibraryDetail";
import StudentFeesReport from "../STUDENT/StudentApp/StudentFeesReport";
import UniversityResult from "../STUDENT/StudentApp/UniversityResult";

import PushNotification from "../STUDENT/Admin/PushNotification";
import EventsUpload from "../STUDENT/Admin/Circular/EventsUpload";
import EventsList from "../STUDENT/Admin/Circular/EventsList";

import FileView from "../Academic/FileView";
import ViewTimeTable from "../Academic/ViewTimeTable";
import StudentPerformanceInternal from "../Academic/StudentPerformanceInternal";
import StudentPerformanceUniv from "../Academic/StudentPerformanceUniv";
import StudentFeesView from "../Academic/StudentFeesView";
import StudentGroup from "../Academic/StudentGroup";
import ViewEvent from "../Academic/ViewEvent";
import ExamFeesReport from "../Academic/ExamFeesReport";
import ViewDigitalDiary from "../Academic/ViewDigitalDiary";

import StudentAttendance from "../Academic/Attendance/StudentAttendance";
import SchoolStudentAttendance from "../Academic/Attendance/SchoolStudentAttendance";
import AttendanceConfig from "../Academic/Attendance/AttendanceConfig";

import UniversityNumberUpdate from "../Academic/StudentGroup/UniversityNumberUpdate";
import AssignStudentGroup from "../Academic/StudentGroup/AssignStudentGroup";

import SubjectStaff from "../Academic/SubjectAllocation/SubjectStaff";
import SubjectStudent from "../Academic/SubjectAllocation/SubjectStudent";

import AddSubject from "../Academic/AcademicMaster/AddSubject";
import BatchSubject from "../Academic/AcademicMaster/BatchSubject";
import Regulation from "../Academic/AcademicMaster/Regulation";
import SubjectList from "../Academic/AcademicMaster/SubjectList";
import TopicList from "../Academic/AcademicMaster/TopicList";
import TopicUpload from "../Academic/AcademicMaster/TopicUpload";

import DigitalDiary from "../Academic/DigitalDiary/DigitalDiary";
import DigitalDiaryList from "../Academic/DigitalDiary/DigitalDiaryList";

import BookDetail from "../library/BookDetail";
import LibrarySettings from "../library/LibrarySettings";
import BookReturn from "../library/BookReturn";
import LibraryAdvanceSearch from "../library/LibraryAdvanceSearch";
import BookIssue from "../library/BookIssue";
import BookDetailList from "../library/BookDetailList";
import BookDetailView from "../library/BookDetailView";
import FindBook from "../library/FindBook";
import LibraryMasterList from "../library/LibraryMasterList";
import MemberShipList from "../library/LibraryMemberShipList";
import BookPurchaseDetail from "../library/BookPurchaseDetail";
import ViewBookPurchaseDetail from "../library/ViewBookPurchaseDetail";
import SupplierList from "../library/SupplierList";
import AddSupplier from "../library/AddSupplier";
import BookPurchaseReport from "../library/BookPurchaseReport";
import BookAccessNumberList from "../library/BookAccessNumberList";
import JournalOrder from "../library/AddJournalOrder";
import JournalReceipt from "../library/JournalReceipt";
import AddTitle from "../library/AddTitle";

import Home from "../Home";

import ActivityGroup from "../Activity/ActivityGroup";

import ResetPassword from "../Profile/ResetPassword";
import InstituteRegister from "../pages/InstituteRegister";
import Logout from "../pages/logout";
import Login from "../pages/Login";

import OnHandBookReport from "../report/library/OnHandBookReport";
import LibraryBookDetailReport from "../report/library/LibraryBookDetailReport";
import DepartmentBookDetailReport from "../report/library/DepartmentBookDetailReport";
import TitleWiseQuantityReport from "../report/library/TitleWiseQuantity";
import StatisticsReport from "../report/library/StatisticsReport";
import ManagementReport from "../report/library/ManagementReport";
import LibraryBookIssueReport from "../library/IssueReport";
import LibraryBookReturnReport from "../report/library/ReturnReport";
import LibraryBookPendingReport from "../report/library/BookPendingReport";
import JournalReport from "../report/library/JournalReport";

import HostelOccupancyReport from "../report/hostel/HostelOccupancyReport";
import HostelAttendanceReport from "../report/hostel/HostelAttendanceReport";
import HostelAttendanceStatistics from "../report/hostel/HostelAttendanceStatistics";
import HostelOccupancyStatistics from "../report/hostel/HostelOccupancyStatistics";

import StudentPaymentReport from "../report/billing/StudentPaymentReport";
import OverallBillCollectionReport from "../report/billing/OverallBillCollectionReport";
import CollectionBillnowiseReport from "../report/billing/CollectionBillnowiseReport";
import CollectionUnivnowiseReport from "../report/billing/CollectionUnivnowiseReport";
import TransportCollectionReport from "../report/billing/TransportCollectionReport";
import CollectionPaymodeReport from "../report/billing/CollectionPaymodeReport";
import ParticularwiseAbstractReport from "../report/billing/ParticularwiseAbstractReport";
import AbstractMISReport from "../report/billing/AbstractMISReport";
import TransferRefundAbstractReport from "../report/billing/TransferRefundAbstractReport";
import BillCollectionReport from "../report/billing/BillCollectionReport";
import FeeConcessionReport from "../report/billing/FeeConcessionReport";

import StudentDueReport from "../report/due/StudentDueReport";
import DueAbstract from "../report/due/DueAbstract";
import DueParticularswise from "../report/due/DueParticularswise";
import AllDueParticularWise from "../report/due/AllDueParticularWise";
import YearwiseDue from "../report/due/YearwiseDue";
import DueSummary from "../report/due/DueSummary";
import OverallDueAbstract from "../report/due/OverallDueAbstract";
import AllDueParticularsDepartmentWise from "../report/due/AllDueParticularsDepartmentWise";
import AllDueParticularsNameWise from "../report/due/AllDueParticularsNameWise";
import AllDueParticularsYearWise from "../report/due/AllDueParticularsYearWise";
import DueParticularwiseNonPayer from "../report/due/DueParticularwiseNonPayer";
import DueCollegeHostelFees from "../report/due/DueCollegeHostelFees";
import ConsolidatedDueCollegeHostelFees from "../report/due/ConsolidatedDueHostelCollegeFees";
import TermWiseDue from "../report/due/TermWiseDue";

import StudentDetailReport from "../report/studentInformation/StudentDetailReport";
import AdmissionDetailReport from "../report/studentInformation/AdmissionDetailReport";
import StudentAddressReport from "../report/studentInformation/StudentAddressReport";
import StudentTypeReport from "../report/studentInformation/StudentTypeReport";
import StudentScholarshipReport from "../report/studentInformation/StudentScholarshipReport";

import BookDetailReport from "../report/library/BookDetailReport";
import BookDetailTitleWise from "../report/library/BookDetailTitleWise";
import BookDetailTitleSubjectWise from "../report/library/BookDetailTitleSubjectWise";
import BookDetailSubjectWiseAccessNumber from "../report/library/BookDetailSubjectWiseAccessNumber";
import BookDetailAccessNumberWise from "../report/library/BookDetailAccessNumberWise";
import DepartmentBookByAccessNo from "../report/library/DepartmentBookByAccessNumber";
import DepartmentBookBySubjectWise from "../report/library/DepartmentBookBySubjectWise";
import DepartmentBookByTitleWise from "../report/library/DepartmentBookByTitleWise";
import DepartmentBookDeptSubjectWise from "../report/library/DepartmentBookDeptSubjectWise";
import TitleWiseQty from "../report/library/TitleWiseQty";
import TitleQtyAuthorWise from "../report/library/TitleQtyAuthorWise";
import TitleQtyEditionWise from "../report/library/TitleQtyEditionWise";
import TitleQtySubjectWise from "../report/library/TitleQtySubjectWise";
import BookStatisticsReport from "../report/library/BookStatisticsReport";
import IssueReturnStatistics from "../report/library/IssueReturnStatisticsReport";
import BookIssueDayWise from "../report/library/BookIssueDayWise";
import BookIssueWeekWise from "../report/library/BookIssueWeekWise";
import BookIssueMonthWise from "../report/library/BookIssueMonthWise";
import StudentBookIssueDayWise from "../report/library/StudentBookIssueDayWise";
import StudentBookIssueWeekWise from "../report/library/StudentBookIssueWeekWise";
import StudentBookIssueMonthWise from "../report/library/StudentBookIssueMonthWise";
import StaffBookIssueDayWise from "../report/library/StaffBookIssueDayWise";
import StaffBookIssueWeekWise from "../report/library/StaffBookIssueWeekWise";
import StaffBookIssueMonthWise from "../report/library/StaffBookIssueMonthWise";
import BookReturnDayWise from "../report/library/BookReturnDayWise";
import BookReturnWeekWise from "../report/library/BookReturnWeekWise";
import BookReturnMonthWise from "../report/library/BookReturnMonthWise";
import StudentBookReturnDaywise from "../report/library/StudentBookReturnDayWise";
import StudentBookReturnWeekWise from "../report/library/StudentBookReturnWeekWise";
import StudentBookReturnMonthWise from "../report/library/StudentBookReturnMonthWise";
import StaffBookReturnDayWise from "../report/library/StaffBookReturnDayWise";
import StaffBookReturnWeekWise from "../report/library/StaffBookReturnWeekWise";
import StaffBookReturnMonthWise from "../report/library/StaffBookReturnMonthWise";
import BookPendingDayWise from "../report/library/BookPendingDayWise";
import BookPendingWeekWise from "../report/library/BookPendingWeekWise";
import BookPendingMonthWise from "../report/library/BookPendingMonthWise";
import StudentBookPendingDayWise from "../report/library/StudentBookPendingDayWise";
import StudentBookPendingWeekWise from "../report/library/StudentBookPendingWeekWise";
import StudentBookPendingMonthWise from "../report/library/StudentBookPendingMonthWise";
import StaffBookPendingDayWise from "../report/library/StaffBookPendingDayWise";
import StaffBookPendingWeekWise from "../report/library/StaffBookPendingWeekWise";
import StaffBookPendingMonthWise from "../report/library/StaffBookPendingMonthWise";
import OnHandBookAccessNoWise from "../report/library/OnHandBookAccesssNoWise";
import OnHandBookTitleWiseQty from "../report/library/OnHandBookTitleWiseQty";
import OnHandBookSubjectWiseQty from "../report/library/OnHandBookSubjectWiseQty";
import OnHandBookSubjectWiseAccessNo from "../report/library/OnHandBookSubjectWiseAccessNo";
import JournalTitleWise from "../report/library/JournalTitleWise";
import JournalSubjectWise from "../report/library/JournalSubjectWise";
import JournalSupplierWise from "../report/library/JournalSupplierWise";
import JournalPublisherWise from "../report/library/JournalPublisherWise";
import JournalFrequencyWise from "../report/library/JournalFrequencyWise";

import BusPass from "../report/busPass/BusPass";
import BusPassRegister from "../report/busPass/BusPassRegister";
import BusPassBatchWise from "../report/busPass/BusPassBatchWise";
import BusPassStatistics from "../report/busPass/BusPassStatistics";
import BusPassStatisticsGenderWise from "../report/busPass/BusPassStatisticsGenderWise";

import StudentNameList from "../report/academic/StudentNameList";
import StudentPerformanceInternalReport from "../report/academic/StudentPerformanceInternalReport";
import StudentPerformanceUnivReport from "../report/academic/StudentPerformanceUnivReport";
import SchoolAttendanceReport from "../report/academic/SchoolAttendanceReport";
import StudentAttendanceReport from "../report/academic/StudentAttendanceReport";

import IncrementDateDetailsReport from "../report/employee/IncrementDateDetailsReport";

import LateArrivalReport from "../report/employee/Attendance/LateArrivalReport";
import EarlyDepartReport from "../report/employee/Attendance/EarlyDepartReport";
import InOutStatementReport from "../report/employee/Attendance/InOutStatementReport";
import MonthlyActivity from "../report/employee/Attendance/MonthlyActivity";
import AbsentReport from "../report/employee/Attendance/AbsentReport";
import NewJoiningReport from "../report/employee/NewJoiningReport";
import EmployeeRelievingReport from "./../report/employee/RelievingReport";
import CurrentlyWorkingEmployeesReport from "./../report/employee/CurrentlyWorkingEmployees";
import LeaveEntryDetailReport from "../report/employee/Leave/LeaveEntryDetailReport";
import LeaveDetailReport from "../report/employee/Leave/LeaveDetailReport";
import LeaveWithReasonReport from "../report/employee/Leave/LeaveWithReasonReport";
import OtherDeductionReport from "../report/employee/Paybill/OtherDeductionReport";
import StudentMasterReport from "./../report/studentInformation/StudentMasterReport";
import LeaveBalanceReport from "../report/employee/Leave/LeaveBalanceReport";
import EmployeeProfile from "../report/employee/EmployeeProfile";
import PaymodeReport from "../report/employee/Paybill/PaymodeReport";
import FieldsSetting from "../SuperAdmin/FieldsSetting";
import SalaryStatementReport from "../report/employee/Paybill/SalaryStatementReport";
import PermissionEntryReport from "../report/employee/Leave/PermissionEntryReport";

import TestQuiz from "../lms/TestQuiz";
import QuizQuestion from "../lms/QuizQuestion";
import QuizList from "../lms/QuizList";
import SalaryReport from "../report/employee/Paybill/SalaryReport";
import InstitutionConfig from "../SuperAdmin/InstitutionConfig";
import AssignCourse from "../lms/AssignCourse";
import CourseProgress from "../lms/CourseProgress";
import MyCourse from "../lms/MyCourse";
import MyChapters from "../lms/MyChapters";
import MyTopic from "../lms/MyTopic";
import NewLMSCourse from "../lms/NewLMSCourse";
import CourseList from "../lms/CourseList";
import ChapterList from "../lms/ChapterList";
import LMSTopicList from "../lms/LMSTopicList";
import ViewLMSTopic from "../lms/ViewLMSTopic";
import NewLMSTopic from "../lms/NewLMSTopic";

import "react-datepicker/dist/react-datepicker.css";
import "../App.css";
import AppointmentOrder from "../HRM/AppointmentOrder";
import RelieveStudentTC from "../STUDENT/Admission/RelieveStudentTC";
import AdmissionCancel from "../STUDENT/Admission/AdmissionCancel";
import AddParticular from "../STUDENT/ParticularList";
import SectionBatchMaster from "../STUDENT/BatchList";
import EditQuizQuestion from "../lms/EditQuizQuestion";
import CancelFeesConcession from "../STUDENT/Billing/CancelFeesConcession";
import StudentAdmissionCancelReport from "../report/studentInformation/StudentAdmissionCancel";
import CummulativePerformanceInternalReport from "../report/academic/CummulativePerformanceInternalReport";
import StudentInternal from "../Academic/StudentInternal";
import EmployeeQualificationList from "../HRM/EmployeeQualificationList";
// import GradeList from "../STUDENT/GradeList";
import PageNotFound from "../pages/PageNotFound";
// import AddProduct from "../Inventory/Product/AddProductMaster";
import Brand from "../Inventory/Master/Brand";
import ItemGroup from "../Inventory/Master/ItemGroup";
import AssetCategory from "../Inventory/Master/AssetCategory";
import UOM from "../Inventory/Master/UOM";
import ItemAttribute from "../Inventory/Master/ItemAttribute";
import BoardingPlaceList from "../STUDENT/BoardingPlaceList";
import GradeList from "../STUDENT/GradeList";
import TaxCategory from "../Inventory/Master/TaxCategory";
import AdmissionFeesList from "../STUDENT/AdmissionFeesList";
import DesignationList from "../HRM/DesignationList";
import DesignationCategoryList from "../HRM/DesignationCategoryList";
// import AdmissionFeesList from "../STUDENT/AdmissionFeesList";
import AddProduct from "../Inventory/Product/AddProductMaster";
import PrivacyPolicy from "../pages/PrivacyPolicy";
// import HostelRoomCategoryList from "../STUDENT/Hostel/HostelRoomCategoryList";
// import HostelFloorList from "../STUDENT/Hostel/HostelFloorList";
// import HostelBuildingList from "../STUDENT/Hostel/HostelBuildingList";
// import HostelBuildingAllotmentList from "../STUDENT/Hostel/HostelBuildingAllotmentList";
// import HostelOccupantTypeList from "../STUDENT/Hostel/HostelOccupantTypeList";
// import HostelRoomList from "../STUDENT/Hostel/HostelRoomList";
// import AdmissionFeesList from "../STUDENT/AdmissionFeesList";
// import NewAsset from "../Inventory/Master/Assets/NewAsset";
import BillRefundAll from "../STUDENT/Billing/BillRefundAll";
// import BusPassStagewiseReport from "../report/busPass/BusPassStagewise";

function Navigator() {
  return (
    <>
      <Routes>
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/registration" element={<AddInstituteStudent />} />
        <Route path="/institutereg" element={<InstituteRegister />} />
        <Route
          path="/page-not-found"
          element={
            <ProtectedRoute>
              <PageNotFound />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute-confirmation"
          element={<InstituteConfirmationMessage />}
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/add-employee"
          element={
            <ProtectedRoute>
              <AddEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-employee"
          element={
            <ProtectedRoute>
              <ViewEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-entry"
          element={
            <ProtectedRoute>
              <LeaveEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-entry-absentee"
          element={
            <ProtectedRoute>
              <LeaveEntryAbsentee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-entry-list"
          element={
            <ProtectedRoute>
              <LeaveEntryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/permission-entry-list"
          element={
            <ProtectedRoute>
              <PermissionEntryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/permission-cancel"
          element={
            <ProtectedRoute>
              <PermissionCancel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shift"
          element={
            <ProtectedRoute>
              <Shift />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance-report"
          element={
            <ProtectedRoute>
              <AttendanceReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance-monthly-report"
          element={
            <ProtectedRoute>
              <AttendanceMonthlyReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkin-list"
          element={
            <ProtectedRoute>
              <CheckInList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-cancel"
          element={
            <ProtectedRoute>
              <LeaveCancel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/el-cl-updation"
          element={
            <ProtectedRoute>
              <ELCLUpdation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compensation-off"
          element={
            <ProtectedRoute>
              <CompensationOff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/biometric-upload"
          element={
            <ProtectedRoute>
              <BioMetricUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/process-attendance"
          element={
            <ProtectedRoute>
              <ProcessAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-employee-attendance"
          element={
            <ProtectedRoute>
              <AddEmployeeAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-biometric"
          element={
            <ProtectedRoute>
              <UpdateBioMetric />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-list"
          element={
            <ProtectedRoute>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tour-entry"
          element={
            <ProtectedRoute>
              <TourEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tour-entry-list"
          element={
            <ProtectedRoute>
              <TourEntryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/holiday-master"
          element={
            <ProtectedRoute>
              <HolidayMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-holiday-list"
          element={
            <ProtectedRoute>
              <ViewHolidayList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/holiday-list"
          element={
            <ProtectedRoute>
              <HolidayList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/permission-entry"
          element={
            <ProtectedRoute>
              <PermissionEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-allowance-deduction"
          element={
            <ProtectedRoute>
              <ResetAllowanceDeduction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/promotion"
          element={
            <ProtectedRoute>
              <Promotion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/increment"
          element={
            <ProtectedRoute>
              <Increment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/increment-date-detail"
          element={
            <ProtectedRoute>
              <IncrementDateDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/arrear-split-up"
          element={
            <ProtectedRoute>
              <ArrearSplitUp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/arrear-report"
          element={
            <ProtectedRoute>
              <ArrearReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-allowance-deduction-list"
          element={
            <ProtectedRoute>
              <ResetAllowanceDeductionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salary-slip-list"
          element={
            <ProtectedRoute>
              <SalarySlipList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-salary-slip"
          element={
            <ProtectedRoute>
              <ViewSalarySlip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subject-allotment"
          element={
            <ProtectedRoute>
              <SubjectStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/batch-subject"
          element={
            <ProtectedRoute>
              <BatchSubject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/syllabus-upload"
          element={
            <ProtectedRoute>
              <SyllabusUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-subject"
          element={
            <ProtectedRoute>
              <AddSubject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subject-list"
          element={
            <ProtectedRoute>
              <SubjectList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topic-upload"
          element={
            <ProtectedRoute>
              <TopicUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topic-list"
          element={
            <ProtectedRoute>
              <TopicList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/material-upload"
          element={
            <ProtectedRoute>
              <MaterialUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/material-list"
          element={
            <ProtectedRoute>
              <MaterialList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qp-upload"
          element={
            <ProtectedRoute>
              <QPUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qp-list"
          element={
            <ProtectedRoute>
              <QPList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/syllabus-list"
          element={
            <ProtectedRoute>
              <SyllabusList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/file-view"
          element={
            <ProtectedRoute>
              <FileView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/increment-date-report"
          element={
            <ProtectedRoute>
              <IncrementDateDetailsReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-relieve"
          element={
            <ProtectedRoute>
              <EmployeeRelieve />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-timetable"
          element={
            <ProtectedRoute>
              <ViewTimeTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timetable-list"
          element={
            <ProtectedRoute>
              <TimeTableList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timetable-upload"
          element={
            <ProtectedRoute>
              <TimeTableUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-attendance"
          element={
            <ProtectedRoute>
              <StudentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-attendance-report"
          element={
            <ProtectedRoute>
              <StudentAttendanceReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-performance-internal"
          element={
            <ProtectedRoute>
              <StudentPerformanceInternal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university-result"
          element={
            <ProtectedRoute>
              <UniversityResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/push-notification"
          element={
            <ProtectedRoute>
              <PushNotification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-performance-internal-report"
          element={
            <ProtectedRoute>
              <StudentPerformanceInternalReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-performance-univ"
          element={
            <ProtectedRoute>
              <StudentPerformanceUniv />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-performance-univ-report"
          element={
            <ProtectedRoute>
              <StudentPerformanceUnivReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-master"
          element={
            <ProtectedRoute>
              <TestMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-detail-list"
          element={
            <ProtectedRoute>
              <TestDetailList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-general-report"
          element={
            <ProtectedRoute>
              <EmployeeGeneralReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/late-arrival-report"
          element={
            <ProtectedRoute>
              <LateArrivalReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/early-depart-report"
          element={
            <ProtectedRoute>
              <EarlyDepartReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/in-out-statement-report"
          element={
            <ProtectedRoute>
              <InOutStatementReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monthly-activity"
          element={
            <ProtectedRoute>
              <MonthlyActivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/absent-report"
          element={
            <ProtectedRoute>
              <AbsentReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-employee-joining-report"
          element={
            <ProtectedRoute>
              <NewJoiningReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-relieving-report"
          element={
            <ProtectedRoute>
              <EmployeeRelievingReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback-list"
          element={
            <ProtectedRoute>
              <FeedbackList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circular-upload"
          element={
            <ProtectedRoute>
              <CircularUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-circular"
          element={
            <ProtectedRoute>
              <ViewCircular />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning"
          element={
            <ProtectedRoute>
              <Learning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library-detail"
          element={
            <ProtectedRoute>
              <LibraryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circular-list"
          element={
            <ProtectedRoute>
              <CircularList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-fees-view"
          element={
            <ProtectedRoute>
              <StudentFeesView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-fees-report"
          element={
            <ProtectedRoute>
              <StudentFeesReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-group"
          element={
            <ProtectedRoute>
              <StudentGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-group"
          element={
            <ProtectedRoute>
              <ActivityGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assign-student-group"
          element={
            <ProtectedRoute>
              <AssignStudentGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library-memberShip-list"
          element={
            <ProtectedRoute>
              <MemberShipList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-purchase-detail"
          element={
            <ProtectedRoute>
              <BookPurchaseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier-list"
          element={
            <ProtectedRoute>
              <SupplierList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-supplier"
          element={
            <ProtectedRoute>
              <AddSupplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-title"
          element={
            <ProtectedRoute>
              <AddTitle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-purchase-report"
          element={
            <ProtectedRoute>
              <BookPurchaseReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-access-number"
          element={
            <ProtectedRoute>
              <BookAccessNumberList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-book-purchase-detail"
          element={
            <ProtectedRoute>
              <ViewBookPurchaseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-detail"
          element={
            <ProtectedRoute>
              <BookDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-detail-view"
          element={
            <ProtectedRoute>
              <BookDetailView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-return"
          element={
            <ProtectedRoute>
              <BookReturn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-issue"
          element={
            <ProtectedRoute>
              <BookIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-book"
          element={
            <ProtectedRoute>
              <FindBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-detail-list"
          element={
            <ProtectedRoute>
              <BookDetailList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library-advanced-search"
          element={
            <ProtectedRoute>
              <LibraryAdvanceSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library-setting"
          element={
            <ProtectedRoute>
              <LibrarySettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library-master-list"
          element={
            <ProtectedRoute>
              <LibraryMasterList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-student"
          element={
            <ProtectedRoute>
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-student"
          element={
            <ProtectedRoute>
              <EditStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-student"
          element={
            <ProtectedRoute>
              <ViewStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-fee-structure"
          element={
            <ProtectedRoute>
              <OpeningFees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-fee-structure"
          element={
            <ProtectedRoute>
              <ViewFeeStructure />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assign-fee"
          element={
            <ProtectedRoute>
              <AssignFee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-list"
          element={
            <ProtectedRoute>
              <StudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fee-structure-list"
          element={
            <ProtectedRoute>
              <FeeStructureList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-entry"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-entry-list"
          element={
            <ProtectedRoute>
              <PaymentEntryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-payment-entry"
          element={
            <ProtectedRoute>
              <ViewBill />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-mis-bill"
          element={
            <ProtectedRoute>
              <ViewMISBill />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-statistics"
          element={
            <ProtectedRoute>
              <StudentStatistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-strength"
          element={
            <ProtectedRoute>
              <StudentStrength />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission-statistic-report"
          element={
            <ProtectedRoute>
              <AdmissionStatisticReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-detail-report"
          element={
            <ProtectedRoute>
              <StudentDetailReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-admission-report"
          element={
            <ProtectedRoute>
              <AdmissionDetailReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-address-report"
          element={
            <ProtectedRoute>
              <StudentAddressReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-master-report"
          element={
            <ProtectedRoute>
              <StudentMasterReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-type-report"
          element={
            <ProtectedRoute>
              <StudentTypeReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-scholarship-report"
          element={
            <ProtectedRoute>
              <StudentScholarshipReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-payment-report"
          element={
            <ProtectedRoute>
              <StudentPaymentReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/overall-bill-collection-report"
          element={
            <ProtectedRoute>
              <OverallBillCollectionReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill-collection-report"
          element={
            <ProtectedRoute>
              <BillCollectionReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection-billnowise-report"
          element={
            <ProtectedRoute>
              <CollectionBillnowiseReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection-univnowise-report"
          element={
            <ProtectedRoute>
              <CollectionUnivnowiseReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transport-collection-report"
          element={
            <ProtectedRoute>
              <TransportCollectionReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection-paymode-report"
          element={
            <ProtectedRoute>
              <CollectionPaymodeReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer-refund-abstract-report"
          element={
            <ProtectedRoute>
              <TransferRefundAbstractReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/particularwise-abstract-report"
          element={
            <ProtectedRoute>
              <ParticularwiseAbstractReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/abstract-mis-report"
          element={
            <ProtectedRoute>
              <AbstractMISReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transport-strength-report"
          element={
            <ProtectedRoute>
              <TransportStrengthReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/miscellaneous-billing-report"
          element={
            <ProtectedRoute>
              <MiscellaneousBillingReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/miscellaneous-billing"
          element={
            <ProtectedRoute>
              <MiscellaneousBilling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-due-report"
          element={
            <ProtectedRoute>
              <StudentDueReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/due-abstract"
          element={
            <ProtectedRoute>
              <DueAbstract />
            </ProtectedRoute>
          }
        />
        <Route
          path="/due-particulars-wise"
          element={
            <ProtectedRoute>
              <DueParticularswise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-due-particularwise"
          element={
            <ProtectedRoute>
              <AllDueParticularWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/year-wise-due"
          element={
            <ProtectedRoute>
              <YearwiseDue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/due-summary"
          element={
            <ProtectedRoute>
              <DueSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/overall-due-abstract"
          element={
            <ProtectedRoute>
              <OverallDueAbstract />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-due-particulars-name-wise"
          element={
            <ProtectedRoute>
              <AllDueParticularsNameWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-due-particulars-department-wise"
          element={
            <ProtectedRoute>
              <AllDueParticularsDepartmentWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-due-particulars-year-wise"
          element={
            <ProtectedRoute>
              <AllDueParticularsYearWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/due-particular-wise-nonpayer"
          element={
            <ProtectedRoute>
              <DueParticularwiseNonPayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/due-college-Hostel-fees"
          element={
            <ProtectedRoute>
              <DueCollegeHostelFees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consolidated-due-college-Hostel-fees"
          element={
            <ProtectedRoute>
              <ConsolidatedDueCollegeHostelFees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fee-modification-report"
          element={
            <ProtectedRoute>
              <FeeModificationReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fee-concession-report"
          element={
            <ProtectedRoute>
              <FeeConcessionReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill-transfer"
          element={
            <ProtectedRoute>
              <BillTransfer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill-refund"
          element={
            <ProtectedRoute>
              <BillRefund />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill-refund-all"
          element={
            <ProtectedRoute>
              <BillRefundAll />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill-refund-student"
          element={
            <ProtectedRoute>
              <BillRefundByStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fee-modification"
          element={
            <ProtectedRoute>
              <FeeModification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fee-concession"
          element={
            <ProtectedRoute>
              <FeeConcession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fee-concession-view"
          element={
            <ProtectedRoute>
              <FeeConcessionView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fee-modification-view"
          element={
            <ProtectedRoute>
              <FeeModificationView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bus-pass-registeration"
          element={
            <ProtectedRoute>
              <StudentBusPassRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bus-pass-registeration-modification"
          element={
            <ProtectedRoute>
              <StudentBusPassRegisterModification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fee-modification-accountant"
          element={
            <ProtectedRoute>
              <FeeModificationAccountant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fee-concession-accountant"
          element={
            <ProtectedRoute>
              <FeeConcessionAccountant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fee-concession-ao"
          element={
            <ProtectedRoute>
              <FeeConcessionAO />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fee-modification-ao"
          element={
            <ProtectedRoute>
              <FeeModificationAO />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-admission"
          element={
            <ProtectedRoute>
              <HostelAdmission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acknowledgement"
          element={
            <ProtectedRoute>
              <Acknowledgement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-acknowledgement"
          element={
            <ProtectedRoute>
              <ViewAcknowledgement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acknowledgement-list"
          element={
            <ProtectedRoute>
              <AcknowledgementList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university-number-update"
          element={
            <ProtectedRoute>
              <UniversityNumberUpdate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-completion"
          element={
            <ProtectedRoute>
              <CourseCompletion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-fee-permission"
          element={
            <ProtectedRoute>
              <AddFeePermission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/date-of-joining"
          element={
            <ProtectedRoute>
              <DateOfJoining />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-attendance"
          element={
            <ProtectedRoute>
              <HostelAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-attendance-report"
          element={
            <ProtectedRoute>
              <HostelAttendanceReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-attendance-statistics"
          element={
            <ProtectedRoute>
              <HostelAttendanceStatistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-occupancy-report"
          element={
            <ProtectedRoute>
              <HostelOccupancyReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-occupancy-statistics"
          element={
            <ProtectedRoute>
              <HostelOccupancyStatistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-upgrade"
          element={
            <ProtectedRoute>
              <StudentUpgrade />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-right"
          element={
            <ProtectedRoute>
              <UserRight />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-setting"
          element={
            <ProtectedRoute>
              <RoleSetting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-role-setting-form"
          element={
            <ProtectedRoute>
              <AddRoleSettingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/regulation"
          element={
            <ProtectedRoute>
              <Regulation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-allotment"
          element={
            <ProtectedRoute>
              <SubjectStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal-order"
          element={
            <ProtectedRoute>
              <JournalOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal-receipt"
          element={
            <ProtectedRoute>
              <JournalReceipt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events-List"
          element={
            <ProtectedRoute>
              <EventsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-event"
          element={
            <ProtectedRoute>
              <ViewEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance-config"
          element={
            <ProtectedRoute>
              <AttendanceConfig />
            </ProtectedRoute>
          }
        />
        <Route
          // path="/home"
          path="/library-dashboard"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-fees"
          element={
            <ProtectedRoute>
              <ExamFees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-fees-report"
          element={
            <ProtectedRoute>
              <ExamFeesReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onhand-book-report"
          element={
            <ProtectedRoute>
              <OnHandBookReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library-book-detail-report"
          element={
            <ProtectedRoute>
              <LibraryBookDetailReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department-book-detail-report"
          element={
            <ProtectedRoute>
              <DepartmentBookDetailReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/title-wise-qty-report"
          element={
            <ProtectedRoute>
              <TitleWiseQuantityReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics-report"
          element={
            <ProtectedRoute>
              <StatisticsReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management-report"
          element={
            <ProtectedRoute>
              <ManagementReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/issue-report"
          element={
            <ProtectedRoute>
              <LibraryBookIssueReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/return-report"
          element={
            <ProtectedRoute>
              <LibraryBookReturnReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-pending-report"
          element={
            <ProtectedRoute>
              <LibraryBookPendingReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal-report"
          element={
            <ProtectedRoute>
              <JournalReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-name-list"
          element={
            <ProtectedRoute>
              <StudentNameList />
            </ProtectedRoute>
          }
        />

        {/* School related new screens */}
        <Route
          path="/add-school-student"
          element={
            <ProtectedRoute>
              <AddSchoolStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-school-student"
          element={
            <ProtectedRoute>
              <ViewSchoolStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-school-student"
          element={
            <ProtectedRoute>
              <EditSchoolStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-payment-report"
          element={
            <ProtectedRoute>
              <StudentPaymentReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-detail-report"
          element={
            <ProtectedRoute>
              <BookDetailReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-detail-titlewise"
          element={
            <ProtectedRoute>
              <BookDetailTitleWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-detail-title-subjectwise"
          element={
            <ProtectedRoute>
              <BookDetailTitleSubjectWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-detail-subjectwise-accessno"
          element={
            <ProtectedRoute>
              <BookDetailSubjectWiseAccessNumber />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-detail-accessnowise"
          element={
            <ProtectedRoute>
              <BookDetailAccessNumberWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department-book-accessno"
          element={
            <ProtectedRoute>
              <DepartmentBookByAccessNo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department-book-subjectwise"
          element={
            <ProtectedRoute>
              <DepartmentBookBySubjectWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department-book-titlewise"
          element={
            <ProtectedRoute>
              <DepartmentBookByTitleWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department-book-dept-subjectwise"
          element={
            <ProtectedRoute>
              <DepartmentBookDeptSubjectWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/titlewise"
          element={
            <ProtectedRoute>
              <TitleWiseQty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/title-authorwise"
          element={
            <ProtectedRoute>
              <TitleQtyAuthorWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="title-editionwise"
          element={
            <ProtectedRoute>
              <TitleQtyEditionWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/title-subjectwise"
          element={
            <ProtectedRoute>
              <TitleQtySubjectWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-statistics"
          element={
            <ProtectedRoute>
              <BookStatisticsReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/issue-return-statistics"
          element={
            <ProtectedRoute>
              <IssueReturnStatistics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-issue-daywise"
          element={
            <ProtectedRoute>
              <BookIssueDayWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-issue-weekwise"
          element={
            <ProtectedRoute>
              <BookIssueWeekWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-issue-monthwise"
          element={
            <ProtectedRoute>
              <BookIssueMonthWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-book-issue-daywise"
          element={
            <ProtectedRoute>
              <StudentBookIssueDayWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-book-issue-weekwise"
          element={
            <ProtectedRoute>
              <StudentBookIssueWeekWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-book-issue-monthwise"
          element={
            <ProtectedRoute>
              <StudentBookIssueMonthWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-book-issue-daywise"
          element={
            <ProtectedRoute>
              <StaffBookIssueDayWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-book-issue-weekwise"
          element={
            <ProtectedRoute>
              <StaffBookIssueWeekWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-book-issue-monthwise"
          element={
            <ProtectedRoute>
              <StaffBookIssueMonthWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-return-daywise"
          element={
            <ProtectedRoute>
              <BookReturnDayWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-return-weekwise"
          element={
            <ProtectedRoute>
              <BookReturnWeekWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-return-monthwise"
          element={
            <ProtectedRoute>
              <BookReturnMonthWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-book-return-daywise"
          element={
            <ProtectedRoute>
              <StudentBookReturnDaywise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-book-return-weekwise"
          element={
            <ProtectedRoute>
              <StudentBookReturnWeekWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-book-return-monthwise"
          element={
            <ProtectedRoute>
              <StudentBookReturnMonthWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-book-return-daywise"
          element={
            <ProtectedRoute>
              <StaffBookReturnDayWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-book-return-weekwise"
          element={
            <ProtectedRoute>
              <StaffBookReturnWeekWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-book-return-monthwise"
          element={
            <ProtectedRoute>
              <StaffBookReturnMonthWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-pending-daywise"
          element={
            <ProtectedRoute>
              <BookPendingDayWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-pending-weekwise"
          element={
            <ProtectedRoute>
              <BookPendingWeekWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-pending-monthwise"
          element={
            <ProtectedRoute>
              <BookPendingMonthWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-book-pending-daywise"
          element={
            <ProtectedRoute>
              <StudentBookPendingDayWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-book-pending-weekwise"
          element={
            <ProtectedRoute>
              <StudentBookPendingWeekWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-book-pending-monthwise"
          element={
            <ProtectedRoute>
              <StudentBookPendingMonthWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-book-pending-daywise"
          element={
            <ProtectedRoute>
              <StaffBookPendingDayWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-book-pending-weekwise"
          element={
            <ProtectedRoute>
              <StaffBookPendingWeekWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-book-pending-monthwise"
          element={
            <ProtectedRoute>
              <StaffBookPendingMonthWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/on-hand-book-accessnowise"
          element={
            <ProtectedRoute>
              <OnHandBookAccessNoWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/on-hand-book-titlewise"
          element={
            <ProtectedRoute>
              <OnHandBookTitleWiseQty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/on-hand-book-subjectwise"
          element={
            <ProtectedRoute>
              <OnHandBookSubjectWiseQty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/on-hand-book-subject-accessnowise"
          element={
            <ProtectedRoute>
              <OnHandBookSubjectWiseAccessNo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/journal-titlewise"
          element={
            <ProtectedRoute>
              <JournalTitleWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal-subjectwise"
          element={
            <ProtectedRoute>
              <JournalSubjectWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal-publisherwise"
          element={
            <ProtectedRoute>
              <JournalPublisherWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal-supplierwise"
          element={
            <ProtectedRoute>
              <JournalSupplierWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal-frequencywise"
          element={
            <ProtectedRoute>
              <JournalFrequencyWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bus-pass-report"
          element={
            <ProtectedRoute>
              <BusPass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bus-pass-batchwise-report"
          element={
            <ProtectedRoute>
              <BusPassBatchWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bus-pass-register-report"
          element={
            <ProtectedRoute>
              <BusPassRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bus-pass-statistics-report"
          element={
            <ProtectedRoute>
              <BusPassStatistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bus-pass-statistics-genderwise-report"
          element={
            <ProtectedRoute>
              <BusPassStatisticsGenderWise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/term-wise-due"
          element={
            <ProtectedRoute>
              <TermWiseDue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/digital-diary"
          element={
            <ProtectedRoute>
              <DigitalDiary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/digital-diary-list"
          element={
            <ProtectedRoute>
              <DigitalDiaryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-digital-diary"
          element={
            <ProtectedRoute>
              <ViewDigitalDiary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-course-completion"
          element={
            <ProtectedRoute>
              <ViewCourseCompletion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-transfer-certificate"
          element={
            <ProtectedRoute>
              <ViewTranferCertificate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bonafide-certificate"
          element={
            <ProtectedRoute>
              <BonafideCertificate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-list"
          element={
            <ProtectedRoute>
              <CourseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapter-list"
          element={
            <ProtectedRoute>
              <ChapterList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lms-topic-list"
          element={
            <ProtectedRoute>
              <LMSTopicList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-lms-topic"
          element={
            <ProtectedRoute>
              <ViewLMSTopic />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-lms-topic"
          element={
            <ProtectedRoute>
              <NewLMSTopic />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school-student-attendance"
          element={
            <ProtectedRoute>
              <SchoolStudentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school-attendance-report"
          element={
            <ProtectedRoute>
              <SchoolAttendanceReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-group"
          element={
            <ProtectedRoute>
              <EmployeeGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/currently-working-employee-report"
          element={
            <ProtectedRoute>
              <CurrentlyWorkingEmployeesReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-entry-detail-report"
          element={
            <ProtectedRoute>
              <LeaveEntryDetailReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-balance-report"
          element={
            <ProtectedRoute>
              <LeaveBalanceReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-profile"
          element={
            <ProtectedRoute>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-detail-report"
          element={
            <ProtectedRoute>
              <LeaveDetailReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-with-reason-report"
          element={
            <ProtectedRoute>
              <LeaveWithReasonReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/other-deduction-report"
          element={
            <ProtectedRoute>
              <OtherDeductionReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paymode-report"
          element={
            <ProtectedRoute>
              <PaymodeReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-list"
          element={
            <ProtectedRoute>
              <QuizList />
            </ProtectedRoute>
          }
        />
        <Route
          path="fields-setting"
          element={
            <ProtectedRoute>
              <FieldsSetting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-test"
          element={
            <ProtectedRoute>
              <TestQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="salary-statement-report"
          element={
            <ProtectedRoute>
              <SalaryStatementReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/permission-entry-report"
          element={
            <ProtectedRoute>
              <PermissionEntryReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-question"
          element={
            <ProtectedRoute>
              <QuizQuestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-salary-report"
          element={
            <ProtectedRoute>
              <SalaryReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assign-course"
          element={
            <ProtectedRoute>
              <AssignCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institution-config"
          element={
            <ProtectedRoute>
              <InstitutionConfig />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-progress"
          element={
            <ProtectedRoute>
              <CourseProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lms-my-course"
          element={
            <ProtectedRoute>
              <MyCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lms-my-chapter"
          element={
            <ProtectedRoute>
              <MyChapters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lms-my-topic"
          element={
            <ProtectedRoute>
              <MyTopic />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lms-new-course"
          element={
            <ProtectedRoute>
              <NewLMSCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment-order"
          element={
            <ProtectedRoute>
              <AppointmentOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/releiving-Student-tc"
          element={
            <ProtectedRoute>
              <RelieveStudentTC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission-cancel"
          element={
            <ProtectedRoute>
              <AdmissionCancel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/particular-list"
          element={
            <ProtectedRoute>
              <AddParticular />
            </ProtectedRoute>
          }
        />
        <Route
          path="/batch-list"
          element={
            <ProtectedRoute>
              <SectionBatchMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-quiz-question"
          element={
            <ProtectedRoute>
              <EditQuizQuestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cancel-fees-concession"
          element={
            <ProtectedRoute>
              <CancelFeesConcession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission-cancel-report"
          element={
            <ProtectedRoute>
              <StudentAdmissionCancelReport />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/bus-pass-stage-report"
          element={
            <ProtectedRoute>
              <BusPassStagewiseReport />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/cummulative-performance-internal-report"
          element={
            <ProtectedRoute>
              <CummulativePerformanceInternalReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/error-log"
          element={
            <ProtectedRoute>
              <WebErrorLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-log"
          element={
            <ProtectedRoute>
              <ActivityLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-internal"
          element={
            <ProtectedRoute>
              <StudentInternal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-qualification-list"
          element={
            <ProtectedRoute>
              <EmployeeQualificationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grade-list"
          element={
            <ProtectedRoute>
              <GradeList />
            </ProtectedRoute>
          }
        />
        {/* Inventory Module */}
        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/brand"
          element={
            <ProtectedRoute>
              <Brand />
            </ProtectedRoute>
          }
        />
        <Route
          path="/item-group"
          element={
            <ProtectedRoute>
              <ItemGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/asset-category"
          element={
            <ProtectedRoute>
              <AssetCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/uom"
          element={
            <ProtectedRoute>
              <UOM />
            </ProtectedRoute>
          }
        />
        <Route
          path="/item-attribute"
          element={
            <ProtectedRoute>
              <ItemAttribute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tax-category"
          element={
            <ProtectedRoute>
              <TaxCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/boarding-place-list"
          element={
            <ProtectedRoute>
              <BoardingPlaceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission-fees-list"
          element={
            <ProtectedRoute>
              <AdmissionFeesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/designation-list"
          element={
            <ProtectedRoute>
              <DesignationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/designation-category-list"
          element={
            <ProtectedRoute>
              <DesignationCategoryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <ProtectedRoute>
              <PrivacyPolicy />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/new-asset"
          element={
            <ProtectedRoute>
              <NewAsset />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/hostel-room-category-list"
          element={
            <ProtectedRoute>
              <HostelRoomCategoryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-floor-list"
          element={
            <ProtectedRoute>
              <HostelFloorList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-building-list"
          element={
            <ProtectedRoute>
              <HostelBuildingList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-building-allotment"
          element={
            <ProtectedRoute>
              <HostelBuildingAllotmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-occupant-list"
          element={
            <ProtectedRoute>
              <HostelOccupantTypeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel-room-list"
          element={
            <ProtectedRoute>
              <HostelRoomList />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </>
  );
}

export default Navigator;
