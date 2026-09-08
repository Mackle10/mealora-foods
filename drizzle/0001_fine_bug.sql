CREATE TABLE `deliveryAddresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(60) NOT NULL,
	`recipientName` varchar(160) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(120) NOT NULL,
	`instructions` text,
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveryAddresses_id` PRIMARY KEY(`id`),
	CONSTRAINT `delivery_addresses_user_label_unique` UNIQUE(`userId`,`label`)
);
--> statement-breakpoint
CREATE TABLE `signupRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactType` enum('email','phone') NOT NULL,
	`contact` varchar(320) NOT NULL,
	`name` varchar(160) NOT NULL,
	`status` enum('pending','started') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signupRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentMethod` enum('cash_on_delivery','mtn_momo','airtel_money','card') DEFAULT 'cash_on_delivery' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentStatus` enum('pending','initiated','paid','failed') DEFAULT 'pending' NOT NULL;