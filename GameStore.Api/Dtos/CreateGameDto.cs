namespace GameStore.Api.Dtos;

public record CreateGameDto(
    string Name,
    string Genre,
    Decimal Price,
    DateOnly ReleaseDate
);
