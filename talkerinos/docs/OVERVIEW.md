# Talkerinos - AI Blog Editing Assistant

## Overview

Talkerinos is an AI-powered blog editing assistant with a split-screen interface. The left side features an AI chatbot, and the right side displays your blog draft. Users can highlight text in the draft, and the AI helps rewrite, enhance, or provide suggestions.

## Core Features

- **Text Selection Editing**: Highlight any portion of your draft and get AI-powered rewrites
- **Contextual Suggestions**: AI understands the full draft context when making suggestions
- **Quick Actions**: One-click buttons for common operations (Enhance, Simplify, Expand, etc.)
- **Inline Accept/Reject**: Review AI suggestions and apply them directly to your draft
- **Chat Mode**: General Q&A about your draft, brainstorming, and writing assistance

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │    Chat Panel       │    │      Draft Editor           │ │
│  │    (React)          │    │      (React)                │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Go)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Chat Handler   │  │  OpenAI Service │  │  Draft Store │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   OpenAI API    │
                    └─────────────────┘
```

## User Flow

1. **Load draft** - Draft appears in the right panel editor
2. **Highlight text** - Chat input shows context, placeholder prompts for action
3. **Type instruction** - Or leave empty for default "enhance" behavior
4. **AI responds** - Provides rewritten text or suggestions
5. **Accept/Reject** - Apply changes directly to editor or dismiss
6. **Chat freely** - Ask questions, brainstorm, get feedback without selection

## Tech Stack

- **Backend**: Go
- **Frontend**: React (or similar)
- **AI**: OpenAI GPT-4 / GPT-4-Turbo
- **Streaming**: Server-Sent Events (SSE) for real-time responses
