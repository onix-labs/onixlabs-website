using Microsoft.AspNetCore.Components;

namespace OnixLabs.Web.Areas.Tools.Components.Mathematics;

public partial class RatioCalculator : ComponentBase
{
    private FieldChanged lastFieldChanged = FieldChanged.None;
    private double firstAntecedent, firstConsequent, secondAntecedent, secondConsequent;
    private bool isAntecedentLocked, isConsequentLocked;

    private void IncrementFirstAntecedent()
    {
        firstAntecedent++;
        lastFieldChanged = FieldChanged.FirstAntecedent;
        CalculateRatio();
    }

    private void IncrementFirstConsequent()
    {
        firstConsequent++;
        lastFieldChanged = FieldChanged.FirstConsequent;
        CalculateRatio();
    }

    private void IncrementSecondAntecedent()
    {
        secondAntecedent++;
        lastFieldChanged = FieldChanged.SecondAntecedent;
        CalculateRatio();
    }

    private void IncrementSecondConsequent()
    {
        secondConsequent++;
        lastFieldChanged = FieldChanged.SecondConsequent;
        CalculateRatio();
    }

    private void DecrementFirstAntecedent()
    {
        firstAntecedent--;
        lastFieldChanged = FieldChanged.FirstAntecedent;
        CalculateRatio();
    }

    private void DecrementFirstConsequent()
    {
        firstConsequent--;
        lastFieldChanged = FieldChanged.FirstConsequent;
        CalculateRatio();
    }

    private void DecrementSecondAntecedent()
    {
        secondAntecedent--;
        lastFieldChanged = FieldChanged.SecondAntecedent;
        CalculateRatio();
    }

    private void DecrementSecondConsequent()
    {
        secondConsequent--;
        lastFieldChanged = FieldChanged.SecondConsequent;
        CalculateRatio();
    }

    private void ToggleAntecedentLock()
    {
        isAntecedentLocked = !isAntecedentLocked;
        Calculate();
    }

    private void ToggleConsequentLock()
    {
        isConsequentLocked = !isConsequentLocked;
        Calculate();
    }

    private void Calculate()
    {
        lastFieldChanged = FieldChanged.None;
        CalculateRatio();
    }

    // private void CalculateRatio()
    // {
    //     int zeroCount = 0;
    //
    //     if (firstAntecedent == 0) zeroCount++;
    //     if (firstConsequent == 0) zeroCount++;
    //     if (secondAntecedent == 0) zeroCount++;
    //     if (secondConsequent == 0) zeroCount++;
    //
    //     if (zeroCount >= 2)
    //         return;
    //
    //     if (firstAntecedent is 0 || lastFieldChanged is FieldChanged.FirstConsequent)
    //         firstAntecedent = firstConsequent * secondAntecedent / secondConsequent;
    //
    //     else if (firstConsequent is 0 || lastFieldChanged is FieldChanged.FirstAntecedent)
    //         firstConsequent = firstAntecedent * secondConsequent / secondAntecedent;
    //
    //     else if (secondAntecedent is 0 || lastFieldChanged == FieldChanged.SecondConsequent)
    //         secondAntecedent = firstAntecedent * secondConsequent / firstConsequent;
    //
    //     else if (secondConsequent is 0 || lastFieldChanged is FieldChanged.SecondAntecedent)
    //         secondConsequent = firstConsequent * secondAntecedent / firstAntecedent;
    //
    //     else secondConsequent = firstConsequent * secondAntecedent / firstAntecedent;
    //
    //     StateHasChanged();
    // }

    private void CalculateRatio()
    {
        int zeroCount = 0;

        if (firstAntecedent == 0) zeroCount++;
        if (firstConsequent == 0) zeroCount++;
        if (secondAntecedent == 0) zeroCount++;
        if (secondConsequent == 0) zeroCount++;

        if (zeroCount >= 2)
            return;

        // Handle locked antecedents
        if (isAntecedentLocked)
        {
            if (lastFieldChanged == FieldChanged.FirstAntecedent)
            {
                secondAntecedent = firstAntecedent * secondConsequent / firstConsequent;
                StateHasChanged();
                return;
            }
            else if (lastFieldChanged == FieldChanged.SecondAntecedent)
            {
                firstAntecedent = secondAntecedent * firstConsequent / secondConsequent;
                StateHasChanged();
                return;
            }
        }

        // Handle locked consequents
        if (isConsequentLocked)
        {
            if (lastFieldChanged == FieldChanged.FirstConsequent)
            {
                secondConsequent = firstConsequent * secondAntecedent / firstAntecedent;
                StateHasChanged();
                return;
            }
            else if (lastFieldChanged == FieldChanged.SecondConsequent)
            {
                firstConsequent = secondConsequent * firstAntecedent / secondAntecedent;
                StateHasChanged();
                return;
            }
        }

        // Default behavior when no locks are applied
        if (firstAntecedent is 0 || lastFieldChanged is FieldChanged.FirstConsequent)
            firstAntecedent = firstConsequent * secondAntecedent / secondConsequent;

        else if (firstConsequent is 0 || lastFieldChanged is FieldChanged.FirstAntecedent)
            firstConsequent = firstAntecedent * secondConsequent / secondAntecedent;

        else if (secondAntecedent is 0 || lastFieldChanged == FieldChanged.SecondConsequent)
            secondAntecedent = firstAntecedent * secondConsequent / firstConsequent;

        else if (secondConsequent is 0 || lastFieldChanged is FieldChanged.SecondAntecedent)
            secondConsequent = firstConsequent * secondAntecedent / firstAntecedent;

        else
            secondConsequent = firstConsequent * secondAntecedent / firstAntecedent;

        StateHasChanged();
    }

    private enum FieldChanged
    {
        None,
        FirstAntecedent,
        FirstConsequent,
        SecondAntecedent,
        SecondConsequent
    }
}