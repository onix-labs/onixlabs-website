# The Problem with Decimals

Throughout the course of my career, it has become apparent that there is a recurring challenge faced by developers bridging JavaScript front-end systems with Java back-end systems, particularly concerning the **precision**, and/or **scale** of decimal numbers; for example, a figure precisely defined as `50.00` using Java’s `BigDecimal` data type will be truncated to `50` when represented using JavaScript’s `Number` data type.

This discrepancy stems from inherent differences in how both languages treat numerical **precision** and/or **scale**, and highlights the necessity for a robust understanding of the respective data types when developing across these platforms.

The underlying reason for this discrepancy is remarkably simple - implementation details!

## Too Long, Didn't Read

JavaScript’s `Number` data type implements the IEEE 754 double precision floating-point standard which **inherently doesn’t preserve decimal places**.

In contrast, Java’s `BigDecimal` data type **does not implement IEEE 754**. Rather, `BigDecimal` is just a sophisticated wrapper around a BigInteger which represents its unscaled value, and an int that determines where along the number line a decimal point should be placed.

## Precision and Scale

Understanding the distinction between precision and scale is crucial when dealing with Java’s `BigDecimal` and JavaScript’s `Number` data types.

In computing, **precision** denotes the **total number of significant digits in a number**, while **scale** specifies **the number of those digits that appear after the decimal point**. These definitions are context-specific and can vary with the data type’s implementation.

**Precision** encapsulates the **maximum number of significant digits** that can be expressed or stored within a numeric data type, excluding non-significant leading or trailing zeros. For example, a precision of `5` allows for five digits in any combination, such as `123.45` or `54321`.

**Scale**, a component of precision, refers to the number of **significant digits to the right of the decimal point**. It not only reflects the fraction’s exactness but also influences rounding. For instance, a scale of `2` would round `123.456` to `123.46`.

While mathematical convention might disregard non-significant trailing zeros, in computing, they can be integral for data integrity and representational specificity. For example, a stored value of `1.23400` in a database might signify precision to the ten-thousandth place for certain applications, despite having the same mathematical value as `1.234`.

With regards to data integrity and specificity of representation, this is precisely the reason that data types such as Java’s `BigDecimal` or C#’s `decimal` exist, and why they should be used for financial amounts, in contrast to data types that implement the IEEE 754 floating-point standard, such as `Double`.

## JavaScript's Number Type

The JavaScript Number data type (equivalent to `Double` in Java) implements the IEEE 754 floating-point standard, in which the notion of precision is related to the number of bits that are used to store the significand (also known as the mantissa). IEEE 754 floating-point values are stored in a binary format that inherently doesn't preserve exact decimal places, so `1.23400` would be stored with the same precision as `1.234`.

## Java's BigDecimal Type

Java’s `BigDecimal` data type is intended to be used for high-precision decimal numbers and importantly does not implement the IEEE 754 floating-point standard. Rather, `BigDecimal` is just a sophisticated wrapper over a `BigInteger` that represents its unscaled value, and an `int` that represents its scale, so `1.23400` would be stored with greater precision and scale than `1.234`; for example:

| Value   | Unscaled Value | Scale |
| ------- | -------------- | ----- |
| 1.23400 | 123400         | 5     |
| 1.234   | 1234           | 3     |

Unlike the floating-point double, which has a fixed number of bits to represent numbers, BigDecimal can represent numbers with practically unlimited precision and scale. This means it can accurately represent very large or very small numbers without the rounding errors associated with floating-point arithmetic, which makes it better suited to financial applications.

It could be contended by some engineers that for enhanced safety, all financial figures should be represented as **integers**, treating the matter of scale as purely a concern of presentation.

Essentially, this is the underlying principle of the `BigDecimal` class; it is fundamentally an integer value to which a defined scale is applied for precise representation.

## Crossing the Boundary

Challenges pertaining to the maintenance of scale and precision arise predominantly within financial applications that necessitate rigorous representation of numerical scale. These challenges are particularly evident during the parsing process of numbers expressed via Java’s `BigDecimal` data type into JavaScript’s `Number` data type. The latter’s limitations in accurately representing high-precision decimal numbers can lead to discrepancies that are untenable in precise financial computations.

We’ll start by defining a simple response class:

```kotlin
data class Response(
  val amount: BigDecimal
)
```

