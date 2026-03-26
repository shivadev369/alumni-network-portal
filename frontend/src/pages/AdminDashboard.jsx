import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { Link, useNavigate } from "react-router-dom";



const AdminDashboard = () => {

  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("user");
  navigate("/login");
};
  const [counts, setCounts] = useState({});
  const [view, setView] = useState("");
  const [data, setData] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const res = await axios.get("https://alumni-backend-vhm7.onrender.com/admin/dashboard-counts");
    setCounts(res.data);
  };
  

  /* LOAD STUDENTS */

  const loadStudents = async () => {
    const res = await axios.get("https://alumni-backend-vhm7.onrender.com/admin/students");
    setData(res.data);
    setView("students");
    setDepartmentFilter("");
  };

  /* LOAD ALUMNI */

  const loadAlumni = async () => {
    const res = await axios.get("https://alumni-backend-vhm7.onrender.com/admin/alumni");
    setData(res.data);
    setView("alumni");
    setDepartmentFilter("");
  };

  /* LOAD REQUESTS */

  const loadRequests = async (type = "") => {
    const res = await axios.get(`https://alumni-backend-vhm7.onrender.com/admin/requests?type=${type}`);
    setData(res.data);
    setView("requests");
  };
  const loadPosts = async () => {
  const res = await axios.get("https://alumni-backend-vhm7.onrender.com/posts");
  setData(res.data);
  setView("posts");
};
const deletePost = async (id) => {

  if (!window.confirm("Delete this post?")) return;

  await axios.delete(`https://alumni-backend-vhm7.onrender.com/posts/${id}`);

  loadPosts(); // refresh posts

};

  /* ACCEPT */

  const acceptRequest = async (id) => {
    try {

    const res = await axios.post(
      `https://alumni-backend-vhm7.onrender.com/admin/accept/${id}`
    );

    alert(res.data.message);

  } catch (err) {

    if (err.response?.data?.message) {

      alert(err.response.data.message);

    } else {

      alert("Something went wrong");

    }

  }
    loadRequests();
    fetchCounts();
  };

  /* REJECT */

  const rejectRequest = async (id) => {
    await axios.delete(`https://alumni-backend-vhm7.onrender.com/admin/reject/${id}`);
    loadRequests();
    fetchCounts();
  };

  /* FILTER */

  const filteredData = departmentFilter
    ? data.filter((item) => item.department === departmentFilter)
    : data;

  return (
     <>
    <nav className="navbar">
      <Link to="/" className="logo">
        👥 Alumni-Connect
      </Link>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </nav>

  
    <div className="admin-container">

      <h1>Admin Dashboard</h1>

      {/* DASHBOARD CARDS */}

      <div className="card-grid">

        <div className="card" onClick={loadStudents}>
          <h2>{counts.students || 0}</h2>
          <p>Total Students</p>
        </div>

        <div className="card" onClick={loadAlumni}>
          <h2>{counts.alumni || 0}</h2>
          <p>Total Alumni</p>
        </div>

        <div className="card" onClick={() => loadRequests()}>
          <h2>{counts.requests || 0}</h2>
          <p>Pending Requests</p>
        </div>

  <div className="card" onClick={()=>navigate("/admin/posts")}>
    <h2>📝</h2>
    <p>Manage Posts</p>
  </div>

      </div>

      {/* STUDENTS */}

      {view === "students" && (

        <div className="table-box">

          <h2>Students</h2>

          <select onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="">All Departments</option>
            <option value="Tamil">Tamil</option>
            <option value="English">English</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Commerce">Commerce</option>
          </select>

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Register Number</th>
                <th>Department</th>
              </tr>
            </thead>

            <tbody>

              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="3">No students available</td>
                </tr>
              ) : (
                filteredData.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.registerNumber}</td>
                    <td>{s.department}</td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* ALUMNI */}

      {view === "alumni" && (

        <div className="table-box">

          <h2>Alumni</h2>

          <select onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="">All Departments</option>
            <option value="Tamil">Tamil</option>
            <option value="English">English</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Commerce">Commerce</option>
          </select>

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Batch</th>
              </tr>
            </thead>

            <tbody>

              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4">No alumni available</td>
                </tr>
              ) : (
                filteredData.map((a) => (
                  <tr key={a._id}>
                    <td>{a.name}</td>
                    <td>{a.email}</td>
                    <td>{a.department}</td>
                    <td>{a.batch}</td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* REQUESTS */}

      {view === "requests" && (

        <div className="table-box">

          <h2>Requests</h2>

          <div className="filter">
            <button onClick={() => loadRequests("")}>All</button>
            <button onClick={() => loadRequests("student")}>Students</button>
            <button onClick={() => loadRequests("alumni")}>Alumni</button>
          </div>

          <table>

            <thead>

              <tr>
                <th>Name</th>
                <th>Register No / Batch</th>
                <th>Department</th>
                <th>Email</th>
                <th>Type</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {data.length === 0 ? (
                <tr>
                  <td colSpan="6">No data available</td>
                </tr>
              ) : (
                data.map((r) => (

                  <tr key={r._id}>

                    <td>{r.data.name}</td>

                    <td>
                      {r.type === "student"
                        ? r.data.registerNumber
                        : r.data.batch}
                    </td>

                    <td>{r.data.department}</td>

                    <td>{r.data.email}</td>

                    <td>{r.type}</td>

                    <td>

                      <button
                        className="accept"
                        onClick={() => acceptRequest(r._id)}
                      >
                        Accept
                      </button>

                      <button
                        className="reject"
                        onClick={() => rejectRequest(r._id)}
                      >
                        Reject
                      </button>

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
    </>
  );
};


export default AdminDashboard;