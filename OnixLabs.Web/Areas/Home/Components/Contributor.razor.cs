using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Areas.Home.Components;

public partial class Contributor : ComponentBase
{
    [Parameter]
    public required string Image { get; init; }
    
    [Parameter]
    public required string Name { get; init; }
    
    [Parameter]
    public required string Title { get; init; }
    
    [Parameter]
    public required string InfoUrl { get; init; }
    
    [Parameter]
    public required string LinkedInUrl { get; init; }
    
    [Parameter]
    public required string GitHubUrl { get; init; }
    
    [Parameter]
    public required RenderFragment ChildContent { get; init; }
}