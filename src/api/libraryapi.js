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

const getMemberShipList = async (
  institutionType,
  memberDepartment,
  batch,
  standard,
  memberNo,
  isShowAll,
  collegeID,
  type
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.all_member_list",
    {
      institutionType,
      memberDepartment,
      batch,
      standard,
      memberNo,
      isShowAll,
      collegeID,
      type,
    }
  );
  return data;
};

const getMembership = async (value) => {
  const data = await client.get(
    `/api/resource/Lib Member?fields=["member_number","member_name","member_department","student_batch","member_status",
    "member_type"]&filters=[["member_number", "=", "${value?.trim()}"], ["member_status","=", "Open"]]`
  );
  return data;
};

const checkMemberShip = async (value) => {
  const data = await client.get(
    `/api/resource/Lib Member?fields=["member_number","member_name","member_department","student_batch","member_status",
    "member_type"]&filters=[["member_number", "=", "${value?.trim()}"], ["member_status","=", "Open"]]`
  );
  return data;
};

const viewMemberShip = async (id) => {
  const data = await client.put(`/api/resource/Lib Member/${id}`);
  return data;
};

const editMemberShip = async (id, member_status, reason) => {
  const data = await client.put(`/api/resource/Lib Member/${id}`, {
    member_status,
    reason,
  });
  return data;
};

const getSupplierGroupList = async () => {
  const data = await client.get(
    `/api/resource/Supplier Group?fields=["name as label", "name as value"]&order_by = name asc&limit_page_length=None`
  );
  return data;
};

const getSupplierBySearch = async (value) => {
  const data = await client.get(
    `/api/resource/Supplier?fields=["supplier_name as label", "name as value"]&filters=[["disabled","=", 0]]&or_filters=[["name", "like", "${value?.trim()}%"], ["name", "like", "% ${value?.trim()}%"]]&order_by = name asc&limit_page_length=${
      string.PAGE_LIMIT
    }`
  );
  return data;
};

const getBookTypeList = async () => {
  const data = await client.get(
    `/api/resource/Lib Book Type?fields=["name as label", "name as value"]&filters=[["is_active","=", 1]]&order_by = name asc&limit_page_length=None`
  );
  return data;
};

const getSearchSubjectList = async (value) => {
  const data = await client.get(
    `/api/resource/Lib Subject?fields=["name as label", "name as value"]&filters=[["is_active","=", 1]]&or_filters=[["name", "like", "${value?.trim()}%"], ["name", "like", "% ${value?.trim()}%"]]&order_by = name asc &limit_page_length=${
      string.PAGE_LIMIT
    }`
  );
  return data;
};

const getMasterList = async (doctype, limit) => {
  const data = await client.get(
    `/api/resource/${doctype}?fields=["name", "is_active"]&order_by=name&limit_page_length=${limit}`
  );
  return data;
};

const getDeptList = async () => {
  const data = await client.get(
    `/api/resource/Lib Department?fields=["name as label", "name as value"]&filters=[["is_active","=", 1]]&order_by=name&limit_page_length=None`
  );
  return data;
};

const addAuthorName = async (author_name, is_active = 1) => {
  const data = await client.post(`/api/resource/Lib Author`, {
    author_name: author_name?.trim(),
    is_active,
  });
  return data;
};

const addPubisher = async (publisher, is_active = 1) => {
  const data = await client.post(`/api/resource/Lib Publisher`, {
    publisher: publisher?.trim(),
    is_active,
  });
  return data;
};

const addDepartment = async (department, is_active = 1) => {
  const data = await client.post(`/api/resource/Lib Department`, {
    department: department?.trim(),
    is_active,
  });
  return data;
};

const addSubject = async (subject_name, is_active = 1) => {
  const data = await client.post(`/api/resource/Lib Subject`, {
    subject_name: subject_name?.trim(),
    is_active,
  });
  return data;
};

const viewSupplier = async (id) => {
  const data = await client.get(`/api/resource/Supplier/${id}`);
  return data;
};

const viewSupplierAddress = async (address_title) => {
  const data = await client.get(
    `/api/resource/Address?fields=["address_line1","address_line2","city","state"]&filters=[["address_title", "=", "${address_title?.trim()}"]]`
  );
  return data;
};

const addSupplierAddress = async (
  address_title,
  address_line1,
  address_line2,
  city,
  state,
  pincode
) => {
  const data = await client.post(`/api/resource/Address`, {
    address_title: address_title,
    address_type: "Billing",
    address_line1,
    address_line2,
    city,
    state: state,
    country: "India",
    disabled: 0,
    pincode,
    links: [
      {
        link_doctype: "Supplier",
        link_name: address_title,
        link_title: address_title,
      },
    ],
  });
  return data;
};

const addSupplier = async (supplier_name, mobile_no, email_id) => {
  const data = await client.post(`/api/resource/Supplier`, {
    supplier_name,
    country: "India",
    supplier_group: "Book",
    supplier_type: "Individual",
    mobile_no,
    email_id,
    disabled: 0,
  });
  return data;
};

const editSupplierDetails = async (
  id,
  supplier_name,
  supplier_group,
  supplier_type,
  mobile_no,
  email_id
) => {
  const data = await client.put(`/api/resource/Supplier/${id}`, {
    supplier_name: supplier_name?.trim(),
    supplier_group,
    supplier_type,
    mobile_no,
    email_id,
  });
  return data;
};

const editSupplierAddress = async (
  id,
  address_line1,
  address_line2,
  city,
  state
) => {
  const data = await client.put(`/api/resource/Address/${id}`, {
    address_line1: address_line1?.trim(),
    address_line2: address_line2?.trim(),
    city: city?.trim(),
    state: state?.trim(),
  });
  return data;
};

const getSupplierAddressId = async (address_title) => {
  const data = await client.get(
    `/api/resource/Address?filters=[["address_title","=","${address_title}"]]`
  );
  return data;
};

const addBookType = async (book_type, is_active = 1) => {
  const data = await client.post(`/api/resource/Lib Book Type`, {
    book_type: book_type?.trim(),
    is_active,
  });
  return data;
};

const addBookIssue = async (
  member_number,
  access_number,
  issue_date,
  expected_return_date
) => {
  const data = await client.post("/api/resource/Lib Book Issue", {
    member_number,
    access_number,
    issue_date,
    expected_return_date,
  });
  return data;
};

