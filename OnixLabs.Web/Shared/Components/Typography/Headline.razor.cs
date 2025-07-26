using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Typography;

public partial class Headline : ComponentBase
{
    [Parameter]
    public required bool Centered { get; init; }
    
    [Parameter]
    public required string Class { get; init; }
    
    [Parameter]
    public required RenderFragment ChildContent { get; init; }
}