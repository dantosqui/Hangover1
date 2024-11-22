export class Shopping_Cart{
    constructor(id, post_id, user_id, total_price, quantity, size) {
        this.id = id; 
        this.post_id = post_id;
        this.user_id = user_id;
        this.total_price = total_price;
        this.quantity = quantity;
        this.size = size;
    }
}