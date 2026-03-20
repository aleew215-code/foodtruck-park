-- Add EMPLOYEE to the UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EMPLOYEE';

-- Add employeeTruckId column to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "employeeTruckId" TEXT;

-- Add foreign key constraint
ALTER TABLE "users" ADD CONSTRAINT "users_employeeTruckId_fkey"
  FOREIGN KEY ("employeeTruckId") REFERENCES "food_trucks"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
