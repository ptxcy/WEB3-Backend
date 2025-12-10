import request from 'supertest';
import {app, initServer} from '../../httpServer';
import mongoose from "mongoose";

//We Skip the List Endpoint test because we ain't getting a real persistent test
describe('Create User, Get User, Delete User, Get User Again but must be deleted now', () => {
    it('Create User, Get User, Delete User, Get User Again but must be deleted now', async () => {
        const res = await request(app).post('/api/publicUsers').set("Content-Type", "application/json").send({
            userID: "testUser",
            password: "test",
            isAdministrator: true,
            firstName: "Patrick",
            lastName: "Kloss"
        });
        expect(res.statusCode).toBe(201);

        const findResponse = await request(app).get('/api/publicUsers/testUser');
        expect(findResponse.body.userID).toEqual("testUser");

        const resTwo = await request(app).delete('/api/publicUsers/testUser');
        expect(resTwo.statusCode).toBe(204);

        const findResponseTwo = await request(app).get('/api/publicUsers/testUser');
        expect(findResponseTwo.statusCode).toBe(404);
    });
});

//We Skip the List Endpoint test because we ain't getting a real persistent test
describe('Create User, Change User, Get User To Validate Changes, Delete User', () => {
    it('Create User, Change User, Get User To Validate Changes, Delete User', async () => {
        const res = await request(app).post('/api/publicUsers').set("Content-Type", "application/json").send({
            userID: "userToUpdate",
            password: "test",
            isAdministrator: true,
            firstName: "Patrick",
            lastName: "Kloss"
        });
        expect(res.statusCode).toBe(201);

        const updateResponse = await request(app).put('/api/publicUsers/userToUpdate').send({
            userID: "userToUpdate",
            password: "test",
            isAdministrator: true,
            firstName: "Jeremy",
            lastName: "Kloss"
        });
        expect(updateResponse.statusCode).toBe(200);

        const findResponse = await request(app).get('/api/publicUsers/userToUpdate');
        expect(findResponse.body.firstName).toEqual("Jeremy");

        const resTwo = await request(app).delete('/api/publicUsers/userToUpdate');
        expect(resTwo.statusCode).toBe(204);
    });
});

beforeAll(async () => {
    await initServer();
})

afterAll(async () => {
    await mongoose.connection.close();
});