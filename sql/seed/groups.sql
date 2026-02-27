INSERT INTO groupss (name, description, created_by) VALUES
('BollywoodMovies', 'Discussion about Bollywood films and actors.', 3),
('HollywoodHub', 'Latest Hollywood movies and reviews.', 5),
('HorrorUniverse', 'Horror movies and creepy stories.', 25),
('AnimeWorld', 'Anime discussions and recommendations.', 9),
('AnimationStudio', '2D and 3D animation lovers.', 17),
('GameDevZone', 'Game development and engine discussions.', 13),
('GamingArena', 'Console, PC and competitive gaming.', 38),
('RetroGamesClub', 'Classic retro gaming nostalgia.', 14),
('HardwareGeeks', 'PC builds, GPUs and hardware talk.', 33),
('SoftwareEngineering', 'Backend, frontend and system design.', 16),

('WebDevelopment', 'React, Node, MERN stack discussions.', 37),
('CyberSecurity', 'Security, hacking and cryptography.', 47),
('AIandML', 'Artificial Intelligence & Machine Learning.', 18),
('StartupFounders', 'Startup ideas and entrepreneurship.', 6),
('FinanceTalk', 'Investing, stocks and money matters.', 28),
('CryptoZone', 'Blockchain and cryptocurrency.', 48),
('PhotographyClub', 'Photography and editing tips.', 12),
('MusicLovers', 'All genres of music discussion.', 27),
('FitnessClub', 'Workout routines and nutrition.', 26),
('SpaceExploration', 'Space, NASA and astronomy.', 46),

('ScienceNerds', 'Physics, chemistry and science talk.', 43),
('BookClub', 'Books, novels and literature.', 44),
('TravelDiaries', 'Travel experiences and guides.', 29),
('CookingWorld', 'Recipes and food culture.', 30),
('CarsAndBikes', 'Automobile reviews and discussions.', 34),
('DoomFans', 'Doom game and FPS nostalgia.', 38),
('OpenSourceHub', 'Open source collaboration.', 32),
('MemesCentral', 'Internet memes and humor.', 31),
('TechNewsDaily', 'Latest tech industry updates.', 10),
('DesignInspiration', 'UI/UX and graphic design.', 19);

INSERT INTO group_members (group_id, user_id, role)
SELECT id, created_by, 'admin'
FROM groupss;