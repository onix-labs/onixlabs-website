using System.Security.Cryptography;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using OnixLabs.Security.Cryptography;
using OnixLabs.Web.Shared;

namespace OnixLabs.Web.Areas.Tools.Components.Cryptography;

public partial class HashGenerator : ComponentBase
{
    private readonly Observable<string> inputText = string.Empty;
    private readonly Observable<int> algorithm = 0;
    private readonly Observable<int> shakeLength = 128;
    private string hashResult = string.Empty;
    
    [Inject]
    public required IJSRuntime JsRuntime { get; init; }

    protected override void OnInitialized()
    {
        inputText.ValueChanged += (_, _) => Calculate();
        algorithm.ValueChanged += (_, _) => Calculate();
        shakeLength.ValueChanged += (_, _) => Calculate();
    }

    private void IncrementLength()
    {
        shakeLength.Value++;
    }

    private void DecrementLength()
    {
        shakeLength.Value = Math.Max(0, shakeLength.Value - 1);
    }

    private void Calculate()
    {
        HashAlgorithm hashAlgorithm = algorithm.Value switch
        {
            0 => SHA1.Create(),
            1 => SHA256.Create(),
            2 => SHA384.Create(),
            3 => SHA512.Create(),
            4 => Sha3.CreateSha3Hash224(),
            5 => Sha3.CreateSha3Hash256(),
            6 => Sha3.CreateSha3Hash384(),
            7 => Sha3.CreateSha3Hash512(),
            8 => Sha3.CreateSha3Shake128(shakeLength),
            9 => Sha3.CreateSha3Shake256(shakeLength),
            _ => throw new ArgumentOutOfRangeException()
        };

        hashResult = Hash.Compute(hashAlgorithm, inputText.Value).ToString();

        StateHasChanged();
    }
    
    private async Task CopyToClipboard()
    {
        await JsRuntime.CopyToClipboardAsync(hashResult);
    }
}