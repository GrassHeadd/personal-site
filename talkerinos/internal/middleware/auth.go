package middleware

import (
	"os"

	"github.com/gin-gonic/gin"
)

func RequireAPIKey() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" || apiKey != os.Getenv("API_KEY") {
			c.JSON(401, gin.H{"error": "Unauthorised"})
			c.Abort()
		}
		c.Next()
	}
}
