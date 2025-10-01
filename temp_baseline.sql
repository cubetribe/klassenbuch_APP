-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('TEACHER', 'CO_TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Color" AS ENUM ('BLUE', 'GREEN', 'YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('COLOR_CHANGE', 'LEVEL_CHANGE', 'XP_CHANGE', 'REWARD_REDEEMED', 'CONSEQUENCE_APPLIED', 'AUTO_RULE', 'MANUAL_ACTION');

-- CreateEnum
CREATE TYPE "public"."ConsequenceSeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR');

-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('STUDENT_REPORT', 'COURSE_REPORT', 'TEACHER_DASHBOARD');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'TEACHER',
    "email_verified" TIMESTAMP(3),
    "verification_token" TEXT,
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "school_year" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "internal_code" TEXT NOT NULL,
    "avatar_emoji" TEXT,
    "current_color" "public"."Color" NOT NULL DEFAULT 'GREEN',
    "current_level" INTEGER NOT NULL DEFAULT 0,
    "current_xp" INTEGER NOT NULL DEFAULT 50,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."behavior_events" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "type" "public"."EventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "behavior_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rewards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cost_xp" INTEGER,
    "cost_level" INTEGER,
    "weekly_limit" INTEGER,
    "category" TEXT NOT NULL,
    "emoji" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reward_redemptions" (
    "id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "redeemed_by" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consequences" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "severity" "public"."ConsequenceSeverity" NOT NULL,
    "notes_required" BOOLEAN NOT NULL DEFAULT false,
    "emoji" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consequence_applications" (
    "id" TEXT NOT NULL,
    "consequence_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "applied_by" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consequence_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" TEXT NOT NULL,
    "course_id" TEXT,
    "student_id" TEXT,
    "type" "public"."ReportType" NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_token_key" ON "public"."users"("verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_reset_token_key" ON "public"."users"("reset_token");

-- CreateIndex
CREATE INDEX "courses_teacher_id_idx" ON "public"."courses"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_internal_code_key" ON "public"."students"("internal_code");

-- CreateIndex
CREATE INDEX "students_course_id_idx" ON "public"."students"("course_id");

-- CreateIndex
CREATE INDEX "students_internal_code_idx" ON "public"."students"("internal_code");

-- CreateIndex
CREATE INDEX "behavior_events_student_id_created_at_idx" ON "public"."behavior_events"("student_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "behavior_events_course_id_created_at_idx" ON "public"."behavior_events"("course_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "rewards_active_idx" ON "public"."rewards"("active");

-- CreateIndex
CREATE INDEX "reward_redemptions_student_id_created_at_idx" ON "public"."reward_redemptions"("student_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reward_redemptions_course_id_created_at_idx" ON "public"."reward_redemptions"("course_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "consequences_active_idx" ON "public"."consequences"("active");

-- CreateIndex
CREATE INDEX "consequence_applications_student_id_created_at_idx" ON "public"."consequence_applications"("student_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "consequence_applications_course_id_created_at_idx" ON "public"."consequence_applications"("course_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reports_course_id_type_created_at_idx" ON "public"."reports"("course_id", "type", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reports_student_id_type_created_at_idx" ON "public"."reports"("student_id", "type", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "public"."audit_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "public"."audit_logs"("entity_type", "entity_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."behavior_events" ADD CONSTRAINT "behavior_events_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."behavior_events" ADD CONSTRAINT "behavior_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."behavior_events" ADD CONSTRAINT "behavior_events_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reward_redemptions" ADD CONSTRAINT "reward_redemptions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reward_redemptions" ADD CONSTRAINT "reward_redemptions_redeemed_by_fkey" FOREIGN KEY ("redeemed_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reward_redemptions" ADD CONSTRAINT "reward_redemptions_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reward_redemptions" ADD CONSTRAINT "reward_redemptions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consequence_applications" ADD CONSTRAINT "consequence_applications_applied_by_fkey" FOREIGN KEY ("applied_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consequence_applications" ADD CONSTRAINT "consequence_applications_consequence_id_fkey" FOREIGN KEY ("consequence_id") REFERENCES "public"."consequences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consequence_applications" ADD CONSTRAINT "consequence_applications_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consequence_applications" ADD CONSTRAINT "consequence_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

