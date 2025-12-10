import express from 'express';
import {
    AuthenticationSuccessful,
    BuildUnauthorizedResponse,
    BuildUnauthorizedResponseAskForLogin,
    InternalServerError
} from "../../utils/MessageBuilder";
import {
    BearerTokenState,
    generateJWTToken,
    HasValidBarerToken,
    isLoginDataCorrect,
    loadJWTTokenPayload
} from "./AuthenticateService";
import {JwtPayload} from "jsonwebtoken";

const router = express.Router();
export {router};

function isAuthHeaderSet(req: express.Request): boolean {
    if (req.headers.authorization !== undefined) {
        return true;
    }
    return false;
}

async function handleGetRequest(req: express.Request, res: express.Response): Promise<void> {
    //Ask For Authentication
    if (!isAuthHeaderSet(req)) {
        BuildUnauthorizedResponseAskForLogin(res);
        console.error("Authentication Header was missing Asking For Login.");
        return;
    }

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

                const username: string = tokenContent.userID;
                const isAdministrator: boolean = tokenContent.isAdministrator;
                AuthenticationSuccessful(res, await generateJWTToken(username, isAdministrator));
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
                AuthenticationSuccessful(res);
                return;
            }
        }
    }

    //Validate Login Data and Generate JWT Token if valid
    if (authorizationHeaderValue.startsWith('Basic ')) {
        const encodedValue = authorizationHeaderValue.substring("Basic ".length);
        const decodedValue = Buffer.from(encodedValue, 'base64').toString('ascii');

        const loginInformation = decodedValue.split(':');
        if (loginInformation.length > 2 || loginInformation.length == 0) {
            BuildUnauthorizedResponse(res);
            console.error("Authentication Header value contained more than 1 Double Dots.");
            return;
        }

        const userID: string = loginInformation[0];
        const password: string = loginInformation[1];
        const validUser = await isLoginDataCorrect(userID, password);
        if (validUser !== undefined && validUser !== null) {
            const token = await generateJWTToken(validUser.userID, validUser.isAdministrator);
            AuthenticationSuccessful(res, token);
            return
        } else {
            BuildUnauthorizedResponse(res);
            console.error("Login Information was wrong.");
            return;
        }
    }

    BuildUnauthorizedResponse(res);
    console.error("Unexpected Behavior Happend");
    return;
}

router.get('/', async (req, res) => {
    console.log("Authentication Endpoint reached!");
    await handleGetRequest(req, res);
})