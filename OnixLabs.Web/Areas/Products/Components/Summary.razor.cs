using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Areas.Products.Components;

public partial class Summary : ComponentBase
{
    [Parameter]
    public required string Title { get; init; }
    
    [Parameter]
    public required RenderFragment ChildContent { get; init; }
}