-- Add linked_card_id to bugs table (links to kanban_cards)
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS linked_card_id INTEGER REFERENCES kanban_cards(id) ON DELETE SET NULL;

-- Add description_markdown to bugs table for rich text
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS description_markdown TEXT;
