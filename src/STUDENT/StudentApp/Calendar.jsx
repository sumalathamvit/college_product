import React, { useEffect, useState, useRef, useContext } from "react";
import { Modal } from "react-bootstrap";
import DateRangeIcon from "@mui/icons-material/DateRange";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import moment from "moment";

import AcademicApi from "../../api/AcademicApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import Icon from "../../component/Icon";
import AuthContext from "../../auth/context";
import string from "../../string";
import ScreenTitle from "../../component/common/ScreenTitle";

function Calendar() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [selectedItem, setSelectedItem] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const { collegeId, department } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const dayStyles = {
    width: "140px",
    height: "100px",
    border: "1px solid #eff0f4",
    // margin: 0,
    // padding: 0,
  };

  const weekDayStyles = {
    width: "140px",
    color: "white",
  };

  const requestToServer = async (courseID) => {
    try {
      setLoad(true);

      const res = await AcademicApi.getEventCalendar(collegeId, courseID, null);
      console.log("res---", res);
      setEventList(res.data.message.data.eventNotices);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const getCourseList = async (value) => {
    try {
      const getMasterSubjectStaffRes = await AcademicApi.getCourseList(value);
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);

      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };
  useEffect(() => {
    getCourseList(collegeId);
  }, []);
  const renderDayContent = (date, fullDate) => {
    // console.log("date-----", date, fullDate, eventList);

    const formattedDate = moment(fullDate).format("YYYY-MM-DD");
    const Event = eventList.find(
      (item) => moment(item.eventDate).format("YYYY-MM-DD") === formattedDate
    );

    const matchedEvents = eventList.filter(
      (item) => moment(item.eventDate).format("YYYY-MM-DD") === formattedDate
    );

    return (
      <div
        style={{
          display: "flex",

          alignItems: "center",
          justifyContent: "center",
          alignContent: "center",
          flexDirection: "column",
          margin: 0,
        }}
        onClick={
          matchedEvents
            ? () => {
                setSelectedItem(matchedEvents);
                setModalVisible(true);
              }
            : setSelectedItem([])
        }
      >
        <div className="fw-bold fs-5">{fullDate.getDate()}</div>
        <div
          className="row no-gutters mt-1 text-center"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {matchedEvents.map((item, index) => {
            return (
              <>
                {item ? (
                  <div
                    style={{
                      flex: 1 / 5,
                      color: "green",
                      paddingRight: 10,
                      paddingLeft: 10,
                      borderRadius: 5,
                      fontSize: "0.8em",
                      width: "100%",
                      marginTop: 35,
                    }}
                    title={item ? item.description : ""}
                  >
                    ⬤{/* {item.eventTopic} */}
                  </div>
                ) : null}
              </>
            );
          })}
        </div>

        {/* <div
          style={{
            marginTop: "35px",
          }}
          title={Event ? Event.description : ""}
        >
          <div className="fw-bold fs-5">{fullDate.getDate()}</div>

          {Event ? (
            <div
              style={{
                backgroundColor: "green",
                color: "white",
                paddingRight: 10,
                paddingLeft: 10,
                borderRadius: 5,
                fontSize: "0.8em",
                width: "100%",
              }}
            >
              {Event.eventTopic}
            </div>
          ) : null}
        </div> */}
      </div>
    );
  };

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />

      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <ReactSelectField
          labelSize={2}
          style={{
            width: "60%",
          }}
          id="course"
          mandatory={1}
          label={RENAME?.course}
          getOptionLabel={(option) => option.courseName}
          getOptionValue={(option) => option.courseID}
          options={courseList}
          searchIcon={false}
          clear={false}
          onChange={(text) => {
            requestToServer(text.courseID);
          }}
        />
        <div className="row no-gutters mt-4 ">
          <style>
            {`.custom-day-class {${Object.entries(dayStyles)
              .map(([key, value]) => `${key}: ${value};`)
              .join(" ")}}`}
            {`.custom-weekday-class {${Object.entries(weekDayStyles)
              .map(([key, value]) => `${key}: ${value};`)
              .join(" ")}}`}
          </style>
          <DatePicker
            inline
            calendarClassName="fs-6"
            maxDate={moment().add(3, "months")._d}
            minDate={new Date()}
            selected={null}
            dayClassName={() => "custom-day-class"}
            weekDayClassName={() => "custom-weekday-class"}
            dateFormat={"YYYY-MM-DD"}
            renderCustomHeader={({
              date,
              changeYear,
              changeMonth,
              decreaseMonth,
              increaseMonth,
            }) => {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingRight: 10,
                    paddingLeft: 10,
                  }}
                >
                  <div>
                    <h2>{moment(date).format("MMMM-yyyy")}</h2>
                  </div>
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
                    <div onClick={decreaseMonth}>
                      <Icon iconName={"ArrowLeftOutlined"} fontSize={"large"} />
                    </div>

                    <div onClick={increaseMonth}>
                      <Icon
                        iconName={"ArrowRightOutlined"}
                        fontSize={"large"}
                      />
                    </div>
                  </div>
                </div>
              );
            }}
            renderDayContents={(date, fullDate) =>
              renderDayContent(date, fullDate, eventList)
            }
          />
        </div>
      </div>
      <Modal
        show={modalVisible}
        onHide={() => setModalVisible(false)}
        dialogClassName="my-modal"
        onEscapeKeyDown={() => setModalVisible(false)}
      >
        <Modal.Header>
          <Modal.Title>Events</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem.length > 0 &&
            selectedItem.map((item, index) => {
              return (
                <>
                  <div
                    style={{
                      marginTop: 10,
                    }}
                  >
                    <div
                      style={{
                        marginTop: 5,
                      }}
                    >
                      <span className="fw-bold"> Description : </span>
                      {item.description}
                    </div>
                    {item.filePath ? (
                      <div
                        style={{
                          marginTop: 5,
                        }}
                        onClick={(e) =>
                          window.open(string.FILEURL + item.filePath, "_blank")
                        }
                      >
                        <span className="fw-bold">File : </span>
                        {item.filePath.split("/").pop() + "  "}

                        <Icon
                          iconName={"Download"}
                          fontSize={"medium"}
                          // style={{ float: "right" }}
                        />
                      </div>
                    ) : null}
                  </div>
                </>
              );
            })}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setModalVisible(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Calendar;
