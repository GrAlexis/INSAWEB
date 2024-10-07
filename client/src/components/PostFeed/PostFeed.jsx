import React, { useEffect, useState } from 'react';
import config from '../../config';
import axios from 'axios';
import PostElement from '../PostElement/PostElement';
import './PostFeed.css';

const PostFeed = ({ setParticipants }) => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(config.backendAPI + '/posts');
      setPosts(response.data);
      
      const participants = response.data.map(post => {
        const user = post.user ? `${post.user.name} ${post.user.lastName}` : null;
        const challenge = post.challengeId ? post.challengeId.title : null;
        
        if (user && challenge) {
          return `${user} a participé à ${challenge}`;
        }
        return null;
      }).filter(participant => participant !== null); 

      setParticipants(participants); 

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
