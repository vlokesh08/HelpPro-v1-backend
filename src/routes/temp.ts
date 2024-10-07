import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import bcrypt from 'bcryptjs';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';
import { a } from 'vitest/dist/suite-xGC-mxBC.js';
import { use } from 'hono/jsx';
export const tempRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
		SECRET_HASH: string;
	};
}>();

tempRoute.put('/temp', async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

    //update user verified status
    const { id } = await c.req.json();
    const user = await prisma.user.update(
        {
            where: {
                id : id,
            },
            data: {
                verified: true,
            },
        }
    );
    if(!user) return c.json({ message: 'User not found' });
    return c.json({ message: 'User verified' });
});