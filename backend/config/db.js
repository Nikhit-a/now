
const mongoose = require("mongoose");

let mongodInstance = null;

const connectDB = async () => {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/careerinfinity";
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
        console.log("MongoDB Connected Successfully to:", uri);
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.warn(`Local MongoDB at ${uri} was not reachable (${error.message}).`);
            console.log("Starting in-memory MongoDB server for development...");
            try {
                const { MongoMemoryServer } = require("mongodb-memory-server");
                mongodInstance = await MongoMemoryServer.create();
                const memUri = mongodInstance.getUri();
                await mongoose.connect(memUri);
                console.log("In-Memory MongoDB Connected Successfully at:", memUri);

                // Auto-seed careers if empty
                try {
                    const Career = require("../models/Career");
                    const count = await Career.countDocuments();
                    if (count === 0) {
                        const careers = require("../data/careers");
                        for (const career of careers) {
                            await Career.findOneAndUpdate({ title: career.title }, career, { upsert: true });
                        }
                        console.log(`Auto-seeded ${careers.length} default careers into in-memory database.`);
                    }
                } catch (seedErr) {
                    console.warn("Could not auto-seed careers:", seedErr.message);
                }
                return;
            } catch (memError) {
                console.error("Failed to start in-memory MongoDB:", memError.message);
            }
        }
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
