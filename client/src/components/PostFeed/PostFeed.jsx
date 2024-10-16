import React, { useEffect, useState } from 'react';
import config from '../../config';
import axios from 'axios';
import PostElement from '../PostElement/PostElement';
import './PostFeed.css';
import LazyLoad from 'react-lazyload';

const PostFeed = ({ setParticipants, selectedEvent }) => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${config.backendAPI}/posts`, {
        params: {
          universeId: config.universe  // Send universeId as a query parameter
        }
      });
      let filteredPosts = response.data;
  
      if (selectedEvent) {
        filteredPosts = filteredPosts.filter(post => post.challengeId && post.eventId === selectedEvent.id);
      }
  
      setPosts(filteredPosts);
      
      const participants = filteredPosts.map(post => {
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
  }, [selectedEvent]);

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  return (
    <div className="postfeed">
      {posts.map((post) => (
        <LazyLoad key={post._id} height={200} offset={100} once> 
          <PostElement post={post} onDelete={handleDelete} fetchPosts={fetchPosts} />
        </LazyLoad>      
    ))}
    </div>
  );
}

export default PostFeed;
