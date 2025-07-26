using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Layout;

public partial class Container : ComponentBase
{
    [Parameter]
    public required bool Fluid { get; init; }
    
    [Parameter]
    public required string Class { get; init; }
    
    [Parameter]
    public required RenderFragment ChildContent { get; init; }
}