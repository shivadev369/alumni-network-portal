import { useEffect, useState } from "react";
import axios from "axios";
import "./ManagePosts.css";
import { useNavigate } from "react-router-dom";

const ManagePosts = () => {

  const [posts,setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(()=>{

    fetchPosts();

  },[]);

  const fetchPosts = async () => {

    const res = await axios.get("https://alumni-backend-vhm7.onrender.com/posts");

    setPosts(res.data);

  };

  const deletePost = async (id) => {

    if(!window.confirm("Delete this post?")) return;

    await axios.delete(`https://alumni-backend-vhm7.onrender.com/posts/${id}`);

    fetchPosts();

  };

  return(
    
    
    

  <div className="manage-posts-container">

    <div className="posts-header">

      <h2>Manage Posts</h2>

      <button
        className="back-btn"
        onClick={()=>navigate("/admin")}
      >
        Back
      </button>

    </div>

    {posts.length === 0 ? (

      <p className="no-posts">No posts available</p>

    ) : (

      <div className="posts-grid">

        {posts.map(post => (

          <div key={post._id} className="post-card">

            <div className="post-author">

              <strong>{post.author?.name}</strong>
              <span className="post-role">
                {post.role}
              </span>

            </div>

            <p className="post-content">
              {post.content}
            </p>

            {post.image && (

              <img
                src={post.image}
                className="post-image"
              />

            )}

            <button
              className="delete-post-btn"
              onClick={()=>deletePost(post._id)}
            >
              Delete Post
            </button>

          </div>

        ))}

      </div>

    )}

  </div>
  

  );

};

export default ManagePosts;