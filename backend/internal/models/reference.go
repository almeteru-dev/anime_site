package models

type Language struct {
	ID   int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Code string `gorm:"unique;not null;type:varchar(10)" json:"code"`
	Name string `gorm:"not null;type:varchar(255)" json:"name"`
}

type Status struct {
	ID   int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"not null;type:varchar(255)" json:"name"`
}

type Source struct {
	ID   int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"not null;type:varchar(255)" json:"name"`
}

type CollectionType struct {
	ID   int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"not null;type:varchar(255)" json:"name"`
}

type Genre struct {
	ID   int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"not null;type:varchar(255)" json:"name"`
}

type Studio struct {
	ID   int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"not null;type:varchar(255)" json:"name"`
}
