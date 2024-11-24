"use client";

import React, { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";

type Post = {
  id: string;
  content: string;
  timestamp: string;
  parentId: string | null;
  likes: number;
  dislikes: number;
};

type Comment = {
  id: string;
  content: string;
  timestamp: string;
  postId: string;
};

type PaginatedResponse = {
  page: number;
  pageSize: number;
  totalPages: number;
  posts: Post[];
};

const fetchRootPosts = async ({ page = 1, pageSize = 10 }): Promise<PaginatedResponse> => {
  const { data } = await axios.get(`/api/posts/root?page=${page}&page_size=${pageSize}`);
  return data;
};

const createPost = async (content: string, parentId?: string) => {
  const { data } = await axios.post("/api/posts", { content, parentId });
  return data;
};

const createComment = async (postId: string, content: string) => {
  const { data } = await axios.post(`/api/posts/${postId}/comments`, { content });
  return data;
};

const fetchPostComments = async (postId: string) => {
  const { data } = await axios.get(`/api/posts/${postId}/comments`);
  return data;
};
const CommentItem = ({ comment }: { comment: Comment }) => {
  return (
    <div className="pl-4 border-l border-gray-200 mt-2">
      <p className="text-gray-700">{comment.content}</p>
      <p className="text-sm text-gray-500 mb-2">
        {new Date(comment.timestamp).toLocaleString()}
      </p>
    </div>
  );
};

const Post = ({ post }: { post: Post }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleShowComments = async (postId: string) => {
    if (!showComments) {
      try {
        const fetchedComments = await fetchPostComments(postId);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }
    setShowComments(!showComments);
  };

  const handleReply = async (postId: string, content: string) => {
    try {
      const newComment = await createComment(postId, content);
      setComments(prev => [...prev, newComment]);
      setReplyContent("");
      setIsReplying(false);
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  return (
    <div className="border rounded-md p-4 mb-4">
      <h2 className="text-xl text-black font-semibold">{post.content}</h2>
      <p className="text-sm text-gray-500 mb-2">
        {new Date(post.timestamp).toLocaleString()}
      </p>
      <div className="flex space-x-4 mb-2">
        <button
          onClick={() => handleShowComments(post.id)}
          className="text-blue-500"
        >
          {showComments ? "Hide Comments" : "Show Comments"}
        </button>
        <button
          onClick={() => setIsReplying(!isReplying)}
          className="text-blue-500"
        >
          Reply
        </button>
      </div>
      {isReplying && (
        <div className="mt-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
            placeholder="Write a reply..."
          />
          <button
            onClick={() => handleReply(post.id, replyContent)}
            className="mt-2 px-4 py-1 bg-black text-white rounded-md"
          >
            Submit
          </button>
        </div>
      )}
      {showComments && (
        <div className="mt-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Page Component
export default function HomePage() {
  const [newPostContent, setNewPostContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError, error } = useQuery(
    ["rootPosts", currentPage],
    () => fetchRootPosts({ page: currentPage }),
    {
      onError: (err) => console.error("Error fetching posts:", err)
    }
  );

  const handlePostSubmit = async () => {
    if (!newPostContent.trim()) return;
    try {
      await createPost(newPostContent);
      setNewPostContent("");
      window.location.reload();
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
      {isError && (
        <p className="text-black">Error loading posts: {(error as Error).message}</p>
      )}
      {data?.posts.map((post: Post) => (
        <Post key={post.id} post={post} />
      ))}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1
                ? "bg-black text-white"
                : "bg-gray-200 text-black"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
