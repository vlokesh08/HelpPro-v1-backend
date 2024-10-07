import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';
export const notificationRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();

// notificationRoute.use('/*', async (c, next) => {
// 	try {
// 		const header = c.req.header('authorization') || '';
// 		const token = header.split(' ')[1];
// 		const user = await verify(token, c.env.JWT_SECRET);
// 		if (user && typeof user.id === 'string') {
// 			c.set('jwtPayload', { userId: user.id });
// 			return next();
// 		} else {
// 			c.status(403);
// 			return c.json({ error: 'Unauthorized ' });
// 		}
// 	} catch (e) {
// 		c.status(403);
// 		return c.json({
// 			error: 'Credentials failed',
// 		});
// 	}
// });

// Route to get notifications for the user

notificationRoute.get('/get-notifications/:id', async (c) => {
	const prisma = new PrismaClient({
	  datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
  
	const id  = await c.req.param("id");
	console.log(id);
  
	try {
	  const notifications = await prisma.notification.findMany({
		where: {
			userId: id,
		},
		include: {
		  subscriber: {
			select: {
			  id: true,
			  name:true,
			  username: true,
			  profilePic: true,
		  },
		}
	  },
	  orderBy: {
		createdAt: 'desc',
	  },
	});	
	  return c.json(notifications);
	} catch (e) {
	  console.error(e);
	  c.status(500);
	  return c.json({
		error: 'Internal Server Error',
	  });
	}
  });
  
  // delete notification by id

notificationRoute.delete('/delete-notification/:id', async (c) => {
	const prisma = new PrismaClient({
	  datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
  
	// const { id } = await c.get('jwtPayload');
	const notificationId = await c.req.param("id");

	console.log(notificationId);
  
	try {
	  const notification = await prisma.notification.findFirst({
		where: {
		  id: notificationId,
		//   userId: id,
		},
	  });
  
	  if (!notification) {
		c.status(404);
		return c.json({
		  error: 'Notification not found',
		});
	  }
  
	  await prisma.notification.delete({
		where: {
		  id: notificationId,
		},
	  });
  
	  return c.json({
		message: 'Notification deleted',
	  });
	} catch (e) {
	  console.error(e);
	  c.status(500);
	  return c.json({
		error: 'Internal Server Error',
	  });
	}
  });