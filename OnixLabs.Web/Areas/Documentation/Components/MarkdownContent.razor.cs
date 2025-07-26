using Markdig;
using Microsoft.AspNetCore.Components;
using OnixLabs.Web.Shared;

namespace OnixLabs.Web.Areas.Documentation.Components;

public partial class MarkdownContent : ComponentBase
{
    [Parameter] 
    public string Url { get; set; } = string.Empty;
    
    [Inject]
    public required HttpClient Http { get; set; }

    private string HtmlContent { get; set; } = string.Empty;
    private string? Error { get; set; }
    private bool IsLoading { get; set; }

    protected override async Task OnParametersSetAsync()
    {
        if (string.IsNullOrWhiteSpace(Url))
        {
            Error = "No URL specified.";
            return;
        }

        IsLoading = true;
        Error = string.Empty;

        try
        {
            string markdown = await Http.GetStringAsync(Url);
            
            MarkdownPipeline pipeline = new MarkdownPipelineBuilder()
                .UseAdvancedExtensions()
                .UseBootstrap()
                .Use(new LinkTargetExtension())
                
                .Build();
            
            HtmlContent = Markdown.ToHtml(markdown, pipeline);
        }
        catch (Exception ex)
        {
            Error = $"Failed to load content: {ex.Message}";
        }

        IsLoading = false;
    }
}