import * as Mongoose from "mongoose";

export interface IUser {
    userID: string;
    isAdministrator: boolean;
    password: string;
    firstName?: string;
    lastName?: string;
}

const UserSchema = new Mongoose.Schema<IUser>({
        userID: {type: String, unique: true, required: true},
        isAdministrator: {type: Boolean, required: true},
        password: {type: String, required: true},
        firstName: {type: String, required: false},
        lastName: {type: String, required: false},
    },
    {
        toJSON: {
            transform: (doc, ret) => {
                delete ret._id;
                delete ret.__v;
            }
        }
    })

export const UserModel = Mongoose.model<IUser>("User", UserSchema);