const getStudentImage = async (enroll_number) => {
  const data = await client.get(
    `/api/resource/Student?fields=["image"]&filters=[["name","=","${enroll_number}"]]&limit_page_length=None&order_by=creation desc`
  );
  return data;
};

const getBookById = async (id) => {
  const data = await client.get(`/api/resource/Lib Book/${id}`);
  return data;
};

const getBookIssueByEnrollNo = async (enroll_number) => {
  const data = await client.get(
    `/api/resource/Lib Book Issue?fields=["member_number", "access_number", "issue_date", "expected_return_date", "is_returned","is_renewal"]&filters=[["member_number","=","${enroll_number}"],["is_returned", "=", "0"]]&order_by=creation desc&limit_page_length=None`
  );
  return data;
};

const getLibrarySetting = async (value) => {
  const data = await client.get(
    `/api/resource/Lib Configuration?fields=["member_type as label","name as value"]&filters=[["college_id","=","${value}"]]&order_by=creation asc`
  );
  return data;
};

const viewLibrarySetting = async (id) => {
  const data = await client.get(`/api/resource/Lib Configuration/${id}`);
  return data;
};

const updateAvailableAccessNo = async (id) => {
  const data = await client.put(`/api/resource/Lib Access Number/${id}`, {
    is_available: 0,
  });
  return data;
};

const getAccessNoById = async (id) => {
  const data = await client.get(`/api/resource/Lib Access Number/${id}`);
  return data;
};

const checkAccessNumber = async (access_number) => {
  const data = await client.get(
    `/api/resource/Lib Access Number?filters=[["access_number", "in", "${access_number}"]]&limit_page_length=None`
  );
  return data;
};

const addAccessNumber = async (purchase_detail, access_number) => {
  const data = await client.post("/api/resource/Lib Access Number", {
    purchase_detail,
    access_number,
    is_available: 1,
    status: "Active",
    handled_by: string.DEFAULT_LIBRARY_DEPARTMENT,
  });
  return data;
};

const getAccessNumber = async () => {
  const data = await client.get(
    `/api/resource/Lib Access Number?filters=[["is_active","=","1"],["is_available", "=","0"]]&fields=["access_number as label", "access_number as value","purchase_detail"]&limit_page_length=${string.PAGE_LIMIT}`
  );
  return data;
};

const filterAccess = async (id) => {
  const data = await client.get(
    `/api/resource/Lib Book Issue?&filters=[["access_number","=","${id}"],["is_returned","=","0"]]&fields=["is_renewal","expected_return_date","member_number"]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const getBookTitle = async (name) => {
  const data = await client.get(
    `/api/resource/Lib Book?filters=[["name","=","${name?.trim()}"]]&fields=["name","main_title"]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const updateAccessnumber = async (id) => {
  const data = await client.put(`/api/resource/Lib Access Number/${id}`, {
    is_available: true,
  });
  return data;
};

const editLibrarySetting = async (
  id,
  book_limit,
  due_day,
  fine_amount,
  college_id
) => {
  const data = await client.put(`/api/resource/Lib Configuration/${id}`, {
    book_limit,
    due_day,
    fine_amount,
    college_id,
  });
  return data;
};

const getAuthorBySearch = async (text) => {
  const data = await client.get(
    `/api/resource/Lib Author?fields=["name as label","name as value"]&filters=[["is_active","=", 1]]&or_filters=[["name", "like", "${text?.trim()}%"], ["name", "like", "% ${text?.trim()}%"]]&order_by = name asc&limit_page_length=${
      string.PAGE_LIMIT
    }`
  );
  return data;
};

const getPublisherBySearch = async (text) => {
  const data = await client.get(
    `/api/resource/Lib Publisher?fields=["name as label","name as value"]&filters=[["is_active","=", 1]]&or_filters=[["name", "like", "${text?.trim()}%"], ["name", "like", "% ${text?.trim()}%"]]&order_by = name asc&limit_page_length=${
      string.PAGE_LIMIT
    }`
  );
  return data;
};

const getBookName = async () => {
  const data = await client.get(
    `/api/resource/Lib Book?fields=["name as value", "main_title as label"]&order_by=main_title asc&limit_page_length=${string.PAGE_LIMIT}`
  );
  return data;
};

const getBookAuthorPublisherByKeyword = async (keyword) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_purchase_search",

    {
      keyword,
    }
  );
  return data;
};

const getBookNameByTitle = async (text) => {
  const data = await client.get(
    `/api/resource/Lib Book?fields=["name as value","main_title as label"]&or_filters=[["main_title", "like", "${text?.trim()}%"], ["main_title", "like", "% ${text?.trim()}%"]]&order_by = name asc &limit_page_length=${
      string.PAGE_LIMIT
    }`
  );
  return data;
};

const getAuthor = async () => {
  const data = await client.get(
    `/api/resource/Lib Author?fields=["name as label","name as value"]&filters=[["is_active","=", 1]]&limit_page_length=${string.PAGE_LIMIT}`
  );
  return data;
};

const getPublisher = async () => {
  const data = await client.get(
    `/api/resource/Lib Publisher?fields=["name as label","name as value"]&filters=[["is_active","=", 1]]&limit_page_length=${string.PAGE_LIMIT}`
  );
  return data;
};

const getLibraryConfiguration = async (value) => {
  const data = await client.get(
    `/api/resource/Lib Configuration?fields=["due_day","fine_amount"]&filters=[["member_type", "=", "${value?.trim()}"]]`
  );
  return data;
};

const getAccessNumberList = async (access_number) => {
  const data = await client.get(
    `/api/resource/Lib Access Number?fields=["access_number as label","access_number as value"]&or_filters=[["access_number","like","${access_number}%"]]&order_by = access_number asc&limit_page_length=${string.PAGE_LIMIT}`
  );
  return data;
};

const getBookPurchaseDetailReportCount = async (
  main_title,
  author_name,
  subject,
  call_number,
  year_publish,
  edition,
  publisher,
  supplier,
  book_type,
  department,
  from_date,
  to_date,
  order_by,
  is_available
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_report_count",
    {
      main_title: main_title?.trim(),
      author_name: author_name?.trim(),
      subject: subject?.trim(),
      call_number,
      year_publish,
      edition,
      publisher: publisher?.trim(),
      supplier: supplier.trm(),
      book_type: book_type?.trim(),
      department: department?.trim(),
      from_date,
      to_date,
      order_by,
      is_available,
    }
  );
  return data;
};

