import React from 'react';
import './PostElement.css';
import logo from '../../assets/logos/astus.png';
import gold_ingot from '../../assets/icons/rarity/gold_ingot.png'
import smiley_face from '../../assets/buttons/likes/thumbs-up.png'
import fries_reward_icon from '../../assets/icons/rewards/fries.png'
import default_reward_icon from '../../assets/icons/rewards/default.png'
import beer_reward_icon from '../../assets/icons/rewards/beer.png'

const PostElement = ({ post }) => {
    const getRewardIcon = (reward) => {
        const normalizedReward = reward.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
        if (normalizedReward.includes('frite') || normalizedReward.includes('frites')) {
          return fries_reward_icon;
        }
        if (normalizedReward.includes('biere') || normalizedReward.includes('bieres')) {
          return beer_reward_icon;
        }
        return default_reward_icon;
      };

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
        <div className="reward">
          <img src={getRewardIcon(post.reward)} alt="Reward Icon" className="reward-icon" />
          <span className="reward-text">{post.reward}</span>
        </div>
        <img src={gold_ingot} alt="Points Icon" className="points-icon" />
        <div className="post-title">
          <span>{post.title}</span>
        </div>
        <div className="post-likes">
          <button className="likes-button">
            <img src={smiley_face} alt="Likes Icon" className="likes-icon" />
          </button>
          {post.likes > 0 && <span>{post.likes}</span>}
        </div>
      </div>
      <div className="post-footer">
        <button className="sheesh-button">Je Sheesh!</button>
      </div>
    </div>
  );
};

export default PostElement;
