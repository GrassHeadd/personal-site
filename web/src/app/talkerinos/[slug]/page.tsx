"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/shared/components/Footer";
import { getPostBySlug, type Post } from "@/features/talkerinos";

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
        <main className="flex-1 pt-32 md:pt-40 pb-20">
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
        <main className="flex-1 pt-32 md:pt-40 pb-20">
          <div className="max-w-3xl mx-auto px-5 md:px-10 text-center">
            <h1 className="text-4xl font-bold mb-4">
              post not found<span className="text-forest">.</span>
            </h1>
            <p className="text-ink-soft mb-8">
              The post you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/talkerinos"
              className="text-forest underline decoration-wavy decoration-sage underline-offset-4 hover:decoration-forest"
            >
              ← back to talkerinos
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="flex-1 pt-32 md:pt-40 pb-20">
        <article className="max-w-3xl mx-auto px-5 md:px-10">
          {/* Back link */}
          <Link
            href="/talkerinos"
            className="inline-flex items-center gap-2 text-ink-soft hover:text-forest transition-colors mb-8"
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
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{post.Title}</h1>
            <time className="text-ink-soft">
              {formatDate(post.PublishedAt?.Valid ? post.PublishedAt.Time : post.CreatedAt)}
            </time>
          </header>

          {/* Content */}
          <div className="text-ink text-lg leading-relaxed whitespace-pre-wrap">
            {post.Content}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
