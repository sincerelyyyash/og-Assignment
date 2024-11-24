"use client"

import React from "react";

type Comment = {
  id: string;
  content: string;
  timestamp: string;
};

type CommentSectionProps = {
  comments: Comment[];
};

const CommentSection = ({ comments }: CommentSectionProps) => {
  return (
    <div className="mt-4 space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="p-4 border rounded-md">
          <p className="text-gray-700">{comment.content}</p>
          <p className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentSection;

