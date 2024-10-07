import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import bcrypt from 'bcryptjs';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';
import { a } from 'vitest/dist/suite-xGC-mxBC.js';
import { use } from 'hono/jsx';
export const loginRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
		SECRET_HASH: string;
	};
}>();

// Register Route
loginRoute.post('/register', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const { username, name, email, password } = await c.req.json();

	// Check if the user already exists
	const userExists = await prisma.user.findFirst({
		where: { username },
	});

	if (userExists) {
		return c.json({ message: 'User already exists' }, 400);
	}

	const emailcheck = await prisma.user.findUnique({
		where: { email },
	});

	if (emailcheck) {
		return c.json({ message: 'Email already exists' }, 400);
	}
	// Hash the password
	const hashedPassword = await bcrypt.hash(password, 10);

	// Create the user
	const user = await prisma.user.create({
		data: {
			username,
			name,
			email,
			password: hashedPassword,
		},
	});

	return c.json({ message: 'User registered successfully', user });
});

// Login Route
loginRoute.post('/login', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const { email, password } = await c.req.json();

	// Find the user by email
	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		return c.json({ message: 'Invalid email or password' }, 401);
	}

	// Compare the password
	const isPasswordValid = await bcrypt.compare(password, user.password);

	if (!isPasswordValid) {
		return c.json({ message: 'Invalid email or password' }, 401);
	}
	const token = await sign({ id: user.id }, c.env.JWT_SECRET);

	return c.json({
		jwt: token,
		user: user,
		message: 'Login in successful',
	});
});

loginRoute.post('/githublogin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	const GITHUB_CLIENT_ID = 'Ov23ct6yKrCQOfjkoGQP';
	const GITHUB_CLIENT_SECRET = '33cc1446326df42f055bf9b57445172d7c35aaa4';
	const GITHUB_CALLBACK_URL = 'http://localhost:5173/';
	const githubOAuthURL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user`;

	const { code } = await c.req.json();
	console.log(code);
	try {
		const params = '?client_id=' + GITHUB_CLIENT_ID + '&client_secret=' + GITHUB_CLIENT_SECRET + '&code=' + code;
		// Request access token from GitHub
		const tokenResponse = await fetch('https://github.com/login/oauth/access_token' + params, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		});

		const tokenText = await tokenResponse.text();
		const tokenData = JSON.parse(tokenText);

		const accessToken = tokenData.access_token;

		// const tokenData = await tokenResponse.json();

		// console.log(tokenData)

		// if (tokenData.error) {
		//     c.status(400);
		// 	return c.json({ message: 'Error getting access token', error: tokenData.error });
		// }

		// const accessToken = tokenData.access_token;

		// console.log(accessToken)



		const userProfileResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'User-Agent': 'Your-App-Name',
				Accept: 'application/json',
			},
		});
			const userProfileText = await userProfileResponse.text();
    const userProfile = JSON.parse(userProfileText);

	console.log(userProfile)

	const username = userProfile.login;
	const name = userProfile.name;

	if(!username) {
		console.log("No user name")
		return c.json({ message: 'Retry Please' }, 401);
	}



		const email = `${username}@helppro.com`;
		const password = email + c.env.SECRET_HASH;

		console.log(username, email, name, password)

		const userExists = await prisma.user.findUnique({
			where: { email },
		});
		// if(!userExists) {
		// 	console.log('User does not exist'	)
		// 	c.json({ message: 'User already exists' }, 400);
		// }

		if (userExists) {
			// const hashedPassword = await bcrypt.hash(password, 10);
			const isPasswordValid = await bcrypt.compare(password, userExists.password);

			if (!isPasswordValid) {
				return c.json({ message: 'Invalid email or password' }, 401);
			}

			// update profile pic
			const user = await prisma.user.update({
				where: {
					id: userExists.id,
				},
				data: {
					profilePic: userProfile.avatar_url,
				},
			});
			const token = await sign({ id: userExists.id }, c.env.JWT_SECRET);

			return c.json({
				jwt: token,
				user: userExists,
				message: 'Login in successful',
			});
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: {
				username,
				name,
				email,
				profilePic: userProfile.avatar_url,
				password:hashedPassword,
			},
		});

		const token = await sign({ id: user.id }, c.env.JWT_SECRET);

			return c.json({
				jwt: token,
				user: user,
				message: 'Login in successful',
			});

		// const userProfile = await userProfileResponse.json();

		// if (userProfile.error) {
		//     return c.status(400);
		// 	c.json({ message: 'Error fetching user profile', error: userProfile.error });
		// }

		// const username = userProfile.login;
		// const email = userProfile.email;
		// const name = userProfile.name;

		// console.log(userProfile)

		// Check if the user already exists
		// const userExists = await prisma.user.findUnique({
		//     where: { username },
		// });

		// if (userExists) {
		//     return res.status(400).json({ message: 'User already exists' });
		// }

		// const emailCheck = await prisma.user.findUnique({
		//     where: { email },
		// });

		// if (emailCheck) {
		//     return res.status(400).json({ message: 'Email already exists' });
		// }

		// // Create the user
		// const user = await prisma.user.create({
		//     data: {
		//         username,
		//         name,
		//         email,
		//         // You can handle password creation as per your requirements if needed
		//         // Here we assume GitHub OAuth takes care of authentication
		//     },
		// });

		return c.json({ message: 'Login in successful' });
	} catch (error) {
		console.error('Error during GitHub login:', error);
		c.status(500);
		return c.json({ message: 'Internal server error' });
	}

	return c.json({ message: 'User registered successfully' });
	//  finally {
	//     await prisma.$disconnect();
	// }
});
