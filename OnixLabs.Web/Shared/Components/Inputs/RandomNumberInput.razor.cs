using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Shared.Components.Inputs;

public partial class RandomNumberInput : ComponentBase
{
    [Parameter]
    public required int Value { get; set; }

    [Parameter]
    public required EventCallback<int> ValueChanged { get; init; }

    [Parameter]
    public required Expression<Func<int>>? ValueExpression { get; init; }
    
    [Parameter]
    public required string Id { get; init; } = Guid.NewGuid().ToString();

    [Parameter]
    public required string Label { get; init; } = "Random Number";
    
    private async Task RandomizeSeedAsync()
    {
        int newValue = Random.Shared.Next();
        Value = newValue;
        
        await ValueChanged.InvokeAsync(newValue);
    }
}