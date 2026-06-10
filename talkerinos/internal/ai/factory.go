package ai

// Config holds the settings needed to create an AI provider.
// Loaded from environment variables in main.go.
type Config struct {
	Provider string // "openai" or "claude"
	APIKey   string // API key for the provider
	Model    string // Model name (e.g. "gpt-4-turbo", "claude-3-opus")
}
