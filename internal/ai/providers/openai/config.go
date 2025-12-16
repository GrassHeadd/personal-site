// openai settings
package openai

import (
	"net/http"
	"time"
)

type Config struct {
	APIKey      string
	Model       string
	MaxTokens   int
	Temperature float64
	BaseURL     string
}

func NewClient(cfg Config) *Client {
	baseURL := cfg.BaseURL
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}

	return &Client{
		apiKey:      cfg.APIKey,
		model:       cfg.Model,
		maxTokens:   cfg.MaxTokens,
		temperature: cfg.Temperature,
		baseURL:     baseURL,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}
