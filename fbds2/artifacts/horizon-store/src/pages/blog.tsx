import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Blog() {
  const { data: posts, isLoading } = useListBlogPosts();

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto px-4 py-12 lg:py-20"
    >
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">The Journal</h1>
        <p className="text-lg text-muted-foreground">Stories, insights, and inspiration from the Horizon team. Exploring design, lifestyle, and culture.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="bg-muted aspect-video rounded-xl" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : posts?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No posts available right now. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
          {posts?.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group block flex flex-col h-full">
              <div className="relative aspect-video overflow-hidden rounded-xl mb-6 bg-muted">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                <span className="text-primary">{post.category}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground line-clamp-3 mb-4 flex-grow">
                {post.excerpt}
              </p>
              <div className="flex items-center text-sm font-medium text-primary mt-auto">
                Read Article <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}
