import request from 'supertest';
import {app, initServer} from '../../httpServer';
import mongoose from "mongoose";

describe('GET /authenticate Error Cases', () => {
    it('No Auth Header should return 401', async () => {
        const res = await request(app).get('/api/authenticate');
        expect(res.statusCode).toBe(401);
    });

    it('Basic Header Empty', async () => {
        const res = await request(app).get('/api/authenticate')
            .set('Authorization', `Basic `);
        expect(res.statusCode).toBe(401);
    });
});

describe('GET /authenticate correct with admin', () => {
    it('Full Circle', async () => {
        const res = await request(app).get('/api/authenticate')
            .set('Authorization', `Basic YWRtaW46MTIz`);
        expect(res.statusCode).toBe(200);

        const authHeader = res.headers['authorization'];
        expect(authHeader).toBeDefined();
        expect(authHeader.startsWith('Bearer ')).toBe(true);
    });
});

beforeAll(async () => {
    await initServer();
})

afterAll(async () => {
    await mongoose.connection.close();
});