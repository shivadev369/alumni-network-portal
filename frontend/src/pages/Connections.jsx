import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Connections.css";
import "./AlumniDashboard.css";

function Connections() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);

  const [search,setSearch] = useState("");
  const [results,setResults] = useState([]);
  const [showDropdown,setShowDropdown] = useState(false);

  const [notifications,setNotifications] = useState([]);

  /* ------------------- FETCH NOTIFICATIONS ------------------- */

  useEffect(()=>{

    axios
      .get(`https://alumni-backend-connect.onrender.com/notifications/${user._id}`)
      .then(res => setNotifications(res.data))
      .catch(err => console.log(err));

  },[]);


  /* ------------------- SEARCH PEOPLE ------------------- */

  const searchPeople = async () => {

    const res = await axios.get(
      `https://alumni-backend-connect.onrender.com/search?name=${search}`
    );

    setResults(res.data);

  };


  /* ------------------- FETCH PENDING REQUESTS ------------------- */

  const fetchRequests = async () => {

    try {

      const res = await fetch(
        `https://alumni-backend-connect.onrender.com/connect/pending/${user._id}`,
        { credentials:"include" }
      );

      const data = await res.json();

      setRequests(data);

    } catch (err) {

      console.log(err);

    }

  };


  /* ------------------- FETCH ACCEPTED CONNECTIONS ------------------- */

  const fetchConnections = async () => {

    try {

      const res = await fetch(
        `https://alumni-backend-connect.onrender.com/connect/accepted/${user._id}`,
        { credentials:"include" }
      );

      const data = await res.json();

      setConnections(data);

    } catch (err) {

      console.log(err);

    }

  };


  /* ------------------- LOAD DATA ------------------- */

  useEffect(() => {

    if(user){
      fetchRequests();
      fetchConnections();
    }

  },[]);


  /* ------------------- ACCEPT REQUEST ------------------- */

  const acceptRequest = async (id) => {

    try {

      await fetch(
        `https://alumni-backend-connect.onrender.com/connect/accept/${id}`,
        {
          method:"PUT",
          credentials:"include"
        }
      );

      fetchRequests();
      fetchConnections();

    } catch(err){

      console.log(err);

    }

  };


  /* ------------------- REJECT REQUEST ------------------- */

  const rejectRequest = async (id) => {

    try {

      await fetch(
        `https://alumni-backend-connect.onrender.com/connect/reject/${id}`,
        {
          method:"DELETE",
          credentials:"include"
        }
      );

      fetchRequests();

    } catch(err){

      console.log(err);

    }

  };


  return (

<div>

{/* ---------------- NAVBAR ---------------- */}

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

{results.map(person => (

<div
key={person._id}
className="search-item"
onClick={()=>setShowDropdown(false)}
>

<div className="user-top">

<span className="user-name">
{person.name}
</span>

<span className={`role-badge ${person.role}`}>
{person.role}
</span>

</div>

{person.role==="student" && (
<div className="user-sub">
{person.department}
</div>
)}

{person.role==="alumni" && (
<div className="user-sub">
{person.jobRole} • {person.currentWork}
</div>
)}

</div>

))}

</div>

)}

</div>


<div className="nav-links">

<span 
  onClick={() => navigate(user?.role === "student" ? "/student" : "/alumni")}
>
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


{/* ---------------- CENTER WRAPPER ---------------- */}

<div className="connections-page">


{/* ---------------- CONNECTION REQUESTS ---------------- */}

<div className="connections-container">

<h2>Connection Requests</h2>

{requests.length===0 ? (

<p className="no-requests">
No pending requests
</p>

):( 

requests.map(req => (

<div key={req._id} className="request-card">

<div>

<h3>{req.sender.name}</h3>

<p>{req.sender.email}</p>

</div>

<div className="buttons">

<button
className="accept-btn"
onClick={()=>acceptRequest(req._id)}
>
Accept
</button>

<button
className="reject-btn"
onClick={()=>rejectRequest(req._id)}
>
Reject
</button>

</div>

</div>

))

)}

</div>


{/* ---------------- MY CONNECTIONS ---------------- */}

<div className="connections-container">

<h2>My Connections</h2>

{connections.length===0 ? (

<p className="no-requests">
No connections yet
</p>

):( 

connections.map(person => (

<div key={person._id} className="request-card">

<div>

<h3>{person.name}</h3>

<p>

{person.role==="alumni"
? `${person.jobRole} • ${person.currentWork}`
: person.department}

</p>

</div>

<div className="buttons">

<button
className="accept-btn"
onClick={() =>
navigate(`/chat/${person._id}`,{
state:{ user:person }
})
}
>

💬 Message

</button>

</div>

</div>

))

)}

</div>

</div>

</div>

  );

}

export default Connections;