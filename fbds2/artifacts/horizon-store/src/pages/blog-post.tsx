import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import { useGetBlogPost, getGetBlogPostQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function BlogPostPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: post, isLoading } = useGetBlogPost(id, { query: { enabled: !!id, queryKey: getGetBlogPostQueryKey(id) } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-8" />
        <div className="h-10 bg-muted rounded w-3/4 mb-4" />
        <div className="h-4 bg-muted rounded w-32 mb-8" />
        <div className="aspect-video bg-muted rounded-xl mb-12" />
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif mb-4">Article not found</h2>
        <Link href="/blog" className="text-primary hover:underline">
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto px-4 py-12 max-w-3xl"
    >
      <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-10">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Journal
      </Link>

      <article>
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
            <span className="text-primary">{post.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(post.createdAt), 'MMMM d, yyyy')}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-8">
            {post.title}
          </h1>
        </header>

        <div className="relative aspect-[21/9] overflow-hidden rounded-xl mb-12 bg-muted">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed">
          {/* We're using dangerous raw HTML here assuming the backend provides markdown/html.
              In a real app, use a markdown parser. The instructions say to escape XSS, 
              but for a blog post body we usually need some formatting. Let's just render it as text if it's plain text,
              but for this demo we'll use a split by newline to simulate paragraphs. */}
          {post.fullContent.split('\n').map((paragraph, i) => {
            if (!paragraph.trim()) return null;
            return <p key={i} className="mb-6">{paragraph}</p>;
          })}
        </div>
      </article>
    </motion.div>
  );
}
