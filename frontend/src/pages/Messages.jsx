import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Messages.css";
import "./AlumniDashboard.css"; // reuse navbar styles

const Messages = () => {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [chats, setChats] = useState([]);

  const [search,setSearch] = useState("");
  const [results,setResults] = useState([]);
  const [showDropdown,setShowDropdown] = useState(false);

  const [notifications,setNotifications] = useState([]);

  // FETCH CHATS
  useEffect(() => {

    axios
      .get(`https://alumni-backend-vhm7.onrender.com/recent-chats/${user._id}`)
      .then(res => {
        console.log("Recent chats:", res.data);
        setChats(res.data);
      })
      .catch(err => console.log("Fetch chats error:", err));

  }, []);


  // FETCH NOTIFICATIONS
  useEffect(()=>{

    axios.get(`https://alumni-backend-vhm7.onrender.com/notifications/${user._id}`)
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


  const formatTime = (date) => {

    const d = new Date(date);

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    });

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

{results.map(person => (

<div
key={person._id}
className="search-item"
onClick={()=>{

setShowDropdown(false);

}}
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


{/* MESSAGES PAGE */}

<div className="messages-page">

<h2 className="messages-title">Messages</h2>

{chats.length === 0 && (
<p>No chats yet</p>
)}

{chats.map(chat => (

<div
key={chat._id}
className="chat-card"
onClick={() =>
navigate(`/chat/${chat._id}`, {
state: { user: chat }
})
}
>

<div className="chat-avatar">
{chat.name?.charAt(0)}
</div>

<div className="chat-info">

<div className="chat-name">
{chat.name}
</div>

<div className="chat-role">

{chat.role === "alumni" && (
<>
{chat.jobRole} • {chat.currentWork}
</>
)}

{chat.role === "student" && (
<>
{chat.department}
</>
)}

</div>

<div className="chat-last">
{chat.lastMessage}
</div>

</div>

<div className="chat-time">
{formatTime(chat.createdAt)}
</div>

</div>

))}

</div>

</div>

  );

};

export default Messages;