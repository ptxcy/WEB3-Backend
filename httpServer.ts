import express from "express";
import {connectToMongoDB, isMongoDBConnected} from "./database/MongoDB";
import * as fs from "node:fs";
import https from "https";

const port = 443
const key = fs.readFileSync("./certificates/key.pem");
const cert = fs.readFileSync("./certificates/cert.pem");

const app = express();

const allowedOrigins = new Set<string>([
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
    "http://frontend",
    "http://frontend:80",
]);

app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;

    if (origin && allowedOrigins.has(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Expose-Headers", "Authorization");

    next();
});

export {app};

async function initRoutes() {
    const routes = await Promise.all([
        import("./endpoints/authenticate/AuthenticateRoute"),
        import("./endpoints/degreeCourse/DegreeCourseRoute"),
        import("./endpoints/degreeCourseApplications/DegreeCourseApplicationsRoute"),
        import("./endpoints/users/PublicUsersRoute"),
        import("./endpoints/users/UsersRoute")
    ]);

    const [authRouter, degCourseRouter, degCourseApplicationRouter, publicUsersRouter, usersRouter] = routes.map(r => r.router);
    app.use("/api/users", usersRouter);
    app.use("/api/publicUsers", publicUsersRouter);
    app.use("/api/authenticate", authRouter);
    app.use("/api/degreeCourses", degCourseRouter);
    app.use("/api/degreeCourseApplications", degCourseApplicationRouter);
    app.use((req, res, next) => {
        const path = req.path;
        let isRegisteredPath: boolean = false;
        for (let pth in routes) {
            if (path === pth) {
                isRegisteredPath = true;
            }
        }

        if (isRegisteredPath) {
            next();
        } else {
            res.status(404).json({error: 'Route does not exist'});
        }
    });
}


//export for test purposes
export async function initServer() {
    // Ensuring The DB can be Started after the server :)
    while (!isMongoDBConnected()) {
        await connectToMongoDB();
        if (!isMongoDBConnected()) {
            console.log("MongoDB Try Reconnecting...");
            await sleep(1000);
        }
    }

    await initRoutes();
}

async function startServer() {
    await initServer();
    const server = https.createServer({key, cert}, app);
    server.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

function sleep(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
}

if (process.env.NODE_ENV !== 'test') {
    startServer();
}