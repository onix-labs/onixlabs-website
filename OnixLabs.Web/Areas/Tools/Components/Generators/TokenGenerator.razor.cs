using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using OnixLabs.Core.Linq;
using OnixLabs.Security;
using OnixLabs.Web.Shared;

namespace OnixLabs.Web.Areas.Tools.Components.Generators;

public partial class TokenGenerator : ComponentBase
{
    private readonly List<SecurityToken> tokens = [];

    private int generator;
    private int seed;
    private int length = 10;
    private int amount = 1;

    private bool useUpper = true;
    private bool useLower = true;
    private bool useDigits = true;
    private bool useSpecialBasic;
    private bool useSpecialExtended;

    [Inject]
    public required IJSRuntime JsRuntime { get; init; }

    private void RandomizeSeed()
    {
        seed = Random.Shared.Next();
        StateHasChanged();
    }

    private void IncrementLength()
    {
        length++;
        StateHasChanged();
    }

    private void DecrementLength()
    {
        length--;
        StateHasChanged();
    }

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
        tokens.Clear();

        SecurityTokenBuilder builder = generator switch
        {
            1 => SecurityTokenBuilder.CreatePseudoRandom(length, seed),
            2 => SecurityTokenBuilder.CreateSecureRandom(length),
            _ => throw new InvalidOperationException("Unknown generator type.")
        };

        if (useUpper)
            builder = builder.UseUpperCase();

        if (useLower)
            builder = builder.UseLowerCase();

        if (useDigits)
            builder = builder.UseDigits();

        if (useSpecialBasic)
            builder = builder.UseBasicSpecialCharacters();

        if (useSpecialExtended)
            builder = builder.UseExtendedSpecialCharacters();

        for (int _ = 1; _ <= amount; _++)
            tokens.Add(builder.ToSecurityToken());

        StateHasChanged();
    }

    private async Task CopyToClipboard(int? index = null)
    {
        await JsRuntime.CopyToClipboardAsync(index is null
            ? tokens.JoinToString(Environment.NewLine)
            : tokens[index.Value].ToString()
        );
    }
}