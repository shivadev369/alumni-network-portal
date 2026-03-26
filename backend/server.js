require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();

/* ===============================
   CONNECT TO MONGODB ATLAS
================================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

/* ===============================
   CORS CONFIG
================================= */

app.use(
  cors({
    origin:"https://alumni-network-portal-g0gqtxjug-shivuji3693-9596s-projects.vercel.app",
    credentials: true
  })
);

app.use(express.json());

/* ===============================
   SESSION CONFIG
================================= */

app.use(
  session({
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
      httpOnly: true
    }
  })
);

/* ===============================
   STUDENT SCHEMA
================================= */

const studentSchema = new mongoose.Schema(
{
  name: { type: String, required: true },

  registerNumber: { type: String, required: true, unique: true },

  department: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
    match: /@gvgvc\.ac\.in$/,
  },

  password: { type: String, required: true },

  profilePic: { type: String, default: "" },
  
  skills: {type : String, default: ""}

},
{ timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

/* ===============================
   ALUMNI SCHEMA
================================= */

const alumniSchema = new mongoose.Schema(
{
  customId: {
    type: String,
    unique: true,
    required: true
  },

  name: { 
    type: String, 
    required: true 
  },

  department: { 
    type: String, 
    required: true 
  },

  batch: {
    type: Number,
    required: true,
    min: 1980,
    max: 2025
  },

  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  password: { 
    type: String, 
    required: true 
  },

  profilePic: { 
    type: String, 
    default: "" 
  },

  // NEW FIELD
  currentWork: {
    type: String,
    default: ""
  },

  jobRole: {
    type: String,
    default: ""
  }

},
{ timestamps: true }
);
const Alumni = mongoose.model("Alumni", alumniSchema);

/* ===============================
   REQUEST SCHEMA
================================= */

const requestSchema = new mongoose.Schema(
{
  type: String,
  data: Object,
  status: {
    type: String,
    default: "pending",
  },
},
{ timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);

/* ===============================
   REGISTER REQUEST
================================= */

app.post("/register", async (req, res) => {

  try {

    const { role, email } = req.body;

    if (role === "student") {

      if (!email.endsWith("@gvgvc.ac.in")) {
        return res.status(400).json({
          error: "Student email must end with @gvgvc.ac.in",
        });
      }

    }

    const request = new Request({
      type: role,
      data: req.body,
    });

    await request.save();

    res.json({
      message: "Request sent to admin for approval",
    });

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }

});

/* ===============================
   ADMIN REQUESTS
================================= */

app.get("/admin/requests", async (req, res) => {

  try {

    const { type } = req.query;

    let query = {};

    if (type) query.type = type;

    const requests = await Request.find(query);

    res.json(requests);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});

/* ===============================
   ACCEPT REQUEST
================================= */

app.post("/admin/accept/:id", async (req, res) => {

  try {

    const request = await Request.findById(req.params.id);

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    if (request.type === "student") {

      const student = new Student(request.data);
      await student.save();

    }

    else if (request.type === "alumni") {

      // GENERATE CUSTOM ID
      const seq = await getNextSequence("alumniId");

      const alumniData = {
        ...request.data,
        customId: "AL" + seq
      };

      const alumni = new Alumni(alumniData);

      await alumni.save();

    }

    await Request.findByIdAndDelete(req.params.id);

    res.json({ message: "Request accepted successfully" });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email ID already exists"
      });
    }

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }

});

const counterSchema = new mongoose.Schema({
  name: String,
  seq: Number
});

const Counter = mongoose.model("Counter", counterSchema);

