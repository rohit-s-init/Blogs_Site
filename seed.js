import db from "./db.js";

export default function seedDatabase() {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();

  if (userCount.count > 0) {
    console.log("Seed already exists. Skipping...");
    return;
  }

  console.log("Seeding database...");

  const seed = db.transaction(() => {

    /* ---------------- USERS ---------------- */
    const insertUser = db.prepare(`
      INSERT INTO users (email, username, password_hash, is_verified)
      VALUES (?, ?, ?, 1)
    `);

    insertUser.run("admin@mail.com", "admin", "hashed_pw");
    insertUser.run("john@mail.com", "john", "hashed_pw");
    insertUser.run("alice@mail.com", "alice", "hashed_pw");
    insertUser.run("bob@mail.com", "bob", "hashed_pw");
    insertUser.run("mike@mail.com", "mike", "hashed_pw");
    insertUser.run("sara@mail.com", "sara", "hashed_pw");

    /* ---------------- GROUPS ---------------- */
    const insertGroup = db.prepare(`
      INSERT INTO groups (name, description, created_by)
      VALUES (?, ?, ?)
    `);

    insertGroup.run("javascript", "All about JS", 1);
    insertGroup.run("webdev", "Web development discussions", 2);
    insertGroup.run("backend", "Backend architecture & APIs", 3);

    /* ---------------- GROUP MEMBERS ---------------- */
    const insertMember = db.prepare(`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (?, ?, ?)
    `);

    // javascript group
    insertMember.run(1, 1, "admin");
    insertMember.run(1, 2, "member");
    insertMember.run(1, 3, "member");

    // webdev group
    insertMember.run(2, 2, "admin");
    insertMember.run(2, 4, "member");
    insertMember.run(2, 5, "member");

    // backend group
    insertMember.run(3, 3, "admin");
    insertMember.run(3, 1, "moderator");
    insertMember.run(3, 6, "member");

    /* ---------------- POSTS ---------------- */
    const insertPost = db.prepare(`
      INSERT INTO posts (title, content, user_id, group_id)
      VALUES (?, ?, ?, ?)
    `);




    // 🔥 Single Image Post
    insertPost.run(
      "JavaScript Event Loop Diagram",
      `
Understanding the JS event loop visually.

![image](https://picsum.photos/800/500?random=101)
  `,
      2,
      1
    );

    // 🔥 Multiple Images (Carousel)
    insertPost.run(
      "My Workspace Setup",
      `
Here’s my coding workspace 🔥

![image](https://picsum.photos/800/500?random=201)
![image](https://picsum.photos/800/500?random=202)
![video](https://www.w3schools.com/html/mov_bbb.mp4)
![image](https://picsum.photos/800/500?random=203)
  `,
      4,
      2
    );

    // 🔥 Single Video Post
    insertPost.run(
      "Node Server Demo",
      `
Quick demo of my Node server running.

![video](https://www.w3schools.com/html/mov_bbb.mp4)
  `,
      3,
      3
    );

    // 🔥 Mixed Media (Image + Video Carousel)
    insertPost.run(
      "Fullstack Project Showcase",
      `
Built a fullstack project with React + Node.

![image](https://picsum.photos/800/500?random=301)
![video](https://www.w3schools.com/html/mov_bbb.mp4)
![image](https://picsum.photos/800/500?random=302)
  `,
      1,
      3
    );


    insertPost.run("Understanding Closures", "Closures explained deeply.", 2, 1);
    insertPost.run("Async Await Guide", "Async patterns in JS.", 3, 1);

    insertPost.run("How to deploy Node", "Deployment strategies.", 2, 2);
    insertPost.run("React vs Vanilla JS", "Which one to choose?", 4, 2);

    insertPost.run("Designing REST APIs", "Best practices.", 3, 3);
    insertPost.run("Rate Limiting Middleware", "Security & scaling.", 1, 3);











    /* ---------------- COMMENTS ---------------- */
    const insertComment = db.prepare(`
      INSERT INTO comments (content, user_id, post_id, parent_id)
      VALUES (?, ?, ?, ?)
    `);

    // Root comments
    insertComment.run("Great explanation!", 3, 1, null);
    insertComment.run("This helped a lot.", 4, 1, null);

    // Nested replies
    insertComment.run("Thanks!", 2, 1, 1);
    insertComment.run("Glad it helped.", 2, 1, 2);

    insertComment.run("Very detailed.", 5, 3, null);
    insertComment.run("Can you share more?", 6, 5, null);

    /* ---------------- REACTIONS ---------------- */
    const insertReaction = db.prepare(`
      INSERT INTO post_reactions (post_id, user_id, type)
      VALUES (?, ?, ?)
    `);

    insertReaction.run(1, 3, "like");
    insertReaction.run(1, 4, "like");
    insertReaction.run(2, 1, "like");
    insertReaction.run(3, 5, "dislike");
    insertReaction.run(4, 6, "like");
    insertReaction.run(5, 2, "like");

  });

  seed();
  console.log("Database seeded successfully.");
}

