using FluentValidation;
using FluentValidation.AspNetCore;
using Mapster;
using MapsterMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Relevantz.SOR.Api.Middleware;
using Relevantz.SOR.Common.Utils;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Core.Mapping;
using Relevantz.SOR.Core.Service;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;
using Relevantz.SOR.Data.Repository;
using Serilog;
using System.IO.Compression;
using System.Reflection;
using System.Text;
using Relevantz.EEPZ.Data.DBContexts;

var builder = WebApplication.CreateBuilder(args);

// ─── 1. Serilog ───────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Service", "Relevantz-SOR")
    .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
    .CreateLogger();
builder.Host.UseSerilog();
Log.Information("Starting SOR Application in {Environment} mode", builder.Environment.EnvironmentName);

// ─── 2. Controllers + JSON ────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ─── 3. FluentValidation ──────────────────────────────────────────────────────
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<Relevantz.SOR.Common.Validators.CreateCandidateRequestDtoValidator>();
Log.Information("FluentValidation registered successfully");

// ─── 4. Swagger ───────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Relevantz SOR API",
        Version = "v1",
        Description = "Streamlined Offer Release — Offer Lifecycle Management API"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by your JWT token"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ─── 5. SOR MySQL DbContext ────────────────────────────────────────────────────
var sorConnection = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("SOR database connection string is not configured.");

var dbRetryCount    = builder.Configuration.GetValue<int>("Database:MaxRetryCount", 3);
var dbRetryDelay    = builder.Configuration.GetValue<int>("Database:MaxRetryDelaySeconds", 10);
var dbCommandTimeout = builder.Configuration.GetValue<int>("Database:CommandTimeoutSeconds", 30);

builder.Services.AddDbContext<SORDbContext>(options =>
{
    options.UseMySql(
        sorConnection,
        new MySqlServerVersion(new Version(8, 0, 36)),
        mySqlOptions =>
        {
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: dbRetryCount,
                maxRetryDelay: TimeSpan.FromSeconds(dbRetryDelay),
                errorNumbersToAdd: null);
            mySqlOptions.CommandTimeout(dbCommandTimeout);
        })
        .EnableSensitiveDataLogging(builder.Environment.IsDevelopment())
        .EnableDetailedErrors(builder.Environment.IsDevelopment());
}, ServiceLifetime.Scoped);

// ─── EEPZ DbContext (same DB — read access for user info) ────────────────────
var eepzConnection = builder.Configuration.GetConnectionString("EEPZConnection")
    ?? throw new InvalidOperationException("EEPZ connection string not configured.");

builder.Services.AddDbContext<EEPZDbContext>(options =>
{
    options.UseMySql(
        eepzConnection,
        new MySqlServerVersion(new Version(8, 0, 36)),
        mySqlOptions =>
        {
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: dbRetryCount,
                maxRetryDelay: TimeSpan.FromSeconds(dbRetryDelay),
                errorNumbersToAdd: null);
            mySqlOptions.CommandTimeout(dbCommandTimeout);
        })
        .EnableSensitiveDataLogging(builder.Environment.IsDevelopment())
        .EnableDetailedErrors(builder.Environment.IsDevelopment());
}, ServiceLifetime.Scoped);
Log.Information("SOR and EEPZ DbContexts registered successfully");

// ─── 7. JWT Authentication ────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"]
    ?? throw new InvalidOperationException("JWT SecretKey not configured.");
var issuer    = jwtSettings["Issuer"]
    ?? throw new InvalidOperationException("JWT Issuer not configured.");
var audience  = jwtSettings["Audience"]
    ?? throw new InvalidOperationException("JWT Audience not configured.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = issuer,
        ValidAudience            = audience,
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew                = TimeSpan.Zero,
        RequireExpirationTime    = true,
        RequireSignedTokens      = true
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Log.Warning("[SOR] JWT Authentication Failed: {ExceptionType}",
                context.Exception.GetType().Name);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Log.Information("[SOR] JWT Token Validated — CorrelationId: {CorrelationId}",
                context.HttpContext.TraceIdentifier);
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Log.Warning("[SOR] JWT Challenge — Path: {Path}, CorrelationId: {CorrelationId}",
                context.Request.Path, context.HttpContext.TraceIdentifier);
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("HROnly",           policy => policy.RequireRole("HR"));
    options.AddPolicy("HRHeadOnly",       policy => policy.RequireRole("HRHead"));
    options.AddPolicy("FinanceOnly",      policy => policy.RequireRole("Finance"));
    options.AddPolicy("ManagerOnly",      policy => policy.RequireRole("HiringManager"));
    options.AddPolicy("ApproverAccess",   policy => policy.RequireRole("HR", "HiringManager", "Finance", "HRHead"));
    options.AddPolicy("HROrHRHead",       policy => policy.RequireRole("HR", "HRHead"));
});

