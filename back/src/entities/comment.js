export class Comment{
    constructor(id, post_id, content, date_posted, likes, parent_id, creator_id) {
        this.id = id; 
        this.post_id = post_id;
        this.content = content;
        this.date_posted = date_posted;
        this.likes = likes;
        this.parent_id = parent_id;
        this.creator_id = creator_id;
    }
}