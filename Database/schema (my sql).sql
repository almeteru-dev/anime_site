CREATE TABLE `users` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(255) UNIQUE,
  `email` VARCHAR(255) UNIQUE,
  `password_hash` VARCHAR(255),
  `avatar_url` VARCHAR(255),
  `age` INTEGER,
  `is_verified` BOOLEAN,
  `created_at` TIMESTAMP
);

CREATE TABLE `anime` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `studio_id` INTEGER,
  `status_id` INTEGER,
  `name` VARCHAR(255),
  `kind` VARCHAR(255),
  `url` VARCHAR(255) UNIQUE,
  `duration` INTEGER,
  `rating` VARCHAR(255),
  `image` VARCHAR(255),
  `score` DECIMAL,
  `episodes` INTEGER,
  `episodes_aired` INTEGER,
  `aired_on` TIMESTAMP,
  `released_on` TIMESTAMP
);

CREATE TABLE `languages` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `code` VARCHAR(255),
  `name` VARCHAR(255)
);

CREATE TABLE `anime_translations` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `anime_id` BIGINT,
  `language_id` INTEGER,
  `title` VARCHAR(255),
  `description` TEXT
);

CREATE TABLE `statuses` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255)
);

CREATE TABLE `status_translations` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `status_id` INTEGER,
  `language_id` INTEGER,
  `name` VARCHAR(255)
);

CREATE TABLE `studios` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255)
);

CREATE TABLE `studio_translations` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `studio_id` INTEGER,
  `language_id` INTEGER,
  `name` VARCHAR(255)
);

CREATE TABLE `genres` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255)
);

CREATE TABLE `genre_translations` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `genre_id` INTEGER,
  `language_id` INTEGER,
  `name` VARCHAR(255)
);

CREATE TABLE `anime_genres` (
  `anime_id` BIGINT,
  `genre_id` INTEGER,
  `name` VARCHAR(255),
  PRIMARY KEY (`anime_id`, `genre_id`)
);

CREATE TABLE `collection_types` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255)
);

CREATE TABLE `collection_type_translations` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `collection_type_id` INTEGER,
  `language_id` INTEGER,
  `name` VARCHAR(255)
);

CREATE TABLE `user_collections` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT,
  `anime_id` BIGINT,
  `collection_type_id` INTEGER,
  `episodes_watched` INTEGER DEFAULT 0,
  `score` DECIMAL,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE UNIQUE INDEX `user_collections_index_0` ON `user_collections` (`user_id`, `anime_id`);

ALTER TABLE `anime_translations` ADD FOREIGN KEY (`anime_id`) REFERENCES `anime` (`id`);

ALTER TABLE `anime_translations` ADD FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`);

ALTER TABLE `status_translations` ADD FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`);

ALTER TABLE `status_translations` ADD FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`);

ALTER TABLE `studio_translations` ADD FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`);

ALTER TABLE `studio_translations` ADD FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`);

ALTER TABLE `genre_translations` ADD FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`);

ALTER TABLE `genre_translations` ADD FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`);

ALTER TABLE `anime_genres` ADD FOREIGN KEY (`anime_id`) REFERENCES `anime` (`id`);

ALTER TABLE `anime_genres` ADD FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`);

ALTER TABLE `collection_type_translations` ADD FOREIGN KEY (`collection_type_id`) REFERENCES `collection_types` (`id`);

ALTER TABLE `collection_type_translations` ADD FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`);

ALTER TABLE `user_collections` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `user_collections` ADD FOREIGN KEY (`anime_id`) REFERENCES `anime` (`id`);

ALTER TABLE `user_collections` ADD FOREIGN KEY (`collection_type_id`) REFERENCES `collection_types` (`id`);
