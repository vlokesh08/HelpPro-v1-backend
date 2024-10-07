import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import bcrypt from 'bcryptjs';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';
export const commentsRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
		SECRET_HASH: string;
	};
}>();

commentsRoute.use("/*", async (c, next) => {
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

// Route to add a comment
commentsRoute.post('/add-comment', async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
  const { userId } = await c.get('jwtPayload');
  const { content, projectId, postAuthor } = await c.req.json();
  console.log(content, projectId,userId, postAuthor)  
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        projectId,
        authorId : userId,
      },
    });

    const commentData = await prisma.comment.findUnique({
      where: {
        id: comment.id
      },
      include: {
        author: true
      }
    });

    // add notification for the post author

    if(userId !== postAuthor){
      await prisma.notification.create({
        data: {
          userId: postAuthor,
          content: "You got a new Comment",
          type: 'comment',
          seen: false,
          subscriberId: userId,
          link : `/project/${projectId}`
        },
      });
    }


    c.status(201)
    return c.json(commentData);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while adding the comment.' });
  }
});

// Route to add a reply
commentsRoute.post('/add-reply', async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
  const { content, commentId, authorId } = await c.req.json();

  try {
    const reply = await prisma.reply.create({
      data: {
        content,
        commentId,
        authorId,
      },
    });

    const replyData = await prisma.reply.findUnique({
      where: {
        id: reply.id
      },
      include: {
        author: true
      }
    });
    c.status(201)
    return c.json(replyData);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while adding the reply.' });
  }
});

// Route to edit a comment
commentsRoute.put('/edit-comment/:id', async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
  const { id } = await c.req.param();
  const { content } = await c.req.json();

  try {
    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    const commentData = await prisma.comment.findUnique({
      where: {
        id: id
      },
      include: {
        author: true,
        replies: {
          include: {
            author: true
          }
        }
      }
    });

    c.status(200)
    return c.json(commentData);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while editing the comment.' });
  }
});

// Route to edit a reply
commentsRoute.put('/edit-reply/:id', async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
  const { id } = await c.req.param();
  const { content } = await c.req.json();

  try {
    const reply = await prisma.reply.update({
      where: { id: id },
      data: { content },
    });
    c.status(200)
    return c.json(reply);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while editing the reply.' });
  }
});

// Route to get comments and their replies for a post
commentsRoute.get('/post/:postId/comments', async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
  const { postId } = await c.req.param();

  try {
    const comments = await prisma.comment.findMany({
      where: { projectId: postId },
      include: { replies: {
        include: {
          author: true
        }
      }, 
        author: true },
    });
    c.status(200)
    return c.json(comments);
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while fetching the comments.' });
  }
});

// delete comment by id 

commentsRoute.delete('/delete-comment/:id', async (c) => {
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const { id } = await c.req.param();
  console.log(id)

  try {
    await prisma.comment.delete({
      where: { id: id },
    });
    c.status(200)
    return c.json({message : 'Comment deleted successfully'});
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while deleting the comment.' });
  }
});

// delete reply by id

commentsRoute.delete('/delete-reply/:id', async (c) => {
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const { id } = await c.req.param();

  try {
    await prisma.reply.delete({
      where: { id: id },
    });
    c.status(200)
    return c.json({message : 'Reply deleted successfully'});
  } catch (error) {
    c.status(500)
    return c.json({ error: 'An error occurred while deleting the reply.' });
  }
});