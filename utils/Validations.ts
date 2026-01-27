import {IDegreeCourse} from "../endpoints/degreeCourse/DegreeModel";
import {IDegreeCourseApplication} from "../endpoints/degreeCourseApplications/DegreeCourseApplicationsModel";

export function validateInputLength(input: string, min: number, max: number) {
  return input.length >= min && input.length <= max;
}

export function validateDegreeCourseMinimalInput(course: IDegreeCourse): boolean {
    if (!course.name || !course.shortName || !course.universityName ||
        !course.universityShortName || !course.departmentName || !course.departmentShortName) {
        return false;
    }

    return validateInputLength(course.name, 5, 255) &&
        validateInputLength(course.shortName, 5, 255) &&
        validateInputLength(course.universityName, 5, 255) &&
        validateInputLength(course.universityShortName, 5, 255) &&
        validateInputLength(course.departmentName, 5, 255) &&
        validateInputLength(course.departmentShortName, 5, 255);
}

function validateField(field: string | undefined): boolean {
    return field === undefined || validateInputLength(field, 5, 255);
}

export function validatePartialDegreeCourse(course: Partial<IDegreeCourse>): boolean {
    return validateField(course.name) &&
        validateField(course.shortName) &&
        validateField(course.universityName) &&
        validateField(course.universityShortName) &&
        validateField(course.departmentName) &&
        validateField(course.departmentShortName);
}

export function validateDegreeCourseApplicationMinimalInput(application: IDegreeCourseApplication): boolean {
    if (!application.applicantUserID || !application.degreeCourseID ||
        !application.targetPeriodYear || !application.targetPeriodShortName) {
        return false;
    }

    return validateInputLength(application.applicantUserID, 5, 255) &&
        validateInputLength(application.degreeCourseID, 5, 255) &&
        validateInputLength(application.targetPeriodYear, 5, 255) &&
        validateInputLength(application.targetPeriodShortName, 5, 255);
}

export function validatePartialDegreeCourseApplication(application: Partial<IDegreeCourseApplication>): boolean {
    return validateField(application.applicantUserID) &&
        validateField(application.degreeCourseID) &&
        validateField(application.targetPeriodYear) &&
        validateField(application.targetPeriodShortName);
}




