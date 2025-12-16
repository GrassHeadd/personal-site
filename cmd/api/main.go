package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"talkerinos/internal/ai"
	"talkerinos/internal/ai/prompt"
	"talkerinos/internal/ai/providers/openai"
	"talkerinos/internal/database"
	"talkerinos/internal/handler"
	"talkerinos/internal/router"
)

func main() {
	_ = godotenv.Load(".env")

	portStr := os.Getenv("PORT")
	if portStr == "" {
		log.Fatal("PORT not found in the environment")
	}

	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL not found in the environment")
	}

	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}

	// Setup AI chat service
	aiProvider := os.Getenv("AI_PROVIDER")
	if aiProvider == "" {
		aiProvider = "openai"
	}
	aiModel := os.Getenv("AI_MODEL")
	if aiModel == "" {
		aiModel = "gpt-4-turbo"
	}

	var chatService ai.ChatService
	switch aiProvider {
	case "openai":
		chatService = openai.NewClient(openai.Config{
			APIKey:    os.Getenv("OPENAI_API_KEY"),
			Model:     aiModel,
			MaxTokens: 2048,
		})
	default:
		log.Fatalf("Unknown AI provider: %s", aiProvider)
	}

	// Setup prompt builder
	promptLoader := prompt.NewLoader("internal/ai/prompt/templates")
	promptBuilder := prompt.NewBuilder(promptLoader)

	// Setup handlers
	h := handler.New(database.New(conn))
	chatHandler := handler.NewChatHandler(chatService, promptBuilder)

	r := router.New(h, chatHandler)

	fmt.Println("Server starting on port:", portStr)
	r.Run(":" + portStr)
}
