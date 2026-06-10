package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"talkerinos/internal/database"
)

type Handler struct {
	db *database.Queries
}

func New(db *database.Queries) *Handler {
	return &Handler{db: db}
}

func (h *Handler) ListPosts(c *gin.Context) {
	posts, err := h.db.ListPosts(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, posts)
}

func (h *Handler) ListDrafts(c *gin.Context) {
	posts, err := h.db.ListDrafts(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, posts)
}

func (h *Handler) AddPosts(c *gin.Context) {
	var req struct {
		Title   string `json:"title"`
		Slug    string `json:"slug"`
		Content string `json:"content"`
	}

	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(400, gin.H{"err": "invalid request"})
		return
	}

	post, err := h.db.CreatePost(c, database.CreatePostParams{
		ID:        uuid.New(),
		Title:     req.Title,
		Slug:      req.Slug,
		Content:   req.Content,
		Published: false,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, post)
}

func (h *Handler) GetPost(c *gin.Context) {
	idStr := c.Param("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid id"})
		return
	}

	post, err := h.db.GetPostByID(c, id)
	if err != nil {
		c.JSON(404, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(200, post)
}
func (h *Handler) GetPostBySlug(c *gin.Context) {
	slug := c.Param("slug")

	post, err := h.db.GetPostBySlug(c, slug)
	if err != nil {
		c.JSON(404, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(200, post)
}

func (h *Handler) UpdatePost(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid id"})
		return
	}

	var req struct {
		Title     string `json:"title"`
		Slug      string `json:"slug"`
		Content   string `json:"content"`
		Published bool   `json:"published"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	post, err := h.db.UpdatePost(c, database.UpdatePostParams{
		ID:        id,
		Title:     req.Title,
		Slug:      req.Slug,
		Content:   req.Content,
		Published: req.Published,
		UpdatedAt: time.Now(),
	})
	if err != nil {
		c.JSON(404, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(200, post)
}
func (h *Handler) DeletePost(c *gin.Context) {
	idStr := c.Param("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid id"})
		return
	}

	err = h.db.DeletePost(c, id)
	if err != nil {
		c.JSON(404, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(200, gin.H{"message": "deleted"})

}
