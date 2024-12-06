import { Request, Response } from "express";
import StudyMethodModel from "../models/studyMethodModel";
import UserPreferencesModel from "../models/userPreferencesModel";
import User from "../models/user_model";
import { Types } from "mongoose";
const express = require("express");
const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const studyMethods = await StudyMethodModel.find({}, 'name description workDuration breakDuration');
        res.status(200).json(studyMethods);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, workDuration, breakDuration } = req.body;

        if (!name || !description || workDuration === undefined || breakDuration === undefined) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const updatedMethod = await StudyMethodModel.findByIdAndUpdate(
            id,
            { name, description, workDuration, breakDuration },
            { new: true }
        );

        if (!updatedMethod) {
            return res.status(404).json({ error: 'Método de estudio no encontrado' });
        }

        res.status(200).json(updatedMethod);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error Interno del Servidor' });
        }
    }
});


router.post("/", async (req: Request, res: Response) => {
    try {
        const { name, description, workDuration, breakDuration } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }
        const newMethod = new StudyMethodModel({ name, description, workDuration, breakDuration });
        const savedMethod = await newMethod.save();
        res.status(201).json(savedMethod);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error Interno del Servidor' });
        }
    }
});

router.get("/preferences/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const preferences = await UserPreferencesModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(1)
            .populate('userId', '_id')
            .populate('methodId', '_id name workDuration breakDuration');
        
        if (!preferences || preferences.length === 0) {
            return res.status(404).json({ error: 'Preferencias no encontradas' });
        }
        res.status(200).json(preferences[0]);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error Interno del Servidor' });
        }
    }
});

router.get("/preferences", async (req: Request, res: Response) => {
    try {
        const preferences = await UserPreferencesModel.find()
            .populate('userId', '_id name email')
            .populate('methodId', '_id name workDuration breakDuration');

        if (!preferences || preferences.length === 0) {
            return res.status(404).json({ error: 'No se encontraron preferencias' });
        }

        res.status(200).json(preferences);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error Interno del Servidor' });
        }
    }
});


router.post("/preferences", async (req: Request, res: Response) => {
    try {
        const { userId, methodId } = req.body;
        const methodObjectId = new Types.ObjectId(methodId);

        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const methodExists = await StudyMethodModel.findById(methodObjectId);
        if (!methodExists) {
            return res.status(404).json({ error: 'Método de estudio no encontrado' });
        }

        const { workDuration, breakDuration } = methodExists;

        const newPreferences = new UserPreferencesModel({
            userId,
            methodId: methodObjectId,
            workDuration,
            breakDuration
        });

        const savedPreferences = await newPreferences.save();
        
        const populatedPreferences = await UserPreferencesModel.findById(savedPreferences._id)
            .populate('userId')
            .populate('methodId', '_id name workDuration breakDuration');

        res.status(201).json(populatedPreferences);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error Interno del Servidor' });
        }
    }
});

router.delete("/preferences/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const userPreferences = await UserPreferencesModel.findOneAndDelete({ userId });

        if (!userPreferences) {
            return res.status(404).json({ error: 'Preferencias de usuario no encontradas' });
        }

        res.status(200).json({ message: 'Preferencias de usuario eliminadas correctamente' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error Interno del Servidor' });
        }
    }
});

router.delete("/preferences", async (req: Request, res: Response) => {
    try {
        await UserPreferencesModel.deleteMany({});

        res.status(200).json({ message: 'Todas las preferencias de usuario han sido eliminadas correctamente' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error Interno del Servidor' });
        }
    }
});




export default router;