// ─── 8. Repositories ──────────────────────────────────────────────────────────
builder.Services.AddScoped<ICandidateRepository, CandidateRepository>();
builder.Services.AddScoped<IOfferRepository, OfferRepository>();
builder.Services.AddScoped<IOfferWorkflowRepository, OfferWorkflowRepository>();
builder.Services.AddScoped<IOfferWorkflowStepRepository, OfferWorkflowStepRepository>();
builder.Services.AddScoped<IApprovalChainRepository, ApprovalChainRepository>();
builder.Services.AddScoped<IApprovalChainStepRepository, ApprovalChainStepRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IOfferTemplateRepository, OfferTemplateRepository>();
builder.Services.AddScoped<IOfferVersionRepository, OfferVersionRepository>();
builder.Services.AddScoped<IFinanceBudgetRepository, FinanceBudgetRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
Log.Information("SOR Repositories registered successfully");

// ─── 9. Services ──────────────────────────────────────────────────────────────
builder.Services.AddScoped<ICandidateService, CandidateService>();
builder.Services.AddScoped<IOfferService, OfferService>();
builder.Services.AddScoped<IOfferApprovalService, OfferApprovalService>();
builder.Services.AddScoped<IOfferWorkflowService, OfferWorkflowService>();
builder.Services.AddScoped<IApprovalChainService, ApprovalChainService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IFinanceService, FinanceService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IOfferTemplateService, OfferTemplateService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ITokenService, TokenService>();
Log.Information("SOR Services registered successfully");

// ─── 10. Mapster ──────────────────────────────────────────────────────────────
MappingConfig.Configure();
builder.Services.AddSingleton(TypeAdapterConfig.GlobalSettings);
builder.Services.AddScoped<IMapper, ServiceMapper>();

// ─── 11. CORS ─────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("DevelopmentPolicy", policy =>
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
    });
    Log.Warning("[SOR] CORS configured with AllowAny for Development");
}
else
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("ProductionPolicy", policy =>
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .SetIsOriginAllowedToAllowWildcardSubdomains());
    });
    Log.Information("[SOR] CORS configured with restricted origins for Production");
}

// ─── 12. Response Compression ─────────────────────────────────────────────────
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<BrotliCompressionProvider>();
});
builder.Services.Configure<GzipCompressionProviderOptions>(opt =>
    opt.Level = CompressionLevel.Fastest);
builder.Services.Configure<BrotliCompressionProviderOptions>(opt =>
    opt.Level = CompressionLevel.Fastest);

// ─── 13. Memory Cache + HTTP Client ───────────────────────────────────────────
builder.Services.AddMemoryCache();
var httpTimeout = builder.Configuration.GetValue<int>("HttpClient:TimeoutSeconds", 30);
builder.Services.AddHttpClient("DefaultClient")
    .SetHandlerLifetime(TimeSpan.FromMinutes(5))
    .ConfigureHttpClient(client => client.Timeout = TimeSpan.FromSeconds(httpTimeout));

// ─── 14. Health Checks ────────────────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddCheck("sor-mysql-db", () =>
    {
        try
        {
            using var scope = builder.Services.BuildServiceProvider().CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<SORDbContext>();
            return context.Database.CanConnect()
                ? HealthCheckResult.Healthy("SOR MySQL database is healthy")
                : HealthCheckResult.Unhealthy("SOR MySQL database connection failed");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("SOR MySQL database connection failed", ex);
        }
    }, new[] { "db", "mysql" })
    .AddCheck("eepz-mysql-db", () =>
    {
        try
        {
            using var scope = builder.Services.BuildServiceProvider().CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<EEPZDbContext>();
            return context.Database.CanConnect()
                ? HealthCheckResult.Healthy("EEPZ MySQL read database is healthy")
                : HealthCheckResult.Unhealthy("EEPZ MySQL read connection failed");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("EEPZ MySQL read connection failed", ex);
        }
    }, new[] { "db", "mysql" });

// ════════════════════════════════════════════════════════════════════════════
var app = builder.Build();
// ════════════════════════════════════════════════════════════════════════════

