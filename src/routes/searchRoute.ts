
import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import bcrypt from 'bcryptjs';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';

export const searchRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();

// Search Route
searchRoute.post('/post', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());;
    const {query}  = await c.req.json();
  console.log("Search query:", query.query);
    console.log("called");
    
    console.log(query);
    // return c.json({ message: 'Search route called' });

    try {
        const posts = await prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { techstack: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        });
        return c.json(posts);
      } catch (error) {
        c.status(500)
        return c.json({ error: 'An error occurred while searching for posts' });
      }
});

searchRoute.post('/project', async (c) => {
  const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());;
  const {query}  = await c.req.json();
console.log("Search query:", query.query);
  console.log("called");
  
  console.log(query);
  // return c.json({ message: 'Search route called' });

  try {
      const posts = await prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { techstack: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      });
      return c.json(posts);
    } catch (error) {
      c.status(500)
      return c.json({ error: 'An error occurred while searching for posts' });
    }
});