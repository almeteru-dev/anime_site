package service

import (
	"errors"
	"fmt"
	"html"
	"os"
	"strings"
	"sync"

	"github.com/resend/resend-go/v3"
)

const resendFrom = "Lycoris TV <noreply@lycoris.tv>"

var ErrResendNotConfigured = errors.New("RESEND_API_KEY is not set")

var (
	resendMu        sync.Mutex
	resendClient    *resend.Client
	resendClientKey string
)

func getResendClient() (*resend.Client, error) {
	apiKey := strings.TrimSpace(os.Getenv("RESEND_API_KEY"))
	if apiKey == "" {
		return nil, ErrResendNotConfigured
	}

	resendMu.Lock()
	defer resendMu.Unlock()
	if resendClient == nil || resendClientKey != apiKey {
		resendClient = resend.NewClient(apiKey)
		resendClientKey = apiKey
	}
	return resendClient, nil
}

func SendVerificationEmail(toEmail string, verificationLink string) error {
	toEmail = strings.TrimSpace(toEmail)
	verificationLink = strings.TrimSpace(verificationLink)
	if toEmail == "" {
		return errors.New("toEmail is required")
	}
	if verificationLink == "" {
		return errors.New("verificationLink is required")
	}

	client, err := getResendClient()
	if err != nil {
		return err
	}

	safeLink := html.EscapeString(verificationLink)
	params := &resend.SendEmailRequest{
		From:    resendFrom,
		To:      []string{toEmail},
		Subject: "Verify your email address",
		Html:    fmt.Sprintf("<p>Please click the link below to verify your email address.</p><p><a href=\"%s\">%s</a></p>", safeLink, safeLink),
	}

	_, err = client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("send verification email: %w", err)
	}
	return nil
}