// ─── 15. DB Initialization ────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context       = services.GetRequiredService<SORDbContext>();
        var configuration = services.GetRequiredService<IConfiguration>();
        Log.Information("[SOR] Initializing SOR MySQL database");

        if (builder.Environment.IsDevelopment())
        {
            await context.Database.EnsureCreatedAsync();
            Log.Information("[SOR] Schema validated in Development mode");
        }
        else
        {
            var pending = await context.Database.GetPendingMigrationsAsync();
            if (pending.Any())
            {
                Log.Information("[SOR] Applying {Count} pending migrations", pending.Count());
                await context.Database.MigrateAsync();
            }
        }

        await Relevantz.SOR.Data.DBContexts.DbInitializer.InitializeAsync(context, configuration);
        Log.Information("[SOR] Database initialized successfully");
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "[SOR] Critical error during database initialization");
        throw;
    }
}

// ─── 16. Middleware Pipeline ───────────────────────────────────────────────────
// 1. Response Compression
app.UseResponseCompression();

// 2. Correlation ID
app.Use(async (context, next) =>
{
    var correlationId = context.TraceIdentifier;
    context.Response.Headers.Append("X-Correlation-ID", correlationId);
    using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
    {
        await next();
    }
});

// 3. Security Headers
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLower() ?? "";
    if (!path.StartsWith("/swagger") &&
        !path.Contains("index.html") &&
        !path.EndsWith(".js") &&
        !path.EndsWith(".css"))
    {
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'");
        if (!builder.Environment.IsDevelopment())
            context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    await next();
});

// 4. Global Exception Handler
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var correlationId = context.TraceIdentifier;
        if (error != null)
        {
            Log.Error(error.Error,
                "[SOR] Unhandled exception — CorrelationId: {CorrelationId}, Path: {Path}",
                correlationId, context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                message = "An internal server error occurred",
                correlationId,
                timestamp = DateTime.UtcNow,
                error = app.Environment.IsDevelopment() ? error.Error.Message : "Internal Server Error"
            });
        }
    });
});

// 5. Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Relevantz SOR API V1");
        c.RoutePrefix = string.Empty;
        c.DocumentTitle = "Relevantz SOR API Documentation";
    });
    Log.Information("[SOR] Swagger UI enabled");
}

// 6. Serilog Request Logging
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    options.GetLevel = (httpContext, elapsed, ex) => ex != null
        ? Serilog.Events.LogEventLevel.Error
        : httpContext.Response.StatusCode > 499
            ? Serilog.Events.LogEventLevel.Error
            : Serilog.Events.LogEventLevel.Information;
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestHost",   httpContext.Request.Host.Value);
        diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
        diagnosticContext.Set("RemoteIP",      httpContext.Connection.RemoteIpAddress?.ToString());
        diagnosticContext.Set("CorrelationId", httpContext.TraceIdentifier);
    };
});

// 7. HTTPS + Static Files
app.UseHttpsRedirection();
app.UseStaticFiles();

// 8. CORS
var corsPolicy = app.Environment.IsDevelopment() ? "DevelopmentPolicy" : "ProductionPolicy";
app.UseCors(corsPolicy);
Log.Information("[SOR] CORS policy '{Policy}' applied", corsPolicy);

// 9. Auth
app.UseAuthentication();
app.UseAuthorization();

// 10. Custom Exception Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// 11. Controllers
app.MapControllers();

// 12. Health Checks
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            status    = "Healthy",
            timestamp = DateTime.UtcNow,
            service   = "Relevantz-SOR",
            version   = "v1.0"
        });
    }
}).AllowAnonymous();

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("db"),
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            status    = report.Status.ToString(),
            timestamp = DateTime.UtcNow,
            checks    = report.Entries.Select(e => new
            {
                name     = e.Key,
                status   = e.Value.Status.ToString(),
                duration = e.Value.Duration.TotalMilliseconds,
                tags     = e.Value.Tags
            }),
            totalDuration = report.TotalDuration.TotalMilliseconds
        });
    }
}).AllowAnonymous();

// 13. API Info (Dev only)
if (app.Environment.IsDevelopment())
{
    app.MapGet("/api/info", () => Results.Ok(new
    {
        service     = "Relevantz SOR — Streamlined Offer Release API",
        version     = "v1.0",
        environment = builder.Environment.EnvironmentName,
        endpoints   = new { swagger = "/", healthLive = "/health/live", healthReady = "/health/ready" },
        authentication = "JWT Bearer (shared with EEPZ Auth API)",
        documentation  = "See / for API documentation"
    })).AllowAnonymous();
}

try
{
    Log.Information("[SOR] Application started successfully on {Environment}",
        builder.Environment.EnvironmentName);
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "[SOR] Application terminated unexpectedly");
    throw;
}
finally
{
    Log.Information("[SOR] Application shutting down");
    await Log.CloseAndFlushAsync();
}
