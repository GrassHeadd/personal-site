// make api calls
package openai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"talkerinos/internal/ai"
)

// Client implements ai.ChatService for OpenAI's API.
type Client struct {
	apiKey      string
	model       string
	maxTokens   int
	temperature float64
	baseURL     string
	httpClient  *http.Client
}

// ChatStream sends a chat request to OpenAI and streams the response.
func (c *Client) ChatStream(ctx context.Context, req ai.ChatRequest) (<-chan ai.ChatResponseChunk, error) {
	//Build message array for OpenAI
	var msgs []Message

	// Add system prompt with draft context if provided
	systemContent := "You are a helpful blog editing assistant. Help improve the user's writing. Use plain text only, no markdown."
	if req.FullDraft != nil && *req.FullDraft != "" {
		systemContent += fmt.Sprintf("\n\nHere is the full blog draft for context:\n\n%s", *req.FullDraft)
	}
	msgs = append(msgs, Message{
		Role:    "system",
		Content: systemContent,
	})

	// Add convo history
	for _, msg := range req.ConversationHistory {
		msgs = append(msgs, Message{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	// Build current user message with selected text
	userMessage := req.Message
	if req.SelectedText != nil && *req.SelectedText != "" {
		if userMessage == "" {
			userMessage = "Enhance this text - make it clearer and more engaging."
		}
		userMessage = fmt.Sprintf("[Selected text to improve]:\n%s\n\n[Instruction]: %s", *req.SelectedText, userMessage)
	}

	// Add current msg
	msgs = append(msgs, Message{
		Role:    "user",
		Content: userMessage,
	})

	openaiReq := Request{
		Model:     c.model,
		Messages:  msgs,
		Stream:    true,
		MaxTokens: c.maxTokens,
	}
	body, err := json.Marshal(openaiReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create http request
	httpReq, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("Openai request failed: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	// Send request
	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	// Create channel for chunks
	chunks := make(chan ai.ChatResponseChunk, 100)

	// Read stream in background goroutine
	go func() {
		defer close(chunks)
		defer resp.Body.Close()

		reader := bufio.NewReader(resp.Body)

		for {
			// Read one line
			line, err := reader.ReadString('\n')
			if err != nil {
				// Stream ended
				chunks <- ai.ChatResponseChunk{Done: true}
				return
			}

			line = strings.TrimSpace(line)

			// Skip empty lines
			if line == "" || !strings.HasPrefix(line, "data: ") {
				continue
			}

			// Get the JSON part
			data := strings.TrimPrefix(line, "data: ")

			// Check if done
			if data == "[DONE]" {
				chunks <- ai.ChatResponseChunk{Done: true}
				return
			}

			// Parse JSON
			var streamResp StreamResponse
			if err := json.Unmarshal([]byte(data), &streamResp); err != nil {
				continue
			}

			// Send chunk if there's content
			if len(streamResp.Choices) > 0 && streamResp.Choices[0].Delta.Content != "" {
				chunks <- ai.ChatResponseChunk{
					Content: streamResp.Choices[0].Delta.Content,
				}
			}
		}
	}()

	return chunks, nil

}
