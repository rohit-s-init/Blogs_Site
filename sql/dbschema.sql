CREATE DATABASE IF NOT EXISTS hivemind;
use hivemind;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY auto_increment,

  email varchar(500) UNIQUE NOT NULL,
  username varchar(200) NOT NULL,
  password_hash varchar(255) NOT NULL,
  icon varchar(500) DEFAULT "https://cdn.pixabay.com/photo/2022/08/14/20/57/bee-7386616_640.png",
  description varchar(500) DEFAULT "Hello !",

  otp varchar(10),
  otp_expiry INTEGER,
  is_verified INTEGER DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS groupss (
  id INTEGER PRIMARY KEY auto_increment,
  name varchar(500) UNIQUE NOT NULL,
  description TEXT,
  icon varchar(500) DEFAULT "https://cdn.pixabay.com/photo/2022/08/14/20/57/bee-7386616_640.png",
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  background varchar(500) DEFAULT "https://t3.ftcdn.net/jpg/03/15/34/90/360_F_315349043_6ohfFyx37AFusCKZtGQtJR0jqUxhb25Y.webp", 

  FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE CASCADE
);

  /*
  |--------------------------------------------------------------------------
  | POSTS
  |--------------------------------------------------------------------------
  */
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY auto_increment,
    title varchar(300) NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    group_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES groupss(id) ON DELETE CASCADE
);

/* post likes */
CREATE TABLE IF NOT EXISTS post_reactions (
    id INTEGER PRIMARY KEY auto_increment,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    type ENUM('like', 'dislike') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


  /*
  |--------------------------------------------------------------------------
  | COMMENTS
  |--------------------------------------------------------------------------
  | One post → many comments
  | One user → many comments
  |--------------------------------------------------------------------------
  */
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY auto_increment,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    parent_id INTEGER REFERENCES comments(id),
    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    FOREIGN KEY (post_id)
      REFERENCES posts(id)
      ON DELETE CASCADE
  );
  
  
  
  /*
  |--------------------------------------------------------------------------
  | LIKES (junction table)
  |--------------------------------------------------------------------------
  | many-to-many (user ↔ post)
  | one user can like a post only once
  |--------------------------------------------------------------------------
  */
  CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, post_id),

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    FOREIGN KEY (post_id)
      REFERENCES posts(id)
      ON DELETE CASCADE
  );
  
  
CREATE TABLE IF NOT EXISTS group_members (
  id INTEGER PRIMARY KEY auto_increment,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role ENUM('admin','moderator','member') NOT NULL DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(group_id, user_id),

  FOREIGN KEY (group_id)
    REFERENCES groupss(id)
    ON DELETE CASCADE,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS followers (
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (follower_id, following_id),

  FOREIGN KEY (follower_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY (following_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CHECK (follower_id != following_id)
);



/*
|--------------------------------------------------------------------------
| COMMENT REACTIONS
|--------------------------------------------------------------------------
| One comment → many reactions
| One user → one reaction per comment
|--------------------------------------------------------------------------
*/
CREATE TABLE IF NOT EXISTS comment_reactions (
  id INTEGER PRIMARY KEY auto_increment,

  comment_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,

  type enum('like','dislike') NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(comment_id, user_id),

  FOREIGN KEY (comment_id)
    REFERENCES comments(id)
    ON DELETE CASCADE,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
