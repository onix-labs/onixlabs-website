using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Accordion;

public partial class AccordionItem : ComponentBase
{
    [Parameter]
    public required string Header { get; init; } = string.Empty;

    [Parameter]
    public required string Id { get; init; } = Guid.NewGuid().ToString();
    
    [Parameter]
    public required RenderFragment ChildContent { get; init; }
    
    [CascadingParameter]
    public required Accordion Parent { get; init; }
}