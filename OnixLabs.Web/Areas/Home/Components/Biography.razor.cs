using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Areas.Home.Components;

public partial class Biography : ComponentBase
{
    [Parameter]
    public required string Heading { get; init; }
    
    [Parameter]
    public required string SubHeading { get; init; }
    
    [Parameter]
    public required string ImageUrl { get; init; }
    
    [Parameter]
    public required string LinkedInUrl { get; init; }
    
    [Parameter]
    public required string GitHubUrl { get; init; }
    
    [Parameter]
    public required RenderFragment ChildContent { get; init; }
}