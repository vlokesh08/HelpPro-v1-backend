import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';

export const postRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();

postRoute.use("/*", async (c, next) => {
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

// Create Route
postRoute.post('/create', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const { link, title, description, bounty, techstack, authorId } = await c.req.json();

	// Create the post
	let bountyValue = bounty === true ? true : false;
    try{

        const post = await prisma.post.create({
            data: {
                link,
                title,
                description,
                authorId,
                bounty: bountyValue,
                techstack,
            },
        });
    }catch(e){
        return c.json({ message: 'Error creating post', e }, 500);
    }

	return c.json({ message: 'Post created successfully' });
});

// Get all posts

postRoute.get('/all', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const posts = await prisma.post.findMany(
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

postRoute.get('/getPostById/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = await c.req.param('id');
	try{
		const post = await prisma.post.findUnique({
			where: { id: id },
		});
	
		return c.json({ post });
	}catch(e) {
		return c.json({ message: 'Error getting post', e }, 500);
	}

	c.status(204);
	return c.json({ message: 'Problem with the server' });
});


// Update post by id

postRoute.put('/update/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = await c.req.param('id');
	try{

		const { link, title, description, bounty, techstack, authorId } = await c.req.json();
	
		let bountyValue = bounty === 'true' ? true : false;
		const post = await prisma.post.update({
			where: { id: id },
			data: {
				link,
				title,
				description,
				authorId,
				bounty: bountyValue,
				techstack,
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

postRoute.delete('/delete/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = await c.req.param('id');

	console.log(id);	

	try{

		const post = await prisma.post.delete({
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

// get posts by user id

postRoute.get('/getUserPosts/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = await c.req.param('id');
	console.log(id);
	try{
		const posts = await prisma.post.findMany({
			where: { authorId: id },
		});
	
		return c.json({ posts });
	}catch(e) {
		return c.json({ message: 'Error getting posts', e }, 500);
	}

	c.status(204);
	return c.json({ message: 'Problem with the server' });
});