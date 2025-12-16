"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import {
  getPostById,
  updatePost,
  chatStream,
  type Post,
  type ChatMessage,
} from "@/lib/talkerinos";

export default function EditPost() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [apiKey, setApiKey] = useState("");
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<{
    original: string;
    rewritten: string;
  } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem("talkerinos_api_key");
    if (!storedKey) {
      router.push("/talkerinos/admin");
      return;
    }
    setApiKey(storedKey);
    loadPost(storedKey);
  }, [postId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadPost = async (key: string) => {
    try {
      const p = await getPostById(key, postId);
      setPost(p);
      setTitle(p.Title);
      setSlug(p.Slug);
      setContent(p.Content);
    } catch (err) {
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!post) return;
    setSaving(true);
    setError(null);
    try {
      await updatePost(apiKey, post.ID, {
        title,
        slug,
        content,
        published: post.Published,
      });
      router.push("/talkerinos/admin");
    } catch (err) {
      setError("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  // Listen for text selection in the content textarea
  useEffect(() => {
    const handleSelectionChange = () => {
      const textarea = textareaRef.current;
      if (!textarea || document.activeElement !== textarea) return;

      const selected = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd,
      );
      if (selected.trim()) {
        setSelectedText(selected);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const handleSendChat = () => {
    if (!chatInput.trim() && !selectedText) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput || "Enhance this text",
      selectedText: selectedText || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsStreaming(true);

    let assistantContent = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    chatStream(
      apiKey,
      {
        message: userMessage.content,
        selectedText: selectedText || undefined,
        fullDraft: content,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      },
      (chunk) => {
        if (chunk.Error) {
          setError(chunk.Error);
          setIsStreaming(false);
          return;
        }
        if (chunk.Content) {
          assistantContent += chunk.Content;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantContent,
            };
            return updated;
          });
        }
        if (chunk.Done && chunk.Suggestion) {
          setPendingSuggestion({
            original: chunk.Suggestion.Original,
            rewritten: chunk.Suggestion.Rewritten,
          });
        }
        if (chunk.Done) {
          setIsStreaming(false);
          setSelectedText("");
        }
      },
      (err) => {
        setError(err);
        setIsStreaming(false);
      },
    );
  };

  const handleAcceptSuggestion = () => {
    if (!pendingSuggestion) return;
    setContent((prev) =>
      prev.replace(pendingSuggestion.original, pendingSuggestion.rewritten),
    );
    setPendingSuggestion(null);
  };

  const handleRejectSuggestion = () => {
    setPendingSuggestion(null);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 md:pt-40 pb-20">
          <div className="text-center text-white-50">Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 md:pt-40 pb-20">
          <div className="text-center text-red-400">Post not found</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 pt-24 pb-4 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-5 md:px-10 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/talkerinos/admin"
                className="text-white-50 hover:text-sage transition-colors"
              >
                &larr; Back
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-cream">
                Edit Post
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {error && <span className="text-red-400 text-sm">{error}</span>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-sage text-black-100 font-medium hover:bg-forest transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Split View */}
          <div className="flex gap-6">
            {/* Editor Panel - Left (60%) */}
            <div className="w-[60%] space-y-6">
              <div>
                <label className="block text-white-50 text-sm mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black-200 border border-black-300 text-white focus:border-sage focus:outline-none transition-colors"
                  placeholder="Post title"
                />
              </div>

              <div>
                <label className="block text-white-50 text-sm mb-2">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black-200 border border-black-300 text-white font-mono text-sm focus:border-sage focus:outline-none transition-colors"
                  placeholder="post-url-slug"
                />
              </div>

              <div>
                <label className="block text-white-50 text-sm mb-2">
                  Content
                </label>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 rounded-lg bg-black-200 border border-black-300 text-white focus:border-sage focus:outline-none transition-colors resize-y"
                  placeholder="Write your post content..."
                />
              </div>
            </div>

            {/* Chat Panel - Right (40%) */}
            <div className="w-[40%] flex flex-col rounded-lg border border-black-300 bg-black-200/50 h-[700px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <p className="text-white-50 text-sm text-center py-8">
                    Select text in the editor and ask AI to help improve it
                  </p>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-sage/20 ml-8"
                        : "bg-black-300 mr-8"
                    }`}
                  >
                    {msg.selectedText && (
                      <p className="text-xs text-white-50 mb-2 italic">
                        &quot;{msg.selectedText.slice(0, 50)}
                        {msg.selectedText.length > 50 ? "..." : ""}&quot;
                      </p>
                    )}
                    <p className="text-white text-sm whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestion Accept/Reject */}
              {pendingSuggestion && (
                <div className="p-4 border-t border-black-300">
                  <p className="text-sm text-white-50 mb-2">
                    Apply this change?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAcceptSuggestion}
                      className="flex-1 px-3 py-2 rounded bg-sage text-black-100 text-sm font-medium hover:bg-forest transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={handleRejectSuggestion}
                      className="flex-1 px-3 py-2 rounded border border-white-50 text-white-50 text-sm hover:border-red-400 hover:text-red-400 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Selected Text Indicator */}
              {selectedText && (
                <div className="px-4 py-2 border-t border-black-300">
                  <p className="text-xs text-sage">
                    Selected: &quot;{selectedText.slice(0, 40)}
                    {selectedText.length > 40 ? "..." : ""}&quot;
                  </p>
                </div>
              )}

              {/* Chat Input */}
              <div className="p-4 border-t border-black-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleSendChat()
                    }
                    placeholder={
                      selectedText
                        ? "What to do with selection?"
                        : "Select text first..."
                    }
                    disabled={isStreaming}
                    className="flex-1 px-3 py-2 rounded-lg bg-black-300 border border-black-300 text-white text-sm focus:border-sage focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={
                      isStreaming || (!chatInput.trim() && !selectedText)
                    }
                    className="px-4 py-2 rounded-lg bg-sage text-black-100 font-medium hover:bg-forest transition-colors disabled:opacity-50"
                  >
                    {isStreaming ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
