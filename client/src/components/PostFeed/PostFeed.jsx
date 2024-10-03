import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostElement from '../PostElement/PostElement';
import './PostFeed.css';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };
  
  return (
    <div className="postfeed">
      {posts.map((post) => (
        <PostElement key={post._id} post={post} onDelete={handleDelete} fetchPosts={fetchPosts} />
      ))}
    </div>
  );
}

export default PostFeed;