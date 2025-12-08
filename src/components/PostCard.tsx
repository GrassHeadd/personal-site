'use client';
import Link from 'next/link';
import GlowCard from './GlowCard';

interface PostCardProps {
  slug: string;
  title: string;
  content: string;
  date: string;
  index: number;
}

const PostCard = ({ slug, title, content, date, index }: PostCardProps) => {
  const excerpt = content.length > 150 ? content.slice(0, 150) + '...' : content;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link href={`/talkerinos/${slug}`}>
      <GlowCard identifier={`post-${index}`}>
        <div className="p-6 md:p-8 cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-sage transition-colors">
              {title}
            </h2>
            <span className="text-sm text-white-50 bg-black-200 px-3 py-1 rounded-full whitespace-nowrap ml-4">
              {formatDate(date)}
            </span>
          </div>
          <p className="text-white-50 leading-relaxed">
            {excerpt}
          </p>
        </div>
      </GlowCard>
    </Link>
  );
};

export default PostCard;
