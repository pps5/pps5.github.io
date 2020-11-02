---
title: "Fragment の getArguments, requireArguments の使い分けについて"
emoji: "😸"
type: "tech"
topics: ["android"]
published: true
created: 2020/08/17
description: Fragment の getArguments, requireArguments の使い分けについて
---

## それぞれのメソッドの違い
Fragment に何か値を渡したいとき、今であれば Jetpack Navigation と SafeArgs を使うのが一番簡単で確実だと思いますが、古いプロジェクトだと必ずしもそうはいかないため今まで通りの実装をしなければなりません。

newInstance を利用した実装が一般的で、 Fragment を新しく作成するときは以下のように実装されたメソッドを使用します。

```kotlin
class SampleFragment : Fragment() {

    companion object {
        private const val KEY = "key"

        fun newInstance(value: Int) {
            val f = SampleFragment()
            f.arguments = bundleOf(KEY, value)
            return f
        }
    }
}
```

この値を取り出すときに用いるのが getArguments や requireArguments ですが、戻り値が Nullable かどうかが異なります。

```kotlin
val args = getArguments
if (args != null) {
    val value = args.getInt(KEY)
    doSomething(value)
}
```

```kotlin
val value = requireArguments().getInt(KEY)
doSomething(value)
```

requireArguments は内部的に null チェックを行っており、もし null であれば例外が発生します。したがって、この SampleFragment を直接コンストラクタで生成した場合、

- 前者 (getArguments): doSomething は実行されないが、クラッシュもしない
- 後者 (requireArguments): 例外が発生してアプリがクラッシュする

といった挙動になります。


## どう使い分けるか
基本的に全て requireArguments で問題ないはずです。

Fragment に何か値を渡すとき、それは Fragment で必ず使う値であることがほとんどです。たとえば、ある日にちのデータを表示する画面であれば日付は必要でしょうし、カテゴリに応じた内容を表示するならばカテゴリは必須であるはずです。

null チェックをして、データがあったときだけ画面を構築するようにしてしまうと、必要なデータがない異常な状態であっても正常に動作しているかのように見えてしまいます。Fragmentの使い方を間違っていることがわかるように、誤った初期化をしていれば即座にクラッシュさせたほうが開発中に気づきやすくなります。

値が渡されないことが想定される場合でも、必ず newInstance で arguments をセットすればそれで良いと思います。

```kotlin
// bad
fun newInstance(value: Int?) {
    val f = SampleFragment()
    if (value != null) {
        f.arguments = bundleOf(KEY, value)
    }
    return f
}

// good
fun newInstance(value: Int?) {
    val f = SampleFragment()
    val args = Bundle()
    if (value != null) {
        args.putInt(value)
    }
    f.arguments = args
    return f
}
```

これで少なくとも newInstance 経由でインスタンスを生成していれば getArguments が null になることがなくなります。そして requireArguments を使用していれば、たとえ誤って直接コンストラクタで生成したとしても例外が発生するため開発中に検出できるようになります。


## まとめ
なんだかんだ考えた結果、自分の中では全部 requireArguments で良いという結論に至りました。もしここに記載したもの以外で何かお気づきの点がありましたら、[@Inb\_J](https://twitter.com/Inb\_J) までご連絡ください。

requireArguments の実装を見ると、例外を送出しているため実開発で使用するのに戸惑う人もいるかもしれませんが、例外は必ずしも悪いものではなく、開発段階で不正な状態を発見するのにも役立ちます。特に Android では Android 固有のライフサイクルによって、静的解析などで厳密にチェックすることも難しいこともあるため、こういった形で検証できるようにしたほうが良いでしょう。
