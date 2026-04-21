import { BLOG_CATEGORIES_BY_LOCALE } from "@shared/content/repository";
import { ContentAdminManager } from "@/components/content/ContentAdminManager";
import { getServerContentByType } from "@/lib/contentStoreServer";

export default async function AdminBlogPostsPage() {
  const initialItems = await getServerContentByType("blog");
  return (
    <ContentAdminManager
      title="Blog Posts"
      description="Create, edit, preview, and manage article content for the public Blog page."
      type="blog"
      categoryOptions={BLOG_CATEGORIES_BY_LOCALE}
      ctaVerb="post"
      initialItems={initialItems}
      backupUrl="/api/backup/blog-posts"
      backupLabel="Backup all blog posts"
    />
  );
}
