import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AlumniDashboard.css";

const StudentDashboard = () => {

const navigate = useNavigate();
const student = JSON.parse(localStorage.getItem("user"));

const [posts,setPosts] = useState([]);
const [suggestions,setSuggestions] = useState([]);
const [search,setSearch] = useState("");
const [results,setResults] = useState([]);
const [selectedUser,setSelectedUser] = useState(null);
const [connectionStatus,setConnectionStatus] = useState("");

const [skills,setSkills] = useState("");
const [editSkills,setEditSkills] = useState("");
const [edit,setEdit] = useState(false);

const [showDropdown,setShowDropdown] = useState(false);


/* FETCH POSTS */

useEffect(()=>{

axios.get("https://alumni-backend-vhm7.onrender.com/posts")
.then(res=>setPosts(res.data))
.catch(err=>console.log(err))

},[])



/* FETCH STUDENT PROFILE */

useEffect(()=>{

axios
.get(`https://alumni-backend-vhm7.onrender.com/student/${student._id}`)
.then(res=>{
setSkills(res.data.skills || "")
})
.catch(err=>console.log(err))

},[])



/* SEARCH PEOPLE */

const searchPeople = async () => {

try{

const res = await axios.get(
`https://alumni-backend-vhm7.onrender.com/search?name=${search}`
)

setResults(res.data)

}catch(err){
console.log(err)
}

};



/* SEARCH DEBOUNCE (SAME AS ALUMNI DASHBOARD) */

useEffect(() => {

if (search.trim() === "") {
setResults([]);
return;
}

const delay = setTimeout(() => {
searchPeople();
}, 400);

return () => clearTimeout(delay);

}, [search]);



/* CONNECTION STATUS */

const checkConnectionStatus = async (otherUserId)=>{

try{

const res = await axios.get(
`https://alumni-backend-vhm7.onrender.com/connection-status/${student._id}/${otherUserId}`
)

setConnectionStatus(res.data.status)

}catch(err){
console.log(err)
}

};



/* SEND CONNECTION */

const sendRequest = async (receiverId, receiverRole)=>{

try{

await axios.post("https://alumni-backend-vhm7.onrender.com/connect",{
senderId:student._id,
receiverId,
senderModel:"Student",
receiverModel:receiverRole==="student"?"Student":"Alumni"
})

setConnectionStatus("pending")

}catch(err){
console.log(err)
}

};



/* LIKE POST */

const likePost = async(postId)=>{

const res = await axios.post("https://alumni-backend-vhm7.onrender.com/like-post",{
postId,
userId:student._id
})

setPosts(posts.map(p=>p._id===postId?res.data:p))

}



/* SAVE SKILLS */

const saveSkills = async()=>{

await axios.post("https://alumni-backend-vhm7.onrender.com/update-student",{
id:student._id,
skills:editSkills
})

setSkills(editSkills)
setEdit(false)

}



/* SUGGESTIONS */

useEffect(()=>{

axios
.get(`https://alumni-backend-vhm7.onrender.com/suggestions/${student._id}/student`)
.then(res=>setSuggestions(res.data))
.catch(err=>console.log(err))

},[])



return(

<div className="dashboard">

{/* NAVBAR */}

<div className="navbar">

<div className="logo">👥 Alumni-Connect</div>

<div className="search-box">

<input
placeholder="Search alumni or students..."
value={search}
onChange={(e)=>{

const value = e.target.value
setSearch(value)

if(value.trim()===""){
setResults([])
setShowDropdown(false)
}else{
setShowDropdown(true)
}

}}
onFocus={()=>setShowDropdown(true)}
/>


{showDropdown && results.length>0 &&(

<div className="search-dropdown">

{results.map(user=>(

<div
key={user._id}
className="search-item"
onClick={()=>{

setSelectedUser(user)
checkConnectionStatus(user._id)
setShowDropdown(false)

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

{user.department &&(
<div className="user-sub">
{user.department}
</div>
)}

{user.jobRole &&(
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

<span onClick={()=>navigate("/student")}>
Home
</span>


<span onClick={()=>navigate("/connections")}>
Connections
</span>

<span onClick={()=>navigate("/messages")}>
💬 Messages
</span>

<span onClick={()=>{

localStorage.removeItem("user")
navigate("/")

}}>
Logout
</span>

</div>

</div>



{/* PROFILE MODAL */}

{selectedUser && (

<div className="modal-overlay">

<div className="modal">

<h2>{selectedUser.name}</h2>

{selectedUser.email && (
<p><b>Email:</b> {selectedUser.email}</p>
)}

{selectedUser.role && (
<p><b>Role:</b> {selectedUser.role}</p>
)}

{selectedUser.department && (
<p><b>Department:</b> {selectedUser.department}</p>
)}

{selectedUser.batch && (
<p><b>Batch:</b> {selectedUser.batch}</p>
)}

{selectedUser.registerNumber && (
<p><b>Register No:</b> {selectedUser.registerNumber}</p>
)}

{selectedUser.currentWork && (
<p><b>Current Work:</b> {selectedUser.currentWork}</p>
)}

{selectedUser.jobRole && (
<p><b>Job Role:</b> {selectedUser.jobRole}</p>
)}

{selectedUser.skills && (
<p><b>Skills:</b> {selectedUser.skills}</p>
)}


<div className="modal-buttons">

{connectionStatus==="connected" &&(

<button
className="message-btn"
onClick={()=>navigate(`/chat/${selectedUser._id}`,{
state:{user:selectedUser}
})}
>
💬 Message
</button>

)}

{connectionStatus==="pending" &&(

<button disabled className="pending-btn">
⏳ Pending
</button>

)}

{connectionStatus==="none" && selectedUser._id!==student._id &&(

<button
onClick={()=>sendRequest(selectedUser._id,selectedUser.role)}
>
Connect
</button>

)}

<button
className="cancel"
onClick={()=>setSelectedUser(null)}
>
Close
</button>

</div>

</div>

</div>

)}



<div className="layout">


{/* LEFT PROFILE */}

<div className="left">

<div className="profile-card">

<div className="avatar">
{student.name?.charAt(0)}
</div>

<h3>{student.name}</h3>

<p>Department : {student.department}</p>
<p>Register No : {student.registerNumber}</p>

<h4>Skills : {skills || "Not added"}</h4>

<button onClick={()=>{
setEditSkills(skills)
setEdit(true)
}}>
Edit Skills
</button>

</div>

</div>



{/* CENTER POSTS */}

<div className="center">

<div
className="card"
onClick={()=>navigate("/interview-experience")}
>

<img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"/>

<span>View Interview Experiences</span>

</div>


<h3>Recent Posts</h3>

<div className="posts">

{posts.map(post=>(

<div key={post._id} className="post">

<div className="post-header">

<div className="post-left">

<div className="post-avatar">
{post.author?.name?.charAt(0)}
</div>

<div className="user-info">

<div className="post-name">
{post.author?.name}
</div>

<div className="post-dept">
{post.author?.department}
</div>

</div>

</div>

</div>

<p>{post.content}</p>

{post.image &&
<img src={post.image} className="post-image"/>
}

<div className="post-actions">

<button
className={post.likes?.includes(student._id)?"liked":""}
onClick={()=>likePost(post._id)}
>

{post.likes?.includes(student._id)?"❤️":"🤍"} 

{post.likes?.length || 0} Like{post.likes?.length === 1 ? "" : "s"}

</button>

</div>

</div>

))}

</div>

</div>



{/* RIGHT SIDEBAR */}

<div className="right">

<h3>Suggestions</h3>

{suggestions.map(person=>(

<div key={person._id} className="suggestion">

<div>

<b>{person.name}</b>
<p>{person.department}</p>

</div>

<button
className="connect-btn"
onClick={()=>sendRequest(person._id,person.role)}
>
Connect
</button>

</div>

))}

</div>

</div>



{/* EDIT SKILLS MODAL */}

{edit &&(

<div className="modal-overlay">

<div className="modal">

<h2>Edit Skills</h2>

<input
value={editSkills}
onChange={(e)=>setEditSkills(e.target.value)}
placeholder="Enter your skills"
/>

<div className="modal-buttons">

<button onClick={saveSkills}>
Save
</button>

<button
className="cancel"
onClick={()=>setEdit(false)}
>
Cancel
</button>

</div>

</div>

</div>

)}

</div>

)

}

export default StudentDashboard;