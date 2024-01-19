CREATE TABLE `authors` (
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `books` (
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`subtitle` text NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `book_authors` (
	`author_id` text NOT NULL,
	`book_id` text NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `book_id_author_id_idx` ON `book_authors` (`book_id`,`author_id`);