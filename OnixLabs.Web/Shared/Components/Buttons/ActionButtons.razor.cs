using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Buttons;

public partial class ActionButtons : ComponentBase
{
    [Parameter]
    public required RenderFragment ChildContent { get; init; }
}