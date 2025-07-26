namespace OnixLabs.Web.Shared;

public sealed class Observable<T>(T value)
{
    private T value = value;
    private EventHandler<ValueChangedEventArgs<T>>? valueChanged;

    public T Value
    {
        get => value;

        set
        {
            if (EqualityComparer<T>.Default.Equals(this.value, value)) return;

            T old = this.value;
            this.value = value;
            valueChanged?.Invoke(this, new ValueChangedEventArgs<T>(old, value));
        }
    }

    public event EventHandler<ValueChangedEventArgs<T>>? ValueChanged
    {
        add => valueChanged += value;
        remove => valueChanged -= value;
    }

    public static implicit operator Observable<T>(T value) => new(value);
    public static implicit operator T(Observable<T> value) => value.Value;

    private void OnValueChanged(T oldValue, T newValue)
    {
        ValueChangedEventArgs<T> args = new(oldValue, newValue);
        valueChanged?.Invoke(this, args);
    }
}

public sealed class ValueChangedEventArgs<T>(T oldValue, T newValue) : EventArgs
{
    public T OldValue { get; } = oldValue;
    public T NewValue { get; } = newValue;
}