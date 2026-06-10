package prompt

import (
	"fmt"

	"talkerinos/internal/ai"
)

// Builder assembles prompts with context for AI requests.
type Builder struct {
	loader *Loader
}

// NewBuilder creates a new Builder with the given Loader.
func NewBuilder(loader *Loader) *Builder {
	return &Builder{loader: loader}
}

// BuildMessages creates the message array for an AI request.
// Includes system prompt, draft context, conversation history, and current message.
func (b *Builder) BuildMessages(req ai.ChatRequest) ([]ai.Message, error) {
	var messages []ai.Message

	// Load and add system prompt
	systemPrompt, err := b.loader.Load("system")
	if err != nil {
		return nil, fmt.Errorf("failed to load system prompt: %w", err)
	}
	messages = append(messages, ai.Message{
		Role:    "system",
		Content: systemPrompt,
	})

	// Add draft context if provided
	if req.FullDraft != nil && *req.FullDraft != "" {
		messages = append(messages, ai.Message{
			Role:    "system",
			Content: fmt.Sprintf("Here is the blog draft for context:\n\n%s", *req.FullDraft),
		})
	}

	// Add conversation history
	for _, msg := range req.ConversationHistory {
		messages = append(messages, msg)
	}

	// Build current user message
	userMessage := req.Message
	if req.SelectedText != nil && *req.SelectedText != "" {
		// If no message but has selection, use default enhance prompt
		if userMessage == "" {
			enhancePrompt, err := b.loader.Load("enhance")
			if err != nil {
				userMessage = "Enhance this text."
			} else {
				userMessage = enhancePrompt
			}
		}
		userMessage = fmt.Sprintf("[Selected text: \"%s\"]\n\n%s", *req.SelectedText, userMessage)
	}

	messages = append(messages, ai.Message{
		Role:    "user",
		Content: userMessage,
	})

	return messages, nil
}
