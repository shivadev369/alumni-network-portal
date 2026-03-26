import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS
import "./InterviewExperience.css";

const InterviewExperience = () => {

  const navigate = useNavigate(); // ✅ ADD THIS

  const [interviews, setInterviews] = useState([]);
  const [filters, setFilters] = useState({ company: "", role: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://alumni-backend-connect.onrender.com/interviews/all")
      .then((res) => {
        setInterviews(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, []);

  const filteredInterviews = interviews.filter((post) => {
    return (
      (!filters.company ||
        post.company.toLowerCase().includes(filters.company.toLowerCase())) &&
      (!filters.role ||
        post.role.toLowerCase().includes(filters.role.toLowerCase()))
    );
  });

  return (
    <>
      {/* ================= NAVBAR ================= */}

      <div className="navbar">

        <div className="logo">AlumniConnect</div>

        <div className="nav-links">

          <span onClick={() => navigate("/student")}>
            Home
          </span>

          <span onClick={() => navigate("/connections")}>
            Connections
          </span>

          <span onClick={() => navigate("/messages")}>
            💬 Messages
          </span>

          <span
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
          >
            Logout
          </span>

        </div>

      </div>

      {/* ================= PAGE CONTENT ================= */}

      <div className="interview-section">

        {/* Filters */}
        <div className="filter-section">
          <input
            type="text"
            placeholder="Filter by company"
            value={filters.company}
            onChange={(e) =>
              setFilters({ ...filters, company: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Filter by role"
            value={filters.role}
            onChange={(e) =>
              setFilters({ ...filters, role: e.target.value })
            }
          />
        </div>

        {/* Loading or Posts */}
        {loading ? (
          <p>Loading interview experiences...</p>
        ) : filteredInterviews.length === 0 ? (
          <p>No interview experiences found</p>
        ) : (
          <div className="interview-feed">
            {filteredInterviews.map((post) => (
              <div key={post._id} className="post-item">

  <div className="post-header">

    <div className="post-user">

      <div className="post-avatar">
        {post.author?.name?.charAt(0) || "U"}
      </div>

      <div>
        <strong>{post.author?.name || "Unknown"}</strong>

        <p className="post-meta">
          {post.author?.department || "-"}
        </p>
      </div>

    </div>

    <small className="post-time">
      {new Date(post.createdAt).toLocaleString()}
    </small>

  </div>

  <p>
    <strong>Company:</strong>
    <span className="tag">{post.company}</span>
  </p>

  <p>
    <strong>Role:</strong>
    <span className="tag">{post.roleName}</span>
  </p>

  <p>{post.experience}</p>

</div>
            ))}
          </div>
        )}

      </div>
    </>
  );
};

export default InterviewExperience;