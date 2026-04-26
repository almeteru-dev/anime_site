package models

import "time"

type Episode struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	AnimeID      int64     `gorm:"not null;index;uniqueIndex:idx_episode_unique" json:"anime_id"`
	ServerNumber int       `gorm:"not null;uniqueIndex:idx_episode_unique" json:"server_number"`
	GroupID      int64     `gorm:"not null;uniqueIndex:idx_episode_unique" json:"group_id"`
	Number       int       `gorm:"not null;uniqueIndex:idx_episode_unique" json:"number"`
	VideoURL     string    `gorm:"not null;type:varchar(500)" json:"video_url"`
	Duration     int       `json:"duration"`
	CreatedAt    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`

	Anime      Anime      `gorm:"foreignKey:AnimeID;constraint:OnDelete:CASCADE" json:"-"`
	VoiceGroup VoiceGroup `gorm:"foreignKey:GroupID" json:"voice_group"`
}
