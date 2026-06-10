// Package ai defines the core types and interfaces for AI-powered chat functionality.
package ai

import (
	"context"
)

// ChatService defines the interface that all AI services must implement.
// This abstraction allows the handler to work with any AI backend (OpenAI, Anthropic, etc.)
// without knowing the implementation details.
//
// Example usage:
//
//	chunks, err := service.ChatStream(ctx, req)
//	if err != nil {
//	    return err
//	}
//	for chunk := range chunks {
//	    // send chunk to client
//	}
type ChatService interface {
	// ChatStream sends a chat request and returns a channel of response chunks.
	// The channel is closed when the response is complete or an error occurs.
	// Returns an error if the stream fails to start (e.g., invalid API key, network error).
	// Mid-stream errors are sent via ChatResponseChunk.Error field.
	ChatStream(ctx context.Context, req ChatRequest) (<-chan ChatResponseChunk, error)
}
