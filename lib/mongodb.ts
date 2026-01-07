import mongoose from 'mongoose';

// Define the connection cache type
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend the global object to include our mongoose cache for both main and demo DBs
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var mongooseDemo: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DEMO_URI = process.env.MONGODB_DEMO_URI;

// Initialize the caches on the global object to persist across hot reloads in development
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };
let cachedDemo: MongooseCache = global.mongooseDemo || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}
if (!global.mongooseDemo) {
  global.mongooseDemo = cachedDemo;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Caches the connection to prevent multiple connections during development hot reloads.
 * @param useDemo - Whether to connect to the demo database
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(useDemo: boolean = false): Promise<typeof mongoose> {
  const currentURI = useDemo ? MONGODB_DEMO_URI : MONGODB_URI;

  if (!currentURI) {
    throw new Error(
        `Please define the ${useDemo ? 'MONGODB_DEMO_URI' : 'MONGODB_URI'} environment variable inside .env.local`
    );
  }

  // If already connected, check if it's the right host
  if (mongoose.connection.readyState >= 1) {
    const currentHost = new URL(currentURI).host;
    const connectedHost = mongoose.connection.host;
    
    if (connectedHost && currentHost.includes(connectedHost)) {
      return mongoose;
    }
    
    // Different host, disconnect first
    await mongoose.disconnect();
  }

  return mongoose.connect(currentURI, { bufferCommands: false });
}

export default connectDB;