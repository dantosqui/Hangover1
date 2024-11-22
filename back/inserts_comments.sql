-- Insert additional comments
INSERT INTO comments (post_id, content, date_posted, likes, parent_id, creator_id)
VALUES
(1, 'Comment 4 on Post 1', NOW(), 2, NULL, 1),
(1, 'Comment 5 on Post 1', NOW(), 4, NULL, 2),
(1, 'Comment 6 on Post 1', NOW(), 3, NULL, 3),
(1, 'Reply to Comment 1 on Post 1', NOW(), 1, 1, 2),
(1, 'Reply to Comment 2 on Post 1', NOW(), 1, 2, 3),
(2, 'Comment 1 on Post 2', NOW(), 5, NULL, 1),
(2, 'Comment 2 on Post 2', NOW(), 3, NULL, 2),
(3, 'Comment 1 on Post 3', NOW(), 1, NULL, 3);
