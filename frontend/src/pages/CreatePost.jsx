import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreatePost.css";
import "./AlumniDashboard.css"; // reuse navbar styles

axios.defaults.withCredentials = true;

const CreatePost = () => {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    content: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);

  const [search,setSearch] = useState("");
  const [results,setResults] = useState([]);
  const [showDropdown,setShowDropdown] = useState(false);

  const [notifications,setNotifications] = useState([]);


  // FETCH NOTIFICATIONS
  useEffect(()=>{

    axios.get(`https://alumni-backend-connect.onrender.com/notifications/${user._id}`)
    .then(res=>setNotifications(res.data))
    .catch(err=>console.log(err))

  },[])


  // SEARCH PEOPLE
  const searchPeople = async () => {

    const res = await axios.get(
      `https://alumni-backend-connect.onrender.com/search?name=${search}`
    );

    setResults(res.data);

  };


  // IMAGE TO BASE64
  const handleImageChange = (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {

      setForm((prev) => ({
        ...prev,
        image: reader.result,
      }));

    };

    reader.readAsDataURL(file);

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (!form.content.trim()) {
      alert("Post content is required");
      return;
    }

    try {

      setLoading(true);

      await axios.post(
        "https://alumni-backend-connect.onrender.com/create-post",
        {
          content: form.content,
          image: form.image,
        }
      );

      alert("Post created successfully!");

      setForm({
        content: "",
        image: "",
      });

      navigate("/alumni");

    } catch (err) {

      console.error("POST ERROR:", err);

      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error creating post"
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


{/* CREATE POST UI */}

<div className="post-container">

<div className="post-card">

<h2>Create a Post</h2>

<form onSubmit={handleSubmit}>

<textarea
placeholder="What do you want to talk about?"
value={form.content}
onChange={(e)=>
setForm({ ...form, content: e.target.value })
}
required
/>

<input
type="file"
accept="image/*"
onChange={handleImageChange}
/>

{form.image && (

<div className="image-preview-box">

<img src={form.image} alt="preview" />

</div>

)}

<button type="submit" disabled={loading}>
{loading ? "Posting..." : "Post"}
</button>

</form>

</div>

</div>

</div>

  );

};

export default CreatePost;