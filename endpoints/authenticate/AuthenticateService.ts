import bcrypt from "bcryptjs";
import config from "config";
import jwt, {JsonWebTokenError, JwtPayload} from "jsonwebtoken";
import {GetUserById} from "../users/UsersService";

export enum BearerTokenState {
    VALID,
    RENEWED,
    EXPIRED,
    INVALID,
    ERROR
}

const jwtSecret: string = config.get("session-config.tokenKey");
const tokenExpiresAfter: number = config.get("session-config.tokenExpireAfter");
const timeToLiveCheckTime: number = config.get("session-config.timeToLiveDiffrenceExpandingTime");
const saltRounds = 10;

export async function GenerateHash(password: string): Promise<string> {
    return await bcrypt.genSalt(saltRounds).then(salt => {
        return bcrypt.hash(password, salt);
    }).catch(err => {
        console.log("Failed to Hash a password because: " + err)
        return "";
    })
}

export async function generateJWTToken(userID: string, isAdministrator: boolean): Promise<string> {
    return jwt.sign({userID, isAdministrator}, jwtSecret, {
        algorithm: "HS256",
        expiresIn: tokenExpiresAfter,
    });
}

export async function isLoginDataCorrect(userID: string, password: string): Promise<{
    userID: string;
    password: string;
    isAdministrator: boolean;
    firstName?: string;
    lastName?: string;
} | null> {

    if (password === undefined || userID === undefined) {
        return null;
    }

    const user: {
        userID: string;
        password: string;
        isAdministrator: boolean;
        firstName?: string;
        lastName?: string;
    } | null | undefined = await GetUserById(userID);
    if (user === undefined || user == null) {
        return null;
    }

    const userPassword: string = user.password;
    if (userPassword === undefined || userPassword == null) {
        return null;
    }

    const loginPassword = await GenerateHash(password);
    console.log("generated hash out of request: ", loginPassword);
    console.log("saved password: ", userPassword);
    if (await bcrypt.compare(password, userPassword)) {
        return user;
    }

    return null
}

export async function HasValidBarerToken(authorizationHeaderValue: string): Promise<BearerTokenState> {
    //Validate JWT Token
    try {
        const token: string = authorizationHeaderValue.substring("Bearer ".length);
        const tokenContent: string | JwtPayload = loadJWTTokenPayload(token);

        if (typeof tokenContent === "string") {
            return BearerTokenState.ERROR;
        }

        if (isTokenExpired(tokenContent)) {
            return BearerTokenState.EXPIRED;
        }


        if (DoesTokenNeedsRenewal(tokenContent)) {
            return BearerTokenState.RENEWED;
        }

        return BearerTokenState.VALID;
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            return BearerTokenState.INVALID
        }
        console.error("Unexpected Error Occured Trying to validate JWT Token: " + error);
        return BearerTokenState.ERROR;
    }
}

export function isTokenExpired(tokenContent: JwtPayload): boolean {
    const currenTimeInSeconds: number = Math.floor(Date.now() / 1000)
    const tokenExpiresAfter: number | undefined = tokenContent.exp;

    if (tokenExpiresAfter === undefined) {
        return true;
    }

    return tokenExpiresAfter < currenTimeInSeconds
}

export function DoesTokenNeedsRenewal(tokenContent: JwtPayload): boolean {
    const currenTimeInSeconds: number = Math.floor(Date.now() / 1000)
    const tokenExpiresAfter: number | undefined = tokenContent.exp;
    if (tokenExpiresAfter === undefined) {
        throw Error("Token Had no Expire Date");
    }

    const timeToLive = currenTimeInSeconds - tokenExpiresAfter;
    if (timeToLive <= timeToLiveCheckTime) {
        return true;
    }
    return false;
}

export function loadJWTTokenPayload(token: string): JwtPayload | string {
    return jwt.verify(token, jwtSecret);
}