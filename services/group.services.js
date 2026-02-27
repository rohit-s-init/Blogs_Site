import db from "../db.js";

export function getPosts(userId, offset = 0, groupId) {

    return db.prepare(`
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

WHERE posts.group_id = ?

GROUP BY posts.id

ORDER BY posts.created_at DESC

LIMIT 10 OFFSET ?;

    `).all(userId, userId, Number(groupId), offset * 10);
}

export function getGroupData(groupId, currentUserId) {
    console.log(currentUserId);
    const query = db.prepare(`
SELECT
    g.id,
    g.name,
    g.description,
    g.icon,
    g.background,
    g.created_at,

    u.username AS creator_username,
    u.icon AS creator_icon,

    COUNT(DISTINCT gm.user_id) AS members_count,

    MAX(CASE
        WHEN gm.user_id = ? THEN 1
        ELSE 0
    END) AS is_member

FROM groups g

LEFT JOIN users u
    ON g.created_by = u.id

LEFT JOIN group_members gm
    ON g.id = gm.group_id

WHERE g.id = ?

GROUP BY g.id;

        `);
    return query.get(currentUserId, groupId);
}

export function searchGroup(keyword, userId = null) {

    const words = keyword
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    const conditions = words.map(() =>
        "(g.name LIKE ? COLLATE NOCASE OR g.description LIKE ? COLLATE NOCASE OR u.username LIKE ? COLLATE NOCASE)"
    ).join(" OR ");

    const likeParams = words.flatMap(word => [
        `%${word}%`,
        `%${word}%`,
        `%${word}%`
    ]);

    const query = `
        SELECT
            g.id,
            g.name,
            g.description,
            g.icon,
            g.background,
            g.created_at,

            u.username AS creator_username,
            u.icon AS creator_icon,

            COUNT(DISTINCT gm.user_id) AS members_count,

            ${
              userId
                ? `CASE 
                     WHEN gm2.user_id IS NOT NULL THEN 1 
                     ELSE 0 
                   END AS is_member`
                : `0 AS is_member`
            }

        FROM groups g

        LEFT JOIN users u
            ON g.created_by = u.id

        LEFT JOIN group_members gm
            ON g.id = gm.group_id

        ${
          userId
            ? `LEFT JOIN group_members gm2
               ON g.id = gm2.group_id
               AND gm2.user_id = ?`
            : ``
        }

        WHERE ${conditions}

        GROUP BY g.id
        ORDER BY g.created_at DESC
    `;

    const finalParams = userId
        ? [...likeParams, userId]
        : likeParams;

    return db.prepare(query).all(...finalParams);
}

export function getAllGroups(userId = null) {

    const query = `
        SELECT
            g.id,
            g.name,
            g.description,
            g.icon,
            g.background,
            g.created_at,

            u.username AS creator_username,
            u.icon AS creator_icon,

            COUNT(DISTINCT gm.user_id) AS members_count,

            ${
              userId
                ? `CASE 
                     WHEN gm2.user_id IS NOT NULL THEN 1 
                     ELSE 0 
                   END AS is_member`
                : `0 AS is_member`
            }

        FROM groups g

        LEFT JOIN users u
            ON g.created_by = u.id

        LEFT JOIN group_members gm
            ON g.id = gm.group_id

        ${
          userId
            ? `LEFT JOIN group_members gm2
               ON g.id = gm2.group_id
               AND gm2.user_id = ?`
            : ``
        }

        GROUP BY g.id
        ORDER BY g.created_at DESC
    `;

    const params = userId ? [userId] : [];

    return db.prepare(query).all(...params);
}



export function createGroup({ name, description, createdBy }) {
    const insertGroup = db.prepare(`
        INSERT INTO groups (name, description, created_by)
        VALUES (?, ?, ?)
    `);

    const insertMember = db.prepare(`
        INSERT INTO group_members (group_id, user_id, role)
        VALUES (?, ?, 'admin')
    `);

    const getGroup = db.prepare(`
        SELECT
            g.id,
            g.name,
            g.description,
            g.icon,
            g.background,
            g.created_at,
            u.username AS creator_username,
            u.icon AS creator_icon
        FROM groups g
        LEFT JOIN users u ON g.created_by = u.id
        WHERE g.id = ?
    `);

    const transaction = db.transaction(() => {
        const result = insertGroup.run(name, description, createdBy);

        const groupId = result.lastInsertRowid;

        insertMember.run(groupId, createdBy);

        return getGroup.get(groupId);
    });

    return transaction();
}



export function joinGroup(groupId, userId) {

    const query = `
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (?, ?, 'member')
      ON CONFLICT(group_id, user_id) DO NOTHING
    `;

    const stmt = db.prepare(query);
    const result = stmt.run(groupId, userId);

    return result;

}