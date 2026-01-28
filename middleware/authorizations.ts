import express from "express";
import {BuildUnauthorizedResponse, InternalServerError} from "../utils/MessageBuilder";
import {
    BearerTokenState,
    generateJWTToken,
    HasValidBarerToken,
    loadJWTTokenPayload
} from "../endpoints/authenticate/AuthenticateService";
import {JwtPayload} from "jsonwebtoken";

export async function checkIfUserHasRightsForThisUserAction(req: express.Request, res: express.Response, next: express.NextFunction) {
    const userData: { userID: string, isAdmin: string } | undefined = (req as any).userData;
    if (userData === undefined || userData === null) {
        console.error("User Data was not saved in Context of Request out of the JWT Token");
        InternalServerError(res);
        return;
    }

    if (userData.isAdmin) {
        next();
        return;
    }

    if (req.method === "POST" || req.method === "DELETE") {
        BuildUnauthorizedResponse(res, "User needs to be admin to do that!");
        return;
    }

    const {userID} = req.params;
    if (userID === undefined || userID !== userData.userID) {
        BuildUnauthorizedResponse(res, "Mismatch of ID in path and ID in Token User is not allowed to do that!");
        return;
    }

    //User can only edit their own password, first and last name but not the isAdmin setting;
    if (req.method === "PUT") {
        if (req.body.isAdministrator !== undefined) {
            BuildUnauthorizedResponse(res, "User is not Allowed to change if the user is an admin or not!");
            return;
        }
    }

    // User used GET /:userID and the id was the right one
    next()
}

export async function checkIfUserHasRightsForThisDegreeCourseAction(req: express.Request, res: express.Response, next: express.NextFunction) {
    const userData: { userID: string, isAdmin: string } | undefined = (req as any).userData;
    if (userData === undefined || userData === null) {
        console.error("User Data was not saved in Context of Request out of the JWT Token");
        InternalServerError(res);
        return;
    }

    if (userData.isAdmin) {
        next();
        return;
    }

    if (req.method === "POST" || req.method === "DELETE" || req.method === "PUT") {
        BuildUnauthorizedResponse(res, "User needs to be admin to do that!");
        return;
    }

    if(req.method === "GET" && req.path.endsWith("/degreeCourseApplication")) {
        BuildUnauthorizedResponse(res,"User needs to be admin to do that!");
        return;
    }

    next()
}

export async function checkIfUserHasRightsForThisDegreeCourseApplicationAction(req: express.Request, res: express.Response, next: express.NextFunction) {
    const userData: { userID: string, isAdmin: string } | undefined = (req as any).userData;
    if (userData === undefined || userData === null) {
        console.error("User Data was not saved in Context of Request out of the JWT Token");
        InternalServerError(res);
        return;
    }

    if (userData.isAdmin) {
        next();
        return;
    }

    if(req.method === "GET" && req.path.endsWith("/myApplications")) {
        next();
        return;
    }

    if(req.method === "POST") {
        next();
        return;
    }

    BuildUnauthorizedResponse(res,"User needs to be admin to do that!");
    return;
}

export async function checkForAuthorization(req: express.Request, res: express.Response, next: express.NextFunction) {
    //Invalid Header Value
    const authorizationHeaderValue = req.headers.authorization;
    if (!authorizationHeaderValue) {
        console.error("Authentication Header was there but empty?");
        BuildUnauthorizedResponse(res);
        return;
    }

    //User Has already an access token validate
    if (authorizationHeaderValue.startsWith('Bearer ')) {
        let tokenState = await HasValidBarerToken(authorizationHeaderValue);
        switch (tokenState) {
            case BearerTokenState.RENEWED: {
                const token: string = authorizationHeaderValue.substring("Bearer ".length);
                const tokenContent: string | JwtPayload = loadJWTTokenPayload(token);

                if (typeof tokenContent === "string") {
                    tokenState = BearerTokenState.ERROR;
                    break;
                }

                const userID: string = tokenContent.userID;
                const isAdmin: boolean = tokenContent.isAdministrator;
                res.setHeader("Authorization", await generateJWTToken(userID, isAdmin));

                //Ignore type so i don't need to write an interface extension and i can simply add context objects
                (req as any).userData = {
                    userID: tokenContent.userID,
                    isAdmin: tokenContent.isAdministrator
                };

                next();
                return;
            }
            case BearerTokenState.ERROR: {
                InternalServerError(res)
                return;
            }
            case BearerTokenState.INVALID: {
                BuildUnauthorizedResponse(res);
                return;
            }
            case BearerTokenState.EXPIRED: {
                BuildUnauthorizedResponse(res);
                return;
            }
            case BearerTokenState.VALID: {
                next()
                return;
            }
        }
    }else{
        console.error("Token was: " + authorizationHeaderValue + " but should start with Bearer");
        BuildUnauthorizedResponse(res);
        return;
    }
}