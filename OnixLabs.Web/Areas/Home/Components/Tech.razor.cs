using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Areas.Home.Components;

public partial class Tech : ComponentBase
{
    [Parameter]
    public required string ImageUrl { get; init; }
    
    [Parameter]
    public required string Title { get; init; }
    
    [Parameter]
    public required string Url { get; init; }
}