const getBookPurchaseDetailReport = async (
  college_id,
  main_title,
  author_name,
  subject,
  call_number,
  year_publish,
  edition,
  publisher,
  supplier,
  book_type,
  department,
  access_no_from,
  access_no_to,
  from_date,
  to_date,
  selected_field,
  limit_value
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_report_select_field",
    {
      college_id,
      main_title,
      author_name,
      subject,
      call_number,
      year_publish,
      edition,
      publisher,
      supplier,
      book_type,
      department,
      access_no_from,
      access_no_to,
      from_date,
      to_date,
      selected_field,
      limit_value,
    }
  );
  return data;
};

const getBookDetailReportCount = async (
  main_title,
  author_name,
  subject_name,
  call_number,
  year_publish,
  edition,
  publisher,
  supplier,
  book_type,
  department,
  from_date,
  to_date,
  order_by,
  access_no_from,
  access_no_to,
  is_available
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_report_count",
    {
      main_title: main_title?.trim(),
      author_name: author_name?.trim(),
      subject_name: subject_name?.trim(),
      call_number,
      year_publish,
      edition,
      publisher: publisher?.trim(),
      supplier: supplier?.trim(),
      book_type: book_type?.trim(),
      department: department?.trim(),
      from_date,
      to_date,
      order_by,
      access_no_from,
      access_no_to,
      is_available,
    }
  );
  return data;
};

const getBookDetailReport = async (
  main_title,
  author_name,
  subject_name,
  call_number,
  year_publish,
  edition,
  publisher,
  supplier,
  book_type,
  department,
  from_date,
  to_date,
  order_by,
  access_no_from,
  access_no_to,
  is_available,
  selected_field,
  limit_value
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_report",
    {
      main_title: main_title?.trim(),
      author_name: author_name?.trim(),
      subject_name: subject_name?.trim(),
      call_number,
      year_publish,
      edition,
      publisher: publisher?.trim(),
      supplier: supplier?.trim(),
      book_type: book_type?.trim(),
      department: department?.trim(),
      from_date,
      to_date,
      order_by,
      access_no_from,
      access_no_to,
      is_available,
      selected_field,
      limit_value,
    }
  );
  return data;
};

const bookReturnReportCount = async (
  access_number,
  member_number,
  from_date,
  to_date
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_return_report_count",
    {
      access_number,
      member_number,
      from_date,
      to_date,
    }
  );
  return data;
};

const bookReturnReport = async (
  access_number,
  member_number,
  from_date,
  to_date,

  limit_value
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_return_report",
    {
      access_number,
      member_number,
      from_date,
      to_date,
      limit_value,
    }
  );
  return data;
};
const bookIssueReportCount = async (
  access_number,
  member_number,
  from_date,
  to_date
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_issue_report_count",
    {
      access_number,
      member_number,
      from_date,
      to_date,
    }
  );
  return data;
};

const bookIssueReport = async (
  access_number,
  member_number,
  from_date,
  to_date,
  limit_value
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_issue_report",
    {
      access_number,
      member_number,
      from_date,
      to_date,
      limit_value,
    }
  );
  return data;
};

const getBookDetailQtyCount = async (
  main_title,
  author_name,
  subject_name,
  year_publish,
  edition,
  order_by
) => {
  const data = await client.post(
    "api/method/education.smvss.library.titlewise_quantity_count",
    {
      main_title: main_title?.trim(),
      author_name: author_name?.trim(),
      subject_name: subject_name?.trim(),
      year_publish,
      edition,
      order_by,
    }
  );
  return data;
};

const getBookDetailQty = async (
  main_title,
  author_name,
  subject_name,
  year_publish,
  edition,
  order_by,
  limit_value
) => {
  const data = await client.post(
    "api/method/education.smvss.library.titlewise_quantity",
    {
      main_title: main_title?.trim(),
      author_name: author_name?.trim(),
      subject_name: subject_name?.trim(),
      year_publish,
      edition,
      order_by,
      limit_value,
    }
  );
  return data;
};

const getPendingBookCount = async (from_date, to_date) => {
  const data = await client.post(
    "/api/method/education.smvss.library.pending_book_report_count",
    {
      from_date,
      to_date,
    }
  );
  return data;
};

const getPendingBooks = async (from_date, to_date, limit_value) => {
  const data = await client.post(
    "/api/method/education.smvss.library.pending_book_report",
    {
      from_date,
      to_date,
      limit_value,
    }
  );
  return data;
};

const addBook = async (
  college_id,
  main_title,
  publisher,
  author_origin,
  book_department,
  book_type,
  isbn,
  call_number,
  rack_number,
  book_subject,
  author_name
) => {
  const data = await client.post("/api/resource/Lib Book", {
    main_title: main_title?.trim(),
    publisher: publisher?.trim(),
    author_origin,
    book_department: book_department?.trim(),
    book_type,
    isbn,
    call_number,
    rack_number,
    book_subject,
    author_name,
    college_id,
  });
  return data;
};

const getBookByTitle = async (main_title) => {
  const data = await client.get(
    `/api/resource/Lib Book?fields=["name","main_title","publisher"]&filters=[["main_title", "=", "${main_title?.trim()}"]]&order_by=main_title asc&limit_page_length=None`
  );
  return data;
};

const getBookDetailById = async (name) => {
  const data = await client.get(`/api/resource/Lib Book/${name}`);
  return data;
};

const libPurchase = async (
  college_id,
  po_number,
  supplier,
  invoice_date,
  date_of_entry,
  invoice_number,
  total_value,
  discount_amount,
  paid_amount,
  file_path
) => {
  const data = await client.post("/api/resource/Lib Purchase", {
    college_id,
    po_number,
    supplier: supplier?.trim(),
    invoice_date,
    date_of_entry,
    invoice_number,
    total_value,
    discount_amount,
    paid_amount,
    file_path,
  });
  return data;
};

