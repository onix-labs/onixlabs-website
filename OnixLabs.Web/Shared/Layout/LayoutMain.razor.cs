using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Layout;

public partial class LayoutMain : ComponentBase
{
    [Parameter]
    public required RenderFragment Body { get; init; }
}