using GameStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameStore.Api.Data;

public static class DataExtensions
{
    public static void MigrateDB(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider
                             .GetRequiredService<GameStoreContext>();

        dbContext.Database.Migrate();
    }

    public static void AddGameStoreDb(this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("GameStore");
        
        // DbCOntext has a scoped service lifetime beacuse:
        // 1. it ensures that a new instance of DbContext is created pee request
        // 2. Db connections are a limited and expensive resource so we can ensure those connections opened and closed efficiently
        // 3. DbContext is not thred safe. Scoped avoids to concurrency issues :
        // 4. Makes it easier to manage transactions and ensure data consistency
        // 5. reusing a DbContext instance can leads to increased memeory usage
        builder.Services.AddSqlite<GameStoreContext>(
            connectionString,
            optionsAction: options => options.UseSeeding((context, _) =>
            {
                if (!context.Set<Genre>().Any())
                {
                    context.Set<Genre>().AddRange(
                        new Genre {Name = "Fighting"},
                        new Genre {Name = "RPG"},
                        new Genre {Name = "Platformer"},
                        new Genre {Name = "Racing"},
                        new Genre {Name = "Sports"}
                    );
                    context.SaveChanges();
                }
            })
        );
    }
}
