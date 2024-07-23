import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import ProtectedRoute from "../guards/ProtectedRoute";

import ResetPassword from "../Profile/ResetPassword";
import Logout from "../pages/logout";
import Login from "../pages/Login";

import "react-datepicker/dist/react-datepicker.css";
import "../App.css";

import Register from "./../pages/Register";
import MyCourse from "../lms/MyCourse";
import MyChapters from "../lms/MyChapters";
import MyTopic from "../lms/MyTopic";
import AuthContext from "../auth/context";

function StudentNavigator() {
  const { email } = useContext(AuthContext);
  return (
    <>
      <Routes>
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/" element={<MyCourse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
      </Routes>
    </>
  );
}

export default StudentNavigator;
