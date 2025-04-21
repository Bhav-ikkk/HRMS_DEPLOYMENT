-- AlterTable
ALTER TABLE "Trace" ADD COLUMN     "attendance" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "LeaveType";
