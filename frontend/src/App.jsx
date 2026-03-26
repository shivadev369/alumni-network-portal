import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateInterview from "./pages/CreateInterview";
import CreatePost from "./pages/CreatePost";
import Connections from "./pages/Connections"
import InterviewExperiencePage from "./pages/InterviewExperience";
import ChatPage from "./pages/ChatPage";
import Messages from "./pages/Messages";
import ManagePosts from "./pages/ManagePosts";

import Navbar from "./components/Navbar";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        {/* Navbar will show on all pages */}
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/alumni" element={<AlumniDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/interview-experience" element={<InterviewExperiencePage/>} />
          <Route path="/connections" element={<Connections/>} />
          <Route path="/create-interview" element={<CreateInterview />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/admin/posts" element={<ManagePosts/>}/>

<Route path="/chat/:userId" element={<ChatPage />} />
<Route path="/messages" element={<Messages />} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;