import db from "../config/db.js";

export async function getPosts(userId, offset = 0, groupId) {
    const [rows] = await db.execute(
        `
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

        WHERE posts.group_id = ?

        GROUP BY posts.id

        ORDER BY posts.created_at DESC

        LIMIT 10 OFFSET ?
        `,
        [
            userId,
            userId,
            Number(groupId),
            offset * 10
        ]
    );

    return rows;
}

export async function getGroupData(groupId, currentUserId) {
    console.log(currentUserId);

    const [rows] = await db.execute(
        `
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

        FROM groupss g

        LEFT JOIN users u
            ON g.created_by = u.id

        LEFT JOIN group_members gm
            ON g.id = gm.group_id

        WHERE g.id = ?

        GROUP BY g.id
        `,
        [currentUserId, groupId]
    );

    return rows[0] || null;
}

export async function searchGroup(keyword, userId = null) {

    const words = keyword
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    const conditions = words.map(() =>
        "(g.name LIKE ? OR g.description LIKE ? OR u.username LIKE ?)"
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

        FROM groupss g

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

    // ⚠ Parameter order matters
    const finalParams = userId
        ? [userId, ...likeParams]
        : likeParams;

    const [rows] = await db.execute(query, finalParams);

    return rows;
}

export async function getAllGroups(userId = null) {

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
                    WHEN MAX(gm2.user_id) IS NOT NULL THEN 1
                    ELSE 0
                    END AS is_member`
                : `0 AS is_member`
            }

        FROM groupss g

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

        GROUP BY 
            g.id,
            g.name,
            g.description,
            g.icon,
            g.background,
            g.created_at,
            u.username,
            u.icon

        ORDER BY g.created_at DESC
    `;

    const params = userId ? [userId] : [];

    return (await db.execute(query,params))[0];
}



export async function createGroup({ name, description, createdBy }) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1️⃣ Insert group
        const [insertResult] = await connection.execute(
            `
            INSERT INTO groupss (name, description, created_by)
            VALUES (?, ?, ?)
            `,
            [name, description, createdBy]
        );

        const groupId = insertResult.insertId;

        // 2️⃣ Insert admin membership
        await connection.execute(
            `
            INSERT INTO group_members (group_id, user_id, role)
            VALUES (?, ?, 'admin')
            `,
            [groupId, createdBy]
        );

        // 3️⃣ Fetch created group
        const [rows] = await connection.execute(
            `
            SELECT
                g.id,
                g.name,
                g.description,
                g.icon,
                g.background,
                g.created_at,
                u.username AS creator_username,
                u.icon AS creator_icon
            FROM groupss g
            LEFT JOIN users u ON g.created_by = u.id
            WHERE g.id = ?
            `,
            [groupId]
        );

        await connection.commit();

        return rows[0];

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}



export async function joinGroup(groupId, userId) {

    const [result] = await db.execute(
        `
        INSERT IGNORE INTO group_members (group_id, user_id, role)
        VALUES (?, ?, 'member')
        `,
        [groupId, userId]
    );

    return result;
}