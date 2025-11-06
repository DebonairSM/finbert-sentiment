CREATE TABLE `news_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`headline` text NOT NULL,
	`summary` text,
	`source` text,
	`url` text,
	`published_at` integer,
	`raw_text` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sentiment_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer NOT NULL,
	`label` text NOT NULL,
	`score_positive` real DEFAULT 0 NOT NULL,
	`score_neutral` real DEFAULT 0 NOT NULL,
	`score_negative` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `news_articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `watchlist_symbols` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`asset_type` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `symbol_url_idx` ON `news_articles` (`symbol`,`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `watchlist_symbols_symbol_unique` ON `watchlist_symbols` (`symbol`);