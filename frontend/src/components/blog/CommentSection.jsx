// src/components/blog/CommentSection.jsx
import React, { useState } from "react";
import { FaUser, FaPaperPlane, FaThumbsUp, FaReply } from "react-icons/fa";
import toast from "react-hot-toast";

const initialComments = [
  {
    id: 1,
    name: "Grace A.",
    avatar: null,
    date: "2024-11-19T10:30:00Z",
    content: "This was incredibly helpful. I've been monitoring my blood pressure at home for a year now and this article confirmed what my doctor has been saying. Thank you for making it so clear.",
    likes: 24,
    replies: [],
  },
  {
    id: 2,
    name: "Michael O.",
    avatar: null,
    date: "2024-11-19T14:15:00Z",
    content: "I appreciate that you included the medication section without pushing it. So many articles either fear-monger about meds or act like lifestyle changes alone are enough for everyone.",
    likes: 18,
    replies: [
      {
        id: 21,
        name: "Dr. James Mensah",
        isAuthor: true,
        date: "2024-11-19T15:00:00Z",
        content: "Thank you, Michael. Individualized care is everything — what works for one person may not for another. Glad the article resonated.",
        likes: 12,
      },
    ],
  },
];

const CommentSection = () => {
  const [comments, setComments] = useState(initialComments);
  const [form, setForm] = useState({ name: "", email: "", content: "" });
  const [replyTo, setReplyTo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.content) {
      toast.error("Please fill in all fields");
      return;
    }
    const newComment = {
      id: Date.now(),
      name: form.name,
      date: new Date().toISOString(),
      content: form.content,
      likes: 0,
      replies: [],
    };
    setComments([newComment, ...comments]);
    setForm({ name: "", email: "", content: "" });
    toast.success("Comment posted! It will appear after moderation.");
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-md mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">Leave a Comment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Your name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a3a1] focus:border-transparent text-sm"
            required
          />
          <input
            type="email"
            placeholder="Your email * (not published)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a3a1] focus:border-transparent text-sm"
            required
          />
        </div>
        <textarea
          placeholder="Share your thoughts or questions... *"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a3a1] focus:border-transparent text-sm resize-none mb-4"
          required
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          <FaPaperPlane /> Post Comment
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a3a1] to-[#007a78] flex items-center justify-center text-white flex-shrink-0">
                {comment.avatar ? (
                  <img src={comment.avatar} alt={comment.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{comment.name}</span>
                  <span className="text-xs text-gray-400">{formatDate(comment.date)}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {comment.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <button className="flex items-center gap-1.5 hover:text-[#00a3a1] transition-colors">
                    <FaThumbsUp /> {comment.likes}
                  </button>
                  <button
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="flex items-center gap-1.5 hover:text-[#00a3a1] transition-colors"
                  >
                    <FaReply /> Reply
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-16 mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      <FaUser className="text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{reply.name}</span>
                        {reply.isAuthor && (
                          <span className="text-[10px] bg-[#00a3a1] text-white px-2 py-0.5 rounded-full font-medium">
                            Author
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(reply.date)}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommentSection;