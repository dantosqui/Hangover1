-- Insert into roles


-- Insert into visibilities


-- Insert into users
INSERT INTO users (username, first_name, last_name, email, password, date_of_birth, description, profile_photo, role_id)
VALUES
('user1', 'John', 'Doe', 'john.doe@example.com', 'password1', '1990-01-01', 'Description 1', 'https://randomuser.me/api/portraits/men/37.jpg', 1),
('user2', 'Jane', 'Doe', 'jane.doe@example.com', 'password2', '1992-02-02', 'Description 2', 'https://randomuser.me/api/portraits/men/66.jpg', 2),
('user3', 'Jim', 'Beam', 'jim.beam@example.com', 'password3', '1994-03-03', 'Description 3', 'https://randomuser.me/api/portraits/women/2.jpg', 3);

-- Insert into posts
INSERT INTO posts (creator_id, title, description, allow_comments, visibility_id, parent_id, likes, remixable, date_posted, front_image, back_image, price)
VALUES
(1, 'Post 1', 'Description 1', TRUE, 1, NULL, 10, TRUE, NOW(), 'front1.jpg', 'back1.jpg', 250),
(2, 'Post 2', 'Description 2', TRUE, 2, NULL, 20, FALSE, NOW(), 'front2.jpg', 'back2.jpg', 250),
(3, 'Post 3', 'Description 3', FALSE, 3, NULL, 30, TRUE, NOW(), 'front3.jpg', 'back3.jpg', 250);

-- Insert into tags
INSERT INTO tags (name) VALUES ('tag1'), ('tag2'), ('tag3');

-- Insert into post_tag
INSERT INTO post_tag (post_id, tag_id) VALUES (1, 1), (2, 2), (3, 3);

-- Insert into comments
INSERT INTO comments (post_id, content, date_posted, likes, parent_id, creator_id)
VALUES
(1, 'Comment 1 on Post 1', NOW(), 5, NULL, 1),
(2, 'Comment 2 on Post 2', NOW(), 3, NULL, 2),
(3, 'Comment 3 on Post 3', NOW(), 1, NULL, 3);

-- Insert into comment_likes
INSERT INTO comment_likes (comment_id, user_id) VALUES (1, 1), (2, 2), (3, 3);

-- Insert into chats


-- Insert into designs
INSERT INTO designs (last_edit, id_creator_user, parent_id) VALUES 
(NOW(), 1, 1),
(NOW(), 2, 2),
(NOW(), 3, 3);

-- Insert into liked
INSERT INTO liked (user_id, post_id) VALUES (1, 1), (2, 2), (3, 3);

-- Insert into saved
INSERT INTO saved (user_id, post_id) VALUES (1, 1), (2, 2), (3, 3);

-- Insert into socials
INSERT INTO socials (instagram, pinterest, x, facebook, telegram, tiktok, youtube, twitch, user_id) VALUES 
('insta1', 'pinterest1', 'x1', 'facebook1', 'telegram1', 'tiktok1', 'youtube1', 'twitch1', 1),
('insta2', 'pinterest2', 'x2', 'facebook2', 'telegram2', 'tiktok2', 'youtube2', 'twitch2', 2),
('insta3', 'pinterest3', 'x3', 'facebook3', 'telegram3', 'tiktok3', 'youtube3', 'twitch3', 3);

-- Insert into user_relationships
INSERT INTO user_relationships (follower_id, followed_id) VALUES (1, 2), (2, 3), (3, 1);
