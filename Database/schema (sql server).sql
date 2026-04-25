CREATE TABLE [users] (
  [id] BIGINT PRIMARY KEY IDENTITY(1, 1),
  [username] VARCHAR(255) UNIQUE,
  [email] VARCHAR(255) UNIQUE,
  [password_hash] VARCHAR(255),
  [avatar_url] VARCHAR(255),
  [age] INTEGER,
  [is_verified] BOOLEAN,
  [created_at] TIMESTAMP
)
GO

CREATE TABLE [anime] (
  [id] BIGINT PRIMARY KEY IDENTITY(1, 1),
  [studio_id] INTEGER,
  [status_id] INTEGER,
  [name] VARCHAR(255),
  [kind] VARCHAR(255),
  [url] VARCHAR(255) UNIQUE,
  [duration] INTEGER,
  [rating] VARCHAR(255),
  [image] VARCHAR(255),
  [score] DECIMAL,
  [episodes] INTEGER,
  [episodes_aired] INTEGER,
  [aired_on] TIMESTAMP,
  [released_on] TIMESTAMP
)
GO

CREATE TABLE [languages] (
  [id] INTEGER PRIMARY KEY IDENTITY(1, 1),
  [code] VARCHAR(255),
  [name] VARCHAR(255)
)
GO

CREATE TABLE [anime_translations] (
  [id] BIGINT PRIMARY KEY IDENTITY(1, 1),
  [anime_id] BIGINT,
  [language_id] INTEGER,
  [title] VARCHAR(255),
  [description] TEXT
)
GO

CREATE TABLE [statuses] (
  [id] INTEGER PRIMARY KEY,
  [name] VARCHAR(255)
)
GO

CREATE TABLE [status_translations] (
  [id] BIGINT PRIMARY KEY IDENTITY(1, 1),
  [status_id] INTEGER,
  [language_id] INTEGER,
  [name] VARCHAR(255)
)
GO

CREATE TABLE [studios] (
  [id] INTEGER PRIMARY KEY IDENTITY(1, 1),
  [name] VARCHAR(255)
)
GO

CREATE TABLE [studio_translations] (
  [id] BIGINT PRIMARY KEY IDENTITY(1, 1),
  [studio_id] INTEGER,
  [language_id] INTEGER,
  [name] VARCHAR(255)
)
GO

CREATE TABLE [genres] (
  [id] INTEGER PRIMARY KEY IDENTITY(1, 1),
  [name] VARCHAR(255)
)
GO

CREATE TABLE [genre_translations] (
  [id] BIGINT PRIMARY KEY IDENTITY(1, 1),
  [genre_id] INTEGER,
  [language_id] INTEGER,
  [name] VARCHAR(255)
)
GO

CREATE TABLE [anime_genres] (
  [anime_id] BIGINT,
  [genre_id] INTEGER,
  [name] VARCHAR(255),
  PRIMARY KEY ([anime_id], [genre_id])
)
GO

CREATE TABLE [collection_types] (
  [id] INTEGER PRIMARY KEY IDENTITY(1, 1),
  [name] VARCHAR(255)
)
GO

CREATE TABLE [collection_type_translations] (
  [id] BIGINT PRIMARY KEY IDENTITY(1, 1),
  [collection_type_id] INTEGER,
  [language_id] INTEGER,
  [name] VARCHAR(255)
)
GO

CREATE TABLE [user_collections] (
  [id] BIGINT PRIMARY KEY IDENTITY(1, 1),
  [user_id] BIGINT,
  [anime_id] BIGINT,
  [collection_type_id] INTEGER,
  [episodes_watched] INTEGER DEFAULT (0),
  [score] DECIMAL,
  [created_at] TIMESTAMP,
  [updated_at] TIMESTAMP
)
GO

CREATE UNIQUE INDEX [user_collections_index_0] ON [user_collections] ("user_id", "anime_id")
GO

ALTER TABLE [anime_translations] ADD FOREIGN KEY ([anime_id]) REFERENCES [anime] ([id])
GO

ALTER TABLE [anime_translations] ADD FOREIGN KEY ([language_id]) REFERENCES [languages] ([id])
GO

ALTER TABLE [status_translations] ADD FOREIGN KEY ([status_id]) REFERENCES [statuses] ([id])
GO

ALTER TABLE [status_translations] ADD FOREIGN KEY ([language_id]) REFERENCES [languages] ([id])
GO

ALTER TABLE [studio_translations] ADD FOREIGN KEY ([studio_id]) REFERENCES [studios] ([id])
GO

ALTER TABLE [studio_translations] ADD FOREIGN KEY ([language_id]) REFERENCES [languages] ([id])
GO

ALTER TABLE [genre_translations] ADD FOREIGN KEY ([genre_id]) REFERENCES [genres] ([id])
GO

ALTER TABLE [genre_translations] ADD FOREIGN KEY ([language_id]) REFERENCES [languages] ([id])
GO

ALTER TABLE [anime_genres] ADD FOREIGN KEY ([anime_id]) REFERENCES [anime] ([id])
GO

ALTER TABLE [anime_genres] ADD FOREIGN KEY ([genre_id]) REFERENCES [genres] ([id])
GO

ALTER TABLE [collection_type_translations] ADD FOREIGN KEY ([collection_type_id]) REFERENCES [collection_types] ([id])
GO

ALTER TABLE [collection_type_translations] ADD FOREIGN KEY ([language_id]) REFERENCES [languages] ([id])
GO

ALTER TABLE [user_collections] ADD FOREIGN KEY ([user_id]) REFERENCES [users] ([id])
GO

ALTER TABLE [user_collections] ADD FOREIGN KEY ([anime_id]) REFERENCES [anime] ([id])
GO

ALTER TABLE [user_collections] ADD FOREIGN KEY ([collection_type_id]) REFERENCES [collection_types] ([id])
GO
