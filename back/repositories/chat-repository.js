// src/repositories/chat-repository.js
import pg from 'pg';
import { DBConfig } from './dbconfig.js';

class ChatRepository {
    constructor() {
        const { Client } = pg;
        this.DBClient = new Client(DBConfig);
        this.DBClient.connect();
    }

    async getChatId(id1, id2) {
        const query = `
            SELECT chat_id
            FROM chat_members
            WHERE user_id IN ($1, $2)
            GROUP BY chat_id
            HAVING COUNT(DISTINCT user_id) = 2
               AND COUNT(*) = (
                   SELECT COUNT(*)
                   FROM chat_members cm2
                   WHERE cm2.chat_id = chat_members.chat_id
               );
        `;

        const result = await this.DBClient.query(query, [id1, id2]);
        if (result.rows.length > 0) {
            return result.rows[0].chat_id;
        } else {
            const query2 = "INSERT INTO chats (name) VALUES (null) RETURNING id";
            const result2 = await this.DBClient.query(query2);
            const newChatId = result2.rows[0].id;

            if (newChatId) {
                const query3 = "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2),($1, $3)";
                const result3 = await this.DBClient.query(query3, [newChatId, id1, id2]);
                if (result3.rowCount !== 2) {
                    throw new Error('Failed to insert chat members');
                } else {
                    return newChatId;
                }
            }
        }
    }

    async checkChat(userId, chatId) {
        if (chatId === null) {
            let query = "INSERT INTO chats (name) VALUES (null) RETURNING id";
            result = await this.DBClient.query(query);
            const newChatId = result.rows[0].id;

            if (newChatId) {
                query = "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)";
                result = await this.DBClient.query(query, [newChatId, userId]);
                if (result.rowCount !== 2) {
                    throw new Error('Failed to insert chat members');
                } else {
                    return true;
                }
            }
        } else {
            return true;
        }
    }

    async loadMessages(chatId, page, limit) {
        if (chatId !== null) {
            const offset = (page - 1) * limit;
            const query = `
                SELECT messages.*, users.username FROM messages
                inner join users on messages.sender_user=users.id
                WHERE chat_id = $1 AND date_sent < CURRENT_TIMESTAMP
                ORDER BY date_sent DESC
                LIMIT $2 OFFSET $3
            `;
            const countQuery = `
                SELECT COUNT(*) FROM messages 
                WHERE chat_id = $1 AND date_sent < CURRENT_TIMESTAMP
            `;
            
            const messages = await this.DBClient.query(query, [chatId, limit, offset]);
            const countResult = await this.DBClient.query(countQuery, [chatId]);
            const totalCount = parseInt(countResult.rows[0].count);
            
            const query2 = `
                SELECT c.name, u.username 
                FROM chats c
                INNER JOIN chat_members cm ON cm.chat_id = c.id
                INNER JOIN users u ON cm.user_id = u.id
                WHERE c.id = $1
            `;
            const values = [chatId];
            const result = await this.DBClient.query(query2, values);
            const info = {
                chatName: null,
                userList: []
            };
            if (result.rows.length > 0) {
                info.chatName = result.rows[0].name; // Nombre del chat
                info.userList = result.rows.map(row => row.username); // Lista de usernames
            }
            console.log(info);
            return {
                info: info,
                rows: messages.rows.reverse(),
                hasMore: totalCount > (page * limit)
            };
        } else {
            throw new Error('Chat not found');
        }
    }

    async createMessage(userId, chatId, content) {
        const query = "INSERT INTO messages (content, date_sent, sender_user, chat_id) VALUES ($1, CURRENT_TIMESTAMP, $2, $3) RETURNING id, content, date_sent, sender_user";
        if (chatId !== null) {
            const creation = await this.DBClient.query(query, [content, userId, chatId]);
            if (creation.rowCount === 0) {
                throw new Error('Failed to create message');
            } else {
                return creation;
            }
        } else {
            throw new Error('Chat not found');
        }
    }

    async getRecentChats(userId) {
        const query = `
        SELECT 
        chats.id,
        chats.name,
        MAX(messages.date_sent) AS last_message_time
    FROM chats
    JOIN chat_members ON chats.id = chat_members.chat_id
    LEFT JOIN messages ON chats.id = messages.chat_id
    WHERE chats.id IN (
        SELECT chat_members.chat_id
        FROM chat_members
        WHERE chat_members.user_id = $1
    )
    GROUP BY chats.id, chats.name
    ORDER BY last_message_time DESC
    LIMIT 10;
    
        `;
        const values = [userId];
        const result = await this.DBClient.query(query, values);
        
        // Devolver los chats junto con el userId separado
        return {
            ownId: userId,  // ID del usuario actual
            chats: result.rows // Array con los chats
        };
    }

    async insertChatGroup(userId, name, members){
        const insertChatQuery = `INSERT INTO chats (name) VALUES ($1) returning id`;
        const insertChatValues = [name];
        const chatResult = await this.DBClient.query(insertChatQuery, insertChatValues);
        const chatId = chatResult.rows[0].id; // Obtener el id del chat insertado

        // Crear una lista con los valores para insertar en `chat_members`
       
        
        members.push(userId)

        // Insertar el creador del grupo (userId) y los demás miembros en `chat_members`
        members.forEach(async member => {
            const insertmember =`INSERT INTO chat_members (chat_id,user_id) VALUES ($1,$2)`
            await this.DBClient.query(insertmember,[chatId,member])
        });
        
    }
}

export default ChatRepository;