// openai api shapes
package openai

// Request is what we send to OpenAI's chat completions API.
type Request struct {
	Model     string    `json:"model"`
	Messages  []Message `json:"messages"`
	Stream    bool      `json:"stream"`
	MaxTokens int       `json:"max_tokens"`
}

// Message is a single message in the conversation.
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// StreamResponse is what OpenAI sends back when streaming.
type StreamResponse struct {
	Choices []Choice `json:"choices"`
}

// Choice contains the response content.
type Choice struct {
	Delta        Delta   `json:"delta"`
	FinishReason *string `json:"finish_reason"`
}

// Delta contains the incremental content in a streaming response.
type Delta struct {
	Content string `json:"content"`
}
