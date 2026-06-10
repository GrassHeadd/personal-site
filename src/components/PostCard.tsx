import Link from "next/link";

interface PostCardProps {
  slug: string;
  title: string;
  content: string;
  date: string;
  index: number;
}

const PostCard = ({ slug, title, content, date }: PostCardProps) => {
  const excerpt = content.length > 150 ? content.slice(0, 150) + "..." : content;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <Link href={`/talkerinos/${slug}`} className="block group">
      <article className="sketch-border-soft p-6 md:p-8 transition-all duration-200 group-hover:-rotate-[0.5deg] group-hover:border-sage">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h2 className="text-xl md:text-2xl font-bold group-hover:text-forest transition-colors">
            {title}
          </h2>
          <span className="text-sm text-ink-soft whitespace-nowrap">
            {formatDate(date)}
          </span>
        </div>
        <p className="text-ink-soft leading-relaxed">{excerpt}</p>
      </article>
    </Link>
  );
};

export default PostCard;