const libPurchaseDetail = async (
  book_id,
  purchase_id,
  year_of_publish,
  edition,
  pages,
  quantity,
  mrp,
  discount_percentage,
  total_amount,
  remarks
) => {
  const data = await client.post("/api/resource/Lib Purchase Detail", {
    book_id,
    purchase_id,
    year_of_publish,
    edition,
    pages,
    quantity,
    mrp,
    discount_percentage,
    total_amount,
    remarks: remarks?.trim(),
  });
  return data;
};

const getPurchaseDetailId = async (id) => {
  const data = await client.get(`/api/resource/Lib Purchase Detail/${id}`);
  return data;
};

const getSearchLibraryMember = async (value) => {
  const data = await client.get(
    `/api/resource/Lib Member?fields=["member_name", "member_number","member_department","student_batch","member_status","member_type","reason"]&or_filters=[["member_number","=","${value?.trim()}"],["member_name","like","%${value?.trim()}%"]]&limit_page_length=30&order_by=Creation desc`
  );
  return data;
};

const editMaster = async (doctype, docname, name) => {
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

const editMasterStatus = async (doctype, is_active, id) => {
  const data = await client.put(`/api/resource/${doctype}/${id}`, {
    is_active,
  });
  return data;
};

const addBookIssueFineAmount = async (
  book_issue_id,
  fine_amount,
  paid_amount,
  paid_date
) => {
  const data = await client.post(`/api/resource/Lib Fine Amount`, {
    book_issue_id,
    fine_amount,
    paid_amount,
    paid_date,
  });
  return data;
};

const addMaster = async (name, fieldName, value, is_active) => {
  const data = await client.post(`/api/resource/${name}`, {
    [fieldName]: value,
    is_active,
  });
  return data;
};

const getAllBook = async (limit) => {
  const data = await client.get(
    `/api/resource/Lib Book?fields=["name","main_title","publisher"]&order_by=creation desc&limit_page_length=${limit}`
  );
  return data;
};

const getAllSupplierList = async (limitValue, keyword) => {
  const data = await client.post(
    `/api/method/education.smvss.library.supplier_detail`,
    {
      limitValue,
      keyword,
    }
  );
  return data;
};

const getBookPurchaseDetail = async (from_date, to_date, limit) => {
  const data = await client.get(
    `/api/resource/Lib Purchase?fields=["supplier","invoice_number","invoice_date","total_value","paid_amount","name"]&filters=[["invoice_date",">=", "${from_date} 00:00:00.000000"],["invoice_date", "<=", "${to_date} 23:59:59.000000"]]&limit_page_length=${limit}&order_by=invoice_date desc`
  );
  return data;
};

const getBookPurchasebyPuchaseID = async (purchase_id) => {
  const data = await client.post(
    `/api/method/education.smvss.library.get_purchase_details`,
    {
      purchase_id,
    }
  );
  return data;
};

const getBookPurchasebyID = async (purchase_id) => {
  const data = await client.get(
    `/api/resource/Lib Purchase?fields=["supplier","po_number","invoice_number","invoice_number","invoice_date","total_value","discount_amount","paid_amount"]&filters=[["name","=", "${purchase_id} "]]&limit_page_length=None&order_by=name desc`
  );
  return data;
};

const getBookPurchaseOrderbyID = async (purchase_id) => {
  const data = await client.get(
    `/api/resource/Lib Purchase Detail?fields=["book_id","edition","mrp","name","pages","purchase_id","quantity","remarks","unit_price",
    "year_of_publish","total_amount","discount_percentage"]&filters=[["purchase_id","=", "${purchase_id}"]]&limit_page_length=None&order_by=creation desc`
  );
  return data;
};

const getBookAccessNo = async (keyword, is_available) => {
  const data = await client.get(
    `/api/method/education.smvss.library.get_access_title`,
    {
      keyword,
      is_available,
    }
  );
  return data;
};

const getMastersTotalCount = async (doctype) => {
  const data = await client.get(
    `/api/resource/${doctype}?fields=["count(name) as total_count"]&order_by=name&limit_page_length=None`
  );
  return data;
};

const getAllAccessNumber = async (searchText) => {
  const data = await client.get(
    `/api/resource/Lib Access Number?fields=["name as value","access_number as label"]&filters=[["access_number", "like", "${searchText?.trim()}%"]]&limit_page_length=${
      string.PAGE_LIMIT
    }&order_by=name`
  );
  return data;
};

const getAccessNumberDetail = async (access_number) => {
  const data = await client.post(
    "/api/method/education.smvss.library.access_number_details",
    {
      access_number,
    }
  );
  return data;
};

const editBookIssue = async (id, return_date, is_renewal, is_returned) => {
  const fieldName = is_renewal ? "expected_return_date" : "return_date";
  const data = await client.put(`/api/resource/Lib Book Issue/${id}`, {
    [fieldName]: return_date,
    is_renewal,
    is_returned,
  });
  return data;
};

// const getTitlebySearch = async (text) => {
//   const data = await client.get(
//     `/api/resource/Lib Book?fields=["main_title as label","main_title as value"]&or_filters=[["main_title", "like", "${text?.trim()}%"], ["main_title", "like", "% ${text?.trim()}%"]]&order_by = name asc &limit_page_length=${
//       string.PAGE_LIMIT
//     }`
//   );
//   return data;
// };

const getTitlebySearch = async (searchValue, type) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_title_search",
    {
      searchValue,
      type,
    }
  );
  return data;
};

const findAccessFromTitle = async (book_id) => {
  const data = await client.post(
    "/api/method/education.smvss.library.find_access_from_title",
    {
      book_id,
    }
  );
  return data;
};

const bookReturnFineReportCount = async (
  access_number,
  member_number,
  from_date,
  to_date
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.fine_amount_report_count",
    {
      access_number,
      member_number,
      from_date,
      to_date,
    }
  );
  return data;
};

const bookReturnFineAmountReport = async (
  access_number,
  member_number,
  from_date,
  to_date,
  limit_value
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.fine_amount_report",
    {
      access_number,
      member_number,
      from_date,
      to_date,
      limit_value,
    }
  );
  return data;
};

const validateSupplier = async (supplierName) => {
  const data = await client.get(
    `/api/resource/Supplier?filters=[["name", "=", "${supplierName?.trim()}"]]`
  );
  return data;
};

