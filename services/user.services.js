import db from "../db.js";


export function getMyPosts(user_id, currentUserId) {
    return db.prepare(`
        SELECT 
            posts.*,
            users.username,

            COUNT(CASE WHEN post_reactions.type = 'like' THEN 1 END) 
                AS likes_count,

            COUNT(CASE WHEN post_reactions.type = 'dislike' THEN 1 END) 
                AS dislikes_count,

            MAX(CASE 
                WHEN post_reactions.user_id = ? 
                     AND post_reactions.type = 'like'
                THEN 1 ELSE 0 
            END) AS user_liked,

            MAX(CASE 
                WHEN post_reactions.user_id = ? 
                     AND post_reactions.type = 'dislike'
                THEN 1 ELSE 0 
            END) AS user_disliked

        FROM posts

        JOIN users 
            ON posts.user_id = users.id

        LEFT JOIN post_reactions 
            ON posts.id = post_reactions.post_id

        WHERE posts.user_id = ?

        GROUP BY posts.id

        ORDER BY posts.created_at DESC
    `).all(currentUserId, currentUserId, user_id);
}

export function getMyPostById(postId, currentUserId) {
    return db.prepare(`
        SELECT 
            posts.*,
            users.username,

            COUNT(CASE WHEN post_reactions.type = 'like' THEN 1 END) 
                AS likes_count,

            COUNT(CASE WHEN post_reactions.type = 'dislike' THEN 1 END) 
                AS dislikes_count,

            MAX(CASE 
                WHEN post_reactions.user_id = ? 
                     AND post_reactions.type = 'like'
                THEN 1 ELSE 0 
            END) AS user_liked,

            MAX(CASE 
                WHEN post_reactions.user_id = ? 
                     AND post_reactions.type = 'dislike'
                THEN 1 ELSE 0 
            END) AS user_disliked

        FROM posts

        JOIN users 
            ON posts.user_id = users.id

        LEFT JOIN post_reactions 
            ON posts.id = post_reactions.post_id

        WHERE posts.id = ?

        GROUP BY posts.id
    `).get(currentUserId, currentUserId, postId);
}

export function getUserStats(userId) {

    const postCount = db.prepare(`
        SELECT COUNT(*) as totalPosts
        FROM posts
        WHERE user_id = ?
    `).get(userId);

    const likeCount = db.prepare(`
        SELECT COUNT(*) as totalLikes
        FROM post_reactions pr
        JOIN posts p ON pr.post_id = p.id
        WHERE p.user_id = ?
        AND pr.type = 'like'
    `).get(userId);

    return {
        totalPosts: postCount.totalPosts,
        totalLikes: likeCount.totalLikes
    };
}

export function getUserById(id) {
    const user = db.prepare(`
SELECT 
  u.id,
  u.username,
  u.icon,
  u.description,
  u.created_at,

  /* followers count */
  (SELECT COUNT(*) 
   FROM followers f 
   WHERE f.following_id = u.id) AS followers_count,

  /* following count */
  (SELECT COUNT(*) 
   FROM followers f 
   WHERE f.follower_id = u.id) AS following_count

FROM users u
WHERE u.id = ?;
    `).get(id);
    return user;
}

