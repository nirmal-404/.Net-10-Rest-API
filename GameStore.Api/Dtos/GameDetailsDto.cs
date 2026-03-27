namespace GameStore.Api.Dtos;

// Dto is a contact between the client and the server since it reporesents
// a shared agreement about how data will be transfered and used

public record GameDetailsDto(
    int Id,
    string Name,
    int GenreId,
    decimal Price,
    DateOnly ReleaseDate
);
