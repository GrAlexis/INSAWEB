import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostElement from '../PostElement/PostElement';
import './PostFeed.css';

const PostFeed = ({ }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts', error);
      }
    };

    fetchPosts();
  }, []);

  
  
  return (
    <div className="postfeed">
      {posts.map((post) => (
        <PostElement key={post._id} post={post} />
      ))}
    </div>
  );
}

export default PostFeed;
