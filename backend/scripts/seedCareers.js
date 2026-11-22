
require("dotenv").config();

const mongoose = require("mongoose");
const Career = require("../models/Career");
const careers = require("../data/careers");

const seedCareers = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env file");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");

        for (const career of careers) {
            await Career.findOneAndUpdate(
                { title: career.title },
                { $set: career },
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            );
        }

        console.log(`Successfully seeded ${careers.length} careers`);

    } catch (error) {
        console.error("Career seeding failed:", error.message);
        process.exitCode = 1;

    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log("MongoDB disconnected");
        }
    }
};

seedCareers();
