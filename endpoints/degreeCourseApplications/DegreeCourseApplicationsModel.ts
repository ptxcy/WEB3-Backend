import Mongoose from "mongoose";

export interface IDegreeCourseApplication {
    id?: string;
    applicantUserID: string;
    degreeCourseID: string;
    targetPeriodYear: string;
    targetPeriodShortName: string;
}

const degreeCourseApplicationSchema = new Mongoose.Schema<IDegreeCourseApplication>({
    applicantUserID: { type: String, required: true },
    degreeCourseID: { type: String, required: true },
    targetPeriodYear: { type: String, required: true },
    targetPeriodShortName: { type: String, required: true },
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export const DegreeCourseApplicationsModel = Mongoose.model<IDegreeCourseApplication>('degreeCourseApplications', degreeCourseApplicationSchema);