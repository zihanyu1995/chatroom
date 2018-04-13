DROP DATABASE IF EXISTS esn;
CREATE DATABASE esn;



CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  status INTEGER DEFAULT 4, -- 1:ok, 2: help, 3: emergency, 4:undefined
  privilege INTEGER DEFAULT 0, -- 0:Citizen, 1: Coordinator, 2:Administrator
  active BOOLEAN DEFAULT true
);

INSERT INTO users VALUES (0, 'Public Channel', 'password', 4);
INSERT INTO users VALUES (1, 'ESNAdmin', '21232f297a57a5a743894a0e4a801fc3', 1, 2); -- hash of "admin"

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sendtime TEXT,
  message TEXT,
  fromuser INTEGER NOT NULL,
  touser INTEGER NOT NULL,
  status INTEGER DEFAULT 4,
  vote INTEGER DEFAULT 0
);

CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  userid INTEGER,
  sendtime TEXT,
  announcement TEXT
);

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  userid INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  starttime TEXT NOT NULL,
  endtime TEXT NOT NULL,
  role INTEGER NOT NULL,
  posttime TEXT NOT NULL,
  longitude REAL NOT NULL,
  latitude REAL NOT NULL
);

CREATE TABLE friends (
  id SERIAL PRIMARY KEY,
  uid1 INTEGER,
  uid2 INTEGER
);

CREATE TABLE requests (
  fromuser INTEGER,
  touser INTEGER,
  PRIMARY KEY(fromuser,touser)
);

CREATE TABLE statusChangeHistory (
  id SERIAL PRIMARY KEY,
  userid INTEGER,
  status INTEGER,
  sendtime TEXT
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  userid INTEGER,
  sendtime TEXT,
  title TEXT,
  post TEXT,
  topic INTEGER
);
-- choice:  0:not vote, 1: upvote, -1: downvote
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  userid INTEGER,
  messageid INTEGER,
  choice INTEGER
);
