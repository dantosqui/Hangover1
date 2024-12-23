CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    content VARCHAR(500) NOT NULL,
    date_posted TIMESTAMP NOT NULL,
    likes INT NOT NULL,
    parent_id INT,
    creator_id INT NOT NULL
);

CREATE TABLE designs (
    id SERIAL PRIMARY KEY,
    last_edit TIMESTAMP,
    id_creator_user INT NOT NULL,
    parent_id INT,
    front_image text,
    back_image text, 
    design_data JSON
);

CREATE TABLE liked (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL
);

CREATE TABLE post_tag (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    id SERIAL PRIMARY KEY
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    allow_comments BOOLEAN NOT NULL,
    visibility_id INT NOT NULL,
    parent_id INT,
    likes INT NOT NULL,
    remixable BOOLEAN NOT NULL,
    date_posted TIMESTAMP NOT NULL,
    front_image text NOT NULL,
	back_image text NOT NULL,
    price DOUBLE PRECISION NOT NULL
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role VARCHAR(10) NOT NULL
);

CREATE TABLE saved (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL
);

CREATE TABLE socials (
    id SERIAL PRIMARY KEY,
    instagram VARCHAR(100),
    pinterest VARCHAR(100),
    x VARCHAR(100),
    facebook VARCHAR(100),
    telegram VARCHAR(100),
    tiktok VARCHAR(100),
    youtube VARCHAR(100),
    twitch VARCHAR(100),
    user_id INT NOT NULL
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE user_relationships (
    follower_id INT NOT NULL,
    followed_id INT NOT NULL,
    id SERIAL PRIMARY KEY
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    first_name VARCHAR(90) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    description VARCHAR(200),
    profile_photo VARCHAR(4000),
    role_id INT NOT NULL
);

CREATE TABLE visibilities (
    id SERIAL PRIMARY KEY,
    visibility VARCHAR(10) NOT NULL
);

ALTER TABLE comments ADD CONSTRAINT FK_comments_posts FOREIGN KEY (post_id) REFERENCES posts (id);
ALTER TABLE comments ADD CONSTRAINT FK_comments_users FOREIGN KEY (creator_id) REFERENCES users (id);
ALTER TABLE designs ADD CONSTRAINT FK_designs_posts FOREIGN KEY (parent_id) REFERENCES posts (id);
ALTER TABLE designs ADD CONSTRAINT FK_designs_users FOREIGN KEY (id_creator_user) REFERENCES users (id);
ALTER TABLE liked ADD CONSTRAINT FK_liked_posts FOREIGN KEY (post_id) REFERENCES posts (id);
ALTER TABLE liked ADD CONSTRAINT FK_liked_users FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE post_tag ADD CONSTRAINT FK_post_tag_posts FOREIGN KEY (post_id) REFERENCES posts (id);
ALTER TABLE post_tag ADD CONSTRAINT FK_post_tag_tags FOREIGN KEY (tag_id) REFERENCES tags (id);
ALTER TABLE posts ADD CONSTRAINT FK_posts_posts1 FOREIGN KEY (parent_id) REFERENCES posts (id);
ALTER TABLE posts ADD CONSTRAINT FK_posts_users FOREIGN KEY (creator_id) REFERENCES users (id);
ALTER TABLE posts ADD CONSTRAINT FK_posts_visibilities FOREIGN KEY (visibility_id) REFERENCES visibilities (id);
ALTER TABLE saved ADD CONSTRAINT FK_saved_posts FOREIGN KEY (post_id) REFERENCES posts (id);
ALTER TABLE saved ADD CONSTRAINT FK_saved_users FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE socials ADD CONSTRAINT FK_socials_users0 FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE user_relationships ADD CONSTRAINT FK_user_relationships_users0 FOREIGN KEY (follower_id) REFERENCES users (id);
ALTER TABLE user_relationships ADD CONSTRAINT FK_user_relationships_users1 FOREIGN KEY (followed_id) REFERENCES users (id);
ALTER TABLE users ADD CONSTRAINT FK_users_roles FOREIGN KEY (role_id) REFERENCES roles (id);


CREATE TABLE comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT FK_comment_likes_comments FOREIGN KEY (comment_id) REFERENCES comments (id),
    CONSTRAINT FK_comment_likes_users FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE shopping_cart (
	id SERIAL PRIMARY KEY,
	post_id INT NOT NULL,
	user_id INT NOT NULL,
	quantity INT NOT NULL,
    size character varying(10),
    total_price double precision not null,
	CONSTRAINT FK_shopping_cart_posts FOREIGN KEY (post_id) REFERENCES posts (id),
	CONSTRAINT FK_shopping_cart_users FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    name CHARACTER VARYING(100)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    content CHARACTER VARYING(2000),
    date_sent TIMESTAMP WITH TIME ZONE,
    sender_user INTEGER,
    chat_id INTEGER,
    FOREIGN KEY (chat_id) REFERENCES chats (id)
);

CREATE TABLE chat_members (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (chat_id) REFERENCES chats (id)
);  

INSERT INTO roles (role) VALUES ('admin'), ('user'), ('moderator');

INSERT INTO visibilities (visibility) VALUES ('public'), ('private'), ('friends');