const getMasterData = async (doctype, name) => {
  const data = await client.get(
    `/api/resource/${doctype}?fields=["name as label","name as value","name", "is_active"]&or_filters=[["name","like","${name}%"], ["name","like","% ${name}%"]]&order_by=name&limit_page_length=None`
  );
  return data;
};

const checkDuplicateBook = async (book_title, book_publisher) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_check",
    {
      book_title: book_title?.trim(),
      book_publisher: book_publisher?.trim(),
    }
  );
  return data;
};

const getAdvanceSearchCount = async (
  main_title,
  author_name,
  subject_name,
  year_publish,
  edition,
  publisher,
  supplier,
  department
) => {
  const data = await client.post(
    "api/method/education.smvss.library.advance_search_count",
    {
      main_title: main_title?.trim(),
      author_name: author_name?.trim(),
      subject_name: subject_name?.trim(),
      year_publish,
      edition,
      publisher: publisher?.trim(),
      supplier: supplier?.trim(),
      department: department?.trim(),
    }
  );
  return data;
};

const getAdvanceSearch = async (
  main_title,
  author_name,
  subject_name,
  year_publish,
  edition,
  publisher,
  supplier,
  department,
  order_by,
  limit_value
) => {
  const data = await client.post(
    "api/method/education.smvss.library.advance_search",
    {
      main_title: main_title?.trim(),
      author_name: author_name?.trim(),
      subject_name: subject_name?.trim(),
      year_publish,
      edition,
      publisher: publisher?.trim(),
      supplier: supplier?.trim(),
      department: department?.trim(),
      order_by,
      limit_value,
    }
  );
  return data;
};

const getExactMasterData = async (doctype, name) => {
  const data = await client.get(
    `/api/resource/${doctype}?fields=["name as label","name as value","name", "is_active"]&filters=[["name","=","${name?.trim()}"]]&order_by=name&limit_page_length=None`
  );
  return data;
};

const editAccNo = async (
  id,
  is_available,
  handled_by,
  status,
  is_reference
) => {
  const data = await client.put(`/api/resource/Lib Access Number/${id}`, {
    is_available,
    handled_by,
    status,
    is_reference,
  });
  return data;
};

const editAccessNoLog = async (
  access_number,
  previous_status,
  current_status
) => {
  const data = await client.post(`/api/resource/Lib Book Status Log`, {
    access_number,
    previous_status,
    current_status,
    user_id: sessionStorage.getItem("email"),
  });
  return data;
};

const findStatus = async (book_id) => {
  const data = await client.post(
    "/api/method/education.smvss.library.find_book_status",
    {
      book_id,
    }
  );
  return data;
};

const getStatus = async () => {
  const data = await client.get(
    `/api/resource/Lib Book Status?fields=["name as label", "name as value"]&filters=[["name","!=","Lost By Student"]]&order_by=name&limit_page_length=None`
  );
  return data;
};

const getSearchSupplier = async (value) => {
  const data = await client.get(
    `/api/resource/Supplier?fields=["supplier_name", "supplier_group","supplier_type","mobile_no"]&or_filters=[["supplier_name","like","%${value?.trim()}%"]]&limit_page_length=30&order_by=Creation desc`
  );
  return data;
};

const getAllColleges = async () => {
  const data = await client.post(
    "api/method/education.smvss.staff.get_all_colleges"
  );
  return data;
};

const searchLibraryMember = async (searchValue, type, institutionType) => {
  const data = await client.post(
    `/api/method/education.smvss.library.member_search`,
    {
      searchValue,
      type,
      institutionType,
    }
  );
  return data;
};

const getAccessNoDetail = async (access_number) => {
  const data = await client.get(
    `/api/method/education.smvss.library.get_access_number_detail`,
    {
      access_number,
    }
  );
  return data;
};

const getMemberNumberDetail = async (member_number, college_id) => {
  const data = await client.post(
    `/api/method/education.smvss.library.get_member_number_detail`,
    {
      member_number,
      college_id,
    }
  );
  return data;
};

const getBookDetail = async (id) => {
  const data = await client.get(`/api/resource/Lib Book/${id}`);
  return data;
};

const editBook = async (
  id,
  main_title,
  publisher,
  author_origin,
  book_department,
  book_type,
  isbn,
  call_number,
  rack_number,
  book_subject,
  author_name
) => {
  const data = await client.put(`/api/resource/Lib Book/${id}`, {
    main_title: main_title?.trim(),
    publisher: publisher?.trim(),
    author_origin,
    book_department: book_department?.trim(),
    book_type,
    isbn,
    call_number,
    rack_number,
    book_subject,
    author_name,
  });
  return data;
};

const getPublisherList = async () => {
  const data = await client.get(
    `/api/resource/Lib Department?fields=["name as label", "name as value"]&filters=[["is_active","=", 1]]&order_by=name&limit_page_length=None`
  );
  return data;
};

const checkDuplicateBookDetail = async (
  book_title,
  book_publisher,
  book_id
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.book_check",
    {
      book_title: book_title?.trim(),
      book_publisher: book_publisher?.trim(),
      book_id,
    }
  );
  return data;
};

const bookSearch = async (keyword, isTitle, limitValue) => {
  const data = await client.get(
    `/api/method/education.smvss.library.book_search`,
    {
      keyword,
      isTitle,
      limitValue,
    }
  );
  return data;
};

const studentDetailByEnrollNo = async (enrollNo) => {
  const data = await client.post(
    `/api/method/education.smvss.student.student_detail`,
    {
      enrollNo,
    }
  );
  return data;
};

const getSearchJournalSubject = async (value) => {
  const data = await client.get(
    `/api/resource/Lib JJournalSubject?fields=["description as label", "name as value"]&filters=[["isactive","=", 1]]&or_filters=[["description", "like", "${value?.trim()}%"],["description", "like", "%${value?.trim()}%"]]&order_by = description asc &limit_page_length=${
      string.PAGE_LIMIT
    }`
  );
  return data;
};

