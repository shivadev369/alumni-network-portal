import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./ChatPage.css";
import "./AlumniDashboard.css";

const ChatPage = () => {

  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const otherUser = location.state?.user;

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);

  /* FETCH CHAT MESSAGES */

  const fetchMessages = async () => {

    try {

      const res = await axios.get(
        `https://alumni-backend-vhm7.onrender.com/messages/${currentUser._id}/${userId}`
      );

      setMessages(res.data);

    } catch (err) {

      console.log("Fetch messages error:", err);

    }

  };


  /* AUTO REFRESH CHAT */

  useEffect(() => {

    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => clearInterval(interval);

  }, []);


  /* AUTO SCROLL */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  /* FORMAT TIME */

  const formatTime = (date) => {

    const d = new Date(date);

    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

  };


  /* SEND MESSAGE */

  const sendMessage = async () => {

    if (!text.trim()) return;

    try {

      const res = await axios.post(
        "https://alumni-backend-vhm7.onrender.com/send-message",
        {
          senderId: currentUser._id,
          receiverId: userId,
          text
        }
      );

      setMessages(prev => [...prev, res.data]);
      setText("");

    } catch (err) {

      console.log("Send message error:", err);

    }

  };


  return (

<div>

{/* ---------------- NAVBAR ---------------- */}

<div className="navbar">

<div className="logo">
AlumniConnect
</div>

<div className="nav-links">

<span onClick={()=>navigate("/alumni")}>
Home
</span>

<span onClick={()=>navigate("/connections")}>
Connections
</span>

<span onClick={()=>navigate("/messages")}>
Messages
</span>

<span
onClick={()=>{
localStorage.removeItem("user");
navigate("/");
}}
>
Logout
</span>

</div>

</div>


{/* ---------------- CHAT PAGE ---------------- */}

<div className="chat-page">

<div className="chat-container">

{/* HEADER */}

<div className="chat-header">

<div className="chat-avatar">
{otherUser?.name?.charAt(0)}
</div>

<div className="chat-info">

<div className="chat-name">
{otherUser?.name}
</div>

<div className="chat-role">

{otherUser?.role === "alumni" && (
<>
{otherUser?.jobRole} • {otherUser?.currentWork}
</>
)}

{otherUser?.role === "student" && (
<>
{otherUser?.department}
</>
)}

</div>

<div className="chat-status">
Online
</div>

</div>

</div>


{/* ---------------- MESSAGES ---------------- */}

<div className="chat-messages">

{messages.map(msg => (

<div
key={msg._id}
className={
msg.sender.toString() === currentUser._id
? "message-row my-row"
: "message-row"
}
>

<div
className={
msg.sender.toString() === currentUser._id
? "message my-message"
: "message their-message"
}
>

<div className="message-text">
{msg.text}
</div>

<div className="message-time">
{formatTime(msg.createdAt)}
</div>

</div>

</div>

))}

<div ref={bottomRef}></div>

</div>


{/* ---------------- INPUT ---------------- */}

<div className="chat-input">

<input
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder="Type a message..."
onKeyDown={(e)=>{
if(e.key === "Enter"){
sendMessage();
}
}}
/>

<button onClick={sendMessage}>
Send
</button>

</div>

</div>

</div>

</div>

  );

};

export default ChatPage;