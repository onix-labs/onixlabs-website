using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Areas.Products.Components;

public partial class Product : ComponentBase
{
    [Parameter]
    public required string ImageUrl { get; init; }
    
    [Parameter]
    public required string Title { get; init; }
    
    [Parameter]
    public required string TitleClass { get; init; }
    
    [Parameter]
    public required string Hook { get; init; }
    
    [Parameter]
    public required bool ReverseLayout { get; init; }
    
    [Parameter]
    public required string InfoUrl { get; init; }
    
    [Parameter]
    public required RenderFragment ChildContent { get; init; }
}