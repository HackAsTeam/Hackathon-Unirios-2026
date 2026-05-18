using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonUnirios2026.Infra.Migrations
{
    /// <inheritdoc />
    public partial class RemoveEnrollmentJoinedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JoinedAt",
                table: "enrollments");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "asp_net_users",
                type: "varchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30,
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "asp_net_users",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Student",
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Student");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "JoinedAt",
                table: "enrollments",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "asp_net_users",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(string),
                oldType: "varchar(30)",
                oldMaxLength: 30,
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "asp_net_users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Student",
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Student");
        }
    }
}
