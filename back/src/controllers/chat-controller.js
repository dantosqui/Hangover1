// src/controllers/chat-controller.js
import ChatService from '../services/chat-service.js';
import express from 'express';
import { AuthMiddleware } from '../auth/authMiddleware.js';

const router = express.Router();
const chatService = new ChatService();

router.get("/get/chats", AuthMiddleware, async (req, res) => {
    
    try {
        const userId = req.user.id; // Asumiendo que tienes autenticación y puedes acceder al ID del usuario
        const chats = await chatService.getRecentChats(userId);
        res.status(200).json(chats);
    } catch (error) {
        console.error('Error fetching recent chats:', error);
        res.status(500).json({ message: 'Error fetching recent chats' });
    }
});

console.log("Holaa");

router.get("/get/:id", AuthMiddleware, async (req, res) => {
    try{
        const userId = req.user.id;
        const otherUserId = req.params.id;
        const chatId = await chatService.getChatId(userId, otherUserId);
        res.status(200).json(chatId);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: error });
    }
});

router.post("/create/group", AuthMiddleware, async (req, res) => {
    try{
        const userId = req.user.id;
        const name = req.body.name;
        const members = req.body.members;

        await chatService.insertGroupChat(userId, name, members);

        res.status(201).send();

    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: error });
    }
});

export default router;