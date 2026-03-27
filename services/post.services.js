import db from "../config/db.js";

export function createPost(title, content, groupId, userId) {
    return db.prepare(`
        INSERT INTO posts (title, content, user_id, group_id)
        VALUES (?, ?, ?, ?)
    `).run(title, content, userId, groupId);
}

export async function getAllPosts(userId, offset = 0) {
    const offserNum = Number(offset) * 10;
    return (await db.execute(`
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

GROUP BY posts.id,users.id,groupss.id

ORDER BY posts.created_at DESC

LIMIT 10 OFFSET ${offserNum};

    `, [userId, userId]))[0];
}
export function getAllUserPosts(userId, currentUserId) {
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
    `).all(currentUserId, currentUserId, userId);
}


export function getPostById(id, currentUserId) {
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
    `).get(currentUserId, currentUserId, id);
}

export async function getPostByIdPublic(postId, userId = null) {
    const [rows] = await db.execute(`
        SELECT 
            p.*,
            u.username,
            g.name as group_name,
            g.icon as group_icon,

            COUNT(CASE WHEN pr.type = 'like' THEN 1 END) AS likes_count,
            COUNT(CASE WHEN pr.type = 'dislike' THEN 1 END) AS dislikes_count,

            MAX(CASE 
                WHEN pr.user_id = ? AND pr.type = 'like'
                THEN 1 ELSE 0 
            END) AS user_liked,

            MAX(CASE 
                WHEN pr.user_id = ? AND pr.type = 'dislike'
                THEN 1 ELSE 0 
            END) AS user_disliked,

            (
                SELECT COUNT(*)
                FROM comments c
                WHERE c.post_id = p.id
            ) AS comment_count

        FROM posts p

        JOIN users u 
            ON p.user_id = u.id

        JOIN groupss g 
            ON g.id = p.group_id

        LEFT JOIN post_reactions pr 
            ON p.id = pr.post_id

        WHERE p.id = ?

        GROUP BY p.id, u.id, g.id
    `, [userId ?? 0, userId ?? 0, postId]);

    return rows[0] || null;
}



export function updatePost(id, title, content) {
    return db.prepare(`
        UPDATE posts
        SET title=?, content=?, updated_at=CURRENT_TIMESTAMP
        WHERE id=?
    `).run(title, content, id);
}


export function deletePost(id) {
    const deleteReactions = db.prepare(`
        DELETE FROM post_reactions WHERE post_id = ?
    `);

    const deletePost = db.prepare(`
        DELETE FROM posts WHERE id = ?
    `);

    const transaction = db.transaction((postId) => {
        deleteReactions.run(postId);
        deletePost.run(postId);
    });

    return transaction(id);
}

export async function toggleReaction(postId, userId, type) {

    let [existing] = await db.execute(`
        SELECT * FROM post_reactions
        WHERE post_id = ? AND user_id = ?
    `, [postId, userId]);

    console.log(existing);
    existing = existing.length == 0 ? null : existing[0];
    console.log(existing);

    if (!existing) {
        console.log("inserting new")
        let resp = await db.execute(`
            INSERT INTO post_reactions (post_id, user_id, type)
            VALUES (?, ?, ?)
        `, [postId, userId, type]);
        console.log(resp);

    } else if (existing.type === type) {
        console.log("updating existing")
        let resp = await db.execute(`
            DELETE FROM post_reactions
            WHERE post_id = ? AND user_id = ?
        `, [postId, userId]);

    } else {
        console.log("switch");
        let resp = await db.execute(`
            UPDATE post_reactions
            SET type = ?
            WHERE post_id = ? AND user_id = ?
        `, [type, postId, userId]);
        console.log(resp);
    }

    return await db.execute(`
        SELECT
            COUNT(CASE WHEN type='like' THEN 1 END) AS likes_count,
            COUNT(CASE WHEN type='dislike' THEN 1 END) AS dislikes_count
        FROM post_reactions
        WHERE post_id = ?
    `, [postId]);
}

export function searchPosts(keyword) {
    const likePattern = `%${keyword}%`;

    const posts = db.prepare(`
        SELECT posts.*, users.username
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.title LIKE ?
           OR posts.content LIKE ?
        ORDER BY posts.created_at DESC
    `).all(likePattern, likePattern);
    return posts;
}
export async function searchByPost(keyword, userId = null) {

    const words = keyword
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) return [];

    const conditions = words.map(() =>
        "(posts.title LIKE ? OR posts.content LIKE ?)"
    ).join(" OR ");

    const likeParams = words.flatMap(word => [
        `%${word}%`,
        `%${word}%`
    ]);

    const query = `
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

        JOIN users ON posts.user_id = users.id
        JOIN groupss ON posts.group_id = groupss.id

        LEFT JOIN post_reactions 
            ON posts.id = post_reactions.post_id

        LEFT JOIN comments
            ON posts.id = comments.post_id

        WHERE ${conditions}

        GROUP BY posts.id, users.id, groupss.id

        ORDER BY posts.created_at DESC
    `;

    const params = [
        userId ?? 0,
        userId ?? 0,
        ...likeParams
    ];

    const [rows] = await db.execute(query, params);

    return rows;
}





export async function createReply(req, res) {
    const { content, parent_id } = req.body;
    const { postId } = req.params;
    const userId = req.user.id;

    await db.run(`
        INSERT INTO comments (content, user_id, post_id, parent_id)
        VALUES (?, ?, ?, ?)
    `, [content, userId, postId, parent_id]);

    res.json({ success: true });
}
export async function getComments(postId, userId = null) {
    const comments = (await db.execute(`
    SELECT 
        c.id,
        c.content,
        c.parent_id,
        c.created_at,

        u.username AS user_name,
        u.id AS user_id,
        u.icon AS user_icon,

        /* total likes */
        (
          SELECT COUNT(*) 
          FROM comment_reactions cr
          WHERE cr.comment_id = c.id
            AND cr.type = 'like'
        ) AS likes_count,

        /* total dislikes */
        (
          SELECT COUNT(*) 
          FROM comment_reactions cr
          WHERE cr.comment_id = c.id
            AND cr.type = 'dislike'
        ) AS dislikes_count,

        /* did current user like */
        EXISTS(
          SELECT 1
          FROM comment_reactions cr
          WHERE cr.comment_id = c.id
            AND cr.user_id = ?
            AND cr.type = 'like'
        ) AS user_liked,

        /* did current user dislike */
        EXISTS(
          SELECT 1
          FROM comment_reactions cr
          WHERE cr.comment_id = c.id
            AND cr.user_id = ?
            AND cr.type = 'dislike'
        ) AS user_disliked

    FROM comments c
    JOIN users u ON u.id = c.user_id

    WHERE c.post_id = ?
    ORDER BY c.created_at DESC
  `, [userId, userId, postId]))[0];

    return comments;
}


export async function createComment(content, userId, postId, parentId = null) {

    const sql = `
        INSERT INTO comments (content, user_id, post_id, parent_id)
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
        content,
        userId,
        postId,
        parentId ?? null
    ]);

    return {
        id: result.insertId,
        content,
        user_id: userId,
        post_id: postId,
        parent_id: parentId ?? null
    };
}

export async function createNewPost(title, content, userId, groupId) {

    const sql = `
        INSERT INTO posts (title, content, user_id, group_id)
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
        title,
        content,
        userId,
        groupId
    ]);

    return {
        id: result.insertId,
        title,
        content,
        user_id: userId,
        group_id: groupId
    };
}

