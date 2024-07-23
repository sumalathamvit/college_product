import { createSlice } from "@reduxjs/toolkit";
import { replace } from "formik";

const webSlice = createSlice({
  name: "web",
  initialState: {
    //college
    college: {
      institution_type: "",
      is_semester: true,
      is_university: true,
      collegeList: [],
      validity: "",
      address: "",
      second_line: "",
      third_line: "",
      phone: "",
      fax: "",
      print_email: "",
      logo: "",
      no_of_term: 0,
      common_cashier: "",
      common_logo: "",
    },
    //rename
    rename: {
      year: "Year",
      batch: "Batch",
      dept: "Department",
      course: "Course",
      sem: "Semester",
      section: "Section",
    },

    //question paper
    qpList: [],
    qpSubjectList: [],
    qpListShow: false,
    qpListSemester: [],
    //syllabus
    syllabusList: [],
    syllabusListShow: false,
    //material
    materialList: [],
    materialListShow: false,
    materialListSemester: [],
    //Time Table
    timeTableList: [],
    timeTableListShow: false,
    timeTableListBatch: [],
  },
  reducers: {
    //college List
    replaceCollege(state, action) {
      console.log("action.payload", action.payload);
      state.college = action.payload;
    },
    removeCollege(state, action) {
      state.college = {
        institution_type: "",
        is_semester: false,
        is_university: false,
        collegeList: [],
        validity: "",
        address: "",
        second_line: "",
        third_line: "",
        phone: "",
        fax: "",
        print_email: "",
        logo: "",
        no_of_term: 0,
        common_cashier: "",
        common_logo: "",
      };
    },
    //Rename
    replaceRename(state, action) {
      console.log("action.payload", action.payload);
      state.rename = action.payload;
    },
    removeRename(state, action) {
      state.rename = {};
    },

    //Question Paper
    replaceQpList(state, action) {
      state.qpList = action.payload;
    },
    replaceQpSubjectList(state, action) {
      state.qpSubjectList = action.payload;
    },
    replaceQpListShow(state, action) {
      state.qpListShow = action.payload;
    },
    replaceQpListSemester(state, action) {
      state.qpListSemester = action.payload;
    },
    removeQpList(state, action) {
      state.qpList = [];
    },
    removeQpSubjectList(state, action) {
      state.qpSubjectList = [];
    },
    removeQpListShow(state, action) {
      state.qpListShow = false;
    },
    removeQpListSemester(state, action) {
      state.qpListSemester = [];
    },

    //Syllabus
    replaceSyllabusList(state, action) {
      state.syllabusList = action.payload;
    },
    replaceSyllabusListShow(state, action) {
      state.syllabusListShow = action.payload;
    },
    removeSyllabusList(state, action) {
      state.syllabusList = [];
    },
    removeSyllabusListShow(state, action) {
      state.syllabusListShow = false;
    },

    //Material
    replaceMaterialList(state, action) {
      state.materialList = action.payload;
    },
    replaceMaterialListShow(state, action) {
      state.materialListShow = action.payload;
    },
    replaceMaterialListSemester(state, action) {
      state.materialListSemester = action.payload;
    },
    removeMaterialList(state, action) {
      state.materialList = [];
    },
    removeMaterialListShow(state, action) {
      state.materialListShow = false;
    },
    removeMaterialListSemester(state, action) {
      state.materialListSemester = [];
    },

    //Time Table
    replaceTimeTableList(state, action) {
      state.timeTableList = action.payload;
    },
    replaceTimeTableListShow(state, action) {
      state.timeTableListShow = action.payload;
    },
    replaceTimeTableListBatch(state, action) {
      state.timeTableListBatch = action.payload;
    },
    removeTimeTableList(state, action) {
      state.timeTableList = [];
    },
    removeTimeTableListShow(state, action) {
      state.timeTableListShow = false;
    },
    removeTimeTableListBatch(state, action) {
      state.timeTableListBatch = [];
    },
  },
});

export const webSliceActions = webSlice.actions;

export default webSlice;
