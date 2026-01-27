import express from 'express';
import {
    checkForAuthorization,
    checkIfUserHasRightsForThisDegreeCourseApplicationAction
} from "../../middleware/authorizations";
import {
    BuildUpdateSucceeded, ConflictCourseApplicationIDAlreadyExists, ConflictCourseIDAlreadyExists,
    DeletionSuccessful,
    InternalServerError,
    Malformed,
    NotFound
} from "../../utils/MessageBuilder";
import {DeleteResult} from "mongodb";
import {
    deleteDegreeCourseApplication, getDegreeCourseApplicationById, getDegreeCourseApplicationUserId,
    saveDegreeCourseApplication,
    searchDegreeCourseApplications,
    updateDegreeCourseApplication
} from "./DegreeCourseApplicationsService";
import {IDegreeCourseApplication} from "./DegreeCourseApplicationsModel";
import {getDegreeCourseById} from "../degreeCourse/DegreeCourseService";
import {validateDegreeCourseApplicationMinimalInput, validatePartialDegreeCourseApplication} from "../../utils/Validations";

const router = express.Router();
export {router};

// Transform request body if content-type is json
router.use((req, res, next) => {
    if (req.headers['content-type'] === 'application/json') {
        express.json()(req, res, next);
    } else {
        next();
    }
});

router.get('/myApplications', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseApplicationAction, async (req, res) => {
    console.log("Triggered DegreeCourseApplication List Endpoint");
    const userData: { userID: string, isAdmin: string } | undefined = (req as any).userData;
    if (userData === undefined || userData === null) {
        console.error("User Data was not saved in Context of Request out of the JWT Token");
        InternalServerError(res);
        return;
    }

    res.json(await searchDegreeCourseApplications({applicantUserID: userData.userID}));
});

router.get('/:applicationID', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseApplicationAction, async (req, res) => {
    console.log("Triggered DegreeCourseApplication Search By Id endpoint");
    const {applicationID} = req.params;
    const application = await getDegreeCourseApplicationById(applicationID);

    if (!application) {
        console.log(`Could not find DegreeCourseApplication with id: ${applicationID}`);
        NotFound(res);
        return;
    }
    res.json(application);
});

router.get('/', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseApplicationAction, async (req, res) => {
    console.log("Triggered DegreeCourseApplication List Endpoint");
    res.json(await searchDegreeCourseApplications(req.query));
});

router.post('/', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseApplicationAction, async (req, res) => {
    console.log("Triggered DegreeCourseApplication Creation Endpoint");
    const userData: { userID: string, isAdmin: string } | undefined = (req as any).userData;
    if (userData === undefined || userData === null || userData.userID === undefined) {
        console.error("User Data was not saved in Context of Request out of the JWT Token");
        InternalServerError(res);
        return;
    }

    if (!req.body.degreeCourseID || !req.body.targetPeriodShortName || !req.body.targetPeriodYear) {
        console.error("Failed to save degreeCourseApplication missing body params: ", req.body);
        Malformed(res);
        return;
    }

    const degreeCourseID = req.body.degreeCourseID;
    const degree = await getDegreeCourseById(degreeCourseID);
    if (degree === null) {
        console.error("DegreeCourse For DegreeCourseApplication does not exist!");
        Malformed(res, "DegreeCourse For DegreeCourseApplication does not exist!");
        return;
    }

    let applicantID = req.body.applicantUserID && userData.isAdmin ? req.body.applicantUserID : userData.userID;
    const application: IDegreeCourseApplication | undefined = {
        applicantUserID: applicantID,
        degreeCourseID: degreeCourseID,
        targetPeriodShortName: req.body.targetPeriodShortName,
        targetPeriodYear: req.body.targetPeriodYear,
    }

    if (!application) {
        Malformed(res);
        return;
    }

    if(!validateDegreeCourseApplicationMinimalInput(application)){
        Malformed(res, "DegreeCourseApplication does not have the required fields!");
        return;
    }

    console.log("Creating new DegreeCourseApplication:", application);
    const created = await saveDegreeCourseApplication(application);
    if (created) {
        res.status(201);
        res.json(created);
    } else {
        ConflictCourseApplicationIDAlreadyExists(res);
    }
});

router.put('/:applicationID', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseApplicationAction, async (req, res) => {
    console.log("Triggered DegreeCourseApplication Update Endpoint");
    const {applicationID} = req.params;
    const applicationData: Partial<IDegreeCourseApplication> | undefined = req.body;

    if (!applicationData) {
        Malformed(res);
        return;
    }

    if(!validatePartialDegreeCourseApplication(applicationData)){
        Malformed(res, "DegreeCourseApplication fields are not valid!");
        return;
    }

    const existingApplication = await getDegreeCourseApplicationById(applicationID);
    if (!existingApplication) {
        NotFound(res);
        return;
    }

    await updateDegreeCourseApplication(applicationID, applicationData);

    const updatedApplication = await getDegreeCourseApplicationById(applicationID);
    if (!updatedApplication) {
        InternalServerError(res);
        return;
    }

    BuildUpdateSucceeded(res, updatedApplication);
});

router.delete('/:applicationID', checkForAuthorization, checkIfUserHasRightsForThisDegreeCourseApplicationAction, async (req, res) => {
    console.log("Triggered DegreeCourseApplication Deletion Endpoint");
    const {applicationID} = req.params;
    const deletionResult: DeleteResult | null = await deleteDegreeCourseApplication(applicationID);

    if (!deletionResult) {
        InternalServerError(res);
        return;
    }

    if (deletionResult.deletedCount === 0) {
        NotFound(res);
        return;
    }

    DeletionSuccessful(res);
});
