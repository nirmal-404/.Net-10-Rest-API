namespace GameStore.Api.Dtos;

// Dto is a contact between the client and the server since it reporesents
// a shared agreement about how data will be transfered and used

public record GameSummaryDto(
    int Id,
    string Name,
    string Genre,
    decimal Price,
    DateOnly ReleaseDate
);
