import React from 'react';
import './CommentModal.css';

const CommentModal = ({ comments, onClose, onDeleteComment, currentUserId }) => {
  return (
    <div className="comment-modal">
      <div className="comment-modal-content">
        <h4>Commentaires (version longue)</h4>
        <button className="close-modal" onClick={onClose}>✕</button>
        <div className="comment-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment">
              <p><strong>{comment.userLabel}</strong>: {comment.text}</p>
              {comment.user === currentUserId && (
                <button className="delete-comment-button" onClick={() => onDeleteComment(comment._id)}>
                  <span className="delete-icon">✕</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
