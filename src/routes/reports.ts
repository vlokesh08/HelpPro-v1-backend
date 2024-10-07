import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import bcrypt from 'bcryptjs';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';
export const reportsRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
		SECRET_HASH: string;
	};
}>();

// Route to add a report

reportsRoute.post('/add-report', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const { content, type, userId, id } = await c.req.json();
	console.log(content, type, userId);
	try {
		const report = await prisma.report.create({
			data: {
				content,
				type,
				userId,
                reportedId: id,
                status: 'pending',
			},
		});
		c.status(201);
		return c.json(report);
	} catch (error) {
		c.status(500);
		return c.json({ error: 'An error occurred while adding the report.' });
	}
});

// Route to get all reports

reportsRoute.get('/get-reports', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const reports = await prisma.report.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    }, 
                },
            },
        });
        c.status(200);
        return c.json(reports);
    } catch (error) {
        c.status(500);
        return c.json({ error: 'An error occurred while getting the reports.' });
    }
});

// Route to mark report as resolved

reportsRoute.put('/resolve-report/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const id = c.req.param('id');
	const { message, status } = await c.req.json();

    try {
        const report = await prisma.report.update({
            where: {
                id: id,
            },
            data: {
                status: status,
            },
        });
        c.status(200);
        return c.json(report);
    } catch (error) {
        c.status(500);
        return c.json({ error: 'An error occurred while resolving the report.' });
    }
});

// Route to mark report as later

reportsRoute.delete('/delete-report/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const id = c.req.param('id');

    try {
        const report = await prisma.report.update({
            where: {
                id: id,
            },
            data: {
                status: "later",
            },
        });
        c.status(200);
        return c.json(report);
    } catch (error) {
        c.status(500);
        return c.json({ error: 'An error occurred while deleting the report.' });
    }
});


