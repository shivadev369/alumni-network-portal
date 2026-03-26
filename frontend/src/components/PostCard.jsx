import "./PostCard.css";

const PostCard = ({ post, onEdit, onDelete, showActions }) => {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <small>
        By {post.author?.name} | {new Date(post.createdAt).toLocaleDateString()}
      </small>

      {showActions && (
        <div style={{ marginTop: "10px" }}>
          <button onClick={() => onEdit(post)}>Edit</button>
          <button
            onClick={() => onDelete(post._id)}
            style={{ marginLeft: "10px", background: "red", color: "white" }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PostCard;