import {DegreeCourseModel, IDegreeCourse} from "./DegreeModel";
import {DeleteResult} from "mongodb";

export async function saveDegreeCourse(course: IDegreeCourse): Promise<IDegreeCourse | null> {
    try {
        return await DegreeCourseModel.create(course);
    } catch (err) {
        console.log("An error occurred creating new CourseDegree: ", err);
        return null;
    }
}

export async function deleteDegreeCourse(courseId: string): Promise<DeleteResult | null> {
    try {
        return await DegreeCourseModel.deleteOne({_id: courseId});
    } catch (err) {
        console.log("An error occurred creating new CourseDegree: ", err);
        return null;
    }
}

export async function getDegreeCourseById(courseId: string): Promise<IDegreeCourse | null> {
    try {
        return await DegreeCourseModel.findOne({_id: courseId});
    } catch (err) {
        console.log("An error occurred getting CourseDegree: ", err);
        return null;
    }
}

export async function updateDegreeCourse(courseId: string, courseDegree: Partial<IDegreeCourse>): Promise<void> {
    try {
        await DegreeCourseModel.updateOne({_id: courseId}, courseDegree);
    } catch (err) {
        console.log("An error occurred creating new CourseDegree: ", err);
    }
}

export async function searchDegreeCourses(filter: Partial<IDegreeCourse>): Promise<IDegreeCourse[]> {
    const searchObject: any = {};
    if (filter.name) searchObject.name = {$eq: filter.name};
    if (filter.shortName) searchObject.shortName = {$eq: filter.shortName};
    if (filter.universityName) searchObject.universityName = {$eq: filter.universityName};
    if (filter.universityShortName) searchObject.universityShortName = {$eq: filter.universityShortName};
    if (filter.departmentName) searchObject.departmentName = {$eq: filter.departmentName};
    if (filter.departmentShortName) searchObject.departmentShortName = {$eq: filter.departmentShortName};
    console.log("Searching with filter:", JSON.stringify(searchObject));
    return DegreeCourseModel.find(searchObject);
}

