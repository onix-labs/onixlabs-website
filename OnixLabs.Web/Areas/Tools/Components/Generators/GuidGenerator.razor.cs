using System.Text;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using OnixLabs.Core.Linq;
using OnixLabs.Web.Shared;

namespace OnixLabs.Web.Areas.Tools.Components.Generators;

public partial class GuidGenerator : ComponentBase
{
    private readonly List<Guid> guids = [];

    private int version;
    private int amount = 1;

    private bool useHyphens = true;
    private bool useBraces;
    private bool useQuotes;
    private bool useCommas;
    private bool useUppercase;

    [Inject]
    public required IJSRuntime JsRuntime { get; init; }

    private void IncrementAmount()
    {
        amount++;
        StateHasChanged();
    }

    private void DecrementAmount()
    {
        amount--;
        StateHasChanged();
    }

    private void Create()
    {
        guids.Clear();

        for (int _ = 1; _ <= amount; _++)
            guids.Add(version switch
            {
                4 => Guid.NewGuid(),
                7 => Guid.CreateVersion7(),
                _ => Guid.Empty
            });

        StateHasChanged();
    }

    private string Format(Guid guid)
    {
        StringBuilder builder = new();

        if (useQuotes)
            builder.Append('"');

        if (useBraces)
            builder.Append('{');

        builder.Append(guid);

        if (useBraces)
            builder.Append('}');

        if (useQuotes)
            builder.Append('"');

        if (useCommas)
            builder.Append(',');

        if (!useHyphens)
            builder.Replace("-", string.Empty);

        return useUppercase
            ? builder.ToString().ToUpper()
            : builder.ToString().ToLower();
    }

    private async Task CopyToClipboard(int? index = null)
    {
        await JsRuntime.CopyToClipboardAsync(index is null
            ? guids.Select(Format).JoinToString(Environment.NewLine)
            : Format(guids[index.Value])
        );
    }
}