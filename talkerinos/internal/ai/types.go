package ai

// Message represents a single turn in a conversation.
// Used to build conversation history for context.
type Message struct {
	Role         string  // "user", "assistant", or "system"
	Content      string  // The actual message text
	SelectedText *string // Text highlighted when this message was sent (nil if none)
}

// ChatRequest contains everything needed to make a chat request to an AI provider.
// Built by the handler from the incoming HTTP request.
type ChatRequest struct {
	Message             string    // Current user message (can be empty if SelectedText exists)
	SelectedText        *string   // Currently highlighted text to rewrite (nil if none)
	FullDraft           *string   // The entire blog post for context (nil if not provided)
	ConversationHistory []Message // Previous messages in the conversation
}

// Suggestion represents a proposed text replacement.
// Returned when the user had text selected and the AI rewrote it.
type Suggestion struct {
	Original  string // The text that was selected
	Rewritten string // The AI's improved version
}

// ChatResponseChunk represents a piece of a streaming response.
// Chunks are sent over a channel as the AI generates text.
type ChatResponseChunk struct {
	Content    string      // Partial text (empty on final chunk)
	Done       bool        // True if this is the final chunk
	Error      *string     // Non-nil if an error occurred mid-stream
	Suggestion *Suggestion // Included in final chunk if there was selected text
}
