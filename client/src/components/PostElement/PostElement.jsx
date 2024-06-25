import React from 'react';
import './PostElement.css';
import logo from '../../assets/logos/astus.png';
import gold_ingot from '../../assets/icons/rarity/gold_ingot.png'


const PostElement = ({ post }) => {
  return (
    <div className="post">
      <div className="post-header">
        <img src={logo} alt="Logo" className="logo" />
        <div className="post-info">
          <span className="date">{post.event} - {post.date}</span>
          <span className="user">{post.user}</span>
        </div>
        <div className="status">
          <span className="status-text">En cours</span>
        </div>
      </div>
      <div className="post-image">
        <img src={post.image} alt={post.title} />
      </div>
      <div className="post-body">
        <div className="points">
            <img src={gold_ingot} alt="Points Icon" className="points-icon" />
          <i className="fas fa-glasses"></i>
        </div>
        <div className="post-title">
          <span>{post.title}</span>
        </div>
        <div className="reward">
          <span>{post.reward}</span>
        </div>
      </div>
      <div className="post-footer">
        <button className="sheesh-button">Je Sheesh!</button>
      </div>
    </div>
  );
};

export default PostElement;