const getSearchEditor = async (value) => {
  const data = await client.get(
    `/api/resource/Lib JEditor?fields=["description as label", "name as value"]&filters=[["isactive","=", 1]]&or_filters=[["description", "like", "${value?.trim()}%"],["description", "like", "%${value?.trim()}%"]]&order_by = description asc &limit_page_length=${
      string.PAGE_LIMIT
    }`
  );
  return data;
};
const getSearchJoural = async (value) => {
  const data = await client.get(
    `/api/resource/Lib JJournal?fields=["description as label", "name as value"]&filters=[["isactive","=", 1]]&or_filters=[["description", "like", "${value?.trim()}%"],["description", "like", "%${value?.trim()}%"]]&order_by = description asc &limit_page_length=${
      string.PAGE_LIMIT
    }`
  );
  return data;
};

const getSubscriptionTypeList = async () => {
  const data = await client.get(
    `/api/resource/Lib JSubscriptionType?fields=["description as label", "name as value"]&filters=[["isactive","=", 1]]&order_by = description asc &limit_page_length=${string.PAGE_LIMIT}`
  );
  return data;
};

const getFrequencyList = async () => {
  const data = await client.get(
    `/api/resource/Lib JFrequency?fields=["description as label", "name as value","days"]&filters=[["isactive","=", 1]]&order_by = description asc &limit_page_length=${string.PAGE_LIMIT}`
  );
  return data;
};

const addJournalOrder = async (
  subscriptiontypeid,
  journalid,
  subscriptionnumber,
  isforeign,
  subscriptionfrom,
  subscriptionto,
  frequencyid,
  editorid,
  publisherid,
  supplierid,
  journalsubjectid,
  purchaseno,
  podate,
  amount,
  dcno,
  dcdate,
  paymodeid,
  bankid,
  remarks,
  collegeid
) => {
  const data = await client.post(`/api/resource/Lib JSubscription`, {
    subscriptiontypeid,
    journalid,
    subscriptionnumber,
    isforeign,
    subscriptionfrom,
    subscriptionto,
    frequencyid,
    editorid,
    publisherid,
    supplierid,
    journalsubjectid,
    purchaseno,
    podate,
    amount,
    dcno,
    dcdate,
    paymodeid,
    bankid,
    remarks,
    isactive: true,
    collegeid,
  });
  return data;
};

const getModeOfReceiptList = async () => {
  const data = await client.get(
    `/api/resource/Lib JModeReceipt?fields=["description as label","name as value"]&filters=[["isactive", "=", "1"]]&order_by = description asc &limit_page_length=None`
  );
  return data;
};

const getSupplementaryList = async () => {
  const data = await client.get(
    `/api/resource/Lib JSupplementary?fields=["description as label","name as value"]&filters=[["isactive", "=", "1"]]&order_by = name asc &limit_page_length=None`
  );
  return data;
};

const getJournalIDList = async (college_id, keyword) => {
  const data = await client.post(
    `/api/method/education.smvss.library.journal_search`,
    {
      keyword,
      college_id,
    }
  );
  return data;
};

const getJournalIDDetails = async (subscription_id) => {
  const data = await client.post(
    `/api/method/education.smvss.library.get_journal_detail`,
    {
      subscription_id,
    }
  );
  return data;
};

const addJournalReceipt = async (
  journalid,
  due_date,
  receive_date,
  modereceiptid,
  issue_date,
  issue_number,
  volume_number,
  period,
  pages,
  remarks,
  isactive = 1
) => {
  const data = await client.post("/api/resource/Lib JJournalReceive", {
    journalid,
    due_date,
    receive_date,
    modereceiptid,
    issue_date,
    issue_number,
    volume_number,
    period,
    pages,
    remarks,
    isactive,
  });
  return data;
};

const addSupplementary = async (
  journalid,
  supplementaryid,
  quantity,
  remark,
  isactive
) => {
  const data = await client.post("/api/resource/Lib JJournalXSupplementary", {
    journalid,
    supplementaryid,
    quantity,
    remark,
    isactive,
  });
  return data;
};

const addJournalMaster = async (doctype, description) => {
  const data = await client.post(`/api/resource/${doctype}`, {
    description,
    isactive: true,
  });
  return data;
};

const addSupplementaryMaster = async (description) => {
  const data = await client.post("/api/resource/Lib JSupplementary", {
    description,
    isactive: true,
  });
  return data;
};

const authenticate = async (user_id, form_name) => {
  const data = await client.post(
    `/api/method/education.smvss.library.find_access_right`,
    {
      user_id,
      form_name,
    }
  );
  return data;
};

const getOnHandBook = async (
  college_id,
  report_type,
  main_title,
  author_name,
  subject_name,
  call_number,
  year_of_publish,
  edition,
  publisher,
  supplier,
  book_type,
  access_no_from,
  access_no_to,
  department,
  from_date,
  to_date,
  member_number,
  isShowAll
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.on_hand_book_detail_report",
    {
      college_id,
      report_type,
      main_title,
      author_name,
      subject_name,
      call_number,
      year_of_publish,
      edition,
      publisher,
      supplier,
      book_type,
      access_no_from,
      access_no_to,
      department,
      from_date,
      to_date,
      member_number,
      isShowAll,
    }
  );
  return data;
};

const getSubject = async () => {
  const data = await client.get(
    `/api/resource/Lib Subject?fields=["name as label", "name as value"]&filters=[["is_active","=", 1]]&order_by = name asc&limit_page_length=None`
  );
  return data;
};

const getMasterAssignRole = async (docType, moduleID = null, roleID = null) => {
  const data = await client.post(
    `/api/method/education.smvss.library.get_master_for_assign_role_to_user`,
    {
      docType,
      moduleID,
      roleID,
    }
  );
  return data;
};

