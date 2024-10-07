import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';
import { e } from 'vitest/dist/reporters-QGe8gs4b.js';

export const savePost = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();

savePost.use('/*', async (c, next) => {
	try {
		const header = c.req.header('authorization') || '';
		const token = header.split(' ')[1];
		const user = await verify(token, c.env.JWT_SECRET);
		if (user && typeof user.id === 'string') {
			c.set('jwtPayload', { userId: user.id });
			return next();
		} else {
			c.status(403);
			return c.json({ error: 'Unauthorized ' });
		}
	} catch (e) {
		c.status(403);
		return c.json({
			error: 'Credentials failed',
		});
	}
});

// Save Post

savePost.post('/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const userId = c.get('jwtPayload').userId;
	const { isPost, isProject } = await c.req.json();
	const id = await c.req.param('id');
	// Create the post
	try {
		if (isPost) {
			const res = await prisma.saved.create({
				data: {
					isPost: true,
					userId: userId,
					postId: id,
				},
			});
		}
		if (isProject === true) {
			const res = await prisma.saved.create({
				data: {
					isProject: true,
					userId: userId,
					projectId: id,
				},
			});
		}
	} catch (e) {
		return c.json({ message: 'Error creating post', e }, 500);
	}
	return c.json({ message: 'Post created successfully' });
});

// Get all saved posts

savePost.get('/all/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const userId = c.req.param('id');
	// return c.json({ message: userId });
	try {
		const posts = await prisma.saved.findMany({
			where: {
				userId: userId,
			},
			include: {
				post: true,
				project: true,
			},
		});
		return c.json(posts);
	} catch (error) {
		c.status(500);
		return c.json({ error: 'An error occurred while searching for posts' });
	}
});

// Delete saved post

savePost.delete('/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const userId = c.get('jwtPayload').userId;
	const id = await c.req.param('id');
	const { isPost, isProject } = await c.req.json();
	console.log(isPost, isProject);
	if (isPost) {
		try {
			const res = await prisma.saved.deleteMany({
				where: {
					userId: userId,
					postId: id,
				},
			});
			return c.json({ message: 'Post deleted successfully' });
		} catch (e) {
			return c.json({ message: 'Error deleting post', e }, 500);
		}
	}
	try {
		const res = await prisma.saved.deleteMany({
			where: {
				userId: userId,
				projectId: id,
			},
		});
		return c.json({ message: 'Project deleted successfully' });
	} catch (e) {
		return c.json({ message: 'Error deleting project', e }, 500);
	}
});

// check if post is saved

savePost.get('/project/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const userId = c.get('jwtPayload').userId;
	const id = await c.req.param('id');
	try {
		const post = await prisma.saved.findFirst({
			where: {
				userId: userId,
				projectId: id,
			},
		});
		if (post) {
			return c.json({ bookmarked: true });
		} else {
			return c.json({ bookmarked: false });
		}
	} catch (e) {
		return c.json({ message: 'Error checking post', e }, 500);
	}
});

savePost.get('/opensource/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const userId = c.get('jwtPayload').userId;
	const id = await c.req.param('id');
	try {
		const post = await prisma.saved.findFirst({
			where: {
				userId: userId,
				postId: id,
			},
		});
		if (post) {
			return c.json({ message: 'Post is saved' });
		} else {
			return c.json({ message: 'Post is not saved' });
		}
	} catch (e) {
		return c.json({ message: 'Error checking post', e }, 500);
	}
});
