using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Inputs;

public partial class SelectInput<T> : ComponentBase
{
    [Parameter]
    public required T Value { get; set; }

    [Parameter]
    public required EventCallback<T> ValueChanged { get; init; }
    
    [Parameter]
    public required Expression<Func<T>>? ValueExpression { get; init; }

    [Parameter]
    public required string Id { get; init; } = Guid.NewGuid().ToString();

    [Parameter]
    public required string Label { get; init; } = "Select";

    [Parameter]
    public required RenderFragment ChildContent { get; set; }
}