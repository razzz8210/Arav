import { MongoClient } from "mongodb";

const options = {};

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

function getMongoUri() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Please add your MONGO_URI to .env");
  }
  return uri;
}

function getClientPromise() {
  if (clientPromise) return clientPromise;
  const uri = getMongoUri();
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      mongo?: Promise<MongoClient>;
    };
    if (!globalWithMongo.mongo) {
      client = new MongoClient(uri, options);
      globalWithMongo.mongo = client.connect();
    }
    clientPromise = globalWithMongo.mongo;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export default getClientPromise;

export async function getUsersCollection() {
  const client = await getClientPromise();
  const db = client.db("crack-dev");
  return db.collection("user-data");
}
