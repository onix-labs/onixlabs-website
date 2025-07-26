using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Primitives;

namespace OnixLabs.Web.Areas.Contact.Pages;

public partial class Index : ComponentBase
{
    private string reason = string.Empty;
    private string message = string.Empty;

    [Inject]
    public required NavigationManager NavigationManager { get; init; }

    protected override void OnInitialized()
    {
        Uri uri = NavigationManager.ToAbsoluteUri(NavigationManager.Uri);
        Dictionary<string, StringValues> query = QueryHelpers.ParseQuery(uri.Query);

        if (!query.TryGetValue("reason", out StringValues value)) return;

        switch (value)
        {
            case "aero-demo":
                reason = "Aero Platform (Book a Demo)";
                message = "Hello. I'd like to see Aero in action.";
                break;
            case "consulting":
                reason = "Consulting";
                message = "Hello. I'd like to discuss your consultation services.";
                break;
        }
    }
}