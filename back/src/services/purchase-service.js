import { PurchaseRepository } from "../../repositories/purchase-repository.js";

export default class PurchaseService {
    constructor (){
        this.bd = new PurchaseRepository();
    }

    async InsertInShoppingCart(shopping_cart){
        const inserted = await this.bd.insertInShoppingCart(shopping_cart);
        return inserted;
    }
}