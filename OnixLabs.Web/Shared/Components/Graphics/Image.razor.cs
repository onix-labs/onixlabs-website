using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Graphics;

public partial class Image : ComponentBase
{
    [Parameter]
    public required string Url { get; init; }
    
    [Parameter]
    public required string Description { get; init; }
    
    [Parameter]
    public required string Class { get; init; }
    
    [Parameter]
    public required int Height { get; init; }
}