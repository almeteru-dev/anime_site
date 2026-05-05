package models

import "time"

type FAQItem struct {
	ID          int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Question    string    `gorm:"not null;type:varchar(500)" json:"question"`
	Answer      string    `gorm:"not null;type:text" json:"answer"`
	IsPublished bool      `gorm:"not null;default:false" json:"is_published"`
	Priority    int       `gorm:"not null;default:0" json:"priority"`
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (FAQItem) TableName() string {
	return "faq_items"
}

