using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Cards;

public partial class CardHeader : ComponentBase
{
    [Parameter]
    public required string Class { get; init; }
    
    [Parameter]
    public required RenderFragment ChildContent { get; init; }
}