export class Post {
    constructor(id, creator_id, title, description, allow_comments, visibility_id, parent_id, likes, remixable, date_posted, front_image, back_image) {
        this.id = id;
        this.creator_id = creator_id;
        this.title = title;
        this.description = description;
        this.allow_comments = allow_comments;
        this.visibility_id = visibility_id;
        this.parent_id = parent_id;
        this.likes = likes;
        this.remixable = remixable;
        this.date_posted = date_posted;
        this.front_image = front_image;
        this.back_image = back_image;
    }
}