We can assume that this class will produce the following JSON, given the value `50.00`:

```json
{
  "amount": 50.00
}
```

At this juncture, it may be tempting to assume that JavaScript inherently lacks the ability to preserve numerical scale, particularly when encountering a value such as `.00` within JSON-formatted data. It is, however, crucial to differentiate between the **JSON** format and **JavaScript’s numeric implementation**. While JSON (JavaScript Object Notation) adopts JavaScript’s syntactical framework for object representation, **it does not inherently impose JavaScript’s numerical constraints**.

The encoding of numbers within JSON is contingent upon the configuration of the serialisation process utilised. It is only upon deserialisation within a JavaScript environment, such as Node.js or a web browser, that a number’s scale may be subject to truncation, reflecting the behaviour of JavaScript’s `Number` data type.

We can test this by entering the following code into a browser console:

```javascript
const json = '{"amount": 50.00}';
const object = JSON.parse(json);
console.log(object);
```

This produces the following output:

```javascript
{amount:50}
```

As we observe, the value `50.00` encoded in JSON has been parsed into a `Number`, therefore the `.00` has been truncated.

At this juncture, one might consider the serialisation of numeric values as `String` to circumvent the loss of scale. However, this strategy does not provide a comprehensive resolution. Upon parsing these string-encoded numerical values back into a `Number` data type, the initial scale is invariably compromised, as we can see from the following test:

```javascript
const json = '{"amount": "50.00"}';
const object = JSON.parse(json);
console.log(object);
console.log(Number(object.amount));
```

This produces the following output:

```javascript
{amount:'50.00'}
50
```

As we observe, whilst the value `50.00` is preserved when encoded as a `String`, the `.00` is lost as soon as the value is parsed to `Number`. In essence, adopting this methodology merely shifts a greater burden onto the shoulders of front-end developers, having to split the `String` value on `.` and then obtain the length of the string after the decimal place in order to properly represent the number with the desired scale, as we can see from this example:

```javascript
const json = '{"amount": "50.00"}';
const object = JSON.parse(json);
const scale = object.amount.split('.')[1].length;
const number = Number(object.amount);
console.log(number.toFixed(scale));
```

This produces the following output:

```javascript
50.00
```

A better solution when using `BigDecimal` would be to return its scale in the response; for example:

```kotlin
data class Response(
  val amount: BigDecimal,
  val scale: Int = amount.scale()
)
```

We can assume that this class will produce the following JSON, given the value `50.00`:

```javascript
{
  "amount": 50.00,
  "scale": 2
}
```

Whilst the scale of the amount property will be lost upon deserialisation into a JavaScript object, the `scale`  property provides this detail up front, alleviating the burden on front-end developers:

```javascript
const json = '{"amount": 50.00, "scale": 2}';
const object = JSON.parse(json);
console.log(object.amount.toFixed(object.scale));
```

This produces the following output:

```javascript
50.00
```

At this juncture, one might consider that if sending scale values in a response to a JavaScript client, that one should also receive scale values in requests from the client. However, this strategy is also undesirable, as the request values inevitably need to be checked when received by the back-end system. Rather, it would be more efficient to check, and set the scale once the value has been received. In this case, we can adopt the following rules for checking and setting the scale of the requested value:

- If the scale of the value is less than the desired scale, increase the scale to the desired scale.
- If the scale of the value is equal to the desired scale, leave it alone.
- If the scale of the value is greater than the desired, throw an exception or return an error. We cannot always presume to know how greater than desired scale should be rounded, especially when dealing with financial values.

The following code sample illustrates these rules:

```kotlin
val desiredScale = 2

check(request.amount.scale() <= desiredScale) {
  "Requested scale is greater than the desired scale."
}

val scaledValue = request.amount.setScale(desiredScale)
```

## Machine-to-Machine Transmission

Considering that JSON is agnostic to the numerical limitations of JavaScript when it comes to serialised data, it can generally be presumed that the machine-to-machine transmission of JSON data encapsulating serialised `BigDecimal` values is safe. Nonetheless, it is imperative to recognise that this assumption is contingent upon the configuration of the serialisation and deserialisation processes employed by both the sending and receiving systems. The integrity of the `BigDecimal` values across such transmissions depends on the alignment of these configurations, without such, data integrity may be lost.

## IEEE-754 Further Reading

