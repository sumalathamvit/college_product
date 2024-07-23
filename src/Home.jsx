import React, { useContext, useEffect, useState } from "react";
import preFunction from "./component/common/CommonFunction";
import CustomActivityIndicator from "./component/common/CustomActivityIndicator";
import HeadingIcon from "@mui/icons-material/School";
import { chartColors } from "./component/common/CommonArray";

import DashboardApi from "./api/Dashboardapi";
import ReactEcharts from "echarts-for-react";
import PageFooter from "./pages/PageFooter";
import { useSelector } from "react-redux";
import AuthContext from "./auth/context";

const Home = () => {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);

  const [yearWiseAdmissionData, setYearWiseAdmissionData] = useState([]);
  const [courseWiseDueData, setCourseWiseDueData] = useState([]);
  const [departmentWiseBook, setDepartmentWiseBook] = useState([]);
  const [topIssuedBookData, setTopIssuedBookData] = useState([]);
  const [deptWiseStudntStrength, setDeptWiseStudntStrength] = useState([]);
  const [bookIssueData, setBookIssueData] = useState([]);
  const [newArrivalBookData, setNewArrivalBookData] = useState([]);

  const { setUnSavedChanges } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const yearWiseAdmissionDataChart = {
    title: {
      text: RENAME?.year + "wise Admission",
      left: "center",
      textStyle: {
        fontSize: 30,
        color: "#3d5179",
        font: "inherit",
      },
    },
    tooltip: {
      trigger: "item",
      itemStyle: { fontSize: 16 },
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    // legend: {
    //   orient: "vertical",
    //   left: "left",
    //   textStyle: {
    //     fontSize: 16,
    //   },
    // },
    series: [
      {
        name: "Admission Data",
        type: "pie",
        radius: "60%",
        data: yearWiseAdmissionData.map((item, index) => ({
          value: item.Count,
          name: item.Year, // You can use any property from your data as the name
          label: {
            fontSize: 16,
            color: chartColors[index],
          },
          itemStyle: { color: chartColors[index] },
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const courseWiseDueDataChart = {
    title: {
      text:
        collegeConfig.institution_type === 1
          ? RENAME?.sem + "wise Fees Due"
          : RENAME?.course + "wise Fees Due",
      left: "center",
      textStyle: {
        fontSize: 30,
        color: "#3d5179",
        font: "inherit",
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: {
        fontSize: 16,
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    yAxis: {
      width: 100,
      type: "category",
      data: courseWiseDueData.map((item) =>
        collegeConfig.institution_type === 1 ? item.className : item.courseName
      ),
      axisLabel: {
        fontSize: 15, // Adjust font size here
        color: "#000", // Adjust font color here
      },
    },
    xAxis: {
      type: "value",
      boundaryGap: [0, 0.01],
      axisLabel: {
        fontSize: 15, // Adjust font size here
        color: "#000", // Adjust font color here
      },
    },
    series: [
      {
        name: "Total",
        color: "#5470c6",
        data: courseWiseDueData.map((item) => item.total),
        type: "bar",
        label: {
          show: true,
          position: "outside", // Adjust label position if needed
          textStyle: {
            fontSize: 16, // Adjust font size here
            color: chartColors[0], // Set label color
          },
        },
        itemStyle: {
          color: chartColors[0],
        },
      },
      {
        name: "Paid",
        color: "#91cc75",
        data: courseWiseDueData.map((item) => item.paidTotal),
        type: "bar",
        label: {
          show: true,
          position: "outside", // Adjust label position if needed
          textStyle: {
            fontSize: 16, // Adjust font size here
            color: chartColors[4], // Set label color
          },
        },
        itemStyle: {
          color: chartColors[4],
        },
      },
      {
        name: "Due",
        color: "#ee6666",
        data: courseWiseDueData.map((item) => item.dueTotal),
        type: "bar",
        label: {
          show: true,
          position: "outside", // Adjust label position if needed
          textStyle: {
            fontSize: 16, // Adjust font size here
            color: chartColors[1], // Set label color
          },
        },
        itemStyle: {
          color: chartColors[1],
        },
      },
    ],
  };

  const topIssuedBookDataChart = {
    title: {
      text: "Top 5 Books",
      left: "center",
      textStyle: {
        fontSize: 30,
        color: "#3d5179",
        font: "inherit",
      },
    },
    tooltip: {
      trigger: "item",
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    // legend: {
    //   position: "top", // Position the legend below the chart
    //   orient: "horizontal", // Align legend horizontally
    //   textStyle: {
    //     fontSize: 16,
    //   },
    // },
    series: [
      {
        name: "Top Issued",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        padAngle: 5,
        itemStyle: {
          borderRadius: 10,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: topIssuedBookData.map((item, index) => ({
          value: item.issueCount,
          name: item.main_title,
          label: {
            show: true,
            position: "outside", // Adjust label position if needed
            textStyle: {
              fontSize: 16, // Adjust font size here
              color: chartColors[index], // Set label color
            },
          },
          itemStyle: { color: item.color || chartColors[0] },
        })),
      },
    ],
  };

  const deptWiseStudntStrengthChart = {
    title: {
      text:
        collegeConfig.institution_type === 1
          ? RENAME?.sem + "wise Students"
          : RENAME?.course + "wise Students",
      left: "center",
      textStyle: {
        fontSize: 30,
        color: "#3d5179",
        font: "inherit",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    yAxis: {
      width: 100,
      type: "category",
      data: deptWiseStudntStrength.map((item) =>
        collegeConfig.institution_type === 1 ? item.className : item.courseName
      ),
      axisLabel: {
        fontSize: 15, // Adjust font size here
        color: chartColors[1], // Adjust font color here
      },
    },
    xAxis: {
      type: "value",
      axisLabel: {
        fontSize: 15, // Adjust font size here
        color: chartColors[2], // Adjust font color here
      },
    },
    series: [
      {
        name: "Student Strength",
        data: deptWiseStudntStrength.map((item) =>
          collegeConfig.institution_type === 1
            ? item.studentCount
            : item.classCount
        ),
        type: "bar",
        barWidth: "50%",
        label: {
          show: true,
          position: "outside", // Adjust label position if needed
          textStyle: {
            fontSize: 16, // Adjust font size here
            color: chartColors[2], // Set label color
          },
        },
        itemStyle: {
          color: chartColors[1],
        },
        showBackground: true,
      },
    ],
  };

  const bookIssueDataChart = {
    title: {
      text: "Issued and Pending Books",
      left: "center",
      textStyle: {
        fontSize: 30,
        color: "#3d5179",
        font: "inherit",
      },
    },
    tooltip: {
      trigger: "item",
      itemStyle: { fontSize: 16 },
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    // legend: {
    //   orient: "vertical",
    //   left: "left",
    //   textStyle: {
    //     fontSize: 16,
    //   },
    // },
    series: [
      {
        name: "Library Data",
        type: "pie",
        radius: "50%",
        data: [
          {
            value: bookIssueData?.issueCount,
            name: "Books Issued",
            label: {
              fontSize: 16,
              color: chartColors[0],
            },
            itemStyle: { color: chartColors[0] },
          },
          {
            value: bookIssueData?.pendingCount,
            name: "Books Pending",
            label: {
              fontSize: 16,
              color: chartColors[1],
            },
            itemStyle: { color: chartColors[1], fontSize: 16 },
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const departmentWiseBookChart = {
    title: {
      text: "Department Wise Book",
      left: "center",
      textStyle: {
        fontSize: 30,
        color: "#3d5179",
        font: "inherit",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: {
        fontSize: 16,
      },
    },
    yAxis: {
      width: 100,
      type: "category",
      data: departmentWiseBook.map((item) => item.book_department),
      axisLabel: {
        fontSize: 15, // Adjust font size here
        color: chartColors[0], // Adjust font color here
      },
    },
    xAxis: {
      type: "value",
      axisLabel: {
        fontSize: 15, // Adjust font size here
        color: chartColors[1], // Adjust font color here
      },
    },
    series: [
      {
        name: "Total Books",
        data: departmentWiseBook.map((item) => item.bookCount),
        type: "bar",
        label: {
          show: true,
          position: "outside", // Adjust label position if needed
          textStyle: {
            fontSize: 16, // Adjust font size here
            color: chartColors[1], // Set label color
          },
        },
        itemStyle: {
          color: chartColors[0],
        },
      },
    ],
  };

  const newArrivalBookDataChart = {
    title: {
      text: "New Arrivals",
      left: "center",
      textStyle: {
        fontSize: 30,
        color: "#3d5179",
        font: "inherit",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: {
        fontSize: 16,
      },
    },
    yAxis: {
      width: 80,
      type: "category",
      data: newArrivalBookData.map((item) => item.main_title),
      axisLabel: {
        fontSize: 15, // Adjust font size here
        color: chartColors[3], // Adjust font color here
      },
    },
    xAxis: {
      type: "value",
      axisLabel: {
        fontSize: 15, // Adjust font size here
        color: chartColors[0], // Adjust font color here
      },
    },
    series: [
      {
        name: "Total Quantity",
        data: newArrivalBookData.map((item) => item.quantity),
        type: "bar",
        label: {
          show: true,
          position: "outside", // Adjust label position if needed
          textStyle: {
            fontSize: 16, // Adjust font size here
            color: chartColors[0], // Set label color
          },
        },
        itemStyle: {
          color: chartColors[3],
        },
      },
    ],
  };

  const fetchYearWiseAdmissionData = async () => {
    try {
      let response;
      if (collegeConfig.institution_type === 1)
        response = await DashboardApi.getSchoolAdmissionCount();
      else response = await DashboardApi.getLast4YearAdmissionCount();
      console.log("getLast4YearAdmissionCount", response);
      setYearWiseAdmissionData(response.data.message.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchBookData = async () => {
    try {
      const response = await DashboardApi.getBookIssueCount();
      console.log("getBookIssueCount", response);
      setBookIssueData(response.data.message.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchDepartmentData = async () => {
    try {
      setLoad(true);
      const response = await DashboardApi.getDepartmentWiseBookCount();
      console.log("getDepartmentWiseBookCount", response);
      setDepartmentWiseBook(response.data.message.data.department);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.error("Error fetching data:", error);
    }
  };

  const fetchTopIssueData = async (value) => {
    try {
      setLoad(true);
      const response = await DashboardApi.getTopIssueBookCount();
      console.log("getTopIssueBookCount---", response);
      for (
        let i = 0;
        i < response.data.message.data.top_book_issue.length;
        i++
      ) {
        response.data.message.data.top_book_issue[i].color = chartColors[i];
      }
      setTopIssuedBookData(response.data.message.data.top_book_issue);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.error("Error fetching data:", error);
    }
  };

  const fetchPurchaseData = async () => {
    try {
      setLoad(true);
      const response = await DashboardApi.getLastPurchaseBooks();
      console.log("getLastPurchaseBooks", response);

      setNewArrivalBookData(response.data.message.data.last_purchase_books);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.error("Error fetching data:", error);
    }
  };

  const fetchClassWiseData = async () => {
    try {
      const response = await DashboardApi.getClasswiseCount(
        collegeConfig.institution_type
      );
      console.log("getClasswiseCount", response);

      setDeptWiseStudntStrength(response.data.message.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchDueWiseData = async () => {
    try {
      let getFeesDueCollectionRes;
      if (collegeConfig.institution_type === 1) {
        getFeesDueCollectionRes =
          await DashboardApi.getSchoolFeesDueCollection();
      } else
        getFeesDueCollectionRes = await DashboardApi.getFeesDueCollection();

      console.log("getFeesDueCollectionRes", getFeesDueCollectionRes);
      setCourseWiseDueData(
        getFeesDueCollectionRes.data.message.data.fees_detail
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchBookData();
    fetchDepartmentData();
    fetchTopIssueData();
    fetchPurchaseData();
    fetchYearWiseAdmissionData();
    fetchClassWiseData();
    fetchDueWiseData();
    handleUnSavedChanges(0);
  }, [collegeConfig.institution_type]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <div className="row no-gutters">
          <div className="page-heading">
            <div>
              <HeadingIcon className="page-heading-position-report" />
              Home
            </div>
          </div>
        </div>
        {/* 1 */}
        <div class="my_graph" style={{ height: 450 }}>
          <ReactEcharts
            style={{ height: 400 }}
            option={yearWiseAdmissionDataChart}
          />
        </div>
        {/* 2 */}
        <div class="my_graph" style={{ height: 630 }}>
          <ReactEcharts
            style={{ height: 600 }}
            option={courseWiseDueDataChart}
          />
        </div>
        {/* 3 */}
        {collegeConfig.institution_type ===
        1 ? null : topIssuedBookData.length > 0 ? (
          <div class="my_graph" style={{ height: 430 }}>
            <ReactEcharts
              style={{ height: 400 }}
              option={topIssuedBookDataChart}
            />
          </div>
        ) : null}

        {/* 4 */}
        <div class="my_graph" style={{ height: 430 }}>
          <ReactEcharts
            style={{ height: 400 }}
            option={deptWiseStudntStrengthChart}
          />
        </div>
        {/* 5 */}
        {collegeConfig.institution_type === 1 ? null : (
          <>
            {bookIssueData.issueCount > 0 || bookIssueData.pendingCount > 0 ? (
              <div class="my_graph" style={{ height: 430 }}>
                <ReactEcharts
                  style={{ height: 400 }}
                  option={bookIssueDataChart}
                />
              </div>
            ) : null}
            {/* 6 */}
            {departmentWiseBook.length > 0 && (
              <div class="my_graph" style={{ height: 830 }}>
                <ReactEcharts
                  style={{ height: 800 }}
                  option={departmentWiseBookChart}
                />
              </div>
            )}
          </>
        )}
        {/* 6 */}
        {/* <div class="my_graph" style={{ height: 730 }}>
          <ReactEcharts
            style={{ height: 700 }}
            option={newArrivalBookDataChart}
          />
        </div> */}
      </div>
      <PageFooter />
    </div>
  );
};

export default Home;
