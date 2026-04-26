package models

type KindOption struct {
	ID   int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"not null;unique;type:varchar(50)" json:"name"`
}

func (KindOption) TableName() string {
	return "kind_options"
}

