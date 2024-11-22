// src/services/chat-service.js
import ChatRepository from '../../repositories/chat-repository.js';

class ChatService {
    constructor() {
        this.bd = new ChatRepository();
    }

    async checkChat(chatId) {
        const exists = await this.bd.checkChat(chatId);
        return exists;
    }

    async loadMessages(chatId, page, limit) {
        const messages = await this.bd.loadMessages(chatId, page, limit);
        return messages;
    }

    async createMessage(userId, chatId, content) {
        const message = await this.bd.createMessage(userId, chatId, content);
        return message;
    }

    async getRecentChats(userId) {
        return await this.bd.getRecentChats(userId);
    }

    async getChatId(userId, otherUserId){
        return await this.bd.getChatId(userId, otherUserId);
    }

    async insertGroupChat(userId, name, members){
        await this.bd.insertChatGroup(userId, name, members);
    }
}

export default ChatService;