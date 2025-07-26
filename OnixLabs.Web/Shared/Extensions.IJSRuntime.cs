using Microsoft.JSInterop;

namespace OnixLabs.Web.Shared;

public static class IJSRuntimeExtensions
{
    public static async Task CopyToClipboardAsync(this IJSRuntime runtime, string text) => 
        await runtime.InvokeVoidAsync("navigator.clipboard.writeText", text);
}