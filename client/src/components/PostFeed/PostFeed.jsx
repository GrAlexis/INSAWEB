import PostElement from "../PostElement/PostElement";


const PostFeed = ({ posts }) => {
  
  return (
    <div className="postfeed">
      {posts.map((post) => (
        <PostElement key={post.id} post={post} />
      ))}
    </div>
  );
}

export default PostFeed;
