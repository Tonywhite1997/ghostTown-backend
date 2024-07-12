/*
  Warnings:

  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GENDER" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "GENDER" NOT NULL;
