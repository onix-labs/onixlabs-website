using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using OnixLabs.Web.Shared;

namespace OnixLabs.Web.Areas.Tools.Components.Graphics;

public partial class ColorPicker : ComponentBase
{
    private int hue, saturation, lightness, red, green, blue;

    private int Hue
    {
        get => hue;
        set
        {
            hue = int.Clamp(value, 0, 360);
            Calculate(UpdatedField.Hue);
        }
    }

    private int Saturation
    {
        get => saturation;
        set
        {
            saturation = int.Clamp(value, 0, 100);
            Calculate(UpdatedField.Saturation);
        }
    }

    private int Lightness
    {
        get => lightness;
        set
        {
            lightness = int.Clamp(value, 0, 100);
            Calculate(UpdatedField.Lightness);
        }
    }

    private int Red
    {
        get => red;
        set
        {
            red = int.Clamp(value, 0, 255);
            Calculate(UpdatedField.Red);
        }
    }

    private int Green
    {
        get => green;
        set
        {
            green = int.Clamp(value, 0, 255);
            Calculate(UpdatedField.Green);
        }
    }

    private int Blue
    {
        get => blue;
        set
        {
            blue = int.Clamp(value, 0, 255);
            Calculate(UpdatedField.Blue);
        }
    }

    private string Value
    {
        get => HexValue;
        set
        {
            HexValue = value;
            Calculate(UpdatedField.Value);
        }
    }

    private string HexValue { get; set; } = "#000000";
    private string RgbValue => $"rgb({red}, {green}, {blue})";
    private string HslValue => $"hsl({hue}, {saturation}%, {lightness}%)";

    [Inject]
    public required IJSRuntime JsRuntime { get; init; }

    private void IncrementHue() => Hue++;
    private void DecrementHue() => Hue--;
    private void IncrementSaturation() => Saturation++;
    private void DecrementSaturation() => Saturation--;
    private void IncrementLightness() => Lightness++;
    private void DecrementLightness() => Lightness--;
    private void IncrementRed() => Red++;
    private void DecrementRed() => Red--;
    private void IncrementGreen() => Green++;
    private void DecrementGreen() => Green--;
    private void IncrementBlue() => Blue++;
    private void DecrementBlue() => Blue--;

    private async Task CopyToClipboard(string text)
    {
        await JsRuntime.CopyToClipboardAsync(text);
    }

    private void Calculate(UpdatedField updatedField)
    {
        if (updatedField is UpdatedField.Value)
        {
            ColorModel colorFromHex = ColorModel.FromHex(HexValue);
            red = colorFromHex.R;
            green = colorFromHex.G;
            blue = colorFromHex.B;
            hue = colorFromHex.H;
            saturation = colorFromHex.S;
            lightness = colorFromHex.L;
        }

        else if (updatedField is UpdatedField.Red or UpdatedField.Green or UpdatedField.Blue)
        {
            (int h, int s, int l) = ColorModel.RgbToHsl(red, green, blue);
            hue = h;
            saturation = s;
            lightness = l;
            HexValue = new ColorModel { R = red, G = green, B = blue, H = hue, S = saturation, L = lightness }.ToHex();
        }

        else if (updatedField is UpdatedField.Hue or UpdatedField.Saturation or UpdatedField.Lightness)
        {
            (int r, int g, int b) = ColorModel.HslToRgb(hue, saturation, lightness);
            red = r;
            green = g;
            blue = b;
            HexValue = new ColorModel { R = red, G = green, B = blue, H = hue, S = saturation, L = lightness }.ToHex();
        }
    }

    private enum UpdatedField
    {
        Value,
        Hue,
        Saturation,
        Lightness,
        Red,
        Green,
        Blue
    }

    private struct ColorModel
    {
        public int R;
        public int G;
        public int B;
        public int H;
        public int S;
        public int L;

        public static ColorModel FromHex(string hex)
        {
            hex = hex.TrimStart('#');
            int r = Convert.ToInt32(hex.Substring(0, 2), 16);
            int g = Convert.ToInt32(hex.Substring(2, 2), 16);
            int b = Convert.ToInt32(hex.Substring(4, 2), 16);
            (int h, int s, int l) = RgbToHsl(r, g, b);
            return new ColorModel { R = r, G = g, B = b, H = h, S = s, L = l };
        }

        public static (int H, int S, int L) RgbToHsl(int r, int g, int b)
        {
            double rNorm = r / 255.0, gNorm = g / 255.0, bNorm = b / 255.0;
            double max = Math.Max(rNorm, Math.Max(gNorm, bNorm));
            double min = Math.Min(rNorm, Math.Min(gNorm, bNorm));
            double h = 0, s = 0, l = (max + min) / 2;

            if (!(Math.Abs(max - min) > 0.1))
                return ((int)h, (int)(s * 100), (int)(l * 100));

            double d = max - min;

            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            if (Math.Abs(max - rNorm) < 0.1)
                h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);

            else if (Math.Abs(max - gNorm) < 0.1) h = (bNorm - rNorm) / d + 2;

            else h = (rNorm - gNorm) / d + 4;

            h *= 60;

            return ((int)h, (int)(s * 100), (int)(l * 100));
        }

        public static (int R, int G, int B) HslToRgb(int h, int s, int l)
        {
            double sNorm = s / 100.0;
            double lNorm = l / 100.0;

            double c = (1 - Math.Abs(2 * lNorm - 1)) * sNorm;
            double x = c * (1 - Math.Abs((h / 60.0) % 2 - 1));
            double m = lNorm - c / 2;

            double r = 0, g = 0, b = 0;

            switch (h)
            {
                case < 60:
                    r = c;
                    g = x;
                    break;
                case < 120:
                    r = x;
                    g = c;
                    break;
                case < 180:
                    g = c;
                    b = x;
                    break;
                case < 240:
                    g = x;
                    b = c;
                    break;
                case < 300:
                    r = x;
                    b = c;
                    break;
                default:
                    r = c;
                    b = x;
                    break;
            }

            return (
                (int)Math.Round((r + m) * 255),
                (int)Math.Round((g + m) * 255),
                (int)Math.Round((b + m) * 255)
            );
        }

        public string ToHex() => $"#{R:X2}{G:X2}{B:X2}";
    }
}