---
title: "WebView と JvmOverloads"
emoji: "😸"
type: "tech"
topics: ["android"]
published: true
created: 2019/02/19
description: JvmOverloads 利用時にデフォルトスタイルが上書きされる View とその対処法
---

## @JvmOverloads とそれによって発生しうる問題
Android で Custom View を作ろうとすると、複数のコンストラクタを実装する必要がありますが、Kotlin を使用している場合は `@JvmOverloads` アノテーションを使うことで簡単に作成することができます。

```kotlin
class MyCustomView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : WebView(context, attrs, defStyleAttr)
```

このように記述することで、`attrs` や `defStyleAttr` が無い場合のオーバーロードコンストラクタも生成されます。基本的には問題ないのですが、一部のViewでは期待した挙動にならないことがあります。

その一つは[Kotlinでcustom viewを実装する時の注意点 \- Qiita](https://qiita.com/kwhrstr1206/items/93827190a535b11bd064)でも書かれているように EditText です。`defStyleAttr` が0で初期化されることにより、Context と AttributeSet を受け取るコンストラクタで指定されているデフォルトのスタイルが適用されず、意図した動作となりません。こういった View はそれなりに存在しており、少し古い記事になりますが[Y\.A\.M の 雑記帳: Android　スタイルメモ](http://y-anz-m.blogspot.com/2012/05/android.html)でその一覧が示されています。

このようなViewに遭遇したとき、実際にどのように調査するかの備忘録です。


## 原因調査

今回私が遭遇した View は WebView なのですが、`@JvmOverloads` によりデフォルトスタイルが適用されない場合、表示した Web ページのテキストボックスをクリックしてもキーボードが表示されません。

非公式ではありますが、有志の方が公開している[Androidソースコード検索サービス \- Developer Collaboration Project](https://sites.google.com/site/devcollaboration/codesearch)というものがあります。

```java
public WebView(Context context, AttributeSet attrs) {
    this(context, attrs, com.android.internal.R.attr.webViewStyle);
}
```

WebView 内では上記のように定義されているので、任意の Andoid バージョンのソースコードで `webViewStyle` というキーワードで検索してみると、なにやら `Widget.WebView` が影響していそうです。

![Search result for wid](/img/search_result_for_webviewstyle.png)

さらに `Widget.WebView` で検索すると、以下のようなコードが見つかりました。Theme 内で `focusable` を指定しており、それが設定されないことにより、キーボードが現れない現象が発生していました。

```xml
<style name="Widget.WebView">
    <item name="focusable">true</item>
    <item name="focusableInTouchMode">true</item>
    <item name="scrollbars">horizontal|vertical</item>
</style>
```

[該当箇所](https://search.siprop.org/android-8.0.0_r1.0/xref/frameworks/base/core/res/res/values/styles.xml#699)


## 問題が発生する View への対処

実際にこういった View にどうアプローチするかを考えると、3引数（あるいは4引数）のコンストラクタを使う機会はそれほどないはずなので、2引数で `@JvmOverloads` を使うのが一番楽だと思います。そこで問題が起きた際には改めて複数のコンストラクタを生成する、と言った形でも問題ないでしょう。


## 参考

- [Kotlinでcustom viewを実装する時の注意点 \- Qiita](https://qiita.com/kwhrstr1206/items/93827190a535b11bd064)
- [Y\.A\.M の 雑記帳: Android　スタイルメモ](http://y-anz-m.blogspot.com/2012/05/android.html)
- [Androidソースコード検索サービス \- Developer Collaboration Project](https://sites.google.com/site/devcollaboration/codesearch)
- [Do I need all three constructors for an Android custom view? \- Stack Overflow](https://stackoverflow.com/questions/9195713/do-i-need-all-three-constructors-for-an-android-custom-view)

