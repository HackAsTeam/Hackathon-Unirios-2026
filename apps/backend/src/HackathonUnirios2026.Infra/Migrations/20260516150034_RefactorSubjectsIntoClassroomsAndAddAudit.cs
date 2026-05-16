using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonUnirios2026.Infra.Migrations
{
    /// <inheritdoc />
    public partial class RefactorSubjectsIntoClassroomsAndAddAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_classrooms_subjects_SubjectId",
                table: "classrooms");

            migrationBuilder.DropIndex(
                name: "IX_classrooms_SubjectId",
                table: "classrooms");

            AddAuditColumns(migrationBuilder, "subjects", includeCreatedAt: false);
            AddAuditColumns(migrationBuilder, "question_answers", includeCreatedAt: true);
            AddAuditColumns(migrationBuilder, "invitation_links", includeCreatedAt: false);
            AddAuditColumns(migrationBuilder, "exams", includeCreatedAt: false);
            AddAuditColumns(migrationBuilder, "exam_attempts", includeCreatedAt: true);
            AddAuditColumns(migrationBuilder, "enrollments", includeCreatedAt: true);
            AddAuditColumns(migrationBuilder, "classrooms", includeCreatedAt: false);
            AddAuditColumns(migrationBuilder, "classroom_exams", includeCreatedAt: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ClassroomId",
                table: "subjects",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE classrooms
                SET "CreatedBy" = "TeacherId"
                WHERE "CreatedBy" = '';

                UPDATE enrollments
                SET
                    "CreatedAt" = "JoinedAt",
                    "CreatedBy" = "StudentId"
                WHERE "CreatedBy" = '';

                UPDATE invitation_links AS links
                SET "CreatedBy" = classrooms."TeacherId"
                FROM classrooms
                WHERE links."ClassroomId" = classrooms."Id"
                    AND links."CreatedBy" = '';

                UPDATE exams
                SET "CreatedBy" = classrooms."TeacherId"
                FROM classrooms
                WHERE exams."ClassroomId" = classrooms."Id"
                    AND exams."CreatedBy" = '';

                UPDATE classroom_exams
                SET
                    "CreatedAt" = "AssignedAt",
                    "CreatedBy" = classrooms."TeacherId"
                FROM classrooms
                WHERE classroom_exams."ClassroomId" = classrooms."Id"
                    AND classroom_exams."CreatedBy" = '';

                UPDATE exam_attempts
                SET
                    "CreatedAt" = "StartedAt",
                    "CreatedBy" = "StudentId"
                WHERE "CreatedBy" = '';

                UPDATE question_answers
                SET
                    "CreatedAt" = "AnsweredAt",
                    "CreatedBy" = exam_attempts."StudentId"
                FROM exam_attempts
                WHERE question_answers."AttemptId" = exam_attempts."Id"
                    AND question_answers."CreatedBy" = '';

                INSERT INTO subjects ("Id", "ClassroomId", "Name", "Description", "CreatedAt", "CreatedBy")
                SELECT gen_random_uuid(), classrooms."Id", subjects."Name", subjects."Description", subjects."CreatedAt", classrooms."TeacherId"
                FROM classrooms
                INNER JOIN subjects ON classrooms."SubjectId" = subjects."Id";

                DELETE FROM subjects
                WHERE "ClassroomId" IS NULL;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "ClassroomId",
                table: "subjects",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "SubjectId",
                table: "classrooms");

            migrationBuilder.CreateIndex(
                name: "IX_subjects_ClassroomId",
                table: "subjects",
                column: "ClassroomId");

            migrationBuilder.AddForeignKey(
                name: "FK_subjects_classrooms_ClassroomId",
                table: "subjects",
                column: "ClassroomId",
                principalTable: "classrooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_subjects_classrooms_ClassroomId",
                table: "subjects");

            migrationBuilder.DropIndex(
                name: "IX_subjects_ClassroomId",
                table: "subjects");

            migrationBuilder.AddColumn<Guid>(
                name: "SubjectId",
                table: "classrooms",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("""
                INSERT INTO subjects ("Id", "ClassroomId", "Name", "Description", "CreatedAt", "CreatedBy")
                SELECT gen_random_uuid(), classrooms."Id", 'Sem disciplina', NULL, classrooms."CreatedAt", classrooms."TeacherId"
                FROM classrooms
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM subjects
                    WHERE subjects."ClassroomId" = classrooms."Id"
                );

                UPDATE classrooms
                SET "SubjectId" = (
                    SELECT subjects."Id"
                    FROM subjects
                    WHERE subjects."ClassroomId" = classrooms."Id"
                    ORDER BY subjects."CreatedAt", subjects."Id"
                    LIMIT 1
                );

                DELETE FROM subjects
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM classrooms
                    WHERE classrooms."SubjectId" = subjects."Id"
                );
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "SubjectId",
                table: "classrooms",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_classrooms_SubjectId",
                table: "classrooms",
                column: "SubjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_classrooms_subjects_SubjectId",
                table: "classrooms",
                column: "SubjectId",
                principalTable: "subjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.DropColumn(
                name: "ClassroomId",
                table: "subjects");

            DropAuditColumns(migrationBuilder, "subjects", includeCreatedAt: false);
            DropAuditColumns(migrationBuilder, "question_answers", includeCreatedAt: true);
            DropAuditColumns(migrationBuilder, "invitation_links", includeCreatedAt: false);
            DropAuditColumns(migrationBuilder, "exams", includeCreatedAt: false);
            DropAuditColumns(migrationBuilder, "exam_attempts", includeCreatedAt: true);
            DropAuditColumns(migrationBuilder, "enrollments", includeCreatedAt: true);
            DropAuditColumns(migrationBuilder, "classrooms", includeCreatedAt: false);
            DropAuditColumns(migrationBuilder, "classroom_exams", includeCreatedAt: true);
        }

        private static void AddAuditColumns(MigrationBuilder migrationBuilder, string table, bool includeCreatedAt)
        {
            if (includeCreatedAt)
            {
                migrationBuilder.AddColumn<DateTime>(
                    name: "CreatedAt",
                    table: table,
                    type: "timestamp with time zone",
                    nullable: false,
                    defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
            }

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: table,
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: table,
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: table,
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: table,
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: table,
                type: "text",
                nullable: true);
        }

        private static void DropAuditColumns(MigrationBuilder migrationBuilder, string table, bool includeCreatedAt)
        {
            if (includeCreatedAt)
            {
                migrationBuilder.DropColumn(
                    name: "CreatedAt",
                    table: table);
            }

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: table);

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: table);

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: table);

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: table);

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: table);
        }
    }
}
