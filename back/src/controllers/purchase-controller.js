import  express from "express";
import PurchaseService from "../services/purchase-service.js";
import { AuthMiddleware } from "../auth/authMiddleware.js";
import { Shopping_Cart } from "../entities/shopping_cart.js";

const router = express.Router()
const purchaseService = new PurchaseService()

router.post("/save", AuthMiddleware, async (req,res)=> {
    const idPost = req.body.idPost;
    const total_price = req.body.total_price;
    const quantity = req.body.quantity;
    const size = req.body.size;
    const user = req.user;


    const shopping_cart = new Shopping_Cart(
        null,
        idPost,
        user.id, 
        total_price,
        quantity,
        size
    ); 

    const inserted = await purchaseService.InsertInShoppingCart(shopping_cart);

    if(inserted){
        return res.status(201).send();
    }
    else{
        return res.status(400).send();
    }
});

export default router;