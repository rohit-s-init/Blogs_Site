INSERT IGNORE INTO group_members (group_id, user_id, role)
SELECT g.id,
       FLOOR(1 + RAND() * 50),
       'member'
FROM groupss g;
