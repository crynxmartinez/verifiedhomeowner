import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.blogPost.findMany({ take: 5 });
  console.log('Blog posts in database:');
  posts.forEach(p => {
    console.log(`- Slug: "${p.slug}", Status: ${p.status}, Title: ${p.title.substring(0, 50)}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
