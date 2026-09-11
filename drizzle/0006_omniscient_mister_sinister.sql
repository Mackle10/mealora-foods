CREATE TABLE `reviewReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`reporterId` int NOT NULL,
	`reason` varchar(240) NOT NULL,
	`status` enum('open','dismissed','actioned') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `reviewReports_id` PRIMARY KEY(`id`),
	CONSTRAINT `review_reports_review_reporter_unique` UNIQUE(`reviewId`,`reporterId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','courier','restaurant_owner') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `restaurants` ADD `ownerVerified` int DEFAULT 0 NOT NULL;