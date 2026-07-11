import { getCollection, type CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

export const getSortedBlogPosts = async (
  limit?: number,
): Promise<BlogPost[]> => {
  const posts = await getCollection("blog");

  const sortedPosts = [...posts].sort(
    (a, b) =>
      new Date(b.data.publishDate).getTime() -
      new Date(a.data.publishDate).getTime(),
  );

  return typeof limit === "number" ? sortedPosts.slice(0, limit) : sortedPosts;
};

export const getLatestBlogPost = async (): Promise<BlogPost> => {
  const [latestPost] = await getSortedBlogPosts(1);

  if (!latestPost) {
    throw new Error("no blog posts found.");
  }

  return latestPost;
};

export const getBlogPostNav = async (
  currentPostId: string,
): Promise<{
  newerPost: BlogPost | null;
  olderPost: BlogPost | null;
}> => {
  const posts = await getSortedBlogPosts();

  const currentIndex = posts.findIndex((post) => post.id === currentPostId);

  if (currentIndex === -1) {
    throw new Error(`blog post not found: ${currentPostId}`);
  }

  return {
    newerPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
    olderPost: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  };
};
