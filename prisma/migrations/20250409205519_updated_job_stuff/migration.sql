/*
  Warnings:

  - The values [WAITING_FOR_LISTER,DECLINED_BY_LISTER] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JobStatus_new" AS ENUM ('WAITING_FOR_WORKER', 'IN_PROGRESS', 'COMPLETED');
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus_new" USING ("status"::text::"JobStatus_new");
ALTER TYPE "JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "JobStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'WAITING_FOR_WORKER';
