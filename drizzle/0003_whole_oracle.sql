CREATE TABLE `smsNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`eventKey` varchar(80) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`message` text NOT NULL,
	`status` enum('queued','sent','failed') NOT NULL DEFAULT 'queued',
	`providerReference` varchar(160),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`sentAt` timestamp,
	CONSTRAINT `smsNotifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `smsNotifications_eventKey_unique` UNIQUE(`eventKey`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `smsPhone` varchar(40);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(40);