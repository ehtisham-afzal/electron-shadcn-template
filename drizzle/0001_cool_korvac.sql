CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`supabase_id` text NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`notifications` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_supabase_id_unique` ON `user_preferences` (`supabase_id`);--> statement-breakpoint
DROP TABLE `sessions_table`;--> statement-breakpoint
DROP TABLE `users_table`;