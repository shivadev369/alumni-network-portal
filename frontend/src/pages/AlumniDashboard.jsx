import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AlumniDashboard.css";


const AlumniDashboard = () => {

  const navigate = useNavigate();
 const alumni = JSON.parse(localStorage.getItem("user"));

 console.log("DATA IN LOCALSTORAGE:", alumni);

  const [posts,setPosts] = useState([]);
  const [connections,setConnections] = useState([]);
  const [suggestions,setSuggestions] = useState([]);
  const [search,setSearch] = useState("");
  const [results,setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
const [connectionStatus, setConnectionStatus] = useState(""); 
// "none" | "pending" | "connected"

  const [notifications,setNotifications] = useState([]);

  const [profile,setProfile] = useState({
    currentWork:"",
    jobRole:""
  });
  const checkConnectionStatus = async (otherUserId) => {

  console.log("Checking connection between:");
  console.log("Current user:", alumni._id);
  console.log("Other user:", otherUserId);

  try {

    const res = await axios.get(
      `https://alumni-backend-vhm7.onrender.com/connection-status/${alumni._id}/${otherUserId}`
    );

    console.log("Response from backend:", res.data);

    setConnectionStatus(res.data.status);

  } catch (err) {

    console.log("Connection status error:", err);

  }

};

  const [editProfile,setEditProfile] = useState({
    currentWork:"",
    jobRole:""
  });

  const [edit,setEdit] = useState(false);


  // FETCH POSTS
  useEffect(()=>{

    axios.get("https://alumni-backend-vhm7.onrender.com/posts")
    .then(res=>setPosts(res.data))
    .catch(err=>console.log(err))

  },[])

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


  // FETCH NOTIFICATIONS
  useEffect(()=>{

    axios.get(`https://alumni-backend-vhm7.onrender.com/notifications/${alumni._id}`)
    .then(res=>setNotifications(res.data))
    .catch(err=>console.log(err))

  },[])


  // FETCH PROFILE
  useEffect(()=>{

  axios.get(`https://alumni-backend-vhm7.onrender.com/alumni/${alumni._id}`)
  .then(res=>{
    setProfile({
      currentWork:res.data.currentWork || "",
      jobRole:res.data.jobRole || ""
    })
  })
  .catch(err=>console.log(err))

},[alumni])
 
/* SEARCH TRIGGER (DEBOUNCE SAME AS ALUMNI) */

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

  // SEARCH PEOPLE
const searchPeople = async () => {

  const res = await axios.get(
    `https://alumni-backend-vhm7.onrender.com/search?name=${search}`
  );

  setResults(res.data);

};


  // FORMAT POST DATE
  const formatDate = (dateString) => {

    const date = new Date(dateString);

    const options = {
      day: "numeric",
      month: "long",
      year: "numeric"
    };

    const formattedDate = date.toLocaleDateString("en-IN", options);

    const time = date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    return `${formattedDate} • Posted at ${time}`;
  };


  // LIKE POST
  const likePost = async(postId)=>{

    const res = await axios.post("https://alumni-backend-vhm7.onrender.com/like-post",{
      postId,
      userId:alumni._id
    });

    setPosts(posts.map(p=>p._id===postId ? res.data : p))

  }


  // ADD COMMENT
  const addComment = async(postId,text)=>{

    const res = await axios.post("https://alumni-backend-vhm7.onrender.com/comment",{
      postId,
      userId:alumni._id,
      text
    });

    setPosts(posts.map(p=>p._id===postId ? res.data : p))

  }


  // SEND CONNECTION REQUEST
  const sendRequest = async (receiverId, receiverRole) => {

  const user = JSON.parse(localStorage.getItem("user"));

  await axios.post("https://alumni-backend-vhm7.onrender.com/connect", {
    senderId: user._id,
    receiverId: receiverId,
    senderModel: user.role === "student" ? "Student" : "Alumni",
    receiverModel: receiverRole === "student" ? "Student" : "Alumni"
  });

  alert("Connection request sent");
  setConnectionStatus("pending");

};
  useEffect(() => {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return;

  axios
    .get(`https://alumni-backend-vhm7.onrender.com/suggestions/${user._id}/${user.role}`)
    .then(res => {
      setSuggestions(res.data);
      console.log("SUGGESTIONS:", res.data); // DEBUG
    })
    .catch(err => console.log(err));

}, []);

  // SAVE PROFILE
  const saveProfile = async ()=>{

    await axios.post("https://alumni-backend-vhm7.onrender.com/update-alumni",{
      id:alumni._id,
      currentWork:editProfile.currentWork,
      jobRole:editProfile.jobRole
    });

    setProfile(editProfile);
    setEdit(false)

  }
   const [showDropdown, setShowDropdown] = useState(false);

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

  {showDropdown && results.length > 0 && (
    <div className="search-dropdown">

      {results.map(user => (

        <div className="search-item"  onClick={() => {
    setSelectedUser(user);
    checkConnectionStatus(user._id);
    setShowDropdown(false);
  }}>

  <div className="user-top">
    <span className="user-name">{user.name}</span>

    <span className={`role-badge ${user.role}`}>
      {user.role}
    </span>
  </div>

  {user.role === "student" && user.department && (
    <div className="user-sub">
      {user.department}
    </div>
  )}

  {user.role === "alumni" && (
    <div className="user-sub">
      {user.jobRole} {user.currentWork && `• ${user.currentWork}`}
    </div>
  )}

</div>

      ))}

    </div>
  )}

</div>
<div className="nav-links">

<span onClick={()=>navigate("/alumni")}>Home</span>
<span onClick={()=>navigate("/connections")}>Connections</span>
<span onClick={()=>navigate("/messages")}>
💬 Messages
</span>




<span onClick={()=>{

localStorage.removeItem("user");
navigate("/");

}}>Logout</span>

</div>

</div>

{selectedUser && (
  <div className="modal-overlay">
    <div className="modal">

      <h2>{selectedUser.name}</h2>

      {/* COMMON FIELDS (Always Show If Available) */}
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

      {/* ALUMNI SPECIFIC FIELDS */}
      {selectedUser.currentWork && (
        <p><b>Current Work:</b> {selectedUser.currentWork}</p>
      )}

      {selectedUser.jobRole && (
        <p><b>Job Role:</b> {selectedUser.jobRole}</p>
      )}

      {/* YOU CAN ADD MORE FIELDS WITHOUT CHANGING LOGIC */}
      {selectedUser.skills && (
        <p><b>Skills:</b> {selectedUser.skills}</p>
      )}

      {selectedUser.bio && (
        <p><b>Bio:</b> {selectedUser.bio}</p>
      )}

      {/* CONNECTION BUTTON */}
      <div className="modal-buttons">

       {connectionStatus === "connected" && (
  <button
    className="message-btn"
    onClick={() =>
      navigate(`/chat/${selectedUser._id}`, {
        state: { user: selectedUser }
      })
    }
  >
    💬 Message
  </button>
)}

        {connectionStatus === "pending" && (
          <button disabled className="pending-btn">
            ⏳ Pending
          </button>
        )}

        {connectionStatus === "none" && selectedUser._id !== alumni._id && (
          <button
            onClick={() =>
              sendRequest(selectedUser._id, selectedUser.role)
            }
          >
            Connect
          </button>
        )}

        <button
          className="cancel"
          onClick={() => setSelectedUser(null)}
        >
          Close
        </button>

      </div>

    </div>
  </div>
)}

<div className="layout">


{/* LEFT SIDEBAR */}

<div className="left">

<div className="profile-card">

<div className="avatar">
{alumni.name?.charAt(0)}
</div>

<h3>{alumni.name}</h3>
<p>Department : {alumni.department}</p>
<p>Batch  : {alumni.batch}</p>

<h4>Current Work : {profile.currentWork || "Not added"}</h4>
<h4>Role : {profile.jobRole || "Not added"}</h4>

<button onClick={()=>{
  setEditProfile(profile);
  setEdit(true);
}}>
Edit Profile
</button>

</div>

</div>


{/* CENTER FEED */}

<div className="center">

<div className="create-posts">

<div
className="card"
onClick={()=>navigate("/create-interview")}
>

<img
src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
/>

<span>Share Interview Experience</span>

</div>


<div
className="card"
onClick={()=>navigate("/create-post")}
>

<img
src="https://cdn-icons-png.flaticon.com/512/747/747376.png"
/>

<span>Create Post</span>

</div>

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

<div className="post-time">
{formatDate(post.createdAt)}
</div>

</div>

</div>

</div>

<p>{post.content}</p>

{post.image &&
<div className="post-image-box">
<img src={post.image} className="post-image"/>
</div>
}

{/* 👍 LIKE BUTTON */}
<div className="post-actions">

<button
className={post.likes?.includes(alumni._id) ? "liked" : ""}
onClick={()=>likePost(post._id)}
>

{post.likes?.includes(alumni._id) ? "❤️" : "🤍"} 

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

  {suggestions.map(person => (

    <div key={person._id} className="suggestion">

      <div className="suggestion-info">

        <div className="name-row">

          <b
            onClick={() => navigate(`/profile/${person._id}`)}
            className="name"
          >
            {person.name}
          </b>

          <span className="role">
            ({person.role})
          </span>

        </div>

        <p className="dept">
          {person.department}
        </p>

      </div>

      <button
        className="connect-btn"
        onClick={() => sendRequest(person._id, person.role)}
      >
        Connect
      </button>

    </div>

  ))}

</div>
</div>


{/* PROFILE EDIT POPUP */}

{edit && (

<div className="modal-overlay">

<div className="modal">

<h2>Edit Profile</h2>

<label>Current Company</label>
<input
value={editProfile.currentWork}
onChange={(e)=>setEditProfile({...editProfile,currentWork:e.target.value})}
/>

<label>Role</label>
<input
value={editProfile.jobRole}
onChange={(e)=>setEditProfile({...editProfile,jobRole:e.target.value})}
/>

<div className="modal-buttons">

<button onClick={saveProfile}>Save</button>

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

export default AlumniDashboard;