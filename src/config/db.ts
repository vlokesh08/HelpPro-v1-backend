import { Hono } from 'hono';
import { App, Credentials } from 'realm-web';

const app = new Hono();

// Replace with your actual Realm App ID
const appId = 'application-0-ionetps';

// Helper function to get a MongoDB Realm client
const getClient = () => {
  return new App({ id: appId });
};

// Helper function to log in and get a reference to the MongoDB database
const getDatabase = async () => {
  const client = getClient();
  await client.logIn(Credentials.anonymous());
  const currentUser = client.currentUser;
  if (currentUser) {
    const mongo = currentUser.mongoClient('mongodb-atlas');
    const db = mongo.db('OpenSource'); // Replace with your database name
    return db;
  }
  throw new Error('User is not logged in.');
};

export default getDatabase;