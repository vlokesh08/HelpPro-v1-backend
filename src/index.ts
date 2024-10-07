import { Hono } from 'hono';
import { cors } from 'hono/cors'

import connectDB from "./config/db"
import { loginRoute } from './routes/loginRoute';
import { postRoute } from './routes/postRoute';
import { searchRoute } from './routes/searchRoute';
import { userRoute } from './routes/userRoute';
import { projectRoute } from './routes/projectRoute';
import { uploadRoute } from './routes/upload';
import { savePost } from './routes/savePosts';
import { commentsRoute } from './routes/comments';
import { subscriberRouter } from './routes/subscriberRoute';
import { tempRoute } from './routes/temp';
import { notificationRoute } from './routes/notifications';
import { messageRoute } from './routes/messageRoutes';
import { reportsRoute } from './routes/reports';

const app = new Hono();

connectDB();

app.use("/api/*", cors());
app.route("/api/v1/auth", loginRoute);
app.route("/api/v1/post", postRoute);
app.route("/api/v1/project", projectRoute);
app.route("/api/v1/search", searchRoute);
app.route("/api/v1/user", userRoute);
app.route("/api/v1/save", savePost);
app.route("/api/v1/verified", tempRoute);
app.route("/api/v1/subscriber", subscriberRouter);
app.route("/api/v1/messages", messageRoute);
app.route("/api/v1/notifications", notificationRoute);
app.route("/api/v1/reports", reportsRoute);
app.route("/api/v1/comments", commentsRoute);


app.route("/api/v1/upload", uploadRoute);




app.get("/", (c) => {
  return c.json({ message: "Welcome to Hono" });
});

export default {
    fetch: app.fetch
  }