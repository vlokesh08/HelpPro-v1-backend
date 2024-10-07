import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import bcrypt from 'bcryptjs';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';
import { send } from 'process';
import { v4 as uuidv4 } from 'uuid';
export const messageRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
		SECRET_HASH: string;
	};
}>();

// Route to send request by sender id and receiver id

messageRoute.post('/send-request', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  const { senderId, receiverId } = await c.req.json();
  console.log(senderId, receiverId)  
  try {

    // check if sender sent the request previously

    const checkRequest = await prisma.message.findFirst({
      where: {
        userId:senderId,
        receiverId,
      },
    });

    if (checkRequest) {
      c.status(400)
      return c.json({message : checkRequest.status});
    }

    const requestForSender = await prisma.message.create({
      data: {
        userId:receiverId,
        receiverId: senderId,
        status: 'pending',
      },
    });

    const requestForReceiver = await prisma.message.create({
      data: {
        userId: senderId,
        receiverId: receiverId,
        status: 'waiting',
      },
    });


    // send notification to receiver

    await prisma.notification.create({
      data: {
        userId: receiverId,
        subscriberId: senderId,
        content: "You have a new Message Request",
        type: "message",
        link: `/chat`,
      },
    });

    c.status(201)
    return c.json(requestForSender);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while sending the request.' });
  }
});


// Route to accept request by sender id and receiver id

messageRoute.post('/accept-request', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  const { senderId, receiverId } = await c.req.json();
  console.log(senderId, receiverId)  
  try {

    // check if sender sent the request previously
    const roomId = uuidv4();

    const checkRequest = await prisma.message.findFirst({
      where: {
        userId:receiverId,
        receiverId:senderId,
      },
    });

    if (!checkRequest) {
      c.status(400)
      return c.json({ error: 'Request not found.' });
    }

    const request = await prisma.message.update({
      where: {
        id: checkRequest.id,
      },
      data: {
        roomId: roomId,
        status: 'accepted',
      },
    });

    const checkRequest2 = await prisma.message.findFirst({
      where: {
        userId:senderId,
        receiverId:receiverId,
      },
    });

    const requestForReceiver = await prisma.message.update({
      where: {
        id: checkRequest2.id,
      },
      data: {
        userId: senderId,
        receiverId: receiverId,
        status: 'accepted',
        roomId: roomId,
      },
    });

    c.status(201)
    return c.json(request);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while accepting the request.' });
  }
});


// Route to reject request by sender id and receiver id

messageRoute.post('/reject-request', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  const { senderId, receiverId } = await c.req.json();
  console.log(senderId, receiverId)  
  try {

    // check if sender sent the request previously

    const checkRequest = await prisma.message.findFirst({
      where: {
        userId:senderId,
        receiverId,
      },
    });

    if (!checkRequest) {
      c.status(400)
      return c.json({ error: 'Request not found.' });
    }

    const request = await prisma.message.delete({
      where: {
        id: checkRequest.id,
      },
    });

    const checkRequest2 = await prisma.message.findFirst({
      where: {
        userId:receiverId,
        receiverId : senderId,
      },
    });

    const requestForReceiver = await prisma.message.delete({
      where: {
        id: checkRequest2.id,
      },
    });


    c.status(201)
    return c.json("request rejected");
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while rejecting the request.' });
  }
});

// get all requests which are pending by sender id

messageRoute.get('/get-pending-requests/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const id  = await c.req.param("id");
    console.log(id)
  try {
    const requests = await prisma.message.findMany({
      where: {
        userId:id,
        status: 'pending',
      },
      include: {
        receiver: {
          select: {
            name: true,
            username: true,
            profilePic: true,
            verified: true,
          },
        },
      },
    });
    c.status(200)
    return c.json(requests);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while fetching requests.' });
  }
});


// get all requests which are accepted by sender id

messageRoute.get('/get-accepted-requests/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const id  = await c.req.param("id");
  try {
    const requests = await prisma.message.findMany({
      where: {
        userId:id,
        status: 'accepted',
      },
      include: {
        receiver: {
          select: {
            name: true,
            username: true,
            profilePic: true,
            verified: true,
          },
        },
      },
    });
    
    c.status(200)
    return c.json(requests);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while fetching requests.' });
  }
});

messageRoute.get('/search-messages', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { name, status } = c.req.query();

  try {
    const requests = await prisma.message.findMany({
      where: {
        status: status,
        AND: [
          {
            receiver: {
              name: {
                contains: name,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      include: {
        receiver: true,
      },
    });
    c.status(200);
    return c.json(requests);
  } catch (error) {
    c.status(500);
    return c.json({ error: 'An error occurred while searching messages.' });
  }
});


// Route to get all messages

messageRoute.get('/get-all-messages', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  try {
    const messages = await prisma.message.findMany({
      include: {
        receiver: true,
      },
    });
    c.status(200)
    return c.json(messages);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while fetching messages.' });
  }
});


// delete message by id

messageRoute.delete('/delete-message/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const id = await c.req.param("id");
  try {
    const message = await prisma.message.delete({
      where: {
        id: id,
      },
    });
    c.status(200)
    return c.json(message);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while deleting the message.' });
  }
});
