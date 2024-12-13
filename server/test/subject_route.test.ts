const request = require('supertest')
import {app,servers} from './../server'
import mongoose from 'mongoose'
import Subject from './../models/subject_model'
import dotenv from 'dotenv';

dotenv.config();



describe('Probando la api rest de subjects',() =>{
    afterAll(async ()=>{
        await mongoose.connection.close(true);
        await mongoose.disconnect();
        servers.close();
    })
    afterEach(async () =>{
        await Subject.deleteMany({});
        jest.clearAllMocks();
    })
    beforeAll(async () =>{
        await mongoose.disconnect();
        await mongoose.connect('mongodb://localhost:27017/testdb');
    })
  test('test GET subjects' ,async() =>{
    const response = await request(app).get('/subject/')
     expect(response.status).toBe(200)
  })
  test('test POST subject', async () =>{
    const response = await request(app)
      .post('/subject/')
      .send({ name: 'Math', description: 'Math class',type_education: 'School' });
    expect(response.status).toBe(201);
  })
    test('test POST subject error 500', async () =>{
        const response = await request(app)
        .post('/subject/')
        .send({type_education: 'School' });
        expect(response.status).toBe(500);
    })
    test('test GET subject succesfull', async () =>{
        const subject=await Subject.create({ name: 'Math', description: 'Math class',type_education: 'School' });
        const response = await request(app).get('/subject/'+ subject._id);
        expect(response.status).toBe(200);
    })
    test('test GET subject error 404', async () =>{
        const response = await request(app).get('/subject/6749ed75d92b55b51caa5d0a');
        expect(response.status).toBe(404);
    })
    test('test GET subject error 500', async () =>{
        const response = await request(app).get('/subject/6745d0');
        expect(response.status).toBe(500);
    })
    test('test PUT subject succesfull', async () =>{
        const subject=await Subject.create({ name: 'Math', description: 'Math class',type_education: 'School' });
        const response = await request(app)
        .put('/subject/'+ subject._id)
        .send({ name: 'Math', description: 'Math class',type_education: 'University' });
        expect(response.status).toBe(200);
    })
    test('test PUT subject error 404', async () =>{
        const response = await request(app)
        .put('/subject/6749ed75d92b55b51caa5d0a')
        .send({ name: 'Math', description: 'Math class',type_education: 'University' });
        expect(response.status).toBe(404);
    })
    test('test PUT subject error 500', async () =>{
        const response = await request(app)
        .put('/subject/6745d0')
        .send({ name: 'Math', description: 'Math class',type_education: 'University' });
        expect(response.status).toBe(500);
    })
    test('test DELETE subject succesfull', async () =>{
        const subject=await Subject.create({ name: 'Math', description: 'Math class',type_education: 'School' });
        const response = await request(app).delete('/subject/'+ subject._id);
        expect(response.status).toBe(200);
    })
    test('test DELETE subject error 404', async () =>{
        const response = await request(app).delete('/subject/6749ed75d92b55b51caa5d0a');
        expect(response.status).toBe(404);
    })
    test('test DELETE subject error 500', async () =>{
        const response = await request(app).delete('/subject/6745d0');
        expect(response.status).toBe(500);
    })
})