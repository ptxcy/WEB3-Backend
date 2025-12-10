import express from 'express';
import {
    BuildUpdateSucceeded, ConflictCourseIDAlreadyExists, DeletionSuccessful, InternalServerError,
    Malformed,
    NotFound
} from "../../utils/MessageBuilder";
import {DeleteResult} from "mongodb";
import {
    deleteDegreeCourse,
    getDegreeCourseById,
    saveDegreeCourse,
    searchDegreeCourses,
    updateDegreeCourse
} from "./DegreeCourseService";
import {IDegreeCourse} from "./DegreeModel";
import {checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseAction} from "../../middleware/authorizations";
import {searchDegreeCourseApplications} from "../degreeCourseApplications/DegreeCourseApplicationsService";

const router = express.Router();
export {router};

//Transform request body if content-type is json
router.use((req, res, next) => {
    if (req.headers['content-type'] === 'application/json') {
        express.json()(req, res, next);
    } else {
        next();
    }
});

router.get('/:courseID', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseAction, async (req, res) => {
    console.log("Triggered CourseDegree Search By Id endpoint")
    const {courseID} = req.params;
    const course = await getDegreeCourseById(courseID);

    if (course === null || course === undefined) {
        console.log(`Could not find CourseDegree with id: ${courseID}`);
        NotFound(res);
        return;
    }
    res.json(course)
})

router.get('/:courseID/degreeCourseApplications', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseAction, async (req, res) => {
    console.log("Triggered CourseDegree Search By Id endpoint")
    const {courseID} = req.params;
    const course = await getDegreeCourseById(courseID);

    if (course === null || course === undefined) {
        console.log(`Could not find CourseDegree with id: ${courseID}`);
        NotFound(res);
        return;
    }

    res.json(await searchDegreeCourseApplications({degreeCourseID: courseID}));
})

router.get('/', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseAction, async (req, res) => {
    console.log("Triggered CourseDegree List Endpoint")
    res.json(await searchDegreeCourses(req.query));
})

router.post('/', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseAction, async (req, res) => {
    console.log("Triggered CourseDegree Creation Endpoint")
    let courseDegree: IDegreeCourse | undefined = req.body
    if (courseDegree === undefined) {
        Malformed(res);
        return;
    }

    const search: IDegreeCourse[] = await searchDegreeCourses(courseDegree);
    if (search && search.length > 0) {
        ConflictCourseIDAlreadyExists(res);
        return;
    }


    console.log("Creating new CourseDegree: ", courseDegree);
    res.status(201);
    res.json(await saveDegreeCourse(courseDegree));
})

router.put('/:courseID', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseAction, async (req, res) => {
    console.log("Triggered CourseDegree Update Endpoint");
    const {courseID} = req.params;

    let courseDegree: Partial<IDegreeCourse> | undefined = req.body
    if (courseDegree === undefined) {
        Malformed(res);
        return;
    }

    const searchedDegree: IDegreeCourse | null = await getDegreeCourseById(courseID);
    if (searchedDegree === null) {
        NotFound(res);
        return;
    }

    await updateDegreeCourse(courseID, courseDegree);

    const coursi: IDegreeCourse | null = await getDegreeCourseById(courseID);
    if (coursi === null) {
        InternalServerError(res);
        return;
    }

    BuildUpdateSucceeded(res, coursi);
})

router.delete('/:courseID', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseAction, async (req, res) => {
    console.log("Triggered CourseDegree Search By Id endpoint")
    const {courseID} = req.params;
    const deletionResult: DeleteResult | null = await deleteDegreeCourse(courseID);

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