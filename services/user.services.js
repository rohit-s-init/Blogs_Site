import db from "../config/db.js";


export async function getMyPosts(user_id, currentUserId) {
    return (await db.execute(`
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

        GROUP BY posts.id,users.id

        ORDER BY posts.created_at DESC
    `, [user_id, user_id, user_id]))[0];
}

export async function getMyPostById(postId, currentUserId) {
    return (await db.execute(`
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
    `, [currentUserId, currentUserId, postId]))[0];
}

export async function getUserStats(userId) {

    const [postCount] = await db.execute(`
        SELECT COUNT(*) as totalPosts
        FROM posts
        WHERE user_id = ?
    `, [userId]);

    const [likeCount] = await db.execute(`
        SELECT COUNT(*) as totalLikes
        FROM post_reactions pr
        JOIN posts p ON pr.post_id = p.id
        WHERE p.user_id = ?
        AND pr.type = 'like'
    `, [userId]);

    console.log(postCount)
    console.log(likeCount)
    return {
        totalPosts: postCount[0].totalPosts,
        totalLikes: likeCount[0].totalLikes
    };
}

export async function getUserById(id) {
    const [user] = await db.execute(`
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
    `, [id]);
    return user;
}

export async function getRecentPosts(id, offset) {
    const offsetNum = Number(offset) * 10;
    const [recentPosts] = await db.execute(`
SELECT 
    posts.*,

    users.username,
    users.icon AS user_icon,

    groupss.id AS group_id,
    groupss.name AS group_name,
    groupss.icon AS group_icon,

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

JOIN groupss
    ON posts.group_id = groupss.id

LEFT JOIN post_reactions 
    ON posts.id = post_reactions.post_id

LEFT JOIN comments
    ON posts.id = comments.post_id

WHERE users.id = ?

GROUP BY 
    posts.id,
    users.id,
    groupss.id

ORDER BY posts.created_at DESC

LIMIT 10 OFFSET ${offsetNum};
    
    `, [id, id, id]);
    return recentPosts;
}
export async function getRecentComment(id, offset) {
    const offserNum = Number(offset) * 10;
    const [recentComment] = await db.execute(`
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
LIMIT 10 OFFSET ${offserNum};
    
    `, [id]);
    return recentComment;
}
export async function isUserFollowing(folowerId, followingId) {
    const [isFollowing] = await db.execute(`
SELECT 1
FROM followers
WHERE follower_id = ?
AND following_id = ?;
    `, [folowerId, followingId]);
    return isFollowing.length == 0 ? 0 : 1;
}
export async function recentUpvoted(userId) {
    const [upvotes] = await db.execute(`
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
JOIN groupss g ON g.id = p.group_id

WHERE pr.user_id = ?
AND pr.type = 'like'

ORDER BY pr.created_at DESC;        
`, [userId])
    return upvotes;
}
export async function recentDownvoted(userId) {
    const [downvote] = await db.execute(`
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
JOIN groupss g ON g.id = p.group_id

WHERE pr.user_id = ?
AND pr.type = 'dislike'

ORDER BY pr.created_at DESC;
  
`, [userId])
    return downvote;
}

export async function searchUser(keyword, userId = null) {

    const words = keyword
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) return [];

    const conditions = words.map(() =>
        "(u.username LIKE ? OR u.description LIKE ?)"
    ).join(" OR ");

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

    const [rows] = await db.execute(query, likeParams);

    return rows;
}
export async function getAllUsers() {

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

    return (await db.execute(query))[0];
}

export async function checkUserInGroup(userId, groupId) {

    const query = `
        SELECT *
        FROM group_members
        WHERE user_id = ?
          AND group_id = ?
    `;

    return (await db.execute(query, [userId, groupId]))[0].length>0;
}



