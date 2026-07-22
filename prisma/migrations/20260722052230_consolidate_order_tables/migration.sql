/*
  Warnings:

  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItemAddon` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `items` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemAddon" DROP CONSTRAINT "OrderItemAddon_addonId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemAddon" DROP CONSTRAINT "OrderItemAddon_orderItemId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "items" JSONB NOT NULL;

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "OrderItemAddon";
