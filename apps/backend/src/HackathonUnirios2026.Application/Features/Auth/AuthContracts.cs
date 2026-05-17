// Auth service contracts have been moved to HackathonUnirios2026.Domain.Auth.
// These aliases keep existing code in Application compiling without changes.
global using IJwtTokenIssuer = HackathonUnirios2026.Domain.Auth.IJwtTokenIssuer;
global using IGoogleTokenValidator = HackathonUnirios2026.Domain.Auth.IGoogleTokenValidator;
global using GoogleAccount = HackathonUnirios2026.Domain.Auth.GoogleAccount;
global using AuthValidationException = HackathonUnirios2026.Domain.Auth.AuthValidationException;
global using AuthUnauthorizedException = HackathonUnirios2026.Domain.Auth.AuthUnauthorizedException;
global using AccountPendingDeletionException = HackathonUnirios2026.Domain.Auth.AccountPendingDeletionException;
