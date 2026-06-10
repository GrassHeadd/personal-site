"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import {
  getPosts,
  getDrafts,
  createPost,
  updatePost,
  deletePost,
  type Post,
} from "@/lib/talkerinos";

type View = "list" | "create" | "edit";

export default function TalkerinosAdmin() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const storedKey = localStorage.getItem("talkerinos_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      setIsAuthed(true);
      fetchAllPosts(storedKey);
    }
  }, []);

  const fetchAllPosts = async (key?: string) => {
    const keyToUse = key || apiKey;
    setLoading(true);
    setError(null);
    try {
      const [publishedPosts, draftPosts] = await Promise.all([
        getPosts(),
        getDrafts(keyToUse),
      ]);
      setPosts(publishedPosts || []);
      setDrafts(draftPosts || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Failed to load posts. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem("talkerinos_api_key", apiKey);
      setIsAuthed(true);
      fetchAllPosts(apiKey);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("talkerinos_api_key");
    setApiKey("");
    setIsAuthed(false);
    setPosts([]);
    setDrafts([]);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingPost) {
      setSlug(generateSlug(value));
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setEditingPost(null);
    setError(null);
    setSuccess(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createPost(apiKey, { title, slug, content });
      setSuccess("Post created as draft!");
      resetForm();
      setView("list");
      await fetchAllPosts();
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !title.trim() || !slug.trim() || !content.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updatePost(apiKey, editingPost.ID, {
        title,
        slug,
        content,
        published: editingPost.Published,
      });
      setSuccess("Post updated!");
      resetForm();
      setView("list");
      await fetchAllPosts();
    } catch (err) {
      console.error("Failed to update post:", err);
      setError("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    setLoading(true);
    setError(null);
    try {
      await updatePost(apiKey, post.ID, {
        title: post.Title,
        slug: post.Slug,
        content: post.Content,
        published: !post.Published,
      });
      setSuccess(post.Published ? "Post unpublished" : "Post published!");
      await fetchAllPosts();
    } catch (err) {
      console.error("Failed to toggle publish:", err);
      setError("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post: Post) => {
    if (!confirm(`Delete "${post.Title}"? This cannot be undone.`)) return;

    setLoading(true);
    setError(null);
    try {
      await deletePost(apiKey, post.ID);
      setSuccess("Post deleted");
      await fetchAllPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Failed to delete post");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (post: Post) => {
    router.push(`/talkerinos/admin/edit/${post.ID}`);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!isAuthed) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 md:pt-40 pb-20">
          <div className="max-w-md mx-auto px-5">
            <h1 className="text-3xl font-bold text-cream mb-8 text-center">
              Talkerinos Admin
            </h1>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-white-50 text-sm mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black-200 border border-black-300 text-white focus:border-forest focus:outline-none transition-colors"
                  placeholder="Enter your API key"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-lg bg-forest text-black-100 font-medium hover:bg-forest transition-colors"
              >
                Login
              </button>
              <Link
                href="/talkerinos"
                className="block text-center text-white-50 hover:text-forest transition-colors"
              >
                Back to Talkerinos
              </Link>
            </form>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 md:pt-40 pb-20">
        <div className="max-w-4xl mx-auto px-5 md:px-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-cream">
              {view === "list" && "Talkerinos Admin"}
              {view === "create" && "New Post"}
              {view === "edit" && "Edit Post"}
            </h1>
            <div className="flex items-center gap-4">
              {view === "list" ? (
                <>
                  <button
                    onClick={() => {
                      resetForm();
                      setView("create");
                    }}
                    className="px-4 py-2 rounded-lg bg-forest text-black-100 font-medium hover:bg-forest transition-colors"
                  >
                    New Post
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg border border-white-50 text-white-50 hover:border-red-400 hover:text-red-400 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    resetForm();
                    setView("list");
                  }}
                  className="px-4 py-2 rounded-lg border border-white-50 text-white-50 hover:border-forest hover:text-forest transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-forest/10 border border-forest/50 text-forest">
              {success}
            </div>
          )}

          {/* List View */}
          {view === "list" && (
            <>
              {loading ? (
                <div className="text-center py-20 text-white-50">
                  Loading...
                </div>
              ) : (
                <>
                  {/* Drafts */}
                  {drafts.length > 0 && (
                    <div className="mb-10">
                      <h2 className="text-xl font-semibold text-amber mb-4">
                        Drafts ({drafts.length})
                      </h2>
                      <div className="space-y-3">
                        {drafts.map((post) => (
                          <PostRow
                            key={post.ID}
                            post={post}
                            onEdit={() => startEdit(post)}
                            onTogglePublish={() => handleTogglePublish(post)}
                            onDelete={() => handleDelete(post)}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Published */}
                  <div>
                    <h2 className="text-xl font-semibold text-forest mb-4">
                      Published ({posts.length})
                    </h2>
                    {posts.length === 0 ? (
                      <p className="text-white-50 py-8 text-center">
                        No published posts yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {posts.map((post) => (
                          <PostRow
                            key={post.ID}
                            post={post}
                            onEdit={() => startEdit(post)}
                            onTogglePublish={() => handleTogglePublish(post)}
                            onDelete={() => handleDelete(post)}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Create/Edit Form */}
          {(view === "create" || view === "edit") && (
            <form
              onSubmit={view === "create" ? handleCreate : handleUpdate}
              className="space-y-6"
            >
              <div>
                <label className="block text-white-50 text-sm mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black-200 border border-black-300 text-white focus:border-forest focus:outline-none transition-colors"
                  placeholder="Post title"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-white-50 text-sm mb-2">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black-200 border border-black-300 text-white focus:border-forest focus:outline-none transition-colors font-mono text-sm"
                  placeholder="post-url-slug"
                />
              </div>

              <div>
                <label className="block text-white-50 text-sm mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 rounded-lg bg-black-200 border border-black-300 text-white focus:border-forest focus:outline-none transition-colors resize-y"
                  placeholder="Write your post content..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-lg bg-forest text-black-100 font-medium hover:bg-forest transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : view === "create"
                      ? "Create Draft"
                      : "Update Post"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function PostRow({
  post,
  onEdit,
  onTogglePublish,
  onDelete,
  formatDate,
}: {
  post: Post;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-black-200 border border-black-300">
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{post.Title}</h3>
        <p className="text-white-50 text-sm">
          {formatDate(
            post.PublishedAt?.Valid ? post.PublishedAt.Time : post.CreatedAt,
          )}{" "}
          &middot;{" "}
          <span className="font-mono text-xs">/talkerinos/{post.Slug}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-sm rounded border border-white-50 text-white-50 hover:border-forest hover:text-forest transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onTogglePublish}
          className={`px-3 py-1.5 text-sm rounded border transition-colors ${
            post.Published
              ? "border-gold text-amber hover:bg-gold/10"
              : "border-forest text-forest hover:bg-forest/10"
          }`}
        >
          {post.Published ? "Unpublish" : "Publish"}
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-sm rounded border border-red-400 text-red-400 hover:bg-red-400/10 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
