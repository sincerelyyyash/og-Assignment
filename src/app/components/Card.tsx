
"use client";

import React, { useState } from "react";

type CardProps = {
  post: { id: string; content: string; timestamp: string; childrenCount?: number };
  onReply: (id: string, replyContent: string) => void;
  onShowComments: (id: string) => void;
};

const Card = ({ post, onReply, onShowComments }: CardProps) => {
  const [replyContent, setReplyContent] = useState("");

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyContent(e.target.value);
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(post.id, replyContent);
      setReplyContent(""); // Clear the textarea after reply is submitted
    }
  };

  return (
    <div className="p-4 border rounded-md mb-4">
      <h2 className="text-xl text-black font-semibold">{post.content}</h2>
      <p className="text-sm text-gray-500">{new Date(post.timestamp).toLocaleString()}</p>
      <div className="mt-2 flex space-x-4">
        <button onClick={() => onShowComments(post.id)} className="text-blue-500">
          Show Comments ({post.childrenCount || 0})
        </button>
        <button onClick={() => onReply(post.id, replyContent)} className="text-green-500">
          Reply
        </button>
      </div>

      <div className="mt-4">
        <textarea
          value={replyContent}
          onChange={handleReplyChange}
          placeholder="Write a reply..."
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <button
          onClick={handleReplySubmit}
          className="bg-black text-white px-4 py-2 rounded mt-2"
        >
          Submit Reply
        </button>
      </div>
    </div>
  );
};

export default Card;

