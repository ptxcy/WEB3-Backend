import request from 'supertest';
import {app, initServer} from '../../httpServer';
import mongoose from "mongoose";

//We Skip the List Endpoint test because we ain't getting a real persistent test
describe('Create User, Get User, Delete User, Get User Again but must be deleted now But Without Auth', () => {
    it('Create User, Get User, Delete User, Get User Again but must be deleted now', async () => {
        const res = await request(app).post('/api/users').set("Content-Type", "application/json").send({
            userID: "testUserTwo",
            password: "test",
            isAdministrator: true,
            firstName: "Patrick",
            lastName: "Kloss"
        });
        expect(res.statusCode).toBe(401);

        const findResponse = await request(app).get('/api/users/testUserTwo');
        expect(findResponse.statusCode).toBe(401);

        const resTwo = await request(app).delete('/api/users/testUserTwo');
        expect(resTwo.statusCode).toBe(401);

        const findResponseTwo = await request(app).get('/api/users/testUserTwo');
        expect(findResponseTwo.statusCode).toBe(401);
    });
});

describe('Create User, Get User, Delete User, Get User Again but must be deleted now But With Auth', () => {
    it('Create User, Get User, Delete User, Get User Again but must be deleted now', async () => {
        const authRes = await request(app).get('/api/authenticate')
            .set('Authorization', `Basic YWRtaW46MTIz`);
        expect(authRes.statusCode).toBe(200);

        let bearerToken: string = authRes.headers.authorization;
        const res = await request(app).post('/api/users').set('Authorization', bearerToken).set("Content-Type", "application/json").send({
            userID: "testUserTwo",
            password: "test",
            isAdministrator: true,
            firstName: "Patrick",
            lastName: "Kloss"
        });
        expect(res.statusCode).toBe(201);

        const findResponse = await request(app).get('/api/users/testUserTwo').set('Authorization', bearerToken);
        expect(findResponse.body.userID).toEqual("testUserTwo");

        const resTwo = await request(app).delete('/api/users/testUserTwo').set('Authorization', bearerToken);
        expect(resTwo.statusCode).toBe(204);

        const findResponseTwo = await request(app).get('/api/users/testUserTwo').set('Authorization', bearerToken);
        expect(findResponseTwo.statusCode).toBe(404);
    });
});

beforeAll(async () => {
    await initServer();
})

afterAll(async () => {
    await mongoose.connection.close();
});