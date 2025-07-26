using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Accordion;

public partial class Accordion : ComponentBase
{
    [Parameter]
    public required string Id { get; init; } = Guid.NewGuid().ToString();
    
    [Parameter]
    public required RenderFragment ChildContent { get; init; }
}