package models

import (
	"time"
)

type Anime struct {
	ID            int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	StudioID      *int      `json:"studio_id"`
	StatusID      *int      `json:"status_id"`
	SourceID      *int      `json:"source_id"`
	Name          string    `gorm:"not null;type:varchar(255)" json:"name"`
	Kind          string    `gorm:"type:varchar(50)" json:"kind"`
	URL           string    `gorm:"unique;not null;type:varchar(255)" json:"url"`
	Duration      int       `json:"duration"`
	Rating        string    `gorm:"type:varchar(50)" json:"rating"`
	ImageURL      string    `gorm:"column:image;type:varchar(500)" json:"image_url"`
	Score         float64   `gorm:"type:decimal(3,2);default:0" json:"score"`
	Episodes      int       `gorm:"default:0" json:"episodes"`
	EpisodesAired int       `gorm:"default:0" json:"episodes_aired"`
	AiredOn       *time.Time `json:"aired_on"`
	ReleasedOn    *time.Time `json:"released_on"`

	Studio   *Studio   `gorm:"foreignKey:StudioID" json:"studio,omitempty"`
	Status   *Status   `gorm:"foreignKey:StatusID" json:"status,omitempty"`
	Source   *Source   `gorm:"foreignKey:SourceID" json:"source,omitempty"`
	Genres   []Genre   `gorm:"many2many:anime_genres;" json:"genres,omitempty"`
	Translations []AnimeTranslation `gorm:"foreignKey:AnimeID" json:"translations,omitempty"`
}

type AnimeTranslation struct {
	ID          int64    `gorm:"primaryKey;autoIncrement" json:"id"`
	AnimeID     int64    `gorm:"not null" json:"anime_id"`
	LanguageID  int      `gorm:"not null" json:"language_id"`
	Title       string   `gorm:"not null;type:varchar(255)" json:"title"`
	Description string   `gorm:"type:text" json:"description"`
	Anime       Anime    `gorm:"foreignKey:AnimeID" json:"-"`
	Language    Language `gorm:"foreignKey:LanguageID" json:"language"`
}
