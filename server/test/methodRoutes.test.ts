import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import StudyMethodModel from '../models/studyMethodModel';
import UserPreferencesModel from '../models/userPreferencesModel';
import User from '../models/user_model';
import Subject from '../models/subject_model';

const app = express();
app.use(express.json());
app.use('/method', require('../routes/study_method_routes').default);

describe('Rutas de Métodos de Estudio y Preferencias', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await StudyMethodModel.deleteMany({});
        await UserPreferencesModel.deleteMany({});
        await User.deleteMany({email: 'juan@juan.com'});
    });

    describe('GET /method', () => {
        test('debe obtener todos los métodos de estudio', async () => {
            await StudyMethodModel.create([
                { name: 'Pomodoro', description: 'Técnica de gestión de tiempo',workDuration: 25, breakDuration: 5 },
                { name: 'Flashcards', description: 'Método de memorización' ,workDuration: 15, breakDuration: 5}
            ]);

            const response = await request(app)
                .get('/method')
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('description');
        });

        test('debe manejar errores al obtener métodos', async () => {
            await mongoose.disconnect();

            const response = await request(app)
                .get('/method')
                .expect(500);

            expect(response.body).toHaveProperty('error');
            
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        });
    });

    describe('POST /method', () => {
        test('debe crear un nuevo método de estudio', async () => {
            const nuevoMetodo = {
                name: 'Método Cornell',
                description: 'Sistema para tomar notas',
                workDuration: 25,
                breakDuration: 5
            };

            const response = await request(app)
                .post('/method')
                .send(nuevoMetodo)
                .expect(201);

            expect(response.body).toHaveProperty('_id');
            expect(response.body.name).toBe(nuevoMetodo.name);
            expect(response.body.description).toBe(nuevoMetodo.description);
        });

        test('debe fallar al crear método sin nombre', async () => {
            const metodoIncompleto = {
                description: 'Descripción sin nombre'
            };

            const response = await request(app)
                .post('/method')
                .send(metodoIncompleto)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('Preferencias de Usuario', () => {
        test('debe crear preferencias de usuario', async () => {
            const metodo = await StudyMethodModel.create({
                name: 'Pomodoro',
                description: 'Técnica de gestión de tiempo',
                workDuration: 25,
                breakDuration: 5
            });
            const usuario = await User.create({
                name: 'Juan',
                email: 'juan@juan.com',
                password: '123456',
                role: 'student'
            });
            const nuevasPreferencias = {
                userId: usuario._id,
                methodId: metodo._id,
                    workDuration: 25,
                    breakDuration: 5
                
            };

            const response = await request(app)
                .post('/method/preferences')
                .send(nuevasPreferencias)
                .expect(201);

            expect(response.body).toHaveProperty('_id');
        });

        test('debe obtener preferencias de usuario por email', async () => {
            const metodo = await StudyMethodModel.create({
                name: 'Pomodoro',
                description: 'Técnica de gestión de tiempo',
                workDuration: 25,
                breakDuration: 5
                
            });
            const usuario = await User.create({
                name: 'Juan',
                email: 'juan@juan.com',
                password: '123456',
                role: 'student'
            });
            const subject = await Subject.create({
                name: 'Matemáticas',
                description: 'Álgebra, cálculo, geometría'
            });
            const preferedMethod = await UserPreferencesModel.create({
                userId: usuario._id,
                methodId: metodo._id,
                subjectId: subject._id,
                    workDuration: 25,
                    breakDuration: 5
                
            });

            const response = await request(app)
                .get('/method/preferences/' + preferedMethod.userId).expect(200);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('userId');
            expect(response.body).toHaveProperty('workDuration', 25);
        });
    });
});


