// PostFeed.jsx
import React, { useEffect, useState } from 'react';
import config from '../../config';
import axios from 'axios';
import PostElement from '../PostElement/PostElement';
import './PostFeed.css';
import LazyLoad from 'react-lazyload';

const PostFeed = ({ selectedEvent, searchQuery }) => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(config.backendAPI + '/posts');
      let filteredPosts = response.data;

      // Filter by selected event if event filter is applied
      if (selectedEvent) {
        filteredPosts = filteredPosts.filter(post => post.challengeId && post.eventId === selectedEvent.id);
      }

      // Filter by search query
      if (searchQuery) {
        filteredPosts = filteredPosts.filter(post => {
          // Match by user name (assuming post has user info)
          const userMatch = post.user && post.user.name.toLowerCase().includes(searchQuery);

          // Match by challenge title (assuming post has challenge info)
          const challengeMatch = post.challenge && post.challenge.title.toLowerCase().includes(searchQuery);

          // Match by event title (assuming post has event info)
          const eventMatch = post.event && post.event.title.toLowerCase().includes(searchQuery);

          // Return true if any match is found
          return userMatch || challengeMatch || eventMatch;
        });
      }

      setPosts(filteredPosts);
      
    } catch (error) {
      console.error('Error fetching posts', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedEvent, searchQuery]); // Refetch posts when searchQuery or selectedEvent changes

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