const updateRoleSetting = async (roleSettings) => {
  const data = await client.post(
    `/api/method/education.smvss.library.update_role_setting`,
    {
      roleSettings,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getBookDetailSearch = async (
  college_id,
  report_type,
  main_title,
  author_name,
  subject_name,
  call_number,
  year_of_publish,
  edition,
  publisher,
  supplier,
  book_type,
  access_no_from,
  access_no_to,
  department,
  from_date,
  to_date,
  member_number,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.library.book_detail_report`,
    {
      college_id,
      report_type,
      main_title,
      author_name,
      subject_name,
      call_number,
      year_of_publish,
      edition,
      publisher,
      supplier,
      book_type,
      access_no_from,
      access_no_to,
      department,
      from_date,
      to_date,
      member_number,
      isShowAll,
    }
  );
  return data;
};

const getDepartmentBookDetailSearch = async (
  college_id,
  report_type,
  main_title,
  author_name,
  subject_name,
  call_number,
  year_of_publish,
  edition,
  publisher,
  supplier,
  book_type,
  access_no_from,
  access_no_to,
  department,
  from_date,
  to_date,
  member_number,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.library.department_book_detail_report`,
    {
      college_id,
      report_type,
      main_title,
      author_name,
      subject_name,
      call_number,
      year_of_publish,
      edition,
      publisher,
      supplier,
      book_type,
      access_no_from,
      access_no_to,
      department,
      from_date,
      to_date,
      member_number,
      isShowAll,
    }
  );
  return data;
};

const getTitleWiseQtySearch = async (
  college_id,
  report_type,
  main_title,
  author_name,
  subject_name,
  call_number,
  year_of_publish,
  edition,
  publisher,
  supplier,
  book_type,
  access_no_from,
  access_no_to,
  department,
  from_date,
  to_date,
  member_number,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.library.library_title_wise_qty_report`,
    {
      college_id,
      report_type,
      main_title,
      author_name,
      subject_name,
      call_number,
      year_of_publish,
      edition,
      publisher,
      supplier,
      book_type,
      access_no_from,
      access_no_to,
      department,
      from_date,
      to_date,
      member_number,
      isShowAll,
    }
  );
  return data;
};

const getStatisticsReportSearch = async (
  college_id,
  report_type,
  main_title,
  author_name,
  subject_name,
  call_number,
  year_of_publish,
  edition,
  publisher,
  supplier,
  book_type,
  access_no_from,
  access_no_to,
  department,
  from_date,
  to_date,
  member_number,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.library.${report_type}`,
    {
      college_id,
      report_type,
      main_title,
      author_name,
      subject_name,
      call_number,
      year_of_publish,
      edition,
      publisher,
      supplier,
      book_type,
      access_no_from,
      access_no_to,
      department,
      from_date,
      to_date,
      member_number,
      isShowAll,
    }
  );
  return data;
};

const getManagementReportSearch = async (
  college_id,
  main_title,
  author_name,
  subject_name,
  call_number,
  year_of_publish,
  edition,
  publisher,
  supplier,
  book_type,
  access_no_from,
  access_no_to,
  department,
  from_date,
  to_date,
  member_number,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.library.book_details_with_price_report`,
    {
      college_id,
      main_title,
      author_name,
      subject_name,
      call_number,
      year_of_publish,
      edition,
      publisher,
      supplier,
      book_type,
      access_no_from,
      access_no_to,
      department,
      from_date,
      to_date,
      member_number,
      isShowAll,
    }
  );
  return data;
};

const getIssueReportSearch = async (
  college_id,
  report_type,
  main_title,
  author_name,
  subject_name,
  call_number,
  year_of_publish,
  edition,
  publisher,
  supplier,
  book_type,
  access_no_from,
  access_no_to,
  department,
  from_date,
  to_date,
  member_number,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.library.library_book_issue_report`,
    {
      college_id,
      report_type,
      main_title,
      author_name,
      subject_name,
      call_number,
      year_of_publish,
      edition,
      publisher,
      supplier,
      book_type,
      access_no_from,
      access_no_to,
      department,
      from_date,
      to_date,
      member_number,
      isShowAll,
    }
  );
  return data;
};

