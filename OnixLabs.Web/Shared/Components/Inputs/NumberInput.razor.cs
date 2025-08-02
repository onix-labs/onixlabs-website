using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Inputs;

public partial class NumberInput<T> : ComponentBase
{
    [Parameter]
    public required T Value { get; init; } = default!;

    [Parameter]
    public required EventCallback<T> ValueChanged { get; init; }

    [Parameter]
    public required Expression<Func<T>>? ValueExpression { get; init; }

    [Parameter]
    public required EventCallback OnIncrementClicked { get; init; }

    [Parameter]
    public required EventCallback OnDecrementClicked { get; init; }

    [Parameter]
    public required string Id { get; init; } = Guid.NewGuid().ToString();

    [Parameter]
    public required string Label { get; init; } = "Number";
}