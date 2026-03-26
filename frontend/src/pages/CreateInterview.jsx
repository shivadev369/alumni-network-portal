import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateInterview.css";
import "./AlumniDashboard.css"; // reuse navbar styling

axios.defaults.withCredentials = true;

const CreateInterview = () => {

  const navigate = useNavigate();

  const alumni = JSON.parse(localStorage.getItem("user"));

  const [search,setSearch] = useState("");
  const [results,setResults] = useState([]);
  const [showDropdown,setShowDropdown] = useState(false);
  const [selectedUser,setSelectedUser] = useState(null);

  const [notifications,setNotifications] = useState([]);

  const [form, setForm] = useState({
    company: "",
    role: "",
    experience: "",
  });

  const [loading, setLoading] = useState(false);
  const [customCompany, setCustomCompany] = useState("");
  const [customRole, setCustomRole] = useState("");

  const companyList = [
    "Infosys",
    "TCS",
    "CTS",
    "Amazon",
    "HCL",
    "Wipro",
    "Accenture",
    "Others",
  ];

  const roleList = [
    "Software Engineer",
    "Data Engineer",
    "Data Analyst",
    "Business Analyst",
    "DevOps Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Others",
  ];

  // FETCH NOTIFICATIONS
  useEffect(()=>{

    axios.get(`https://alumni-backend-vhm7.onrender.com/notifications/${alumni._id}`)
    .then(res=>setNotifications(res.data))
    .catch(err=>console.log(err))

  },[])


  // SEARCH PEOPLE
  const searchPeople = async () => {

    const res = await axios.get(
      `https://alumni-backend-vhm7.onrender.com/search?name=${search}`
    );

    setResults(res.data);

  };


  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);

   const user = JSON.parse(localStorage.getItem("user"));



    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const finalCompany =
      form.company === "Others" ? customCompany : form.company;

    const finalRole =
      form.role === "Others" ? customRole : form.role;

    try {

      await axios.post("https://alumni-backend-vhm7.onrender.com/create-interview", {
        company: finalCompany,
        role: finalRole,
        experience: form.experience,
      });

      alert("Interview posted successfully!");

      setForm({
        company: "",
        role: "",
        experience: "",
      });

      setCustomCompany("");
      setCustomRole("");

      navigate("/alumni");

    } catch (err) {

      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error posting interview"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

<div>

{/* OLD NAVBAR */}

<div className="navbar">

<div className="logo">AlumniConnect</div>

<div className="search-box">

<input
placeholder="Search alumni or students..."
value={search}
onChange={(e)=>{

const value = e.target.value;
setSearch(value);

if(value.trim()===""){
setResults([]);
setShowDropdown(false);
}else{
searchPeople(value);
setShowDropdown(true);
}

}}
/>

{showDropdown && results.length>0 &&(

<div className="search-dropdown">

{results.map(user => (

<div
key={user._id}
className="search-item"
onClick={()=>{

setSelectedUser(user);
setShowDropdown(false);

}}
>

<div className="user-top">

<span className="user-name">
{user.name}
</span>

<span className={`role-badge ${user.role}`}>
{user.role}
</span>

</div>

{user.role==="student" && (
<div className="user-sub">
{user.department}
</div>
)}

{user.role==="alumni" && (
<div className="user-sub">
{user.jobRole} • {user.currentWork}
</div>
)}

</div>

))}

</div>

)}

</div>

<div className="nav-links">

<span onClick={()=>navigate("/alumni")}>
Home
</span>

<span onClick={()=>navigate("/connections")}>
Connections
</span>

<span onClick={()=>navigate("/messages")}>
💬 Messages
</span>



<span onClick={()=>{
localStorage.removeItem("user");
navigate("/");
}}>
Logout
</span>

</div>

</div>


{/* INTERVIEW FORM */}

<div className="create-interview-container">

<form className="create-interview-form" onSubmit={handleSubmit}>

<h2>Post Interview Experience</h2>

<select
value={form.company}
onChange={(e)=>
setForm({...form, company:e.target.value})
}
required
>

<option value="">Select Company</option>

{companyList.map((comp,index)=>(
<option key={index} value={comp}>
{comp}
</option>
))}

</select>

{form.company==="Others" &&(

<input
type="text"
placeholder="Enter Company Name"
value={customCompany}
onChange={(e)=>setCustomCompany(e.target.value)}
required
/>

)}

<select
value={form.role}
onChange={(e)=>
setForm({...form, role:e.target.value})
}
required
>

<option value="">Select Role</option>

{roleList.map((role,index)=>(
<option key={index} value={role}>
{role}
</option>
))}

</select>

{form.role==="Others" &&(

<input
type="text"
placeholder="Enter Role Name"
value={customRole}
onChange={(e)=>setCustomRole(e.target.value)}
required
/>

)}

<textarea
placeholder="Share your interview experience..."
value={form.experience}
onChange={(e)=>
setForm({...form, experience:e.target.value})
}
rows="5"
required
/>

<button type="submit" disabled={loading}>
{loading ? "Posting..." : "Post Interview"}
</button>

</form>

</div>

</div>

  );

};

export default CreateInterview;