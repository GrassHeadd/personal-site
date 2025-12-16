// Package prompt handles loading and building prompts for AI chat.
package prompt

import (
	"fmt"
	"os"
	"path/filepath"
)

// Loader reads prompt templates from .md files.
type Loader struct {
	templateDir string
}

// NewLoader creates a new Loader that reads from the given directory.
func NewLoader(templateDir string) *Loader {
	return &Loader{
		templateDir: templateDir,
	}
}

// Load reads a prompt template by name (without .md extension).
func (l *Loader) Load(name string) (string, error) {
	path := filepath.Join(l.templateDir, name+".md")
	data, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("failed to load prompt %s: %w", name, err)
	}
	return string(data), nil
}
