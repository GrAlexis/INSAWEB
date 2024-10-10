import React, { useEffect, useState } from 'react';
import config from '../../config';
import axios from 'axios';
import PostElement from '../PostElement/PostElement';
import './PostFeed.css';
import LazyLoad from 'react-lazyload';

const PostFeed = ({selectedEvent }) => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(config.backendAPI + '/posts');
      let filteredPosts = response.data;

      if (selectedEvent) {
        console.log("selectedevent.id "+selectedEvent.id)
        filteredPosts = filteredPosts.filter(post => post.challengeId && post.eventId === selectedEvent.id);
      }

      setPosts(filteredPosts);
      
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
