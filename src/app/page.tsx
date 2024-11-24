
"use client";

import React, { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import Card from "./components/Card";
import CommentSection from "./components/Comments";

type Post = {
  id: string;
  content: string;
  timestamp: string;
};

type Comment = {
  id: string;
  content: string;
  timestamp: string;
};

const fetchRootPosts = async () => {
  const { data } = await axios.get("/api/posts/root");
  return data.posts;
};

const createPost = async (content: string) => {
  const { data } = await axios.post("/api/posts", { content });
  return data;
};

const createReply = async (postId: string, content: string) => {
  try {
    const response = await axios.post(`/api/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  } catch (err: any) {
    console.error("Error creating reply:", err);
    throw new Error("Failed to create reply");
  }
};

const fetchComments = async (postId: string) => {
  try {
    const { data } = await axios.get(`/api/posts/${postId}/comments`);
    return data;
  } catch (err: any) {
    console.error("Error fetching comments:", err);
    throw new Error("Failed to fetch comments");
  }
};

export default function HomePage() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newPostContent, setNewPostContent] = useState("");

  const { data: posts = [], isLoading, isError, error } = useQuery("rootPosts", fetchRootPosts);

  const handleReply = async (postId: string, replyContent: string) => {
    if (replyContent.trim()) {
      try {
        const reply = await createReply(postId, replyContent);
        setComments((prevComments) => [
          ...prevComments,
          { id: reply.id, content: reply.content, timestamp: reply.timestamp },
        ]);
      } catch (error) {
        console.error("Failed to post reply:", error);
      }
    }
  };

  const handleShowComments = async (postId: string) => {
    setSelectedPostId(postId);
    try {
      const data = await fetchComments(postId);
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPostContent.trim()) return;

    try {
      const newPost = await createPost(newPostContent);
      setNewPostContent(""); // Clear textarea after posting
      window.location.reload(); // Re-fetch posts after new post is created
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 bg-white">
      <h1 className="text-3xl font-bold text-center mb-6 text-black">Posts</h1>

      <div className="mb-6">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <button
          onClick={handlePostSubmit}
          className="bg-black text-white px-4 py-2 rounded mt-2"
        >
          Post
        </button>
      </div>

      {isLoading && <p className="text-black">Loading posts...</p>}

      {isError && <p className="text-black">Error loading posts: {(error as Error).message}</p>}

      {(!isLoading && !isError && posts.length === 0) && <p className="text-black">No posts available.</p>}

      {posts.map((post: Post) => (
        <Card
          key={post.id}
          post={post}
          onReply={handleReply}
          onShowComments={() => handleShowComments(post.id)}
        />
      ))}

      {selectedPostId && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-black">Comments</h2>
          <CommentSection comments={comments} />
        </div>
      )}
    </div>
  );
}

