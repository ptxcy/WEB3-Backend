import express from 'express';
import {DeleteUserInDB, GetAllUsersInDB, GetUserById, SaveUserInDB, UpdateUserInDB} from "./UsersService";
import {
    BuildUpdateSucceeded,
    ConflictUserIDAlreadyExists,
    DeletionSuccessful,
    InternalServerError,
    Malformed, MissingBody,
    NotFound
} from "../../utils/MessageBuilder";
import {GenerateHash} from "../authenticate/AuthenticateService";
import {DeleteResult} from "mongodb";
import {IUser} from "./UserModel";

export const router = express.Router();

//Transform request body if content-type is json
router.use((req, res, next) => {
    if (req.headers['content-type'] === 'application/json') {
        express.json()(req, res, next);
    } else {
        next();
    }
});

//Get Specific User
router.get('/:userID', async (req, res) => {
    console.log("Triggered User Search By Id endpoint")
    const {userID} = req.params;
    const user = await GetUserById(userID);
    if (user === null || user === undefined) {
        console.log(`Could not find user with id: ${userID}`);
        NotFound(res);
        return;
    }
    res.json(user)
})

//List All Users
router.get('/', async (req, res) => {
    console.log("Triggered User List Endpoint")
    res.json(await GetAllUsersInDB())
})

//Create User
router.post('/', async (req, res) => {
    console.log("Triggered User Creation Endpoint")
    let body = req.body;
    let password: string = req.body.password;
    const userID = req.body.userID;
    let isAdmin = req.body.isAdministrator;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    if(!isAdmin){
        isAdmin = false;
    }

    if (userID === undefined || password === undefined || body === undefined) {
        console.log("Either userID password isAdmin or body was undefined");
        Malformed(res)
        return;
    }

    const user = await GetUserById(userID);
    if (user !== null && user !== undefined) {
        ConflictUserIDAlreadyExists(res);
        return;
    }

    password = await GenerateHash(password);
    if (password === "") {
        console.log("Could not generate Hash out of password");
        Malformed(res)
        return;
    }

    console.log("Creating new user: " + JSON.stringify(req.body));
    res.status(201);
    res.json(await SaveUserInDB(userID, isAdmin, password, firstName, lastName));
})

router.put('/:userID', async (req, res) => {
    console.log("Triggered User Update Endpoint");
    const {userID} = req.params;
    if(req.body === undefined || req.body === null) {
        MissingBody(res);
        return;
    }

    let password: string = req.body.password;
    const isAdmin = req.body.isAdministrator;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    const updatedUser: IUser | null = await UpdateUserInDB(userID, isAdmin, password, firstName, lastName);
    if (updatedUser === null || updatedUser === undefined) {
        console.log(`Could not update user with id: ${userID}`);
        Malformed(res);
        return;
    }

    BuildUpdateSucceeded(res, updatedUser);
})

//Delete User
router.delete('/:userID', async (req, res) => {
    console.log("Triggered User Search By Id endpoint")
    const {userID} = req.params;
    const deletionResult: DeleteResult | null = await DeleteUserInDB(userID);

    if (deletionResult === null) {
        InternalServerError(res);
        return;
    }

    if (deletionResult.deletedCount === 0) {
        NotFound(res);
        return;
    }

    DeletionSuccessful(res);
})