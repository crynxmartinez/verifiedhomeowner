import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGetBySlug(slug) {
  console.log('Testing slug:', slug);
  
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    console.log('Post NOT FOUND');
    return;
  }

  console.log('Post found:');
  console.log('- ID:', post.id);
  console.log('- Title:', post.title);
  console.log('- Status:', post.status);
  console.log('- Content length:', post.content?.length || 0);
}

testGetBySlug('verifiedhomeowner-com-the-wholesaler-crm-built-to-kill-bad-data-missed-follow-ups-and-busy-work')
  .catch(console.error)
  .finally(() => prisma.$disconnect());
