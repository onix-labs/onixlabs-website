using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Tiles;

public partial class Tile : ComponentBase
{
    [Parameter]
    public required string ImageLightUrl { get; init; }
    
    [Parameter]
    public required string ImageDarkUrl { get; init; }
    
    [Parameter]
    public required string Title { get; init; }
    
    [Parameter]
    public required int ColumnSize { get; init; }
    
    [Parameter]
    public required RenderFragment ChildContent { get; init; }

    private string GetColumnClass() => ColumnSize switch
    {
        3 => "col-12 col-md-4 mt-5",
        4 => "col-12 col-md-6 col-lg-3 mt-5",
        _ => throw new ArgumentOutOfRangeException(nameof(ColumnSize), "ColumnSize must be 3 or 4")
    };
}