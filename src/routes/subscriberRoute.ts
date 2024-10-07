import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const subscriberRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

subscriberRouter.use("/*", async (c, next) => {
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

subscriberRouter.post("/subscribe", async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

  const { userId, subscriberId } = await c.req.json();
  
  try {

    // Check if the user is trying to subscribe to themselves
    if (userId === subscriberId) {
      c.status(403)
      return c.json({
        error: "You cannot subscribe to yourself",
      });
    }

    // Check if the user is already subscribed to the subscriber

    const subscriber = await prisma.subscriber.findFirst({
      where: {
        userId,
        subscriberId,
      },
    });

    if (subscriber) {
      c.status(403)
      return c.json({
        error: "You are already subscribed to this user",
      });
    }

    await prisma.subscriber.create({
      data: {
        userId,
        subscriberId,
      },
    });

    //send notification to the subscriber
    await prisma.notification.create({
      data: {
        userId: userId,
        subscriberId: subscriberId,
        content: "You have a new subscriber",
        type: "follower",
        link: `/profile/${subscriberId}`,
      },
    });

    return c.json({
      message: "Subscribed successfully",
    });
  } catch (ex) {
    c.status(403)
    return c.json({
      error: "Subscription failed",
    });
  }
});

subscriberRouter.post("/unsubscribe", async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

  const { userId, subscriberId } = await c.req.json();

  try {
    await prisma.subscriber.deleteMany({
      where: {
        userId,
        subscriberId,
      },
    });
    return c.json({
      message: "Unsubscribed successfully",
      subscriberCount: await prisma.subscriber.count({
        where: {
          userId,
        },
      }),
    });
  } catch (ex) {
    c.status(403)
    return c.json({
      error: "Unsubscription failed",
    });
  }
});

subscriberRouter.get("/:userId", async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
  const userId = c.req.param("userId");

  try {
    const subscribers = await prisma.subscriber.findMany({
      where: {
        userId,
      },
      include: {
        subscriber: true,
      },
    });
    return c.json({
      subscribers: subscribers.map((sub) => sub.subscriber),
    });
  } catch (ex) {
    c.status(403)
    return c.json({
      error: "Failed to fetch subscribers",
    });
  }
});