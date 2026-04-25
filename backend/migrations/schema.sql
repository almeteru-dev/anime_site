-- 1. Справочники
CREATE TABLE languages (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL, -- ru, en, kz
  name VARCHAR(255) NOT NULL
);

CREATE TABLE statuses (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL -- ongoing, released
);

CREATE TABLE sources (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL -- manga, light_novel, original, game
);

CREATE TABLE collection_types (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL -- watching, planned
);

CREATE TABLE genres (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL -- action, comedy
);

CREATE TABLE studios (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL -- MAPPA, Madhouse
);

-- 2. Основные сущности
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(40) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  age INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE anime (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studio_id INTEGER REFERENCES studios (id),
  status_id INTEGER REFERENCES statuses (id),
  source_id INTEGER REFERENCES sources (id), -- Ссылка на первоисточник
  name VARCHAR(255) NOT NULL,
  kind VARCHAR(50),
  url VARCHAR(255) UNIQUE NOT NULL,
  duration INTEGER,
  rating VARCHAR(50),
  image VARCHAR(500),
  score DECIMAL(3, 2) DEFAULT 0,
  episodes INTEGER DEFAULT 0,
  episodes_aired INTEGER DEFAULT 0,
  aired_on TIMESTAMP,
  released_on TIMESTAMP
);

-- 3. Таблицы переводов (Мультиязычность)
CREATE TABLE anime_translations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anime_id BIGINT NOT NULL REFERENCES anime (id) ON DELETE CASCADE,
  language_id INTEGER NOT NULL REFERENCES languages (id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE status_translations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status_id INTEGER NOT NULL REFERENCES statuses (id) ON DELETE CASCADE,
  language_id INTEGER NOT NULL REFERENCES languages (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE source_translations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id INTEGER NOT NULL REFERENCES sources (id) ON DELETE CASCADE,
  language_id INTEGER NOT NULL REFERENCES languages (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL -- "Манга", "Ранобэ", "Manga"
);

CREATE TABLE studio_translations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios (id) ON DELETE CASCADE,
  language_id INTEGER NOT NULL REFERENCES languages (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE genre_translations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  genre_id INTEGER NOT NULL REFERENCES genres (id) ON DELETE CASCADE,
  language_id INTEGER NOT NULL REFERENCES languages (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE collection_type_translations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  collection_type_id INTEGER NOT NULL REFERENCES collection_types (id) ON DELETE CASCADE,
  language_id INTEGER NOT NULL REFERENCES languages (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

-- 4. Связи и списки
CREATE TABLE anime_genres (
  anime_id BIGINT NOT NULL REFERENCES anime (id) ON DELETE CASCADE,
  genre_id INTEGER NOT NULL REFERENCES genres (id) ON DELETE CASCADE,
  PRIMARY KEY (anime_id, genre_id)
);

CREATE TABLE user_collections (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  anime_id BIGINT NOT NULL REFERENCES anime (id) ON DELETE CASCADE,
  collection_type_id INTEGER NOT NULL REFERENCES collection_types (id),
  episodes_watched INTEGER DEFAULT 0,
  score DECIMAL(3, 1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, anime_id)
);

-- Индексы
CREATE INDEX idx_anime_url ON anime (url);
CREATE INDEX idx_user_collections_user ON user_collections (user_id);
