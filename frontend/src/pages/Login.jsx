import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

axios.defaults.withCredentials = true;

const Login = () => {

  const navigate = useNavigate();

  const [role, setRole] = useState("student");

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    /* =========================
       DUMMY ADMIN LOGIN
    ========================= */

    if (
      role === "admin" &&
      form.email === "admin@gvgvc.ac.in" &&
      form.password === "admin123"
    ) {

      const adminUser = {
        name: "Admin",
        email: "admin@gvgvc.ac.in",
        role: "admin"
      };

      localStorage.setItem("user", JSON.stringify(adminUser));

      navigate("/admin");

      return;
    }

    /* =========================
       STUDENT / ALUMNI LOGIN
    ========================= */

    try {

      const res = await axios.post(
        "https://alumni-backend-vhm7.onrender.com/login",
        {
          ...form,
          role
        },
        { withCredentials: true }
      );

      const userData = res.data;

     localStorage.setItem("user", JSON.stringify(res.data));

      if (userData.role === "student") {
        navigate("/student");
      } 
      else if (userData.role === "alumni") {
        navigate("/alumni");
      }

    } catch (err) {

      alert(err.response?.data?.message || "Login failed");

    }
  };

  return (

    <div className="login-container">

      <div className="login-card">

        <h2>Login</h2>

        {/* Role Selector */}

        <select
          className="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >

          <option value="student">Student</option>
          <option value="alumni">Alumni</option>
          <option value="admin">Admin</option>

        </select>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            name="email"
            placeholder={
              role === "student"
                ? "Student Email (@gvgvc.ac.in)"
                : "Email"
            }
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

      </div>

    </div>

  );
};

export default Login;