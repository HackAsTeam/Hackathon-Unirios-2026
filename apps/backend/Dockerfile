FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY HackathonUnirios2026.sln .
COPY src/HackathonUnirios2026.API/HackathonUnirios2026.API.csproj src/HackathonUnirios2026.API/
COPY src/HackathonUnirios2026.Application/HackathonUnirios2026.Application.csproj src/HackathonUnirios2026.Application/
COPY src/HackathonUnirios2026.Domain/HackathonUnirios2026.Domain.csproj src/HackathonUnirios2026.Domain/
COPY src/HackathonUnirios2026.Infra/HackathonUnirios2026.Infra.csproj src/HackathonUnirios2026.Infra/
COPY tests/HackathonUnirios2026.Application.Tests/HackathonUnirios2026.Application.Tests.csproj tests/HackathonUnirios2026.Application.Tests/
RUN dotnet restore

COPY . .
RUN dotnet publish src/HackathonUnirios2026.API/HackathonUnirios2026.API.csproj \
    -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "HackathonUnirios2026.API.dll"]
