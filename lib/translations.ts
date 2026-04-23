export type Locale = "en" | "ru"

export const translations = {
  en: {
    // Navbar
    nav: {
      catalog: "Catalog",
      collections: "Collections",
      schedule: "Schedule",
      signIn: "Sign In",
      searchPlaceholder: "Search anime...",
    },
    // Hero Section
    hero: {
      watchNow: "Watch Now",
      moreInfo: "More Info",
      episodes: "Episodes",
    },
    // Home Page Sections
    home: {
      latestEpisodes: "Latest Episodes",
      trendingNow: "Trending Now",
      topRated: "Top Rated",
      seasonalAnime: "Seasonal Anime",
      viewAll: "View All",
    },
    // Login Page
    login: {
      welcomeBack: "Welcome Back",
      signInContinue: "Sign in to continue your anime journey",
      usernameOrEmail: "Username or Email",
      enterUsernameOrEmail: "Enter your username or email",
      password: "Password",
      enterPassword: "Enter your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot Password?",
      signingIn: "Signing In...",
      loginButton: "Login",
      newToAnimeVista: "New to AnimeVista?",
      joinNow: "Join now",
      backToHome: "Back to Home",
    },
    // Register Page
    register: {
      joinTheVista: "Join the Vista",
      createAccountStart: "Create your account and start streaming",
      username: "Username",
      enterUsername: "Enter your username",
      emailAddress: "Email Address",
      enterEmail: "Enter your email",
      password: "Password",
      createPassword: "Create a password",
      confirmPassword: "Confirm Password",
      confirmYourPassword: "Confirm your password",
      agreeToTerms: "I agree to the",
      termsOfService: "Terms of Service",
      createAccount: "Create Account",
      alreadyMember: "Already a member?",
      login: "Login",
      backToHome: "Back to Home",
    },
    // Footer
    footer: {
      tagline: "Your gateway to endless anime adventures",
      termsOfService: "Terms of Service",
      dmca: "DMCA",
      contact: "Contact",
      faq: "FAQ",
      copyright: "All rights reserved.",
      disclaimer: "AnimeVista does not store any files on its servers. All content is provided by non-affiliated third parties.",
    },
    // Common
    common: {
      loading: "Loading...",
      error: "Error",
      retry: "Retry",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      ago: "ago",
    },
    // Language
    language: {
      en: "English",
      ru: "Russian",
      selectLanguage: "Select Language",
    },
  },
  ru: {
    // Navbar
    nav: {
      catalog: "Каталог",
      collections: "Коллекции",
      schedule: "Расписание",
      signIn: "Войти",
      searchPlaceholder: "Поиск аниме...",
    },
    // Hero Section
    hero: {
      watchNow: "Смотреть",
      moreInfo: "Подробнее",
      episodes: "Серий",
    },
    // Home Page Sections
    home: {
      latestEpisodes: "Новые серии",
      trendingNow: "В тренде",
      topRated: "Лучшие",
      seasonalAnime: "Сезонное аниме",
      viewAll: "Смотреть все",
    },
    // Login Page
    login: {
      welcomeBack: "С возвращением",
      signInContinue: "Войдите, чтобы продолжить просмотр",
      usernameOrEmail: "Имя пользователя или Email",
      enterUsernameOrEmail: "Введите имя пользователя или email",
      password: "Пароль",
      enterPassword: "Введите ваш пароль",
      rememberMe: "Запомнить меня",
      forgotPassword: "Забыли пароль?",
      signingIn: "Вход...",
      loginButton: "Войти",
      newToAnimeVista: "Впервые на AnimeVista?",
      joinNow: "Присоединиться",
      backToHome: "На главную",
    },
    // Register Page
    register: {
      joinTheVista: "Присоединиться к Vista",
      createAccountStart: "Создайте аккаунт и начните просмотр",
      username: "Имя пользователя",
      enterUsername: "Введите имя пользователя",
      emailAddress: "Email адрес",
      enterEmail: "Введите ваш email",
      password: "Пароль",
      createPassword: "Создайте пароль",
      confirmPassword: "Подтвердите пароль",
      confirmYourPassword: "Подтвердите ваш пароль",
      agreeToTerms: "Я согласен с",
      termsOfService: "Условиями использования",
      createAccount: "Создать аккаунт",
      alreadyMember: "Уже есть аккаунт?",
      login: "Войти",
      backToHome: "На главную",
    },
    // Footer
    footer: {
      tagline: "Ваш путь к бесконечным аниме приключениям",
      termsOfService: "Условия использования",
      dmca: "DMCA",
      contact: "Контакты",
      faq: "FAQ",
      copyright: "Все права защищены.",
      disclaimer: "AnimeVista не хранит файлы на своих серверах. Весь контент предоставляется сторонними источниками.",
    },
    // Common
    common: {
      loading: "Загрузка...",
      error: "Ошибка",
      retry: "Повторить",
      cancel: "Отмена",
      save: "Сохранить",
      delete: "Удалить",
      edit: "Редактировать",
      close: "Закрыть",
      ago: "назад",
    },
    // Language
    language: {
      en: "Английский",
      ru: "Русский",
      selectLanguage: "Выбрать язык",
    },
  },
} as const

export type TranslationKeys = typeof translations.en
