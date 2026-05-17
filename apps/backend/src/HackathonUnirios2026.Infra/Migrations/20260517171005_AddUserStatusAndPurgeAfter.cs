using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonUnirios2026.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddUserStatusAndPurgeAfter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PurgeAfter",
                table: "asp_net_users",
                type: "timestamptz",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "asp_net_users",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Active");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PurgeAfter",
                table: "asp_net_users");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "asp_net_users");
        }
    }
}
