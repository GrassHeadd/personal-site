"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import PostCard from "@/components/PostCard";
import { getPosts, type Post } from "@/lib/talkerinos";

export default function Talkerinos() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data || []);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 md:pt-40 pb-20">
        <div className="max-w-4xl mx-auto px-5 md:px-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-16">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-cream mb-4">
                Talkerinos
              </h1>
              <p className="text-white-50 text-lg md:text-xl max-w-xl">
                Thoughts, rambles, and the occasional tutorial.
              </p>
            </div>
            <Link
              href="/talkerinos/admin"
              className="px-4 py-2 text-sm rounded-lg border border-sage text-sage font-medium hover:bg-sage hover:text-black-100 transition-all duration-300 whitespace-nowrap"
            >
              if you are me
            </Link>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="text-white-50">Loading...</div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white-50 text-lg">
                I'm a boring person so I don't have any posts yet:(
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {posts.map((post, index) => (
                <PostCard
                  key={post.ID}
                  slug={post.Slug}
                  title={post.Title}
                  content={post.Content}
                  date={post.PublishedAt?.Valid ? post.PublishedAt.Time : post.CreatedAt}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
