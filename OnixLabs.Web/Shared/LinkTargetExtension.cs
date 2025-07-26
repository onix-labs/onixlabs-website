using Markdig;
using Markdig.Renderers;
using Markdig.Renderers.Html.Inlines;

namespace OnixLabs.Web.Shared;

public sealed class LinkTargetExtension : IMarkdownExtension
{
    public void Setup(MarkdownPipelineBuilder pipeline)
    {
    }

    public void Setup(MarkdownPipeline pipeline, IMarkdownRenderer renderer)
    {
        if (renderer is not HtmlRenderer htmlRenderer)
            return;

        LinkInlineRenderer? linkRenderer = htmlRenderer.ObjectRenderers.FindExact<LinkInlineRenderer>();

        if (linkRenderer is not null)
            htmlRenderer.ObjectRenderers.Remove(linkRenderer);

        htmlRenderer.ObjectRenderers.Add(new CustomLinkInlineRenderer());
    }
}