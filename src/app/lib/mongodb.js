import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

const options = {
  serverApi: {
    version: "1", // ✅ Ez a megoldás
    strict: true,
    deprecationErrors: true,
  }
};

let client;
let clientPromise;
console.log(uri)
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI environment variable");
}
if (process.env.NODE_ENV === "development") {
  // Development mód: cache-eljük a MongoClient példányt, hogy hot reloadnál ne nyíljon új kapcsolat
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().then(() => {
      console.log("MongoDB kapcsolódás sikeres!");
      return client; // így továbbadhatod a kliens példányt
    }).catch((err) => {
      console.error("MongoDB kapcsolódási hiba:", err);
      throw err;  // újradobja a hibát
    });
  }
  clientPromise = global._mongoClientPromise;

} else {
  // Production: egyszeri példány
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
