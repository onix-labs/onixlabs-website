namespace OnixLabs.Web.Shared;

internal static class RazorHelper
{
    public static string? If(bool condition, string trueValue) =>
        condition ? trueValue : null;

    public static string IfElse(bool condition, string trueValue, string falseValue) =>
        condition ? trueValue : falseValue;
}