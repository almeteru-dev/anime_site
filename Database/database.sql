CREATE TABLE "users" (
  "id" integer PRIMARY KEY,
  "username" varchar UNIQUE,
  "email" varchar UNIQUE,
  "password_hash" varchar,
  "avatar_url" varchar,
  "age" integer,
  "is_verified" bool,
  "created_at" timestamp
);

CREATE TABLE "anime" (
  "id" integer PRIMARY KEY,
  "studio_id" integer,
  "status_id" integer,
  "kind" varchar,
  "url" varchar UNIQUE,
  "duration" integer,
  "rating" varchar,
  "image" varchar,
  "score" decimal,
  "episodes" integer,
  "episodes_aired" integer,
  "aired_on" timestamp,
  "released_on" timestamp
);

CREATE TABLE "languages" (
  "id" integer PRIMARY KEY,
  "code" varchar,
  "name" varchar
);

CREATE TABLE "anime_translations" (
  "id" integer PRIMARY KEY,
  "anime_id" integer,
  "language_id" integer,
  "title" varchar,
  "description" text
);

CREATE TABLE "statuses" (
  "id" integer PRIMARY KEY,
  "name" varchar
);

CREATE TABLE "status_translations" (
  "id" integer PRIMARY KEY,
  "status_id" integer,
  "language_id" integer,
  "name" varchar
);

CREATE TABLE "studios" (
  "id" integer PRIMARY KEY,
  "name" varchar
);

CREATE TABLE "studio_translations" (
  "id" integer PRIMARY KEY,
  "studio_id" integer,
  "language_id" integer,
  "name" varchar
);

CREATE TABLE "genres" (
  "id" integer PRIMARY KEY,
  "name" varchar
);

CREATE TABLE "genre_translations" (
  "id" integer PRIMARY KEY,
  "genre_id" integer,
  "language_id" integer,
  "name" varchar
);

CREATE TABLE "anime_genres" (
  "anime_id" integer,
  "genre_id" integer,
  "name" varchar,
  PRIMARY KEY ("anime_id", "genre_id")
);

CREATE TABLE "collection_types" (
  "id" integer PRIMARY KEY,
  "name" varchar
);

CREATE TABLE "collection_type_translations" (
  "id" integer PRIMARY KEY,
  "collection_type_id" integer,
  "language_id" integer,
  "name" varchar
);

CREATE TABLE "user_collections" (
  "id" integer PRIMARY KEY,
  "user_id" integer,
  "anime_id" integer,
  "collection_type_id" integer,
  "episodes_watched" integer DEFAULT 0,
  "rewatches" integer DEFAULT 0,
  "score" decimal,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE UNIQUE INDEX ON "user_collections" ("user_id", "anime_id");

ALTER TABLE "anime_translations" ADD FOREIGN KEY ("anime_id") REFERENCES "anime" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "anime_translations" ADD FOREIGN KEY ("language_id") REFERENCES "languages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "status_translations" ADD FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "status_translations" ADD FOREIGN KEY ("language_id") REFERENCES "languages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "studio_translations" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "studio_translations" ADD FOREIGN KEY ("language_id") REFERENCES "languages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "genre_translations" ADD FOREIGN KEY ("genre_id") REFERENCES "genres" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "genre_translations" ADD FOREIGN KEY ("language_id") REFERENCES "languages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "anime_genres" ADD FOREIGN KEY ("anime_id") REFERENCES "anime" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "anime_genres" ADD FOREIGN KEY ("genre_id") REFERENCES "genres" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "collection_type_translations" ADD FOREIGN KEY ("collection_type_id") REFERENCES "collection_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "collection_type_translations" ADD FOREIGN KEY ("language_id") REFERENCES "languages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_collections" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_collections" ADD FOREIGN KEY ("anime_id") REFERENCES "anime" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_collections" ADD FOREIGN KEY ("collection_type_id") REFERENCES "collection_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;
