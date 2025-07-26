using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Graphics;

public partial class Icon : ComponentBase
{
    [Parameter]
    public required string Class { get; init; }
}