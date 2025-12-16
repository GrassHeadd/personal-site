# Backend Specification

## API Endpoints

### POST `/api/chat`

Main endpoint for AI chat interactions.

**Request Body:**
```json
{
  "message": "string",
  "selectedText": "string | null",
  "fullDraft": "string | null",
  "conversationHistory": [
    {
      "role": "user | assistant",
      "content": "string",
      "selectedText": "string | null",
      "timestamp": "ISO 8601 datetime"
    }
  ]
}
```

**Response (Streaming via SSE):**
```json
{
  "response": "string",
  "suggestion": {
    "original": "string",
    "rewritten": "string"
  } | null
}
```

**Behavior:**
- When `selectedText` is provided: AI focuses on rewriting/improving that portion
- When `selectedText` is empty/null: AI provides general suggestions or answers questions
- When `message` is empty but `selectedText` exists: Default to "enhance this text"

---

## Data Models

### Message
```go
type Message struct {
    Role         string    `json:"role"`         // "user" or "assistant"
    Content      string    `json:"content"`
    SelectedText *string   `json:"selectedText"` // text that was highlighted when sent
    Timestamp    time.Time `json:"timestamp"`
}
```

### ChatRequest
```go
type ChatRequest struct {
    Message             string    `json:"message"`
    SelectedText        *string   `json:"selectedText"`
    FullDraft           *string   `json:"fullDraft"`
    ConversationHistory []Message `json:"conversationHistory"`
}
```

### ChatResponse
```go
type ChatResponse struct {
    Response   string      `json:"response"`
    Suggestion *Suggestion `json:"suggestion"`
}

type Suggestion struct {
    Original  string `json:"original"`
    Rewritten string `json:"rewritten"`
}
```

---

## OpenAI Integration

### System Prompt
```
You are a helpful blog editing assistant. Your job is to help writers improve their drafts.

When the user highlights text and asks for help:
- Provide a rewritten version that improves clarity, flow, and engagement
- Keep the original voice and style
- If asked to "enhance" with no other instruction, make it more polished and professional

When no text is highlighted:
- Answer questions about the draft
- Provide general feedback and suggestions
- Help with brainstorming and ideation

Always be concise and actionable in your responses.
```

### Model Selection
- Primary: `gpt-4-turbo` (balance of quality and speed)
- Fallback: `gpt-4` (higher quality, slower)
- Budget option: `gpt-3.5-turbo` (faster, cheaper, lower quality)

### Context Building
1. Include system prompt
2. Include full draft (if provided) as context
3. Include conversation history (last N messages to stay within token limits)
4. Include current message with selected text context

---

## Service Layer

### OpenAIService
```go
type OpenAIService interface {
    Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error)
    ChatStream(ctx context.Context, req ChatRequest) (<-chan string, error)
}
```

### Implementation Notes
- Use streaming for real-time response display
- Implement retry logic with exponential backoff
- Handle rate limits gracefully
- Log token usage for cost tracking

---

## Handler Layer

### ChatHandler
- Parse and validate request
- Build context from draft and history
- Call OpenAI service
- Stream response back via SSE

### SSE Response Format
```
event: message
data: {"chunk": "partial response text"}

event: done
data: {"suggestion": {"original": "...", "rewritten": "..."}}
```

---

## Configuration

### Environment Variables
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo
OPENAI_MAX_TOKENS=2048
OPENAI_TEMPERATURE=0.7
```

---

## Rate Limiting

- Per-user rate limit: 20 requests/minute
- Global rate limit: 100 requests/minute
- Token budget per request: 4096 tokens (input + output)

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

### Error Codes
- `INVALID_REQUEST` - Malformed request body
- `RATE_LIMITED` - Too many requests
- `OPENAI_ERROR` - OpenAI API failure
- `CONTEXT_TOO_LARGE` - Draft + history exceeds token limit
- `INTERNAL_ERROR` - Unexpected server error

---

## Use Cases

### Case 1: User highlights text + types instruction
```
SelectedText: "This is my rambling paragraph..."
Message: "make it shorter"
```
Response chunks stream in, final chunk includes Suggestion with original + rewritten text.
Frontend shows Accept/Reject buttons.

### Case 2: User highlights text, no instruction (default enhance)
```
SelectedText: "Some text"
Message: ""
```
Same as Case 1 - provider uses default "enhance" behavior.

### Case 3: User types question, no highlight
```
SelectedText: nil
Message: "Is my intro too long?"
```
Response chunks stream in, no Suggestion in final chunk.
Just a chat response, no Accept/Reject.

### Case 4: Error mid-stream
Connection drops or API fails during streaming.
Chunk with Error field set, frontend shows error message.

---

## Future Considerations (v2+)

### Case 5: User highlights text from conversation history
- Revisit/refine a previous AI suggestion
- Track which message the selection came from

### Case 6: Multiple selections
- Highlight multiple disconnected parts
- SelectedText becomes []string

### Case 7: Selection with position context
- Start/end index of selection in draft
- Auto-apply suggestion to correct position

### Case 8: Quick actions
- "Enhance", "Simplify", "Expand", "Make Concise" buttons
- Add Action field to ChatRequest instead of relying on Message
