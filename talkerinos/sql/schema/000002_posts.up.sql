  CREATE TABLE posts (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      published BOOLEAN NOT NULL DEFAULT false,
      published_at TIMESTAMPTZ,              -- NULL until published
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
