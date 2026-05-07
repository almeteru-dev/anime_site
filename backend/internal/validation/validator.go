package validation

import (
    "errors"
    "regexp"
)

// ValidateUsername проверяет логин (4-30 симв, англ, цифры, спецсимволы)
func ValidateUsername(username string) error {
    if len(username) < 4 || len(username) > 30 {
        return errors.New("username must be between 4 and 30 characters")
    }
    // Регулярка только для разрешенных символов
    var validUsername = regexp.MustCompile(`^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$`)
    if !validUsername.MatchString(username) {
        return errors.New("username contains invalid characters or cyrillic")
    }
    return nil
}

// ValidatePassword проверяет пароль (8-100 симв)
func ValidatePassword(password string) error {
    if len(password) < 8 || len(password) > 100 {
        return errors.New("password must be between 8 and 100 characters")
    }
    return nil
}