async function getNextSequence(name) {

  const counter = await Counter.findOneAndUpdate(
    { name: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;

}

/* ===============================
   REJECT REQUEST
================================= */

app.delete("/admin/reject/:id", async (req, res) => {

  await Request.findByIdAndDelete(req.params.id);

  res.json({ message: "Request rejected" });

});

/* ===============================
   LOGIN
================================= */

app.post("/login", async (req, res) => {

  const { email, password, role } = req.body;

  console.log("LOGIN REQUEST:", { email, role });   // 👈 Debug 1

  let user;

  if (role === "student") user = await Student.findOne({ email });
  if (role === "alumni") user = await Alumni.findOne({ email });

  console.log("USER FROM DATABASE:", user); 
  
   req.session.user = {
    id: user._id,
    role: role
  };// 👈 Debug 2

  if (!user)
    return res.status(400).json({ message: "User not found" });

  if (password !== user.password)
    return res.status(400).json({ message: "Invalid password" });

  const response = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: role,
    department: user.department,
    currentWork:user.currentWork,
    jobRole:user.jobRole,
    batch: user.batch,
    registerNumber: user.registerNumber,
    skills:user.skills
  };

  console.log("RESPONSE SENT TO FRONTEND:", response);  // 👈 Debug 3

  res.json(response);

});
/* ===============================
   NORMAL POST SCHEMA
================================= */

const normalPostSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  role: {
    type: String,
    enum: ["student", "alumni"],
    required: true
  },

  content: {
    type: String,
    required: true,
    trim: true
  },

  image: {
    type: String,
    default: ""
  },

  // 👍 LIKES
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const NormalPost = mongoose.model("NormalPost", normalPostSchema);

app.post("/update-student", async (req, res) => {

  try {

    const { id, skills } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { skills: skills },
      { new: true }
    );

    res.json(updatedStudent);

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Failed to update student" });

  }

});

app.get("/student/:id", async (req,res)=>{

try{

const student = await Student.findById(req.params.id)

res.json(student)

}catch(err){

res.status(500).json({message:"Error fetching student"})

}

})

app.post("/create-post", async (req, res) => {

  try {

    console.log("SESSION:", req.session.user);
    console.log("BODY:", req.body);

    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { content, image } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Post content required" });
    }

    const newPost = new NormalPost({
      userId: req.session.user.id,
      role: req.session.user.role,
      content,
      image: image || ""
    });

    await newPost.save();

    res.json({
      message: "Post created successfully"
    });

  } catch (err) {

    console.error("POST ERROR:", err);

    res.status(500).json({ error: err.message });

  }

});
/* ===============================
   GET POSTS
================================= */

