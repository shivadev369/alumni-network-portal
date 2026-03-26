import { useState } from "react";
import axios from "axios";
import "./Register.css";

const Register = () => {

const [role,setRole]=useState("student");

const [form,setForm]=useState({});


const handleChange=(e)=>{
setForm({...form,[e.target.name]:e.target.value});
};

const submit = async (e) => {

  e.preventDefault();

  // EMAIL REGEX
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.name) {
    alert("Name is required");
    return;
  }

  if (!form.email) {
    alert("Email is required");
    return;
  }

  if (!emailPattern.test(form.email)) {
    alert("Enter a valid email address");
    return;
  }

  if (role === "student" && !form.email.endsWith("@gvgvc.ac.in")) {
    alert("Student email must be @gvgvc.ac.in");
    return;
  }

  if (!form.password) {
    alert("Password is required");
    return;
  }

  if (form.password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  // STUDENT VALIDATION
  if (role === "student") {
    if (!form.registerNumber || !form.department) {
      alert("Please fill all student fields");
      return;
    }
  }

  // ALUMNI VALIDATION
  if (role === "alumni") {
    if (!form.department || !form.batch || !form.currentCompany || !form.jobRole) {
      alert("Please fill all alumni fields");
      return;
    }
  }

  try {

    await axios.post("https://alumni-backend-vhm7.onrender.com/register", {
      ...form,
      role
    });

    alert("Request sent to admin");

  } catch (err) {

    alert(err.response?.data?.error || "Registration failed");

  }

};

return(

<div className="register-container">

<div className="register-card">

<h2>Register</h2>

<select
value={role}
onChange={(e)=>setRole(e.target.value)}
className="role-select"
>

<option value="student">Student</option>
<option value="alumni">Alumni</option>

</select>


<form onSubmit={submit}>

<input
name="name"
placeholder="Name"
onChange={handleChange}
/>


{/* STUDENT FORM */}

{role==="student" && (

<>

<input
name="registerNumber"
placeholder="Register Number"
onChange={handleChange}
/>
<select name="department" onChange={handleChange} required>

<option value="">Select Department</option>

<option value="Tamil">Tamil</option>
<option value="English">English</option>
<option value="Mathematics">Mathematics</option>
<option value="Physics">Physics</option>
<option value="Chemistry">Chemistry</option>
<option value="Computer Science">Computer Science</option>
<option value="Information Technology">Information Technology</option>
<option value="Commerce">Commerce</option>
<option value="Commerce with CA">Commerce with CA</option>
<option value="Business Administration">Business Administration</option>
<option value="Economics">Economics</option>
<option value="History">History</option>
<option value="Psychology">Psychology</option>
<option value="Visual Communication">Visual Communication</option>

</select>

<input
name="email"
placeholder="Student Email (@gvgvc.ac.in)"
onChange={handleChange}
/>

<input
type="password"
name="password"
placeholder="Password"
onChange={handleChange}
/>

</>

)}


{/* ALUMNI FORM */}

{role==="alumni" && (

<>

<input
name="email"
placeholder="Email"
onChange={handleChange}
/>

<input
type="password"
name="password"
placeholder="Password"
onChange={handleChange}
/>

<select name="department" onChange={handleChange} required>

<option value="">Select Department</option>

<option value="Tamil">Tamil</option>
<option value="English">English</option>
<option value="Mathematics">Mathematics</option>
<option value="Physics">Physics</option>
<option value="Chemistry">Chemistry</option>
<option value="Computer Science">Computer Science</option>
<option value="Information Technology">Information Technology</option>
<option value="Commerce">Commerce</option>
<option value="Commerce with CA">Commerce with CA</option>
<option value="Business Administration">Business Administration</option>
<option value="Economics">Economics</option>
<option value="History">History</option>
<option value="Psychology">Psychology</option>
<option value="Visual Communication">Visual Communication</option>

</select>


<select
name="batch"
onChange={handleChange}
required
>

<option value="">Select Batch</option>

{Array.from({ length: 46 }, (_, i) => {
  const year = 1980 + i;
  return (
    <option key={year} value={year}>
      {year}
    </option>
  );
})}

</select>

<input
name="currentCompany"
placeholder="Current Company"
onChange={handleChange}
/>

<input
name="jobRole"
placeholder="Current Role"
onChange={handleChange}
/>

</>

)}

<button type="submit">
Submit Request
</button>

</form>

</div>

</div>

);

};

export default Register;