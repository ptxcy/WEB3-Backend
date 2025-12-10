import {Document} from "mongoose";
import {IUser, UserModel} from "./UserModel";
import {DeleteResult} from "mongodb";
import {GenerateHash} from "../authenticate/AuthenticateService";

export async function SaveUserInDB(userId: string, isAdmin: boolean, password: string, firstname?: string, lastname?: string): Promise<IUser | null> {
    const userObj = {
        userID: userId,
        isAdministrator: isAdmin,
        password: password,
        firstName: firstname,
        lastName: lastname,
    }
    console.log("Creating new user: " + JSON.stringify(userObj));
    try {
        return await UserModel.create(userObj);
    } catch (err) {
        console.log("An error occurred creating new user: ", err);
        return null;
    }
}

export async function UpdateUserInDB(userId: string, isAdmin?: boolean, password?: string, firstname?: string, lastname?: string): Promise<IUser | null> {
    const userObj = await GetUserById(userId);
    if (userObj === null || userObj === undefined) {
        console.log(`Failed to update user because user with id: ${userId} does not exist`);
        return null;
    }

    const updateObject: any = {};
    if (isAdmin !== undefined) {
        updateObject.isAdministrator = isAdmin;
    }

    if (password !== undefined) {
        updateObject.password = await GenerateHash(password);
    }

    if (firstname !== undefined) {
        updateObject.firstName = firstname;
    }

    if (lastname !== undefined) {
        updateObject.lastName = lastname;
    }

    console.log(`try to update ${userId} with object`, JSON.stringify(updateObject));
    try {
        const updatedUser: Document | null = await UserModel.findOneAndUpdate(
            {userID: userId},
            {$set: updateObject},
            {new: true}
        )
        if (updatedUser === null || updatedUser === undefined) {
            console.log(`Failed to update user with id: ${userId} does not exist`);
            return null;
        }

        const updatedObject = await GetUserById(userId);
        if (updatedObject === null || updatedObject === undefined) {
            console.log(`User was deleted after update?`);
            return null;
        }

        return updatedObject;
    } catch (error) {
        console.error(`Error updating user with id: ${userId}`, error);
        return null;
    }
}

export async function DeleteUserInDB(userId: string): Promise<DeleteResult | null> {
    try {
        const result: DeleteResult = await UserModel.deleteOne({userID: userId});
        if (result.deletedCount === 0) {
            console.log(`User To Be Deleted: ${userId} did not exist.`);
        } else {
            console.log(`User: ${userId} was deleted successfully.`);
        }
        return result;
    } catch (err) {
        console.log("An error occurred deleting user: ", err);
        return null;
    }
}

export async function GetUserById(userId: string): Promise<IUser | null | undefined> {
    try {
        console.log("Getting user with id: " + userId);
        const result = await UserModel.findOne({userID: userId});
        if (!result) {
            console.log(`User with ID ${userId} not found.`);
            return null;
        }
        return result;
    } catch (err) {
        console.log("An error occurred getting user:", err);
    }
}

export async function GetAllUsersInDB(): Promise<IUser[]> {
    try {
        return await UserModel.find({});
    } catch (err) {
        console.error("Error while fetching all users:", err);
        return [];
    }
}