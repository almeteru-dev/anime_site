package app

import (
	"log"

	"github.com/seva/animevista/internal/models"
	"gorm.io/gorm"
)

func Seed(db *gorm.DB) {
	log.Println("Seeding database...")

	// 0. Clean-up: Remove languages other than RU and EN
	db.Where("code NOT IN ?", []string{"ru", "en"}).Delete(&models.Language{})

	// 1. Languages
	languages := []models.Language{
		{Code: "ru", Name: "Russian"},
		{Code: "en", Name: "English (Romaji)"},
	}
	for _, lang := range languages {
		db.FirstOrCreate(&lang, models.Language{Code: lang.Code})
	}

	var ru, en models.Language
	db.Where("code = ?", "ru").First(&ru)
	db.Where("code = ?", "en").First(&en)

	// 2. Statuses
	statuses := []struct {
		Name   string
		RUName string
		ENName string
	}{
		{Name: "ongoing", RUName: "Онгоинг", ENName: "Ongoing"},
		{Name: "released", RUName: "Вышло", ENName: "Released"},
	}
	for _, s := range statuses {
		status := models.Status{Name: s.Name}
		db.FirstOrCreate(&status, models.Status{Name: s.Name})

		db.FirstOrCreate(&models.StatusTranslation{
			StatusID:   status.ID,
			LanguageID: ru.ID,
			Name:       s.RUName,
		}, models.StatusTranslation{StatusID: status.ID, LanguageID: ru.ID})

		db.FirstOrCreate(&models.StatusTranslation{
			StatusID:   status.ID,
			LanguageID: en.ID,
			Name:       s.ENName,
		}, models.StatusTranslation{StatusID: status.ID, LanguageID: en.ID})
	}

	// 3. Sources
	sources := []struct {
		Name   string
		RUName string
		ENName string
	}{
		{Name: "manga", RUName: "Манга", ENName: "Manga"},
		{Name: "light_novel", RUName: "Ранобэ", ENName: "Light Novel"},
		{Name: "original", RUName: "Оригинал", ENName: "Original"},
	}
	for _, src := range sources {
		source := models.Source{Name: src.Name}
		db.FirstOrCreate(&source, models.Source{Name: src.Name})

		db.FirstOrCreate(&models.SourceTranslation{
			SourceID:   source.ID,
			LanguageID: ru.ID,
			Name:       src.RUName,
		}, models.SourceTranslation{SourceID: source.ID, LanguageID: ru.ID})

		db.FirstOrCreate(&models.SourceTranslation{
			SourceID:   source.ID,
			LanguageID: en.ID,
			Name:       src.ENName,
		}, models.SourceTranslation{SourceID: source.ID, LanguageID: en.ID})
	}

	// 4. Genres
	genres := []struct {
		Name   string
		RUName string
		ENName string
	}{
		{Name: "Action", RUName: "Экшен", ENName: "Action"},
		{Name: "Comedy", RUName: "Комедия", ENName: "Comedy"},
		{Name: "Drama", RUName: "Драма", ENName: "Drama"},
		{Name: "Fantasy", RUName: "Фэнтези", ENName: "Fantasy"},
		{Name: "Adventure", RUName: "Приключения", ENName: "Adventure"},
	}
	for _, g := range genres {
		genre := models.Genre{Name: g.Name}
		db.FirstOrCreate(&genre, models.Genre{Name: g.Name})

		db.FirstOrCreate(&models.GenreTranslation{
			GenreID:    genre.ID,
			LanguageID: ru.ID,
			Name:       g.RUName,
		}, models.GenreTranslation{GenreID: genre.ID, LanguageID: ru.ID})

		db.FirstOrCreate(&models.GenreTranslation{
			GenreID:    genre.ID,
			LanguageID: en.ID,
			Name:       g.ENName,
		}, models.GenreTranslation{GenreID: genre.ID, LanguageID: en.ID})
	}

	// 5. Studios
	studios := []string{"Madhouse", "MAPPA", "Ufotable", "A-1 Pictures"}
	for _, s := range studios {
		db.FirstOrCreate(&models.Studio{Name: s}, models.Studio{Name: s})
	}

	// 6. Anime
	var releasedStatus models.Status
	db.Where("name = ?", "released").First(&releasedStatus)
	var mangaSource models.Source
	db.Where("name = ?", "manga").First(&mangaSource)
	var madhouse models.Studio
	db.Where("name = ?", "Madhouse").First(&madhouse)

	animeList := []struct {
		Name    string
		URL     string
		RUTitle string
		ENTitle string // Romaji
		RUDesc  string
		ENDesc  string
	}{
		{
			Name:    "Sousou no Frieren",
			URL:     "sousou-no-frieren",
			RUTitle: "Провожающая в последний путь Фрирен",
			ENTitle: "Sousou no Frieren",
			RUDesc:  "История о эльфийке-маге Фрирен и её путешествии после победы над Королем Демонов.",
			ENDesc:  "After the party of heroes defeated the Demon King, they restored peace to the land and returned to lives of solitude.",
		},
		{
			Name:    "Kimetsu no Yaiba",
			URL:     "kimetsu-no-yaiba",
			RUTitle: "Истребитель демонов",
			ENTitle: "Kimetsu no Yaiba",
			RUDesc:  "Тандзиро Камадо становится истребителем демонов, чтобы спасти свою сестру Незуко.",
			ENDesc:  "Tanjirou Kamado's quiet life is shattered when he finds his family slaughtered by a demon.",
		},
		{
			Name:    "Jujutsu Kaisen",
			URL:     "jujutsu-kaisen",
			RUTitle: "Магическая битва",
			ENTitle: "Jujutsu Kaisen",
			RUDesc:  "Юдзи Итадори поглощает проклятый палец и вступает в мир магов.",
			ENDesc:  "Yuji Itadori, a high school student with extraordinary physical abilities, eats a cursed finger.",
		},
		{
			Name:    "Oshi no Ko",
			URL:     "oshi-no-ko",
			RUTitle: "Звёздное дитя",
			ENTitle: "Oshi no Ko",
			RUDesc:  "Закулисье мира айдолов и история о перерождении.",
			ENDesc:  "Dr. Goro is reborn as the son of the young starlet Ai Hoshino after her stalker murders him.",
		},
		{
			Name:    "Solo Leveling",
			URL:     "solo-leveling",
			RUTitle: "Поднятие уровня в одиночку",
			ENTitle: "Ore dake Level Up na Ken",
			RUDesc:  "Слабейший охотник человечества получает уникальную способность повышать свой уровень.",
			ENDesc:  "In a world where hunters must battle deadly monsters to protect mankind, Sung Jinwoo finds himself in a 'Double Dungeon'.",
		},
	}

	for _, a := range animeList {
		anime := models.Anime{
			Name:     a.Name,
			URL:      a.URL,
			StatusID: &releasedStatus.ID,
			SourceID: &mangaSource.ID,
			StudioID: &madhouse.ID,
		}
		db.FirstOrCreate(&anime, models.Anime{URL: a.URL})

		db.FirstOrCreate(&models.AnimeTranslation{
			AnimeID:     anime.ID,
			LanguageID:  ru.ID,
			Title:       a.RUTitle,
			Description: a.RUDesc,
		}, models.AnimeTranslation{AnimeID: anime.ID, LanguageID: ru.ID})

		db.FirstOrCreate(&models.AnimeTranslation{
			AnimeID:     anime.ID,
			LanguageID:  en.ID,
			Title:       a.ENTitle,
			Description: a.ENDesc,
		}, models.AnimeTranslation{AnimeID: anime.ID, LanguageID: en.ID})
	}

	log.Println("Seeding completed successfully")
}
