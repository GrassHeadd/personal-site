"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import { getPostBySlug, type Post } from "@/lib/talkerinos";

export default function PostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostBySlug(slug);
        setPost(data);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Post not found");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 md:pt-40 pb-20">
          <div className="max-w-3xl mx-auto px-5 md:px-10">
            <div className="text-white-50">Loading...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 md:pt-40 pb-20">
          <div className="max-w-3xl mx-auto px-5 md:px-10 text-center">
            <h1 className="text-4xl font-bold text-cream mb-4">Post not found</h1>
            <p className="text-white-50 mb-8">
              The post you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/talkerinos"
              className="px-6 py-3 rounded-lg bg-sage text-black-100 font-medium hover:bg-forest transition-colors"
            >
              Back to Talkerinos
            </Link>
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
        <article className="max-w-3xl mx-auto px-5 md:px-10">
          {/* Back link */}
          <Link
            href="/talkerinos"
            className="inline-flex items-center gap-2 text-white-50 hover:text-sage transition-colors mb-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Talkerinos
          </Link>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-cream mb-4">
              {post.Title}
            </h1>
            <time className="text-white-50">
              {formatDate(post.PublishedAt?.Time || post.CreatedAt)}
            </time>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="text-white-50 leading-relaxed whitespace-pre-wrap">
              {post.Content}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
