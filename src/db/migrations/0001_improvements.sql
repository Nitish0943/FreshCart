CREATE TABLE `delivery_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`driver_id` text NOT NULL,
	`status` text DEFAULT 'ASSIGNED' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`driver_id`) REFERENCES `delivery_boys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `delivery_batches_driver_idx` ON `delivery_batches` (`driver_id`);
--> statement-breakpoint
CREATE INDEX `delivery_batches_status_idx` ON `delivery_batches` (`status`);
--> statement-breakpoint
CREATE TABLE `addresses_new` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`label` text NOT NULL,
	`address` text NOT NULL,
	`landmark` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`pincode` text NOT NULL,
	`is_default` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `addresses_new` (`id`, `user_id`, `label`, `address`, `city`, `state`, `pincode`, `is_default`, `created_at`, `updated_at`, `deleted_at`)
SELECT `id`, `user_id`, 'Home', `address_line`, `city`, `state`, `zip_code`, `is_default`, `created_at`, `updated_at`, `deleted_at` FROM `addresses`;
--> statement-breakpoint
DROP TABLE `addresses`;
--> statement-breakpoint
ALTER TABLE `addresses_new` RENAME TO `addresses`;
--> statement-breakpoint
CREATE INDEX `addresses_user_idx` ON `addresses` (`user_id`);
--> statement-breakpoint
CREATE TABLE `orders_new` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`address_id` text NOT NULL,
	`total_amount` real NOT NULL,
	`status` text DEFAULT 'RECEIVED' NOT NULL,
	`payment_status` text DEFAULT 'PENDING' NOT NULL,
	`payment_method` text DEFAULT 'COD' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`deleted_at` text,
	`batch_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`batch_id`) REFERENCES `delivery_batches`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `orders_new` (`id`, `user_id`, `address_id`, `total_amount`, `status`, `payment_status`, `payment_method`, `created_at`, `updated_at`, `deleted_at`)
SELECT `id`, `user_id`, IFNULL(`address_id`, 'dummy'), CAST(`total_amount` AS REAL) / 100.0, `status`, `payment_status`, `payment_method`, `created_at`, `updated_at`, `deleted_at` FROM `orders`;
--> statement-breakpoint
DROP TABLE `orders`;
--> statement-breakpoint
ALTER TABLE `orders_new` RENAME TO `orders`;
--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`user_id`);
--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);
--> statement-breakpoint
CREATE TABLE `order_items_new` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `order_items_new` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `created_at`, `updated_at`)
SELECT `id`, `order_id`, `product_id`, `quantity`, CAST(`unit_price` AS REAL) / 100.0, `created_at`, `updated_at` FROM `order_items`;
--> statement-breakpoint
DROP TABLE `order_items`;
--> statement-breakpoint
ALTER TABLE `order_items_new` RENAME TO `order_items`;
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);
--> statement-breakpoint
CREATE INDEX `order_items_product_idx` ON `order_items` (`product_id`);
--> statement-breakpoint
CREATE TABLE `products_new` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`price` real NOT NULL,
	`sku` text NOT NULL,
	`stock_qty` integer DEFAULT 0 NOT NULL,
	`unit` text DEFAULT 'pcs' NOT NULL,
	`image_url` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `products_new` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `sku`, `stock_qty`, `unit`, `image_url`, `is_active`, `created_at`, `updated_at`, `deleted_at`)
SELECT `id`, `category_id`, `name`, `slug`, `description`, CAST(`price` AS REAL) / 100.0, `sku`, `stock_qty`, `unit`, `image_url`, `is_active`, `created_at`, `updated_at`, `deleted_at` FROM `products`;
--> statement-breakpoint
DROP TABLE `products`;
--> statement-breakpoint
ALTER TABLE `products_new` RENAME TO `products`;
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_idx` ON `products` (`slug`);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_idx` ON `products` (`sku`);
--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);