As stated above, IEEE 754 floating-point values are stored in a binary format that inherently doesn't preserve exact decimal places, so `1.23400` would be stored with the same precision as `1.234`.

In fact, IEEE 754 cannot represent `1.234` exactly; rather, `1.234` is an approximation of the stored value, which is actually `1.2339999999999999857891452847979962825775146484375`.

The reason that the number is presented as `1.234` is due to sophisticated algorithms, such as Dragon4, which round the value under certain (but not all) conditions.

We can demonstrate this with the following Kotlin example:

```kotlin
import java.math.BigDecimal

fun main() {
  val number = BigDecimal(1.234)
  
  println(number)
  println(number.toDouble())
}
```

This produces the following output:

```javascript
1.2339999999999999857891452847979962825775146484375
1.234
```

Whilst the example uses `BigDecimal`, we are only using it’s constructor to extract the exponent and significand bits from the `Double` value, which are then inflated to represent the full underlying value.

These approximations are the reason that the sum of `0.1` and `0.2` are not equal to `0.3` when using IEEE 754 floating-point data types.

We can demonstrate this with the following Kotlin example:

```kotlin
import java.math.BigDecimal

fun main() {
  val a = BigDecimal(0.1)
  val b = BigDecimal(0.2)

  println(a)
  println(b)

  val sum = a + b

  println(sum)
  println(sum.toDouble())
}
```

This produces the following output:

```javascript
0.1000000000000000055511151231257827021181583404541015625
0.200000000000000011102230246251565404236316680908203125
0.3000000000000000166533453693773481063544750213623046875
0.30000000000000004
```

Again, we are only using `BigDecimal` in order to inflate the `Double` value so that we can see the underlying computation. The final result `0.30000000000000004` is one of the cases where the rounding algorithm used by the `toString` method is incapable of rounding the result to the expected value of `0.3`.

## BigDecimal Further Reading

One might observe that in the examples immediately above that converting `Double` to `BigDecimal` produces a long, seemingly random number. This is not always the case; indeed, fractions that conform to the base-2 number system, such as a half, quarter, eighth, sixteenth, etc. can be represented exactly; for example:

```kotlin
import java.math.BigDecimal

fun main() {
  val number = BigDecimal(0.25)
  println(number)
}
```

This produces the following output:

```javascript
0.25
```

In contrast, setting the number to `0.26` produces a long, seemingly random number, because `0.26` cannot be represented exactly in IEEE 754 floating-point:

```kotlin
import java.math.BigDecimal

fun main() {
  val number = BigDecimal(0.26)
  println(number)
}
```

This produces the following output:

```javascript
0.2600000000000000088817841970012523233890533447265625
```

As stated above, the `BigDecimal` constructor extracts the exponent and significand bits from the `Double` value and inflates them into the true underlying value. This is not always desirable, therefore an alternative construction mechanism has been implemented, notably `valueOf` (or `toBigDecimal` in Kotlin); for example:

```kotlin
import java.math.BigDecimal

fun main() {
  val a = BigDecimal.valueOf(0.26)
  val b = 0.26.toBigDecimal()

  println(a)
  println(b)
}
```

This produces the following output:

```javascript
0.26
0.26
```

The underlying implementation of the `valueOf` and `toBigDecimal` functions simply calls `toString` thereby parsing it’s presented `String` value.

## Summary

In summary, the `BigDecimal` data type in Java should be used for financial calculations where numerical accuracy is paramount and rounding errors are unacceptable. `BigDecimal` can represent numbers exactly without the precision loss inherent in floating-point calculations.

The `Number` data type in JavaScript, being the sole native data type for representing decimal numbers, poses significant constraints when it comes to the precise handling of numerical values. Its inherent limitations in managing precision and scale render it unsuitable for financial calculations where accuracy is imperative. Therefore, it is advisable to employ the `Number` data type primarily for display purposes, rather than for the execution of monetary computations where precision is critical.

In the process of serialisation from `BigDecimal` to `Number` via JSON, it is imperative to retain the scale attribute of `BigDecimal` as this will facilitate the accurate representation of numerical values on the front-end, ensuring that the presentation aligns with the precision and scale defined in the back-end systems.

Conversely, during the deserialisation process from `Number` to `BigDecimal` via JSON, it is incumbent upon the developer to rigorously validate and apply the appropriate scaling to requested values.