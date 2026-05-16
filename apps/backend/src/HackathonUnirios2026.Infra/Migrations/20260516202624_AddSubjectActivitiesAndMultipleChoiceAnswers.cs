using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonUnirios2026.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddSubjectActivitiesAndMultipleChoiceAnswers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "AnswerText",
                table: "question_answers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "SelectedOptionId",
                table: "question_answers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SubjectId",
                table: "exams",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "question_options",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_question_options", x => x.Id);
                    table.ForeignKey(
                        name: "FK_question_options_questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_question_answers_SelectedOptionId",
                table: "question_answers",
                column: "SelectedOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_exams_SubjectId",
                table: "exams",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_question_options_QuestionId",
                table: "question_options",
                column: "QuestionId");

            migrationBuilder.AddForeignKey(
                name: "FK_exams_subjects_SubjectId",
                table: "exams",
                column: "SubjectId",
                principalTable: "subjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_question_answers_question_options_SelectedOptionId",
                table: "question_answers",
                column: "SelectedOptionId",
                principalTable: "question_options",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_exams_subjects_SubjectId",
                table: "exams");

            migrationBuilder.DropForeignKey(
                name: "FK_question_answers_question_options_SelectedOptionId",
                table: "question_answers");

            migrationBuilder.DropTable(
                name: "question_options");

            migrationBuilder.DropIndex(
                name: "IX_question_answers_SelectedOptionId",
                table: "question_answers");

            migrationBuilder.DropIndex(
                name: "IX_exams_SubjectId",
                table: "exams");

            migrationBuilder.DropColumn(
                name: "SelectedOptionId",
                table: "question_answers");

            migrationBuilder.DropColumn(
                name: "SubjectId",
                table: "exams");

            migrationBuilder.AlterColumn<string>(
                name: "AnswerText",
                table: "question_answers",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
