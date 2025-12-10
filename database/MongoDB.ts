import mongoose from "mongoose";
import config from "config";
import {GetUserById, SaveUserInDB} from "../endpoints/users/UsersService";
import {GenerateHash} from "../endpoints/authenticate/AuthenticateService";

export async function connectToMongoDB(): Promise<void> {
    const connectionString: string = config.get("data-base-config.connectionUri");
    await mongoose.connect(connectionString);

    const db = mongoose.connection;
    db.once("open", (err) => {
        console.log("Connected to MongoDB...");
    })

    db.once("error", (err) => {
        console.error("Could not connect to MongoDB: " + err);
    })

    db.on("error", (err) => {
        console.error("Error Occoured with MongoDB: " + err);
    })

    await createAdminIfNonExistent();
}

export function isMongoDBConnected(): boolean {
    return mongoose.connection.readyState === 1;
}

async function createAdminIfNonExistent() {
    const user = await GetUserById("admin");
    if (user !== null) {
        return;
    }

    console.log("Try to create Admin");
    await SaveUserInDB("admin", true, await GenerateHash("123"));
    console.log("Successfully created admin");
}
