import pg from 'pg';
import { DBConfig } from "./dbconfig.js";

export class PurchaseRepository {
    constructor() {
        const { Client } = pg;
        this.DBClient = new Client(DBConfig);
        this.DBClient.connect();
    }

    async insertInShoppingCart(shopping_cart){
        
        const query = "INSERT INTO shopping_cart (post_id, user_id, total_price, quantity, size) VALUES ($1, $2, $3, $4, $5)";
        const values = [shopping_cart.post_id, shopping_cart.user_id, shopping_cart.total_price, shopping_cart.quantity, shopping_cart.size];

        try{
            const inserted = await this.DBClient.query(query, values);
            return inserted.rowCount > 0;
        } catch (error) {
            console.error("Error capturado:", error);

            // Devolver un código de estado 50
        }
        
    }

}