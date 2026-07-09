import { z } from "astro/zod";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

const envSchema = z.object({
  BLOG_TITLE: z.string().trim().min(1, "title is required."),
  BLOG_SUBTITLE: z.string().trim().optional().default(""),
  BLOG_SLUG: z.string().trim().optional().default(""),
});

const env = envSchema.parse(process.env);

const title = env.BLOG_TITLE;
const subtitle = env.BLOG_SUBTITLE;
const slugInput = env.BLOG_SLUG;

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const escapeYamlString = (value: string) => {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
};

const isNodeError = (error: unknown): error is NodeJS.ErrnoException => {
  return error instanceof Error;
};

const slug = slugify(slugInput || title);

if (!slug) {
  throw new Error("could not create a valid slug.");
}

await mkdir(BLOG_DIR, { recursive: true });

const filePath = path.join(BLOG_DIR, `${slug}.md`);

try {
  await access(filePath);
  throw new Error(`post already exists: src/content/blog/${slug}.md`);
} catch (error) {
  if (isNodeError(error) && error.code === "ENOENT") {
    // file does not exist, so we're good to create it.
  } else {
    throw error;
  }
}

const publishDate = new Date().toISOString();

const content = [
  "---",
  `title: "${escapeYamlString(title)}"`,
  subtitle ? `subtitle: "${escapeYamlString(subtitle)}"` : `subtitle: ""`,
  `publishDate: ${publishDate}`,
  "---",
  "",
  "start writing here...",
  "",
].join("\n");

await writeFile(filePath, content, "utf8");

console.log(`created src/content/blog/${slug}.md`);
