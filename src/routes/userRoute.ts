import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import bcrypt from 'bcryptjs';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';
import { ListBucketsCommand, ListObjectsV2Command, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

export const userRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
		R2_SUBDOMAIN_URL: string;
		ACCESS_KEY: string;
		SECRET_ACCESS_KEY: string;
		BUCKET_NAME: string;
		ACCOUNT_ID: string;
	};
}>();

// get user by id
userRoute.get('/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = c.req.param('id');

	try {
		const user = await prisma.user.findMany({
			where: {
				id: id,
			},
			select: {
				id: true,
				username: true,
				name: true,
				details: true,
				profilePic: true,
                subscribers : true,
                subscribedTo : true,
				verified: true,
			},
		});

		return c.json(user);
	} catch (e) {
		return c.json({ message: 'Error getting user', e }, 500);
	}
});

//Update details by id

userRoute.put('/details/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = c.req.param('id');
	const { details } = await c.req.json();

	try {
		const user = await prisma.user.update({
			where: {
				id: id,
			},
			data: {
				details,
			},
		});

		return c.json({ message: 'User details updated successfully' });
	} catch (e) {
		return c.json({ message: 'Error updating user details', e }, 500);
	}
});

//search user with name or username

userRoute.get('/search/:query', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
    const query = c.req.param('query');
    // const { query } = await c.req.json();
    console.log(query);

	try {
		const user = await prisma.user.findMany({
			where: {
				OR: [
					{
						name: {
							contains: query,
                            mode: 'insensitive',
						},
					},
					{
						username: {
							contains: query,
                            mode: 'insensitive',
						},
					},
				],
			},
			select: {
				id: true,
				username: true,
				name: true,
				details: true,
				profilePic: true,
				verified: true,
			},
		});

		return c.json(user);
	} catch (e) {
		return c.json({ message: 'Error getting user', e }, 500);
	}
});

// Update user by id

userRoute.put('/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = c.req.param('id');
	const { username, name, details, formData, password } = await c.req.json();
	console.log(formData);
	const body = await c.req.parseBody();
	const file = body['file'];

	try {
		const user = await prisma.user.update({
			where: {
				id: id,
			},
			data: {
				username,
				name,
				details,
				// profilePic: url,
			},
		});

		return c.json({ message: 'User updated successfully' });
	} catch (e) {
		return c.json({ message: 'Error updating user', e }, 500);
	}
});

// Update Social Profiles by id

userRoute.put('/social/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = c.req.param('id');
	console.log(id);
	const { githubLink, linkedinLink, portfolio } = await c.req.json();
	console.log(githubLink, linkedinLink, portfolio);

	try {
		const user = await prisma.user.update({
			where: {
				id: id,
			},
			data: {
				githubLink,
				linkedinLink,
				portfolio,
			},
		});

		return c.json({ message: 'User social profiles updated successfully' });
	} catch (e) {
		return c.json({ message: 'Error updating user social profiles', e }, 500);
	}
});

// Get Social Profiles by id

userRoute.get('/social/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = c.req.param('id');

	try {
		const user = await prisma.user.findUnique({
			where: {
				id: id,
			},
			select: {
				githubLink: true,
				linkedinLink: true,
				portfolio: true,
			},
		});

		return c.json(user);
	} catch (e) {
		return c.json({ message: 'Error getting user social profiles', e }, 500);
	}
});

// get all users

userRoute.get('/', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		const users = await prisma.user.findMany();

		return c.json(users);
	} catch (e) {
		return c.json({ message: 'Error getting users', e }, 500);
	}
});

// delete user by id

userRoute.delete('/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = c.req.param('id');

	try {
		const user = await prisma.user.delete({
			where: {
				id: id,
			},
		});

		return c.json({ message: 'User deleted successfully' });
	} catch (e) {
		return c.json({ message: 'Error deleting user', e }, 500);
	}
});
