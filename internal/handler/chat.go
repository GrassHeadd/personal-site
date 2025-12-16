package handler

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"

	"talkerinos/internal/ai"
	"talkerinos/internal/ai/prompt"
)

// ChatHandler handles AI chat requests.
type ChatHandler struct {
	service ai.ChatService
	prompts *prompt.Builder
}

// NewChatHandler creates a new ChatHandler.
func NewChatHandler(service ai.ChatService, prompts *prompt.Builder) *ChatHandler {
	return &ChatHandler{
		service: service,
		prompts: prompts,
	}
}

// ChatRequest is the expected JSON body for chat requests.
type ChatRequest struct {
	Message      string       `json:"message"`
	SelectedText *string      `json:"selectedText"`
	FullDraft    *string      `json:"fullDraft"`
	History      []ai.Message `json:"history"`
}

// Chat handles POST /api/chat - streams AI response via SSE.
func (h *ChatHandler) Chat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Build AI request
	aiReq := ai.ChatRequest{
		Message:             req.Message,
		SelectedText:        req.SelectedText,
		FullDraft:           req.FullDraft,
		ConversationHistory: req.History,
	}

	// Get stream from AI service
	chunks, err := h.service.ChatStream(c.Request.Context(), aiReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Set headers for SSE
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	// Stream chunks to client
	c.Stream(func(w io.Writer) bool {
		chunk, ok := <-chunks
		if !ok {
			return false
		}

		// Send chunk as SSE event
		data, _ := json.Marshal(chunk)
		c.SSEvent("message", string(data))

		return !chunk.Done
	})
}
