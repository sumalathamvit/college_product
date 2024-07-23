const MenuArrayFunctionSchool = () => {
  return [
    {
      title: "Home",
      class: "",
      subMenu: [],
      icon: "Home",
      // link: "/home",
      link: "/library-dashboard",
      mainTitleID: 1,
      subTitleID: 1,
    },
    {
      title: "Student",
      class: "",
      mainTitleID: 4,
      subMenu: [
        {
          title: "Billing",
          class: "",
          subTitleID: 15,
          subData: [
            {
              title: "Billing",
              link: "/payment-entry",
              icon: "ReceiptLongRounded",
            },
            // {
            //   title: "Bill Transfer",
            //   link: "/bill-transfer",
            //   icon: "MoveUpRounded",
            // },
            // {
            //   title: "Bill Refund",
            //   link: "/bill-refund",
            //   icon: "PublishedWithChangesRounded",
            // },
            {
              title: "Bill Refund",
              link: "/bill-refund-student",
              icon: "PublishedWithChangesRounded",
            },
            {
              title: "Bill Refund",
              link: "/bill-refund-all",
              icon: "PublishedWithChangesRounded",
              noMenu: 1,
            },
            {
              title: "Miscellaneous Billing",
              link: "/miscellaneous-billing",
              icon: "ReceiptLongRounded",
            },
            {
              title: "Student Concession",
              icon: "TrendingDownTwoTone",
              subMenu: [
                {
                  title: "Student Concession",
                  link: "/fee-concession",
                  icon: "TrendingDownTwoTone",
                },
                {
                  title: "Office Approval",
                  link: "/fee-concession-accountant",
                  icon: "HowToRegRounded",
                },
                {
                  title: "Management Approval",
                  link: "/fee-concession-ao",
                  icon: "HowToRegRounded",
                },
              ],
            },
            {
              title: "Cancel Concession",
              link: "/cancel-fees-concession",
              icon: "HowToRegRounded",
            },
            {
              title: "Fees Modification",
              icon: "HowToRegRounded",
              subMenu: [
                {
                  title: "Common Fees Modification",
                  link: "/fee-modification",
                  icon: "HowToRegRounded",
                },
                {
                  title: "Office Approval",
                  link: "/fee-modification-accountant",
                  icon: "HowToRegRounded",
                },
                {
                  title: "Management Approval",
                  link: "/fee-modification-ao",
                  icon: "HowToRegRounded",
                },
              ],
            },
            {
              title: "Student Permission",
              link: "/add-fee-permission",
              icon: "InventoryRounded",
            },
            {
              link: "/view-payment-entry",
              title: "View Bill",
              icon: "ReceiptRounded",
            },
            {
              link: "/view-mis-bill",
              title: "View Miscellaneous Bill",
              icon: "ReceiptRounded",
            },
          ],
        },
        {
          title: "Admission",
          class: "",
          subTitleID: 16,
          subData: [
            { title: "Admission", link: "/registration", icon: "PersonAdd" },
            {
              title: "Pending Application",
              link: "/student-list",
              icon: "PendingActions",
            },
            {
              title: "Application Update",
              link: "/edit-school-student",
              icon: "BorderColor",
              noMenu: 1,
            },
            {
              title: "Application",
              link: "/view-student",
              icon: "Portrait",
            },
            {
              title: "Apply Joining Date",
              link: "/date-of-joining",
              icon: "ManageAccounts",
            },
          ],
        },
        {
          title: "Activity Group",
          class: "",
          subTitleID: 61,
          subData: [
            {
              link: "/activity-group",
              title: "Activity Group",
              icon: "School",
            },
          ],
        },
        {
          title: "Hostel",
          subTitleID: 17,
          subData: [
            {
              title: "Hostel Admission",
              link: "/hostel-admission",
              icon: "School",
            },
            {
              title: "Hostel Attendance",
              link: "/hostel-attendance",
              icon: "School",
            },
          ],
        },
        {
          title: "Bus Pass Registration",
          subTitleID: 18,
          subData: [
            {
              link: "/bus-pass-registeration",
              title: "Bus Pass Registration",
              icon: "DirectionsBus",
            },
          ],
        },
        {
          title: "Fees Structure",
          class: "",
          subTitleID: 19,
          subData: [
            {
              title: "Opening Fees",
              link: "/add-fee-structure",
              icon: "ViewList",
            },

            {
              title: "Common Fees",
              link: "/assign-fee",
              icon: "AssignmentTurnedIn",
            },
            {
              title: "Exam Fees",
              link: "/view-fees",
              icon: "Payment",
            },
          ],
        },
        // {
        //   title: "Certificate",
        //   class: "",
        //   subTitleID: 21,
        //   subData: [
        //     // {
        //     //   title: "Bonafide Certificate",
        //     //   link: "/bonafide-certificate",
        //     //   icon: "ManageAccounts",
        //     // },
        //     // {
        //     //   title: "Course Completion Certificate",
        //     //   link: "/view-course-completion",
        //     //   icon: "ManageAccounts",
        //     // },
        //     // {
        //     //   title: "Transfer Certificate",
        //     //   link: "/view-transfer-certificate",
        //     //   icon: "ManageAccounts",
        //     // },
        //   ],
        // },

        {
          title: "Master",
          class: "",
          subTitleID: 58,
          subData: [
            {
              title: "Particulars",
              link: "/particular-list",
              icon: "School",
            },
            {
              title: "Batch",
              link: "/batch-list",
              icon: "School",
            },
          ],
        },

        {
          title: "Report",
          class: "",
          subTitleID: 20,
          subData: [
            // {
            //   title: "Master",
            //   link: "/student-master-report",
            //   icon: "School",
            // },
            {
              title: "Student Report",
              icon: "School",
              subMenu: [
                {
                  title: "Student",
                  link: "/student-detail-report",
                  icon: "School",
                },
                {
                  title: "Student Admission",
                  link: "/student-admission-report",
                  icon: "School",
                },
                {
                  title: "Student Address",
                  link: "/student-address-report",
                  icon: "School",
                },
                {
                  title: "Student Type",
                  link: "/student-type-report",
                  icon: "School",
                },
                // {
                //   title: "Student Scholarship",
                //   link: "/student-scholarship-report",
                //   icon: "School",
                // },
              ],
            },
            {
              title: "Fees Structure",
              link: "/fee-structure-list",
              icon: "MapsUgc",
            },
            {
              title: "Student Opening Fees View",
              link: "/view-fee-structure",
              icon: "ViewList",
              noMenu: 1,
            },
            {
              title: "Exam Fees Report",
              link: "/view-fees-report",
              icon: "CalendarMonth",
            },
            {
              title: "Student Payment & Due",
              link: "/student-payment-report",
              icon: "CurrencyRupee",
            },
            {
              title: "Due Report",
              icon: "PaymentsOutlined",
              subMenu: [
                {
                  link: "/due-abstract",
                  title: "Due Abstract",
                  icon: "PaymentsOutlined",
                },
                {
                  link: "/overall-due-abstract",
                  title: "Overall Due Abstract",
                  icon: "PaymentsOutlined",
                },
                {
                  link: "/due-particulars-wise",
                  title: "Due Particulars wise",
                  icon: "PaymentsOutlined",
                },
                {
                  link: "/all-due-particularwise",
                  title: "All Due Particulars wise",
                  icon: "PaymentsOutlined",
                },
                {
                  link: "/all-due-particulars-name-wise",
                  title: "All Due Particulars Name wise",
                  icon: "PaymentsOutlined",
                },
                {
                  link: "/due-summary",
                  title: "Due Summary",
                  icon: "PaymentsOutlined",
                },
                {
                  link: "/due-particular-wise-nonpayer",
                  title: "Due Particular wise Nonpayer",
                  icon: "PaymentsOutlined",
                },
                // {
                //   link: "/due-college-Hostel-fees",
                //   title: "Due College and Hostel Fees",
                //   icon: "PaymentsOutlined",
                // },
                // {
                //   link: "/consolidated-due-college-Hostel-fees",
                //   title: "Cons. College and Hostel Fees",
                //   icon: "PaymentsOutlined",
                // },
              ],
            },
            {
              title: "Billing Report",
              icon: "CurrencyRupee",
              subMenu: [
                {
                  title: "OverAll Bill Collection",
                  link: "/overall-bill-collection-report",
                  icon: "CurrencyRupee",
                },
                {
                  title: "Collection",
                  link: "/bill-collection-report",
                  icon: "CurrencyRupee",
                },
                {
                  title: "Collection Bill No. Wise",
                  link: "/collection-billnowise-report",
                  icon: "CurrencyRupee",
                },
                {
                  title: "OverAll Transport Collection",
                  link: "/transport-collection-report",
                  icon: "CurrencyRupee",
                },
                {
                  title: "Collection PayMode",
                  link: "/collection-paymode-report",
                  icon: "CurrencyRupee",
                },
                {
                  title: "Bill Transfer & Refund Abstract",
                  link: "/transfer-refund-abstract-report",
                  icon: "CurrencyRupee",
                },
                {
                  title: "Particulars Wise Abstract",
                  link: "/particularwise-abstract-report",
                  icon: "CurrencyRupee",
                },
                {
                  title: "Abstract",
                  link: "/abstract-mis-report",
                  icon: "CurrencyRupee",
                },
                {
                  link: "/miscellaneous-billing-report",
                  title: "Miscellaneous Billing",
                  icon: "CurrencyRupee",
                },
              ],
            },
            {
              title: "Hostel Report",
              icon: "CurrencyRupee",
              subMenu: [
                {
                  title: "Hostel Occupancy",
                  link: "/hostel-occupancy-report",
                  icon: "School",
                },
                {
                  title: "Hostel Occupancy Statistic",
                  link: "/hostel-occupancy-statistics",
                  icon: "School",
                },
                {
                  title: "Hostel Attendance",
                  link: "/hostel-attendance-report",
                  icon: "School",
                },
                {
                  title: "Hostel Attendance Statistic",
                  link: "/hostel-attendance-statistics",
                  icon: "School",
                },
              ],
            },
            // {
            //   title: "Bus Pass Report",
            //   icon: "DirectionsBus",
            //   subMenu: [
            //     {
            //       title: "Bus Pass",
            //       link: "/bus-pass-report",
            //       icon: "School",
            //     },
            //     {
            //       title: "Register",
            //       link: "/bus-pass-register-report",
            //       icon: "School",
            //     },
            //     {
            //       title: "Register Batch Wise",
            //       link: "/bus-pass-batchwise-report",
            //       icon: "School",
            //     },
            //     {
            //       title: "Statistics",
            //       link: "/bus-pass-statistics-report",
            //       icon: "School",
            //     },
            //     {
            //       title: "Statistics Gender Wise",
            //       link: "/bus-pass-statistics-genderwise-report",
            //       icon: "School",
            //     },
            //   ],
            // },
            {
              link: "/fee-concession-report",
              title: "Student Fees Concession",
              icon: "PaymentsOutlined",
            },

            // {
            //   link: "/student-statistics",
            //   title: "Student Statistics",
            //   icon: "StackedLineChart",
            // },

            // {
            //   link: "/student-strength",
            //   title: "Student Strength",
            //   icon: "StackedLineChart",
            // },
          ],
        },
      ],
    },
    {
      title: "Academic",
      class: "",
      mainTitleID: 5,
      subMenu: [
        {
          title: "Attendance",
          class: "",
          subTitleID: 23,
          subData: [
            // {
            //   title: "Student Attendance",
            //   link: "/student-attendance",
            //   icon: "School",
            // },
            {
              title: "Student Attendance",
              link: "/school-student-attendance",
              icon: "School",
            },
            {
              link: "/attendance-config",
              title: "Attendance Configuration",
              icon: "School",
            },
          ],
        },
        {
          title: "Digital Diary",
          class: "",
          subTitleID: 21,
          subData: [
            {
              title: "Digital Diary",
              link: "/digital-diary",
              icon: "School",
            },
            {
              title: "Digital Diary List",
              link: "/digital-diary-list",
              icon: "School",
            },
            {
              title: "View Digital Diary",
              link: "/view-digital-diary",
              icon: "School",
              noMenu: 1,
            },
          ],
        },
        {
          title: "Student Performance",
          class: "",
          subTitleID: 22,
          subData: [
            {
              title: "Performance",
              link: "/student-performance-internal",
              icon: "School",
            },
            {
              title: "Internal Performance",
              link: "/student-internal",
              icon: "School",
            },
          ],
        },
        {
          title: "Subject Allocation",
          class: "",
          subTitleID: 50,
          subData: [
            {
              title: "Class and Subject",
              link: "/student-allotment",
              icon: "School",
            },
            {
              title: "Staff and Subject",
              link: "/subject-allotment",
              icon: "School",
            },
          ],
        },

        {
          title: "Student Group",
          class: "",
          subTitleID: 40,
          subData: [
            {
              link: "/university-number-update",
              title: "RegNo & Section",
              icon: "School",
            },

            {
              link: "/assign-student-group",
              title: "Student Group",
              icon: "School",
            },
          ],
        },
        {
          title: "Master",
          class: "",
          subTitleID: 24,
          subData: [
            { title: "Regulation", link: "/regulation", icon: "School" },
            { title: "Subject Master", link: "/subject-list", icon: "School" },
            {
              link: "/add-subject",
              title: "Subject",
              icon: "School",
            },
            {
              title: "Course and Subject",
              link: "/batch-subject",
              icon: "School",
            },

            {
              link: "/topic-upload",
              title: "Topic Upload",
              icon: "School",
            },
            {
              link: "/topic-list",
              title: "Subject Topic",
              icon: "School",
            },
          ],
        },

        {
          title: "Report",
          class: "",
          subTitleID: 26,
          subData: [
            {
              title: "Student Name",
              link: "/student-name-list",
              icon: "School",
            },
            {
              title: "Performance Report",
              link: "/student-performance-internal-report",
              icon: "School",
            },
            // {
            //   title: "Attendance Report",
            //   link: "/student-attendance-report",
            //   icon: "School",
            // },
            {
              title: "Attendance Report",
              link: "/school-attendance-report",
              icon: "School",
            },
          ],
        },
      ],
    },
    {
      title: "LMS",
      class: "",
      mainTitleID: 5,
      subMenu: [
        {
          title: "Course",
          class: "",
          subTitleID: 75,
          subData: [
            {
              title: "Courses",
              link: "/course-list",
              icon: "School",
            },
            {
              title: "New Course",
              link: "/lms-new-course",
              icon: "School",
              noMenu: 1,
            },
            {
              title: "Chapters",
              link: "/chapter-list",
              icon: "School",
              noMenu: 1,
            },
            {
              title: "Topics",
              link: "/lms-topic-list",
              icon: "School",
              noMenu: 1,
            },
            {
              title: "Topic",
              link: "/new-lms-topic",
              icon: "School",
              noMenu: 1,
            },
            {
              title: "View Topic",
              link: "/view-lms-topic",
              icon: "School",
              noMenu: 1,
            },
            // {
            //   title: "Course Assigned",
            //   link: "/assign-course",
            //   icon: "School",
            //   noMenu: 1,
            // },
          ],
        },

        {
          title: "Course Assign",
          class: "",
          subTitleID: 120,
          subData: [
            {
              title: "Course Assign",
              link: "/assign-course",
              icon: "School",
            },
            {
              title: "Course Progress",
              link: "/course-progress",
              icon: "School",
            },
            // {
            //   title: "Quiz Question",
            //   link: "/quiz-question",
            //   icon: "School",
            // },
          ],
        },
        // {
        //   title: "Quiz",
        //   class: "",
        //   subTitleID: 100,
        //   subData: [
        //     {
        //       title: "Quiz List",
        //       link: "/quiz-list",
        //       icon: "School",
        //     },
        //     // {
        //     //   title: "Test Quiz",
        //     //   link: "/quiz-test",
        //     //   icon: "School",
        //     // },
        //     // {
        //     //   title: "Quiz Question",
        //     //   link: "/quiz-question",
        //     //   icon: "School",
        //     // },
        //   ],
        // },
      ],
    },
    // {
    //   title: "Inventory",
    //   class: "",
    //   mainTitleID: 8,
    //   subMenu: [
    //     {
    //       title: "Product",
    //       class: "",
    //       subTitleID: 27,
    //       subData: [
    //         {
    //           title: "Add Product",
    //           link: "/add-product",
    //           icon: "Inventory",
    //         },
    //       ],
    //     },
    //     {
    //       title: "Master",
    //       class: "",
    //       subTitleID: 45,
    //       subData: [
    //         {
    //           title: "Brand",
    //           link: "/brand",
    //           icon: "AddComment",
    //         },
    //         {
    //           title: "Item Group",
    //           link: "/item-group",
    //           icon: "AddComment",
    //         },
    //         {
    //           title: "Asset Category",
    //           link: "/asset-category",
    //           icon: "AddComment",
    //         },
    //         {
    //           title: "UOM",
    //           link: "/uom",
    //           icon: "AddComment",
    //         },
    //         {
    //           title: "Item Attribute",
    //           link: "/item-attribute",
    //           icon: "AddComment",
    //         },
    //         {
    //           title: "Tax Category",
    //           link: "/tax-category",
    //           icon: "AddComment",
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      title: "Library",
      class: "",
      mainTitleID: 3,
      subMenu: [
        {
          title: "Issue & Return",
          class: "",
          subTitleID: 6,
          subData: [
            { title: "Issue", link: "/book-issue", icon: "LocalLibrary" },
            {
              title: "Return",
              link: "/book-return",
              icon: "LocalLibrary",
            },
          ],
        },
        {
          title: "Search",
          class: "",
          subTitleID: 8,
          subData: [
            {
              title: "Search",
              link: "/library-advanced-search",
              icon: "LocalLibrary",
            },
          ],
        },
        {
          title: "Book",
          class: "",
          subTitleID: 9,
          subData: [
            {
              title: "Book Title",
              link: "/book-detail-list",
              icon: "LocalLibrary",
            },
            { title: "Find Book", link: "/find-book", icon: "LocalLibrary" },
            {
              link: "/book-detail",
              title: "Book Purchase",
              icon: "LocalLibrary",
            },
            {
              link: "/book-purchase-detail",
              title: "Purchase",
              icon: "LocalLibrary",
            },
            {
              link: "/book-detail-view",
              title: "Book",
              icon: "LocalLibrary",
              noMenu: 1,
            },
            {
              link: "/book-access-number",
              title: "Book Setting",
              icon: "LocalLibrary",
            },
          ],
        },
        {
          title: "Journal",
          class: "",
          subTitleID: 10,
          subData: [
            {
              title: "Journal Order",
              link: "/journal-order",
              icon: "LocalLibrary",
            },
            {
              title: "Journal Receipt",
              link: "/journal-receipt",
              icon: "LocalLibrary",
            },
          ],
        },
        {
          title: "Library Member",
          class: "",
          subTitleID: 11,
          subData: [
            {
              title: "Library Member",
              link: "/library-memberShip-list",
              icon: "LocalLibrary",
            },
          ],
        },
        {
          title: "Master",
          class: "",
          subTitleID: 12,
          subData: [
            {
              link: "/library-master-list",
              title: "All Master",
              icon: "LocalLibrary",
            },
            {
              link: "/add-title",
              title: "Add Title",
              icon: "LocalLibrary",
            },
            {
              link: "/add-supplier",
              title: "Add Supplier",
              icon: "LocalLibrary",
            },
            {
              link: "/supplier-list",
              title: "Supplier Information",
              icon: "LocalLibrary",
            },
          ],
        },

        {
          title: "Report",
          class: "",
          subTitleID: 13,
          subData: [
            // { title: "Library Report" },
            // {
            //   link: "/journal-report",
            //   title: "Journal Report",
            //   icon: "LocalLibrary",
            // },
            {
              title: "Journal Report",
              icon: "LocalLibrary",
              subMenu: [
                {
                  title: "Title Wise",
                  link: "/journal-titlewise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Subject Wise",
                  link: "/journal-subjectwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Publisher Wise",
                  link: "/journal-publisherwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Supplier Wise",
                  link: "/journal-supplierwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Frequency Wise",
                  link: "/journal-frequencywise",
                  icon: "LocalLibrary",
                },
              ],
            },
            {
              title: "Book Report",
              icon: "LocalLibrary",
              subMenu: [
                {
                  title: "Book",
                  link: "/book-detail-report",
                  icon: "LocalLibrary",
                },
                {
                  title: "Access No. Wise",
                  link: "/book-detail-accessnowise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Title Wise",
                  link: "/book-detail-titlewise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Title Subject Wise",
                  link: "/book-detail-title-subjectwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Subject Wise AccessNo.",
                  link: "/book-detail-subjectwise-accessno",
                  icon: "LocalLibrary",
                },
              ],
            },
            {
              title: "Dept Book Report",
              icon: "LocalLibrary",
              subMenu: [
                {
                  title: "Access No. Wise",
                  link: "/department-book-accessno",
                  icon: "LocalLibrary",
                },
                {
                  title: "Subject Wise",
                  link: "/department-book-subjectwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Title Wise",
                  link: "/department-book-titlewise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Subject Wise",
                  link: "/department-book-dept-subjectwise",
                  icon: "LocalLibrary",
                },
              ],
            },
            {
              title: "Title Wise Qty Report",
              icon: "LocalLibrary",
              subMenu: [
                {
                  title: "Subject Wise",
                  link: "/title-subjectwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Title Wise",
                  link: "/titlewise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Author Wise",
                  link: "/title-authorwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Edition Wise",
                  link: "/title-editionwise",
                  icon: "LocalLibrary",
                },
              ],
            },
            {
              title: "Statistics Report",
              icon: "LocalLibrary",
              subMenu: [
                {
                  title: "Library Book",
                  link: "/book-statistics",
                  icon: "LocalLibrary",
                },
                {
                  title: "Library Issue / Return",
                  link: "/issue-return-statistics",
                  icon: "LocalLibrary",
                },
              ],
            },
            {
              link: "/management-report",
              title: "Management Report",
              icon: "LocalLibrary",
            },
            {
              title: "Book Issue Report",
              icon: "LocalLibrary",
              subMenu: [
                {
                  title: "Day wise",
                  link: "/book-issue-daywise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Week wise",
                  link: "/book-issue-weekwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Month wise",
                  link: "/book-issue-monthwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Student Day wise",
                  link: "/student-book-issue-daywise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Student Week wise",
                  link: "/student-book-issue-weekwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Student Month wise",
                  link: "/student-book-issue-monthwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Staff Day wise",
                  link: "/staff-book-issue-daywise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Staff Week wise",
                  link: "/staff-book-issue-weekwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Staff Month wise",
                  link: "/staff-book-issue-monthwise",
                  icon: "LocalLibrary",
                },
              ],
            },
            {
              title: "Book Return Report",
              icon: "LocalLibrary",
              subMenu: [
                {
                  title: "Day wise",
                  link: "/book-return-daywise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Week wise",
                  link: "/book-return-weekwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Month wise",
                  link: "/book-return-monthwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Student Day wise",
                  link: "/student-book-return-daywise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Student Week wise",
                  link: "/student-book-return-weekwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Student Month wise",
                  link: "/student-book-return-monthwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Staff Day wise",
                  link: "/staff-book-return-daywise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Staff Week wise",
                  link: "/staff-book-return-weekwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Staff Month wise",
                  link: "/staff-book-return-monthwise",
                  icon: "LocalLibrary",
                },
              ],
            },
            {
              title: "Book Pending Report",
              icon: "LocalLibrary",
              subMenu: [
                {
                  title: "Day wise",
                  link: "/book-pending-daywise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Week wise",
                  link: "/book-pending-weekwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Month wise",
                  link: "/book-pending-monthwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Student Day wise",
                  link: "/student-book-pending-daywise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Student Week wise",
                  link: "/student-book-pending-weekwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Student Month wise",
                  link: "/student-book-pending-monthwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Staff Day wise",
                  link: "/staff-book-pending-daywise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Staff Week wise",
                  link: "/staff-book-pending-weekwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Staff Month wise",
                  link: "/staff-book-pending-monthwise",
                  icon: "LocalLibrary",
                },
              ],
            },
            {
              title: "On Hand Book Report",
              icon: "LocalLibrary",
              subMenu: [
                {
                  title: "Access No. Wise",
                  link: "/on-hand-book-accessnowise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Title Wise Quantity",
                  link: "/on-hand-book-titlewise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Subject Wise Quantity",
                  link: "/on-hand-book-subjectwise",
                  icon: "LocalLibrary",
                },
                {
                  title: "Subject Wise With Access No.",
                  link: "/on-hand-book-subject-accessnowise",
                  icon: "LocalLibrary",
                },
              ],
            },
            {
              link: "/book-purchase-report",
              title: "Book Purchase Report",
              icon: "LocalLibrary",
            },
          ],
        },
        {
          title: "Library Setting",
          class: "",
          subTitleID: 14,
          subData: [
            {
              link: "/library-setting",
              title: "Library Setting",
              icon: "LocalLibrary",
            },
          ],
        },
      ],
    },
    {
      title: "Human Resource",
      class: "",
      mainTitleID: 2,

      subMenu: [
        {
          title: "Employee",
          subTitleID: 1,
          subData: [
            {
              title: "New Employee",
              link: "/add-employee",
              icon: "Assessment",
            },
            {
              link: "/employee-list",
              title: "Pending Employee",
              icon: "ViewList",
            },
            {
              link: "/view-employee",
              title: "View Employee",
              icon: "LibraryAdd",
            },
            {
              title: "Group Employee",
              link: "/employee-group",
              icon: "School",
            },
            {
              title: "Relieving Employee",
              link: "/employee-relieve",
              icon: "ExitToApp",
            },
            {
              link: "/edit-employee",
              title: "Edit Employee",
              icon: "ModeEditOutline",
              noMenu: 1,
            },
          ],
        },
        {
          title: "Leave Management",
          class: "",
          subTitleID: 3,
          subData: [
            {
              title: "Absentees",
              link: "/leave-entry-absentee",
              icon: "DoneAll",
            },
            {
              link: "/permission-entry",
              title: "Permission",
              icon: "DoneAll",
            },
            {
              title: "Permission Cancel",
              link: "/permission-cancel",
              icon: "RemoveDone",
            },
            { title: "Leave", link: "/leave-entry", icon: "DoneAll" },
            {
              title: "Leave Cancel",
              link: "/leave-cancel",
              icon: "RemoveDone",
            },
            { title: "Tour", link: "/tour-entry", icon: "RemoveDone" },
            {
              title: "Compensation Leave",
              link: "/compensation-off",
              icon: "Rule",
            },
            // {
            //   title: "Biometric Modification",
            //   link: "/update-biometric",
            //   icon: "Approval",
            // },
            {
              title: "Manual Attendance",
              link: "/add-employee-attendance",
              icon: "DoneAll",
            },
            {
              title: "Leave Account",
              link: "/el-cl-updation",
              icon: "CalendarMonth",
            },
          ],
        },
        {
          title: "Increment & Promotion",
          subTitleID: 2,
          subData: [
            {
              link: "/increment",
              title: "Increment",
              icon: "SignalCellularAlt",
            },
            {
              title: "Modify Increment Date",
              link: "/increment-date-detail",
              icon: "SignalCellularAlt",
            },
            { title: "Promotion", link: "/promotion", icon: "TrendingUp" },
          ],
        },
        {
          title: "Paybill",
          subTitleID: 6,
          subData: [
            {
              link: "/arrear-split-up",
              title: "Arrear",
              icon: "ViewList",
            },
            {
              title: "Allowance & Deduction",
              link: "/reset-allowance-deduction",
              icon: "SyncProblem",
            },
            {
              title: "Generate PayBill",
              link: "/process-attendance",
              icon: "CurrencyRupee",
            },
            {
              link: "/salary-slip-list",
              title: "Finalize Paybill",
              icon: "CurrencyRupee",
            },
            {
              title: "View Salary Slip",
              link: "/view-salary-slip",
              icon: "ReceiptRounded",
              noMenu: 1,
            },
            {
              link: "/edit-salary-slip",
              title: "Update Paybill",
              icon: "CurrencyRupee",
              noMenu: 1,
            },
          ],
        },

        {
          title: "Master",
          class: "",
          subTitleID: 4,
          subData: [
            {
              link: "/holiday-master",
              title: "Holiday Master",
              icon: "CalendarMonth",
            },
            {
              link: "/employee-qualification-list",
              title: "Employee Qualification",
              icon: "School",
            },
            {
              link: "/designation-list",
              title: "Designation",
              icon: "School",
            },
            {
              link: "/designation-category-list",
              title: "Designation Category",
              icon: "School",
            },
          ],
        },
        {
          title: "Report",
          class: "",
          subTitleID: 5,
          subData: [
            {
              title: "Holiday",
              link: "/holiday-list",
              icon: "CalendarMonth",
            },
            {
              title: "Employee Report",
              icon: "CalendarMonth",
              subMenu: [
                {
                  title: "Master",
                  link: "/employee-general-report",
                  icon: "Assessment",
                },
                {
                  title: "Employee Profile",
                  link: "/employee-profile",
                  icon: "Assessment",
                },
                {
                  title: "Employee Newly Joining",
                  link: "/new-employee-joining-report",
                  icon: "Assessment",
                },
                {
                  title: "Currently Working Employees",
                  link: "/currently-working-employee-report",
                  icon: "Assessment",
                },
                {
                  title: "Employee Releiving",
                  link: "/employee-relieving-report",
                  icon: "Assessment",
                },
                {
                  link: "/increment-date-report",
                  title: "Increment Date",
                  icon: "Assessment",
                },
              ],
            },
            {
              title: "Leave Report",
              icon: "CalendarMonth",
              subMenu: [
                // {
                //   link: "/leave-entry-list",
                //   title: "Leave Entry",
                //   icon: "ViewList",
                // },
                // {
                //   link: "/permission-entry-list",
                //   title: "Permission Entry",
                //   icon: "ViewList",
                // },
                // {
                //   link: "/tour-entry-list",
                //   title: "Tour Entry",
                //   icon: "DoneAll",
                // },
                {
                  link: "/permission-entry-report",
                  title: "Permission Entry",
                  icon: "ViewList",
                },
                {
                  title: "Leave Entry",
                  link: "/leave-entry-detail-report",
                  icon: "School",
                },
                {
                  title: "Employee Leave",
                  link: "/leave-detail-report",
                  icon: "School",
                },
                {
                  title: "Employee Leave With Reason",
                  link: "/leave-with-reason-report",
                  icon: "School",
                },
                {
                  title: "Leave Availed and Balance",
                  link: "/leave-balance-report",
                  icon: "School",
                },
              ],
            },
            {
              title: "Attendance Report",
              icon: "CalendarMonth",
              subMenu: [
                {
                  title: "Late Arrival Report",
                  link: "/late-arrival-report",
                  icon: "Assessment",
                },
                {
                  title: "Early Depature Report",
                  link: "/early-depart-report",
                  icon: "Assessment",
                },
                {
                  title: "In and Out Statement Report",
                  link: "/in-out-statement-report",
                  icon: "Assessment",
                },
                {
                  title: "Monthly Activity Report",
                  link: "/monthly-activity",
                  icon: "Assessment",
                },
                {
                  title: "Absent Report",
                  link: "/absent-report",
                  icon: "Assessment",
                },
                // {
                //   title: "Monthly Attendance",
                //   link: "/attendance-monthly-report",
                //   icon: "Assessment",
                // },
                // {
                //   link: "/checkin-list",
                //   title: "Employee Checkin",
                //   icon: "FormatListBulleted",
                // },
                // {
                //   title: "Attendance",
                //   link: "/attendance-report",
                //   icon: "Assessment",
                // },
              ],
            },

            {
              title: "View Holiday",
              link: "/view-holiday-list",
              icon: "CalendarMonth",
              noMenu: 1,
            },
            {
              title: "Paybill Report",
              icon: "CalendarMonth",
              subMenu: [
                // {
                //   link: "/reset-allowance-deduction-list",
                //   title: "Allowance / Deduction Reset",
                //   icon: "SyncProblem",
                // },
                {
                  title: "Salary Statement Category Wise",
                  link: "/salary-statement-report",
                  icon: "School",
                },
                {
                  link: "/arrear-report",
                  title: "Arrear",
                  icon: "ViewList",
                },
                {
                  link: "/other-deduction-report",
                  title: "Other Deduction",
                  icon: "SyncProblem",
                },
                // {
                //   link: "/paybill-report",
                //   title: "Paybill",
                //   icon: "CurrencyRupee",
                // },
                {
                  title: "Paymode and Bank",
                  link: "/paymode-report",
                  icon: "School",
                },
                {
                  title: "Salary",
                  link: "/employee-salary-report",
                  icon: "Assessment",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Admin",
      class: "",
      mainTitleID: 9,
      subMenu: [
        {
          title: "Assessment Test",
          class: "",
          subTitleID: 41,
          subData: [
            {
              link: "/test-detail-list",
              title: "Test Time Table",
              icon: "School",
            },
            {
              link: "/test-master",
              title: "Test Master",
              icon: "School",
            },
          ],
        },
        {
          title: "Learning",
          class: "",
          subTitleID: 42,
          subData: [
            {
              link: "/syllabus-list",
              title: "Syllabus",
              icon: "School",
            },
            {
              title: "Upload Syllabus",
              link: "/syllabus-upload",
              icon: "School",
            },

            {
              link: "/material-list",
              title: "Study Material",
              icon: "School",
            },
            {
              title: "Upload Study Material",
              link: "/material-upload",
              icon: "School",
            },

            {
              link: "/qp-list",
              title: "Question Paper",
              icon: "School",
            },
            {
              link: "/qp-upload",
              title: "Upload Question Paper",
              icon: "School",
            },

            {
              link: "/timetable-list",
              title: "Time Table",
              icon: "Assessment",
            },
            {
              link: "/timetable-upload",
              title: "Upload Time Table",
              icon: "Assessment",
            },
          ],
        },
        {
          title: "Circular",
          class: "",
          subTitleID: 25,
          subData: [
            {
              link: "/circular-upload",
              title: "Send Circular",
              icon: "School",
            },
            {
              link: "/circular-list",
              title: "Circular",
              icon: "School",
            },
            {
              link: "/events",
              title: "Send Event",
              icon: "School",
            },
            {
              link: "/events-list",
              title: "Event",
              icon: "School",
            },
            {
              link: "/view-circular",
              title: "View Circular",
              icon: "School",
              noMenu: 1,
            },
          ],
        },
        {
          title: "Notification",
          class: "",
          subTitleID: 44,
          subData: [{ title: "App Notification", link: "/push-notification" }],
        },
      ],
    },
    // {
    //   title: "Student App",
    //   class: "",

    //   subMenu: [
    //     {
    //       title: "Learning",
    //       class: "",
    //       subTitleID: 29,
    //       subData: [{ title: "Learning", link: "/learning", icon: "School" }],
    //     },

    //     {
    //       title: "Library",
    //       class: "",
    //       subTitleID: 30,
    //       subData: [
    //         {
    //           title: "Library",
    //           link: "/library-detail",
    //           icon: "LocalLibrary",
    //         },
    //       ],
    //     },
    //     {
    //       title: "Student Fees Report",
    //       class: "",
    //       subTitleID: 31,
    //       subData: [
    //         {
    //           title: "Student Fees Report",
    //           link: "/student-fees-report",
    //           icon: "School",
    //         },
    //       ],
    //     },
    //     // {
    //     //   title: "Student Annual Result",
    //     //   class: "",
    //     //   subTitleID: 32,
    //     //   subData: [
    //     //     {
    //     //       title: "Student Annual Result",
    //     //       link: "/university-result",
    //     //       icon: "School",
    //     //     },
    //     //   ],
    //     // },
    //     {
    //       title: "Calendar",
    //       class: "",
    //       subTitleID: 33,
    //       subData: [
    //         {
    //           link: "/calendar",
    //           title: "Calendar",
    //           icon: "School",
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      title: "Contact us",
      class: "",
      mainTitleID: 6,
      subMenu: [
        {
          title: "Contact us",
          class: "",
          subTitleID: 34,
          subData: [
            {
              link: "/feedback",
              title: "Contact us",
              icon: "AddComment",
            },
          ],
        },
        // {
        //   title: "Feedback",
        //   class: "",
        //   subTitleID: 35,
        //   subData: [
        //     {
        //       link: "/feedback-list",
        //       title: "Feedback",
        //       icon: "Feedback",
        //     },
        //   ],
        // },
      ],
    },
    {
      title: "Super Admin",
      class: "",
      mainTitleID: 7,
      subMenu: [
        {
          title: "Add User Right",
          subTitleID: 51,
          subData: [
            {
              title: "Add User Right Form",
              link: "/add-role-setting-form",
              icon: "Person",
            },
          ],
        },
        {
          title: "User Right",
          subTitleID: 36,
          subData: [
            { title: "User Right", link: "/user-right", icon: "Person" },
          ],
        },
        {
          title: "Role Setting",
          subTitleID: 37,
          subData: [
            { title: "Role Setting", link: "/role-setting", icon: "Person" },
          ],
        },
        {
          title: "Data Setting",
          subTitleID: 52,
          subData: [
            {
              title: "Data Setting",
              link: "/fields-setting",
              icon: "Person",
            },
          ],
        },
        {
          title: "Institution Configuration",
          subTitleID: 54,
          subData: [
            {
              title: "Institution Configuration",
              link: "/institution-config",
              icon: "Person",
            },
          ],
        },
        {
          title: "Log",
          subTitleID: 55,
          subData: [
            {
              title: "Error Log",
              link: "/error-log",
              icon: "Person",
            },
            {
              title: "Activity Log",
              link: "/activity-log",
              icon: "Person",
            },
          ],
        },
      ],
    },
    {
      title: "Profile",
      class: "",
      mainTitleID: 8,
      subMenu: [
        {
          title: "Reset Password",
          class: "",
          subTitleID: 38,
          subData: [
            {
              title: "Reset Password",
              link: "/reset-password",
              icon: "Person",
            },
          ],
        },
        {
          title: "Logout",
          class: "",
          subTitleID: 39,
          subData: [
            {
              title: "Logout",
              link: "/logout",
              icon: "Person",
            },
          ],
        },
      ],
    },
  ];
};

export default MenuArrayFunctionSchool;
