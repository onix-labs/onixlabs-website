using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Buttons;

public partial class ActionButton : ComponentBase
{
    [Parameter]
    public required string Icon { get; init; } = string.Empty;

    [Parameter]
    public required string Text { get; init; }

    [Parameter]
    public required string Url { get; init; } = "/";
    
    [Parameter]
    public required bool OpenInNewTab { get; init; }
    
    [Parameter]
    public required string Class { get; init; }
}