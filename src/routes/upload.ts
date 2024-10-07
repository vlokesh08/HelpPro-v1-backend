import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
// import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import {
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'
export const uploadRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    R2_SUBDOMAIN_URL: string,
    JWT_SECRET: string,
    ACCESS_KEY: string,
    SECRET_ACCESS_KEY: string,
    BUCKET_NAME: string,
    ACCOUNT_ID: string,
  };
}>();



uploadRoute.get('/upload/:id', async (c) => { 
  return c.text('Upload route');
});

uploadRoute.post('/upload/:id', async (c) => {
  // console.log(c.env.DATABASE_URL)
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const id  = c.req.param("id");
  const body = await c.req.parseBody();
  const file = body['file'];

  console.log(file);

  try {
    const S3 = new S3Client({
      region: 'auto',
      endpoint: `https://${c.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
          accessKeyId: c.env.ACCESS_KEY,
          secretAccessKey: c.env.SECRET_ACCESS_KEY,
      },
  });
  
    const uploadParams: PutObjectCommandInput = {
      Bucket: c.env.BUCKET_NAME,
      Key: `profile-pic/${id}`,
      Body: file,
      ContentLength: file.size,
      ContentType: 'image/png/jpg/jpeg'
    };
  
    const cmd = new PutObjectCommand(uploadParams);
    const data = await S3.send(cmd);
    const url = `${c.env.R2_SUBDOMAIN_URL}/profile-pic/${id}`
    const user = await prisma.user.update({
      where: {
          id: id,
      },
      data: {
          profilePic: url,
      },
  });
  const token = await sign({ id: user.id }, c.env.JWT_SECRET);

	return c.json({
		jwt: token,
		user: user,
		message: 'Login in successful',
	});
    return c.json({ message: 'File uploaded successfully' }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ message: 'Error uploading file', error }, 400);
  }


  return c.json({ error: 'File not provided or not valid' }, 400);
});
