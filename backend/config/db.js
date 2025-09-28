import mongoose from 'mongoose';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ConnectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("MONGO_URI not set; user/project features will be disabled.");
    return;
  }

  let attempts = 0;
  const maxAttempts = 5;
  while (attempts < maxAttempts) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      attempts += 1;
      console.error(`Mongo connection attempt ${attempts} failed: ${error.message}`);
      if (attempts >= maxAttempts) {
        console.error("Giving up on Mongo connection after multiple attempts. Continuing without Mongo.");
        return;
      }
      await sleep(2000);
    }
  }
};

export default ConnectDB;