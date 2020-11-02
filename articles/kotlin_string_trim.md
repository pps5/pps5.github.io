---
title: "Kotlin における String#trim()"
emoji: "😸"
type: "tech"
topics: ["android"]
published: true
created: 2018/03/15
description: Java とは異なる Kotlin の trim
---

## Java との挙動の違い
Kotlin における `String#trim()` は Java のそれとはやや異なった実装がされています。

Java では全角スペースは削除されませんが、Kotlin では全角スペースも同様に削除されます。

```java
// Java
String word = "　word　";  // 全角スペースで囲われた文字列
System.out.println("'" + word.trim() + "'");  // => '　word　'
```

```kotlin
// Kotlin
val word = "　word　"  // 全角スペースで囲われた文字列
println("'${word.trim()}'")  // => 'word'
```

Kotlin の公式のソースコードを読んでみると、内部的には `CharSequence#trim()` を呼び出しており、さらに `Character.isWhitespace()` でスペースの判定を行っています。
このメソッドは Unicode のコードポイントで判別しているため、Space Separator カテゴリに含まれる全角スペースは trim メソッドで消されてしまいます。

一方で Java はカテゴリを考慮せず、単純に u0020 以下のものを削除するので、全角スペース(u3000) は削除されません。


## Kotlin で Java と同じ挙動を目指す

Kotlin の trim は `predicate` を渡すことができるため、そこで Java と同様の処理を行います。

```kotlin
val word = "　word "  // 全角スペースと半角スペースで囲われた文字列
println(word.trim { it <= ' ' })  // => '　word'
```

無理やり `java.lang.String` クラスへキャストすることでも可能ですが、Kotlinでは推奨されない方法なので、`predicate` を渡す方法が良いでしょう。


## 参考

- [trim - Kotlin Programming Language](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/trim.html)

