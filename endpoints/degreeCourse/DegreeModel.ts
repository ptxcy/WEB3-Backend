import Mongoose from "mongoose";

export interface IDegreeCourse {
    id?: string;
    name: string;
    shortName: string;
    universityName: string;
    universityShortName: string;
    departmentName: string;
    departmentShortName: string;
}

const degreeCourseSchema = new Mongoose.Schema<IDegreeCourse>({
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    universityName: { type: String, required: true },
    universityShortName: { type: String, required: true },
    departmentName: { type: String, required: true },
    departmentShortName: { type: String, required: true }
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export const DegreeCourseModel = Mongoose.model<IDegreeCourse>('degreeCourse', degreeCourseSchema);