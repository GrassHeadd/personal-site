-- name: CreatePost :one
INSERT INTO posts (id, title, slug, content, published, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetPostByID :one
SELECT * FROM posts WHERE id = $1;

-- name: GetPostBySlug :one
SELECT * FROM posts WHERE slug = $1;

-- name: ListPosts :many
SELECT * FROM posts WHERE published = true ORDER BY created_at DESC;

-- name: ListDrafts :many
SELECT * FROM posts WHERE published = false ORDER BY created_at DESC;

-- name: UpdatePost :one
UPDATE posts SET title = $2, slug = $3, content = $4, published = $5, updated_at = $6
WHERE id = $1
RETURNING *;

-- name: DeletePost :exec
DELETE FROM posts WHERE id = $1;
