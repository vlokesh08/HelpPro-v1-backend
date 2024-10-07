import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';
import { e } from 'vitest/dist/reporters-QGe8gs4b.js';

export const projectRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();

projectRoute.use("/*", async (c, next) => {
	try {
	  const header = c.req.header("authorization") || "";
	  const token = header.split(" ")[1];
	  const user = await verify(token, c.env.JWT_SECRET);
	  if (user && typeof user.id === "string") {
		c.set("jwtPayload", { userId: user.id });
		return next();
	  } else {
		c.status(403);
		return c.json({ error: "Unauthorized " });
	  }
	} catch (e) {
	  c.status(403);
	  return c.json({
		error: "Credentials failed",
	  });
	}
  });

// CreprojectRoute
projectRoute.post('/create', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const { link, title, description,currency, bounty, bountyValue, techstack, authorId,endDate } = await c.req.json();
	console.log({ link, title, description,currency, bounty, bountyValue, techstack, authorId,endDate });
	// Create the post
	let bountyType = bounty == true ? true : false;
    try{

        const post = await prisma.project.create({
            data: {
                title,
                link,
                description,
                authorId,
                bounty: bountyType,
				bountyValue,
				currency,
                techstack,
				completion:endDate,
            },
        });
    }catch(e){
        return c.json({ message: 'Error creating post', e }, 500);
    }
	return c.json({ message: 'Post created successfully' });
});

// Get all posts

projectRoute.get('/all', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const posts = await prisma.project.findMany(
		{
			include: {
				author: {
				  select: {
					id: true,
					name: true,
					username: true,
					profilePic: true,
				  },
				},
		},
	}
	);

	return c.json({ posts });
});

// Get post by id

projectRoute.get('/getPostById/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = await c.req.param('id');
	try{
		const post = await prisma.project.findUnique({
			where: { id: id },
			include: {
				author: {
					select: {
						id: true,
						name: true,
						username: true,
						profilePic: true,
						verified : true,
					},
				},
			},
		});
	
		return c.json({ post });
	}catch(e) {
		return c.json({ message: 'Error getting post', e }, 500);
	}

	c.status(204);
	return c.json({ message: 'Problem with the server' });
});


// Update post by id

projectRoute.put('/update/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = await c.req.param('id');
	try{

				const { link, title, description,bountyValue,currency, bounty, techstack,completion, authorId } = await c.req.json();
	
		let bountyType = bounty == true ? true : false;
		const post = await prisma.project.update({
			where: { id: id },
			data: {
				title,
                link,
                description,
                authorId,
                bounty: bountyType,
				bountyValue,
				currency,
                techstack,
				completion,
			},
		});
	
		return c.json({ message: 'Post updated successfully' });
	}catch(e) {
		return c.json({ message: 'Error updating post', e }, 500);
	}
	c.status(204);
	return c.json({ message: 'Problem with the server' });
});


// Delete post by id

projectRoute.delete('/delete/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = await c.req.param('id');

	console.log(id);	

	try{

		const post = await prisma.project.delete({
			where: { id: id },
		});
		return c.json({ message: 'Post deleted successfully' });
	}
	catch(e){
		return c.json({ message: 'Error deleting post', e }, 500);
	}

	c.status(204);

	return c.json({ message: 'Problem with the server' });

});

projectRoute.get('/getUserPosts/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = await c.req.param('id');
	try{
		const posts = await prisma.project.findMany({
			where: { authorId: id },
		});
	
		return c.json({ posts });
	}catch(e) {
		return c.json({ message: 'Error getting posts', e }, 500);
	}

	c.status(204);
	return c.json({ message: 'Problem with the server' });
});