const getReturnReportSearch = async (
  college_id,
  report_type,
  main_title,
  author_name,
  subject_name,
  call_number,
  year_of_publish,
  edition,
  publisher,
  supplier,
  book_type,
  access_no_from,
  access_no_to,
  department,
  from_date,
  to_date,
  member_number,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.library.library_book_return_report`,
    {
      college_id,
      report_type,
      main_title,
      author_name,
      subject_name,
      call_number,
      year_of_publish,
      edition,
      publisher,
      supplier,
      book_type,
      access_no_from,
      access_no_to,
      department,
      from_date,
      to_date,
      member_number,
      isShowAll,
    }
  );
  return data;
};

const getPendingBookReportSearch = async (
  college_id,
  report_type,
  main_title,
  author_name,
  subject_name,
  call_number,
  year_of_publish,
  edition,
  publisher,
  supplier,
  book_type,
  access_no_from,
  access_no_to,
  department,
  from_date,
  to_date,
  member_number,
  isShowAll
) => {
  const data = await client.post(
    `/api/method/education.smvss.library.library_book_pending_report`,
    {
      college_id,
      report_type,
      main_title,
      author_name,
      subject_name,
      call_number,
      year_of_publish,
      edition,
      publisher,
      supplier,
      book_type,
      access_no_from,
      access_no_to,
      department,
      from_date,
      to_date,
      member_number,
      isShowAll,
    }
  );
  return data;
};

const saveUserSetting = async (
  user_id,
  employeeID,
  roleID,
  status,
  roleSettings
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.update_user_setting",
    {
      user_id,
      employeeID,
      roleID,
      status,
      roleSettings,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getUserSetting = async (user_id, role_id, module_id) => {
  const data = await client.post(
    "/api/method/education.smvss.library.get_user_setting",
    {
      user_id,
      role_id,
      module_id,
    }
  );
  return data;
};

const getJournalReport = async (
  college_id,
  report_type,
  subscription_type,
  journal_name,
  subscription_number,
  frequency,
  editor,
  publisher,
  supplier_name,
  journal_subject,
  author_type,
  due_status,
  mode_of_receipt,
  amount,
  pay_mode,
  bank,
  subscription_from,
  subscription_to,
  isShowAll
) => {
  const data = await client.post(
    "/api/method/education.smvss.library.journal_detail_report",
    {
      college_id,
      report_type,
      subscription_type,
      journal_name,
      subscription_number,
      frequency,
      editor,
      publisher,
      supplier_name,
      journal_subject,
      author_type,
      due_status,
      mode_of_receipt,
      amount,
      pay_mode,
      bank,
      subscription_from,
      subscription_to,
      isShowAll,
    }
  );
  return data;
};

const getFormList = async (moduleID) => {
  const data = await client.post(
    "/api/method/education.smvss.library.get_form_data_by_module",
    {
      moduleID,
    }
  );
  return data;
};

const addorUpdateForm = async (moduleID, formID, form, formLink, isActive) => {
  const data = await client.post(
    "/api/method/education.smvss.library.add_or_update_form",
    {
      moduleID,
      formID,
      form,
      formLink,
      isActive,
      modifiedBy: sessionStorage.getItem("email"),
    }
  );
  return data;
};

const getCollegeConfigData = async (collegeID, key) => {
  const data = await client.post(
    `/api/method/education.smvss.library.get_config_data`,
    {
      collegeID,
      key,
    }
  );
  return data;
};

const upDateConfig = async (configID, collegeID, key, value) => {
  const data = await client.post(
    `/api/method/education.smvss.library.add_or_update_config`,
    {
      configID,
      collegeID,
      key,
      value,
    }
  );
  return data;
};

const getPageConfigData = async (instituteID, moduleID, formID) => {
  const data = await client.post(
    `/api/method/education.smvss.library.get_page_config`,
    {
      instituteID,
      moduleID,
      formID,
    }
  );
  return data;
};

const getComponentList = async (formID) => {
  const data = await client.post(
    `/api/method/education.smvss.library.get_all_components`,
    {
      formID,
    }
  );
  return data;
};

const upDatePageConfig = async (
  pageConfigID,
  instituteID,
  moduleID,
  formID,
  form,
  value,
  attributeValue
) => {
  const data = await client.post(
    `/api/method/education.smvss.library.add_or_update_page_config`,
    {
      pageConfigID,
      instituteID,
      moduleID,
      formID,
      form,
      value,
      attributeValue,
    }
  );
  return data;
};

const getRenameConfig = async () => {
  const data = await client.post(
    "/api/method/education.smvss.library.get_rename_config"
  );
  return data;
};

// get_user_setting_by_user_id
const getUserSettingByUser = async (user_id) => {
  const data = await client.post(
    "/api/method/education.smvss.library.get_user_setting_by_user_id",
    {
      user_id,
    }
  );
  return data;
};

const resetPassword = async (email, old_password, new_password) => {
  const data = await client.post(
    "/api/method/education.smvss.library.update_password",
    {
      email,
      old_password,
      new_password,
    }
  );
  return data;
};

const addComponent = async (moduleID, formID, elementID, value) => {
  const data = await client.post(
    "/api/method/education.smvss.library.add_component",
    {
      moduleID,
      formID,
      elementID,
      value,
    }
  );
  return data;
};

export default {
  addAccessNumber,
  checkAccessNumber,
  getDeptList,
  getBookTypeList,
  getBookById,

  getBookIssueByEnrollNo,
  getAccessNoById,
  getLibrarySetting,
  addBookIssue,
  updateAvailableAccessNo,
  getAccessNumber,
  filterAccess,
  getBookTitle,
  editBookIssue,
  updateAccessnumber,

  editLibrarySetting,
  getAuthor,
  getPublisher,
  viewLibrarySetting,

  checkMemberShip,
  getAccessNumberList,
  getBookDetailReport,

  getAuthorBySearch,
  getPublisherBySearch,

  bookIssueReport,
  bookReturnReport,
  addAuthorName,
  addPubisher,
  addDepartment,
  addSubject,
  addBookType,
  addSupplier,
  getStudentImage,
  getBookDetailQty,
  getPendingBooks,

  getMemberShipList,
  viewMemberShip,
  editMemberShip,
  getMasterList,
  getMembership,
  getLibraryConfiguration,
  addBook,
  getBookByTitle,
  getSupplierBySearch,
  getBookDetailById,
  libPurchase,
  libPurchaseDetail,
  getSupplierGroupList,
  getPurchaseDetailId,
  getSearchLibraryMember,
  editMaster,
  editMasterStatus,
  getBookName,
  getBookNameByTitle,
  addSupplierAddress,
  addBookIssueFineAmount,
  addMaster,
  getAllBook,
  getBookPurchaseDetail,
  getBookPurchasebyID,
  getBookPurchaseOrderbyID,
  getBookAccessNo,
  getMastersTotalCount,
  getAllAccessNumber,
  getAccessNumberDetail,
  getAllSupplierList,
  viewSupplier,
  viewSupplierAddress,
  editSupplierDetails,
  editSupplierAddress,
  getSupplierAddressId,
  getTitlebySearch,
  findAccessFromTitle,
  bookReturnFineAmountReport,
  getBookPurchaseDetailReport,
  getBookPurchaseDetailReportCount,
  validateSupplier,
  getSearchSubjectList,
  getMasterData,
  checkDuplicateBook,
  getAdvanceSearch,
  getAdvanceSearchCount,
  getExactMasterData,
  editAccNo,
  findStatus,
  getStatus,
  bookIssueReportCount,
  getBookDetailReportCount,
  getPendingBookCount,
  getBookDetailQtyCount,
  bookReturnReportCount,
  bookReturnFineReportCount,
  editAccessNoLog,
  uploadFile,
  getSearchSupplier,
  getAllColleges,
  searchLibraryMember,
  getAccessNoDetail,
  getMemberNumberDetail,
  getBookDetail,
  editBook,
  getPublisherList,
  checkDuplicateBookDetail,
  bookSearch,
  studentDetailByEnrollNo,
  getSearchJournalSubject,
  getSearchEditor,
  getSearchJoural,
  getSubscriptionTypeList,
  getFrequencyList,
  addJournalOrder,
  getModeOfReceiptList,
  getSupplementaryList,
  getJournalIDList,
  getJournalIDDetails,

  addJournalReceipt,
  addSupplementary,
  addJournalMaster,
  addSupplementaryMaster,
  getOnHandBook,
  getSubject,
  getMasterAssignRole,
  updateRoleSetting,
  getBookDetailSearch,
  getDepartmentBookDetailSearch,
  getTitleWiseQtySearch,
  getStatisticsReportSearch,
  getManagementReportSearch,
  getIssueReportSearch,
  getReturnReportSearch,
  getPendingBookReportSearch,
  getUserSetting,
  getBookAuthorPublisherByKeyword,
  getJournalReport,
  authenticate,
  saveUserSetting,
  getBookPurchasebyPuchaseID,
  getFormList,
  addorUpdateForm,
  upDateConfig,
  getCollegeConfigData,
  getPageConfigData,
  getComponentList,
  upDatePageConfig,
  getRenameConfig,
  getUserSettingByUser,
  resetPassword,
  addComponent,
};
