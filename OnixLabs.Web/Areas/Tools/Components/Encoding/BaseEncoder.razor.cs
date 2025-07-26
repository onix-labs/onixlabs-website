using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using OnixLabs.Core.Text;
using OnixLabs.Web.Shared;

namespace OnixLabs.Web.Areas.Tools.Components.Encoding;

public partial class BaseEncoder : ComponentBase
{
    private readonly Observable<Format> inputFormat = Format.PlainText;
    private readonly Observable<Format> outputFormat = Format.PlainText;
    private readonly Observable<string> inputText = string.Empty;
    private string outputText = string.Empty;
    private bool isInvalid;

    [Inject]
    public required IJSRuntime JsRuntime { get; init; }

    protected override void OnInitialized()
    {
        inputText.ValueChanged += (_, _) => Calculate();
        inputFormat.ValueChanged += (_, _) => Calculate();
        outputFormat.ValueChanged += (_, _) => Calculate();
    }

    private void Swap()
    {
        (inputText.Value, outputText) = (outputText, inputText.Value);
        (inputFormat.Value, outputFormat.Value) = (outputFormat.Value, inputFormat.Value);
    }

    private void Calculate()
    {
        try
        {
            outputText = ProcessOutput(ProcessInput());
            isInvalid = false;
        }
        catch
        {
            outputText = string.Empty;
            isInvalid = true;
        }

        StateHasChanged();
    }

    private byte[] ProcessInput() => inputFormat.Value switch
    {
        Format.PlainText => System.Text.Encoding.UTF8.GetBytes(inputText.Value),
        Format.Base16Rfc4648Invariant => IBaseCodec.Base16.Decode(inputText.Value, Base16FormatProvider.Invariant),
        Format.Base16Rfc4648Lowercase => IBaseCodec.Base16.Decode(inputText.Value, Base16FormatProvider.Lowercase),
        Format.Base16Rfc4648Uppercase => IBaseCodec.Base16.Decode(inputText.Value, Base16FormatProvider.Uppercase),
        Format.Base32Rfc4648 => IBaseCodec.Base32.Decode(inputText.Value, Base32FormatProvider.Rfc4648),
        Format.Base32ZBase32 => IBaseCodec.Base32.Decode(inputText.Value, Base32FormatProvider.ZBase32),
        Format.Base32GeoHash => IBaseCodec.Base32.Decode(inputText.Value, Base32FormatProvider.GeoHash),
        Format.Base32Crockford => IBaseCodec.Base32.Decode(inputText.Value, Base32FormatProvider.Crockford),
        Format.Base32Hex => IBaseCodec.Base32.Decode(inputText.Value, Base32FormatProvider.Base32Hex),
        Format.Base32Rfc4648Padded => IBaseCodec.Base32.Decode(inputText.Value, Base32FormatProvider.PaddedRfc4648),
        Format.Base32ZBase32Padded => IBaseCodec.Base32.Decode(inputText.Value, Base32FormatProvider.PaddedZBase32),
        Format.Base32GeoHashPadded => IBaseCodec.Base32.Decode(inputText.Value, Base32FormatProvider.PaddedGeoHash),
        Format.Base32CrockfordPadded => IBaseCodec.Base32.Decode(inputText.Value, Base32FormatProvider.PaddedCrockford),
        Format.Base32HexPadded => IBaseCodec.Base32.Decode(inputText.Value, Base32FormatProvider.PaddedBase32Hex),
        Format.Base58Bitcoin => IBaseCodec.Base58.Decode(inputText.Value, Base58FormatProvider.Bitcoin),
        Format.Base58Flickr => IBaseCodec.Base58.Decode(inputText.Value, Base58FormatProvider.Flickr),
        Format.Base58Ripple => IBaseCodec.Base58.Decode(inputText.Value, Base58FormatProvider.Ripple),
        Format.Base64Rfc4648 => IBaseCodec.Base64.Decode(inputText.Value, Base64FormatProvider.Rfc4648),
        _ => throw new ArgumentOutOfRangeException()
    };

    private string ProcessOutput(byte[] bytes) => outputFormat.Value switch
    {
        Format.PlainText => System.Text.Encoding.UTF8.GetString(bytes),
        Format.Base16Rfc4648Invariant => IBaseCodec.Base16.Encode(bytes, Base16FormatProvider.Invariant),
        Format.Base16Rfc4648Lowercase => IBaseCodec.Base16.Encode(bytes, Base16FormatProvider.Lowercase),
        Format.Base16Rfc4648Uppercase => IBaseCodec.Base16.Encode(bytes, Base16FormatProvider.Uppercase),
        Format.Base32Rfc4648 => IBaseCodec.Base32.Encode(bytes, Base32FormatProvider.Rfc4648),
        Format.Base32ZBase32 => IBaseCodec.Base32.Encode(bytes, Base32FormatProvider.ZBase32),
        Format.Base32GeoHash => IBaseCodec.Base32.Encode(bytes, Base32FormatProvider.GeoHash),
        Format.Base32Crockford => IBaseCodec.Base32.Encode(bytes, Base32FormatProvider.Crockford),
        Format.Base32Hex => IBaseCodec.Base32.Encode(bytes, Base32FormatProvider.Base32Hex),
        Format.Base32Rfc4648Padded => IBaseCodec.Base32.Encode(bytes, Base32FormatProvider.PaddedRfc4648),
        Format.Base32ZBase32Padded => IBaseCodec.Base32.Encode(bytes, Base32FormatProvider.PaddedZBase32),
        Format.Base32GeoHashPadded => IBaseCodec.Base32.Encode(bytes, Base32FormatProvider.PaddedGeoHash),
        Format.Base32CrockfordPadded => IBaseCodec.Base32.Encode(bytes, Base32FormatProvider.PaddedCrockford),
        Format.Base32HexPadded => IBaseCodec.Base32.Encode(bytes, Base32FormatProvider.PaddedBase32Hex),
        Format.Base58Bitcoin => IBaseCodec.Base58.Encode(bytes, Base58FormatProvider.Bitcoin),
        Format.Base58Flickr => IBaseCodec.Base58.Encode(bytes, Base58FormatProvider.Flickr),
        Format.Base58Ripple => IBaseCodec.Base58.Encode(bytes, Base58FormatProvider.Ripple),
        Format.Base64Rfc4648 => IBaseCodec.Base64.Encode(bytes, Base64FormatProvider.Rfc4648),
        _ => throw new ArgumentOutOfRangeException()
    };

    private async Task CopyToClipboard(string text)
    {
        await JsRuntime.CopyToClipboardAsync(text);
    }

    private enum Format
    {
        PlainText,
        Base16Rfc4648Invariant,
        Base16Rfc4648Lowercase,
        Base16Rfc4648Uppercase,
        Base32Rfc4648,
        Base32ZBase32,
        Base32GeoHash,
        Base32Crockford,
        Base32Hex,
        Base32Rfc4648Padded,
        Base32ZBase32Padded,
        Base32GeoHashPadded,
        Base32CrockfordPadded,
        Base32HexPadded,
        Base58Bitcoin,
        Base58Flickr,
        Base58Ripple,
        Base64Rfc4648
    }
}