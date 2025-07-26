using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Graphics;

public partial class ThemeImage : ComponentBase
{
    [Parameter]
    public required string UrlDark { get; init; }
    
    [Parameter]
    public required string UrlLight { get; init; }
    
    [Parameter]
    public required string Description { get; init; }
    
    [Parameter]
    public required string Class { get; init; }

    [Parameter]
    public required int Height { get; init; } = -1;
}