import { createSlice, current } from "@reduxjs/toolkit";
import { replace } from "formik";

const lmsSlice = createSlice({
  name: "lms",
  initialState: {
    allTopic: [],
    allCourse: [],
    myCourse: [],
    currentTopic: {},
    questionList: [],
  },
  reducers: {
    replaceAllTopic(state, action) {
      console.log(action.payload, "action.payload");
      state.allTopic = action.payload;
    },
    removeTopic(state, action) {
      state.allTopic = [];
    },
    replaceAllCourse(state, action) {
      state.allCourse = action.payload;
    },
    removeAllCourse(state, action) {
      state.allCourse = [];
    },
    replaceMyCourse(state, action) {
      state.myCourse = action.payload;
    },
    removeMyCourse(state, action) {
      state.myCourse = [];
    },
    replaceCurrentTopic(state, action) {
      state.currentTopic = action.payload;
    },
    removeCurrentTopic(state, action) {
      state.currentTopic = {};
    },
    updateTopicCompleted(state, action) {
      let allTopicData = state.allTopic;
      for (let index = 0; index < allTopicData.length; index++) {
        for (let j = 0; j < allTopicData[index].topics.length; j++) {
          if (allTopicData[index].topics[j].name === action.payload.name) {
            if (action.payload.progress) {
              allTopicData[index].topics[j].completed = true;
              allTopicData[index].completedTopicCount =
                allTopicData[index].completedTopicCount + 1;
            }
            if (allTopicData[index].topics.length - 1 > j) {
              state.currentTopic = allTopicData[index].topics[j + 1];
            } else if (
              allTopicData.length - 1 > index &&
              allTopicData[index + 1].topics.length > 0
            ) {
              console.log(allTopicData[index + 1].topics[0], "next topic");
              state.currentTopic = allTopicData[index + 1].topics[0];
            } else {
              state.currentTopic = state.currentTopic;
            }
            break;
          }
        }
      }
      state.allTopic = allTopicData;
    },

    updateCourseProgress(state, action) {
      let allCourseData = state.myCourse;
      for (let index = 0; index < allCourseData.length; index++) {
        if (allCourseData[index].name === action.payload.name) {
          allCourseData[index].progress = action.payload.progress;
          break;
        }
      }
      state.allCourse = allCourseData;
    },

    previousTopic(state, action) {
      let allTopicData = state.allTopic;
      for (let index = 0; index < allTopicData.length; index++) {
        for (let j = 0; j < allTopicData[index].topics.length; j++) {
          if (allTopicData[index].topics[j].name === action.payload) {
            if (j > 0) {
              state.currentTopic = allTopicData[index].topics[j - 1];
            } else if (index > 0 && allTopicData[index - 1].topics.length > 0) {
              state.currentTopic =
                allTopicData[index - 1].topics[
                  allTopicData[index - 1].topics.length - 1
                ];
            }

            break;
          }
        }
      }
    },

    nextTopic(state, action) {
      let allTopicData = state.allTopic;
      for (let index = 0; index < allTopicData.length; index++) {
        for (let j = 0; j < allTopicData[index].topics.length; j++) {
          if (allTopicData[index].topics[j].name === action.payload) {
            if (allTopicData[index].topics.length - 1 > j) {
              state.currentTopic = allTopicData[index].topics[j + 1];
            } else if (
              allTopicData.length - 1 > index &&
              allTopicData[index + 1].topics.length > 0
            ) {
              state.currentTopic = allTopicData[index + 1].topics[0];
            } else {
              state.currentTopic = state.currentTopic;
            }
            break;
          }
        }
      }
    },
    replaceQuestionList(state, action) {
      state.questionList = action.payload;
    },
    removeQuestionList(state, action) {
      state.questionList = [];
    },
    addQuestion(state, action) {
      state.questionList.push(action.payload);
    },
    removeQuestion(state, action) {
      state.questionList = state.questionList.filter(
        (question) => question.questionName !== action.payload
      );
    },
    updateQuestion(state, action) {
      let questionIndex = state.questionList.findIndex(
        (question) => question.id === action.payload.id
      );
      state.questionList[questionIndex] = action.payload;
    },
    updateQuestionList(state, action) {
      state.questionList = action.payload;
    },
  },
});

export const lmsSliceActions = lmsSlice.actions;

export default lmsSlice;