app.get("/posts", async (req, res) => {

  try {

    const posts = await NormalPost.find().sort({ createdAt: -1 });

    const populatedPosts = await Promise.all(

      posts.map(async (post) => {

        let user;

        if (post.role === "student")
          user = await Student.findById(post.userId);

        if (post.role === "alumni")
          user = await Alumni.findById(post.userId);

        return {
          ...post._doc,
          author: user
        };

      })

    );

    res.json(populatedPosts);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});
app.delete("/posts/:id", async (req, res) => {

  try {

    const postId = req.params.id;

    console.log("DELETE REQUEST RECEIVED");
    console.log("Post ID:", postId);

    const post = await NormalPost.findById(postId);

    console.log("POST FOUND:", post);

    if (!post) {
      console.log("Post not found in database");
      return res.status(404).json({ message: "Post not found" });
    }

    const deletedPost = await NormalPost.findByIdAndDelete(postId);

    console.log("POST DELETED:", deletedPost);

    res.json({ message: "Post deleted successfully" });

  } catch (err) {

    console.log("DELETE ERROR:", err);

    res.status(500).json({ error: err.message });

  }

});
/* ===============================
   LOGOUT
================================= */

app.post("/logout", (req, res) => {

  req.session.destroy(() => {

    res.json({
      message: "Logged out successfully",
    });

  });

});

/* ===============================
   ADMIN DASHBOARD
================================= */

app.get("/admin/dashboard-counts", async (req, res) => {

  try {

    const studentCount = await Student.countDocuments();
    const alumniCount = await Alumni.countDocuments();
    const requestCount = await Request.countDocuments();

    res.json({
      students: studentCount,
      alumni: alumniCount,
      requests: requestCount,
    });

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});

/* ===============================
   ADMIN STUDENTS
================================= */

app.get("/admin/students", async (req, res) => {

  try {

    const students = await Student.find();

    res.json(students);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

/* ===============================
   GET SINGLE ALUMNI PROFILE
================================= */

app.get("/alumni/:id", async (req, res) => {

  try {

    const alumni = await Alumni.findById(req.params.id);

    if (!alumni) {
      return res.status(404).json({
        message: "Alumni not found"
      });
    }

    res.json(alumni);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }

});
/* ===============================
   ADMIN ALUMNI
================================= */

app.get("/admin/alumni", async (req, res) => {

  try {

    const alumni = await Alumni.find().sort({ department: 1 });

    res.json(alumni);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});

const interviewPostSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  role: {
    type: String,
    enum: ["student", "alumni"],
    required: true
  },

  company: {
    type: String,
    required: true
  },

  roleName: {
    type: String,
    required: true
  },

  experience: {
    type: String,
    required: true
  }

},
{
  timestamps: true
}
);

const InterviewPost = mongoose.model("InterviewPost", interviewPostSchema);

app.post("/create-interview", async (req, res) => {

  try {
    console.log("SESSION:", req.session.user);

    if (!req.session.user) {
      return res.status(401).json({
        error: "Not authenticated"
      });
    }

    const { company, role, experience } = req.body;

    if (!company || !role || !experience) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const interview = new InterviewPost({

      userId: req.session.user.id,
      role: req.session.user.role,

      company: company,
      roleName: role,
      experience: experience

    });

    await interview.save();

    res.status(201).json({
      message: "Interview posted successfully",
      interview
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });

  }

});
app.get("/interviews/all", async (req, res) => {

  console.log("STEP 1 → Endpoint /interviews/all triggered");

  try {

    console.log("STEP 2 → Fetching interview posts from database");

    const interviews = await InterviewPost
      .find()
      .sort({ createdAt: -1 });

    console.log("STEP 3 → Total interviews found:", interviews.length);

    const populatedInterviews = await Promise.all(

      interviews.map(async (post, index) => {

        console.log("------------------------------------");
        console.log("STEP 4 → Processing interview index:", index);
        console.log("Interview ID:", post._id);
        console.log("UserId:", post.userId);
        console.log("Role:", post.role);
        console.log("Company:", post.company);

        let user;

        if (post.role === "student") {
          console.log("STEP 5 → Searching Student collection");
          user = await Student.findById(post.userId);
        }

        if (post.role === "alumni") {
          console.log("STEP 6 → Searching Alumni collection");
          user = await Alumni.findById(post.userId);
        }

        console.log("STEP 7 → User fetched from DB:", user);

        if (!user) {
          console.log("WARNING → No user found for userId:", post.userId);
        }

        console.log("STEP 8 → Preparing response object");

        return {
          ...post._doc,
          author: {
            name: user?.name,
            jobRole: user?.jobRole,
            department: user?.department
          }
        };

      })

    );

    console.log("STEP 9 → Sending response to frontend");

    res.json(populatedInterviews);

  } catch (error) {

    console.log("STEP ERROR → Something failed");
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch interview posts",
      error: error.message
    });

  }

});

app.post("/update-alumni", async (req, res) => {

  try {

    const { id, currentWork, jobRole } = req.body;

    const updated = await Alumni.findByIdAndUpdate(
      id,
      {
        currentWork: currentWork,
        jobRole: jobRole
      },
      { new: true }
    );

    res.json({
      message: "Profile updated successfully",
      alumni: updated
    });

  } catch (err) {

    console.log(err);
    res.status(500).json({ message: "Server error" });

  }

});

app.post("/like-post", async (req,res)=>{

  try{

    const {postId,userId} = req.body;

    const post = await NormalPost.findById(postId);

    if(!post){
      return res.status(404).json({message:"Post not found"});
    }

    const alreadyLiked = post.likes.some(
      id => id.toString() === userId
    );

    if(alreadyLiked){

      post.likes = post.likes.filter(
        id => id.toString() !== userId
      );

    }else{

      post.likes.push(userId);

    }

    await post.save();

    res.json(post);

  }catch(err){

    console.log(err);
    res.status(500).json({message:"Server error"});

  }

});
app.get("/search", async (req, res) => {

  console.log("\n🔎 SEARCH API HIT");

  try {

    const { name } = req.query;

    if (!name) return res.json([]);

    const regex = new RegExp(name, "i");

    const students = await Student.find({ name: regex });
    const alumni = await Alumni.find({ name: regex });

    const studentResults = students.map(s => ({
      _id: s._id,
      name: s.name,
      department: s.department,
      batch:s.batch,
      registerNumber: s.registerNumber,
      role: "student"
    }));

    const alumniResults = alumni.map(a => ({
      _id: a._id,
      name: a.name,
      batch: a.batch,
      department: a.department,
      currentWork: a.currentWork,
      jobRole: a.jobRole,
      role: "alumni"
    }));

    const results = [...studentResults, ...alumniResults];

    // ✅ PRINT WHAT IS SENT TO FRONTEND
    console.log("📦 RESPONSE BEING SENT:");
    console.log(JSON.stringify(results, null, 2));

    res.json(results);

  } catch (err) {

    console.log("❌ ERROR:", err.message);
    res.status(500).json({ error: err.message });

  }

});

const connectionSchema = new mongoose.Schema({

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "senderModel"
  },

  senderModel: {
    type: String,
    required: true,
    enum: ["Student", "Alumni"]
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "receiverModel"
  },

  receiverModel: {
    type: String,
    required: true,
    enum: ["Student", "Alumni"]
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

const Connection = mongoose.model("Connection", connectionSchema);

app.post("/connect", async (req, res) => {

  try {

    const {
      senderId,
      receiverId,
      senderModel,
      receiverModel
    } = req.body;

    // Prevent self connection
    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot connect to yourself" });
    }

    // Prevent duplicate request
    const existing = await Connection.findOne({
      sender: senderId,
      receiver: receiverId
    });

    if (existing) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const connection = new Connection({
      sender: senderId,
      receiver: receiverId,
      senderModel,
      receiverModel,
      status: "pending"
    });

    await connection.save();

    res.json({ message: "Connection request sent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});
app.get("/connect/accepted/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    console.log("User ID:", userId);

    const connections = await Connection.find({
      status: "accepted",
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
    .populate("sender", "name role department jobRole currentWork")
    .populate("receiver", "name role department jobRole currentWork");

    console.log("Connections found:", connections);

    const users = connections.map(conn => {

      console.log("Connection:", conn);

      if (conn.sender && conn.sender._id.toString() === userId) {
        return conn.receiver;
      } else {
        return conn.sender;
      }

    });

    console.log("Users returned:", users);

    res.json(users);

  } catch (err) {

    console.log("ERROR:", err);
    res.status(500).json({ error: err.message });

  }

});
app.put("/connect/accept/:id", async (req, res) => {

  try {

    await Connection.findByIdAndUpdate(req.params.id, {
      status: "accepted"
    });

    res.json({ message: "Connection accepted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

app.put("/connect/reject/:id", async (req, res) => {

  try {

    await Connection.findByIdAndUpdate(req.params.id, {
      status: "rejected"
    });

    res.json({ message: "Connection rejected" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

app.get("/connect/pending/:userId", async (req, res) => {

  try {

    const requests = await Connection.find({
      receiver: req.params.userId,
      status: "pending"
    }).populate("sender");

    res.json(requests);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

app.get("/connections/:userId", async (req, res) => {

  try {

    const connections = await Connection.find({
      $or: [
        { sender: req.params.userId, status: "accepted" },
        { receiver: req.params.userId, status: "accepted" }
      ]
    });

    res.json(connections);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

app.get("/connections/mutual/:userId1/:userId2", async (req, res) => {

  try {

    const user1 = await Connection.find({
      $or: [
        { sender: req.params.userId1, status: "accepted" },
        { receiver: req.params.userId1, status: "accepted" }
      ]
    });

    const user2 = await Connection.find({
      $or: [
        { sender: req.params.userId2, status: "accepted" },
        { receiver: req.params.userId2, status: "accepted" }
      ]
    });

    const user1Ids = user1.map(c =>
      c.sender.toString() === req.params.userId1
        ? c.receiver.toString()
        : c.sender.toString()
    );

    const user2Ids = user2.map(c =>
      c.sender.toString() === req.params.userId2
        ? c.receiver.toString()
        : c.sender.toString()
    );

    const mutual = user1Ids.filter(id => user2Ids.includes(id));

    res.json(mutual);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

app.get("/suggestions/:userId/:role", async (req, res) => {

  try {

    const { userId, role } = req.params;

    // 1️⃣ Get all connections of this user
    const connections = await Connection.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    });

    // 2️⃣ Collect connected IDs
    const connectedIds = connections.map(conn =>
      conn.sender.toString() === userId
        ? conn.receiver.toString()
        : conn.sender.toString()
    );

    connectedIds.push(userId); // exclude self

    const objectIds = connectedIds.map(id =>
      new mongoose.Types.ObjectId(id)
    );

    // 3️⃣ Get random students
    const students = await Student.aggregate([
      { $match: { _id: { $nin: objectIds } } },
      { $sample: { size: 7 } }
    ]);

    // 4️⃣ Get random alumni
    const alumni = await Alumni.aggregate([
      { $match: { _id: { $nin: objectIds } } },
      { $sample: { size: 7 } }
    ]);

    // 5️⃣ Add role field
    const studentResults = students.map(s => ({
      ...s,
      role: "student"
    }));

    const alumniResults = alumni.map(a => ({
      ...a,
      role: "alumni"
    }));

    // 6️⃣ Combine + shuffle
    const combined = [...studentResults, ...alumniResults]
      .sort(() => 0.5 - Math.random())
      .slice(0, 7);

    res.json(combined);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }

});

app.get("/connection-status/:userId/:otherId", async (req, res) => {

  try {

    console.log("\n🔎 CONNECTION STATUS API HIT");

    const { userId, otherId } = req.params;

    console.log("➡ User 1:", userId);
    console.log("➡ User 2:", otherId);

    const connection = await Connection.findOne({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId }
      ]
    });

    console.log("📦 Connection found in DB:", connection);

    if (!connection) {

      console.log("❌ No connection found");

      return res.json({ status: "none" });

    }

    console.log("✅ DB status:", connection.status);

    if (connection.status === "accepted") {

      console.log("🎉 Returning status: connected");

      return res.json({ status: "connected" });

    }

    console.log("📤 Returning status:", connection.status);

    return res.json({ status: connection.status });

  } catch (err) {

    console.log("🔥 ERROR:", err);

    res.status(500).json({ error: err.message });

  }

});
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  text: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model("Message", messageSchema);
app.post("/send-message", async (req, res) => {

  const { senderId, receiverId, text } = req.body;

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    text
  });

  res.json(message);

});
app.get("/messages/:user1/:user2", async (req, res) => {

  const { user1, user2 } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);

});
app.get("/recent-chats/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log("Fetching recent chats for:", userId);

    const chats = await Message.aggregate([

      {
        $match: {
          $or: [
            { sender: userObjectId },
            { receiver: userObjectId }
          ]
        }
      },

      {
        $sort: { createdAt: -1 }
      },

      // Determine who the OTHER user is
      {
        $addFields: {
          otherUser: {
            $cond: [
              { $eq: ["$sender", userObjectId] },
              "$receiver",
              "$sender"
            ]
          }
        }
      },

      // Group by other user
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$text" },
          createdAt: { $first: "$createdAt" }
        }
      },

      // Lookup Student
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },

      // Lookup Alumni
      {
        $lookup: {
          from: "alumnis",
          localField: "_id",
          foreignField: "_id",
          as: "alumni"
        }
      },

      {
        $addFields: {

          name: {
            $ifNull: [
              { $arrayElemAt: ["$student.name", 0] },
              { $arrayElemAt: ["$alumni.name", 0] }
            ]
          },

          role: {
            $cond: [
              { $gt: [{ $size: "$student" }, 0] },
              "student",
              "alumni"
            ]
          },

          department: {
            $arrayElemAt: ["$student.department", 0]
          },

          jobRole: {
            $arrayElemAt: ["$alumni.jobRole", 0]
          },

          currentWork: {
            $arrayElemAt: ["$alumni.currentWork", 0]
          }

        }
      },

      {
        $project: {
          student: 0,
          alumni: 0
        }
      }

    ]);

    console.log("Chats found:", chats);

    res.json(chats);

  } catch (err) {

    console.log("Recent chats error:", err);

    res.status(500).json({ error: err.message });

  }

});

app.delete("/connect/reject/:id", async (req,res)=>{

  await Connection.findByIdAndDelete(req.params.id);

  res.json({ message:"Request rejected" });

});
/* ===============================
   SERVER START
================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

