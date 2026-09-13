CREATE TABLE `moderationActions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int,
	`reviewId` int,
	`moderatorId` int NOT NULL,
	`action` varchar(40) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderationActions_id` PRIMARY KEY(`id`)
);
