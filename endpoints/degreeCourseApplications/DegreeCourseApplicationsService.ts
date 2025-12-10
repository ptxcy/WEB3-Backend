import { DegreeCourseApplicationsModel, IDegreeCourseApplication } from "./DegreeCourseApplicationsModel";
import { DeleteResult } from "mongodb";

export async function saveDegreeCourseApplication(application: IDegreeCourseApplication): Promise<IDegreeCourseApplication | null> {
    try {
        const existingApplication = await DegreeCourseApplicationsModel.findOne(application);
        if (existingApplication) {
            console.log("Application already exists.");
            return null;
        }

        return await DegreeCourseApplicationsModel.create(application);
    } catch (err) {
        console.log("An error occurred creating new DegreeCourseApplication: ", err);
        return null;
    }
}


export async function deleteDegreeCourseApplication(applicationId: string): Promise<DeleteResult | null> {
    try {
        return await DegreeCourseApplicationsModel.deleteOne({ _id: applicationId });
    } catch (err) {
        console.log("An error occurred deleting DegreeCourseApplication: ", err);
        return null;
    }
}

export async function getDegreeCourseApplicationById(id: string): Promise<IDegreeCourseApplication | null> {
    try {
        return await DegreeCourseApplicationsModel.findOne({ _id: id });
    } catch (err) {
        console.log("An error occurred getting DegreeCourseApplication: ", err);
        return null;
    }
}

export async function getDegreeCourseApplicationUserId(userID: string): Promise<IDegreeCourseApplication | null> {
    try {
        return await DegreeCourseApplicationsModel.findOne({ applicantUserID: userID });
    } catch (err) {
        console.log("An error occurred getting DegreeCourseApplication: ", err);
        return null;
    }
}

export async function updateDegreeCourseApplication(applicationId: string, applicationData: Partial<IDegreeCourseApplication>): Promise<void> {
    try {
        await DegreeCourseApplicationsModel.updateOne({ _id: applicationId }, applicationData);
    } catch (err) {
        console.log("An error occurred updating DegreeCourseApplication: ", err);
    }
}

export async function searchDegreeCourseApplications(filter: Partial<IDegreeCourseApplication>): Promise<IDegreeCourseApplication[]> {
    const searchObject: any = {};
    if (filter.applicantUserID) searchObject.applicantUserID = { $eq: filter.applicantUserID };
    if (filter.degreeCourseID) searchObject.degreeCourseID = { $eq: filter.degreeCourseID };
    if (filter.targetPeriodYear) searchObject.targetPeriodYear = { $eq: filter.targetPeriodYear };
    if (filter.targetPeriodShortName) searchObject.targetPeriodShortName = { $eq: filter.targetPeriodShortName };

    console.log("Searching with filter:", JSON.stringify(searchObject));
    return DegreeCourseApplicationsModel.find(searchObject);
}
