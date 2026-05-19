using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonUnirios2026.Infra.Migrations
{
    /// <inheritdoc />
    public partial class MakeUserRoleNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "asp_net_users",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Student");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "asp_net_users",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Student",
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20,
                oldNullable: true);
        }
    }
}
