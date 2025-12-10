import express from "express";

export function BuildUnauthorizedResponseAskForLogin(res: express.Response) {
    res.status(401)
    res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
    res.end();
}

export function BuildUnauthorizedResponse(res: express.Response, message?: string) {
    res.status(401)
    if (message) {
        res.json({error: message});
    } else {
        res.json({error: "Authorization Header is missing or Invalid"});
    }
    res.end();
}

export function AuthenticationSuccessful(res: express.Response, token?: string) {
    res.status(200)
    if (token) {
        res.setHeader("Authorization", 'Bearer ' + token);
    }
    res.end();
}

export function DeletionSuccessful(res: express.Response, token?: string) {
    res.status(204);
    res.end();
}

export function MissingBody(res: express.Response) {
    res.status(400)
    res.json({error: "Malformed Request Body is missing"});
    res.end();
}

export function Malformed(res: express.Response, message?: string) {
    res.status(400)
    if (message) {
        res.json({error: message});
    } else {
        res.json({error: "Malformed Request"});
    }
    res.end();
}

export function InternalServerError(res: express.Response) {
    res.status(500)
    res.json({error: "Server Error"})
    res.end();
}

export function NotFound(res: express.Response) {
    res.status(404);
    res.json({error: "Could not find Entity"})
    res.end();
}

export function ConflictUserIDAlreadyExists(res: express.Response) {
    res.status(409);
    res.json({error: "user already exists"});
    res.end()
}

export function ConflictCourseIDAlreadyExists(res: express.Response) {
    res.status(409);
    res.json({error: "Course already exists"});
    res.end()
}

export function ConflictCourseApplicationIDAlreadyExists(res: express.Response) {
    res.status(409);
    res.json({error: "Course Application already exists"});
    res.end()
}

export function BuildUpdateSucceeded(res: express.Response, obj: Object) {
    res.status(200)
    res.json(obj);
    res.end()
}