export function getRecentPosts(id, offset) {
    const recentPosts = db.prepare(`
        SELECT 
    posts.*,

    users.username,
    users.icon AS user_icon,

    groups.id AS group_id,
    groups.name AS group_name,
    groups.icon AS group_icon,

    COUNT(DISTINCT CASE 
        WHEN post_reactions.type = 'like' THEN post_reactions.id 
    END) AS likes_count,

    COUNT(DISTINCT CASE 
        WHEN post_reactions.type = 'dislike' THEN post_reactions.id 
    END) AS dislikes_count,

    COUNT(DISTINCT comments.id) AS comment_count,

    MAX(CASE 
        WHEN post_reactions.user_id = ? 
             AND post_reactions.type = 'like'
        THEN 1 ELSE 0 
    END) AS user_liked,

    MAX(CASE 
        WHEN post_reactions.user_id = ? 
             AND post_reactions.type = 'dislike'
        THEN 1 ELSE 0 
    END) AS user_disliked

FROM posts

JOIN users 
    ON posts.user_id = users.id

JOIN groups
    ON posts.group_id = groups.id

LEFT JOIN post_reactions 
    ON posts.id = post_reactions.post_id

LEFT JOIN comments
    ON posts.id = comments.post_id

WHERE users.id = ?

GROUP BY posts.id

ORDER BY posts.created_at DESC

LIMIT 10 OFFSET ?;
    
    `).all(id, id, id, offset * 10);
    return recentPosts;
}
export function getRecentComment(id, offset) {
    const recentComment = db.prepare(`
SELECT 
  c.id,
  c.content,
  c.created_at,
  p.title AS post_title,
  p.id AS post_id

FROM comments c
JOIN posts p ON p.id = c.post_id
WHERE c.user_id = ?
ORDER BY c.created_at DESC
LIMIT 10 OFFSET ?;
    
    `).all(id, offset * 10);
    return recentComment;
}
export function isUserFollowing(folowerId, followingId) {
    const isFollowing = db.prepare(`
SELECT 1
FROM followers
WHERE follower_id = ?
AND following_id = ?;
    `).get(folowerId, followingId);
    return isFollowing;
}
export function recentUpvoted(userId) {
    const upvotes = db.prepare(`
SELECT 
  p.id,
  p.title,
  p.content,
  p.created_at,
  g.name AS group_name,
  pr.created_at AS reacted_at,

  /* total likes */
  (SELECT COUNT(*) 
   FROM post_reactions pr2 
   WHERE pr2.post_id = p.id 
   AND pr2.type = 'like') AS like_count,

  /* total comments */
  (SELECT COUNT(*) 
   FROM comments c 
   WHERE c.post_id = p.id) AS comment_count

FROM post_reactions pr
JOIN posts p ON p.id = pr.post_id
JOIN groups g ON g.id = p.group_id

WHERE pr.user_id = ?
AND pr.type = 'like'

ORDER BY pr.created_at DESC;        
`)
    return upvotes;
}
export function recentDownvoted(userId) {
    const downvote = db.prepare(`
SELECT 
  p.id,
  p.title,
  p.content,
  p.created_at,
  g.name AS group_name,
  pr.created_at AS reacted_at,

  (SELECT COUNT(*) 
   FROM post_reactions pr2 
   WHERE pr2.post_id = p.id 
   AND pr2.type = 'like') AS like_count,

  (SELECT COUNT(*) 
   FROM comments c 
   WHERE c.post_id = p.id) AS comment_count

FROM post_reactions pr
JOIN posts p ON p.id = pr.post_id
JOIN groups g ON g.id = p.group_id

WHERE pr.user_id = ?
AND pr.type = 'dislike'

ORDER BY pr.created_at DESC;
  
`)
    return downvote;
}

export function searchUser(keyword, userId = null) {

    const words = keyword
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) return [];

    // Build dynamic WHERE conditions
    const conditions = words.map(() =>
        "(u.username LIKE ? COLLATE NOCASE OR u.description LIKE ? COLLATE NOCASE)"
    ).join(" OR ");

    // Build like parameters
    const likeParams = words.flatMap(word => [
        `%${word}%`,
        `%${word}%`
    ]);

    const query = `
SELECT 
  u.id,
  u.username,
  u.icon,
  u.description,
  u.created_at,

  /* followers count */
  (SELECT COUNT(*) 
   FROM followers f 
   WHERE f.following_id = u.id) AS followers_count,

  /* following count */
  (SELECT COUNT(*) 
   FROM followers f 
   WHERE f.follower_id = u.id) AS following_count

FROM users u
WHERE ${conditions}
    `;

    return db.prepare(query).all(
        ...likeParams
    );
}
export function getAllUsers() {

    const query = `
SELECT 
  u.id,
  u.username,
  u.icon,
  u.description,
  u.created_at,

  /* followers count */
  (SELECT COUNT(*) 
   FROM followers f 
   WHERE f.following_id = u.id) AS followers_count,

  /* following count */
  (SELECT COUNT(*) 
   FROM followers f 
   WHERE f.follower_id = u.id) AS following_count

FROM users u
    `;

    return db.prepare(query).all();
}

export function checkUserInGroup(userId, groupId) {

    const query = `
        SELECT *
        FROM group_members
        WHERE user_id = ?
          AND group_id = ?
    `;

    return db.prepare(query).get(userId, groupId);
}



