# APP-022｜持ち手目線の実写見本ボード（桂むき）

- 調査・登録：2026-10-25 JST
- 対象：右利き桂むきの **第1ビュー（調理者が自分の手元を見下ろす方向）** の写真見本
- 状態：**外部画像8候補を視覚参照として登録／撮影者の厳密な主観視点、3D手指の実技認定は未確認**
- 現行試作：[独立pose-lab](https://moyashimisosoup.github.io/katsuramuki-dojo/experiments/pose-lab.html)／第1ビュー「持ち手目線（手元）」、PR #21でカメラのみ改善
- 既存の全体索引：[実物の桂むき写真30点](REAL_KATSURAMUKI_PHOTO_REFERENCES_30.md)。**重複写真を新規収集数に加算しない**。

## 使用上の重要事項

ここは**見本画像がページ内で見られる外部参照ボード**です。Markdownの `<img src="外部画像URL">` は掲載元の画像をリモート表示します。**第三者写真のJPEG/WebPをGitHubへコピー／再配布したわけではありません**。リンクの提供元で画像閲覧ができても、GitHub上での画像埋込を禁じる場合やホットリンク保護によって、プレビューが表示できない場合があります。その場合は必ず「出典ページ」を開いてください。プレビュー掲載の継続可否も出典の利用条件に従い、必要ならリンクのみへ変更します。

公開リポジトリへの**原画像バイトの保存は、個別の転載許諾または明確な再配布可能ライセンスが確認できた画像に限る**。特に「フリー素材」は再配布自由と同義ではありません。撮影者・素材提供元の同意なくオリジナル写真をアプリへ組み込まないでください。

優先順位は **撮影者の位置→左手の大根支持→右手の包丁保持→刃の接触→薄片の出口**。1枚の写真を3Dの計測データと取り違えないこと。画像は**画角と相対位置を比べる資料**であり、同一人物の連続実演や専門家の姿勢採用を代替しません。

## 最優先｜自分の手元に近い見下ろし方向

### POV-001｜macaroni（新規・真上寄り／手元アップ）

<img src="https://cdn.macaro-ni.jp/image/summary/58/58571/9tO4TMCS0WZd5heOliSwmocnaeDUrWnKQhM21ILS.jpg" width="440" alt="macaroni 桂むきの両手と包丁、大根の俯瞰方向の画像">

- **[出典ページ](https://macaro-ni.jp/58571)**／[直接画像](https://cdn.macaro-ni.jp/image/summary/58/58571/9tO4TMCS0WZd5heOliSwmocnaeDUrWnKQhM21ILS.jpg)
- 主な用途：左右の手を同時に見せる画角、大根の横軸と広い包丁面、親指の見える配置。**第1ビューの画角検証第一候補**。
- 限界：真上寄りの撮影写真であり、実演者が実際に見ていた視線・カメラ校正値は不明。画像に写る包丁の手・刃付は右利きモデルとして別途確認。
- 既存30点索引との関係：**新規**。

### POV-002｜デイリーポータルZ（既存 KPHOTO-029・手元からの視線に近い）

<img src="https://dailyportalz.jp/application/files/2516/3699/1451/17.jpg" width="440" alt="デイリーポータルZ 大根と包丁の間で両手の親指が見える接写">

- **[出典ページ](https://dailyportalz.jp/kiji/1day-katsuramuki)**／[直接画像](https://dailyportalz.jp/application/files/2516/3699/1451/17.jpg)
- 主な用途：手元へ接近した構図、刃の表面と左右の親指がどこに映るかの比較。現在の球・棒モデルにない「手で支えている感覚」の確認。
- 限界：学習者の実演例であり熟練者の標準姿勢ではない。左右の親指接触の位置と刃の正確なラインは画像の見かけのみ。
- 既存30点：**KPHOTO-029の再選定**。

### POV-003｜DELISH KITCHEN（既存 KPHOTO-028・手元斜め上）

<img src="https://image.delishkitchen.tv/recipe/375442213041079536/1.jpg?version=1636729202" width="440" alt="DELISH KITCHEN 大根の桂むきで左の支持手と右の包丁手を写した手元写真">

- **[出典ページ](https://delishkitchen.tv/recipes/375442213041079536)**／[直接画像](https://image.delishkitchen.tv/recipe/375442213041079536/1.jpg?version=1636729202)
- 主な用途：画面手前からの両手の位置、大根の保持、包丁と薄片の接続方向。第1ビューで両手が切れていないか比較する。
- 限界：光学的な一人称視点の保証はない。切れ刃と帯の真の分離点、手首の奥行き角は一枚から復元できない。
- 既存30点：**KPHOTO-028の再選定**。

### POV-004｜魚料理と簡単レシピ（新規・手元の注釈写真）

<img src="https://blog-imgs-23.fc2.com/d/t/1/dt125kazuo/20060523133447.jpg" width="440" alt="桂剥きの包丁と薄片、指の位置に矢印が書かれた実写の説明画像">

- **[出典ページ](https://dt125kazuo.blog.fc2.com/blog-entry-280.html)**／[直接画像](https://blog-imgs-23.fc2.com/d/t/1/dt125kazuo/20060523133447.jpg)
- 主な用途：包丁の運動方向、親指と薄片の関係を同じフレームで読む。**縦寄りの大根軸を含む別技法／撮影方向**として分けて扱う。
- 限界：画像上に説明用の矢印が加筆されている。矢印は測定データではない。横持ちの辻調プロファイルと混ぜず、第1ビューの唯一の姿勢原型にはしない。
- 既存30点：**新規**。

## 補助｜刃面・帯・保持の構図確認

### POV-005｜Just One Cookbook（既存 KPHOTO-023・刃と薄片の出口）

<img src="https://www.justonecookbook.com/wp-content/uploads/2025/05/Japanese-Cutting-Techniques-274-0596-Katsuramuki-Daikon.jpg" width="440" alt="Just One Cookbook 大根をむいている手の指と包丁の刃、薄片の出口が写る写真">

- **[出典ページ](https://www.justonecookbook.com/japanese-cutting-techniques/)**／[直接画像](https://www.justonecookbook.com/wp-content/uploads/2025/05/Japanese-Cutting-Techniques-274-0596-Katsuramuki-Daikon.jpg)
- 主な用途：帯が切れ刃の近傍から連続していること、指がどこへ添えられているか。
- 限界：近接した外部カメラの構図。**「本人の目線」としては採用しない**。手の左右を画像座標で決めつけない。
- 既存30点：**KPHOTO-023の再選定**。

### POV-006｜Kasumi Japan（新規・俯瞰気味の刃面接写）

<img src="https://cdn.shopify.com/s/files/1/0928/7027/9483/files/usuba-knife-use-2.webp?v=1770604965" width="440" alt="Kasumi Japan 包丁の面と大根、両手が見える桂むきの写真">

- **[出典ページ](https://kasumijapan.com/blogs/news/usuba-knife-use)**／[直接画像](https://cdn.shopify.com/s/files/1/0928/7027/9483/files/usuba-knife-use-2.webp?v=1770604965)
- 主な用途：包丁の刃面と大根側面の相対関係、両手の重なり方。
- 限界：商品解説の構図で、調理者主観ではなく、厳密な刃面角は得られない。
- 既存30点：**新規**。

### POV-007｜金沢製菓調理専門学校ブログ（新規・俯瞰外部カメラ）

<img src="https://stat.ameba.jp/user_images/20160720/14/ikscsg/e0/ab/j/o0800045013702107568.jpg" width="440" alt="調理学校 桂むきで両手と包丁、大根の断面、薄片が見える上方写真">

- **[出典ページ](https://ameblo.jp/ikscsg/entry-12182436424.html)**／[直接画像](https://stat.ameba.jp/user_images/20160720/14/ikscsg/e0/ab/j/o0800045013702107568.jpg)
- 主な用途：大根・両手・刃・長い一枚帯を同時に確認。俯瞰しても接点が手に隠れる可能性を検討する。
- 限界：観察者側からの俯瞰写真で**本人目線ではない**。カメラの左右と実演者の左右は混同不可。
- 既存30点：**新規**。

### POV-008｜辻調理師専門学校（既存 KPHOTO-013・持ち方の別基準）

[出典ページ](https://www.tsuji.ac.jp/college/chorishi/blog/cat1278/23_1.html)／[直接画像](https://www.tsuji.ac.jp/college/chorishi/blog/files/20211224nihon6.jpg)

- 主な用途：右利きの**辻調横持ち方式**に照らして親指と柄の位置を確認。
- 限界：既存[実写観察記録](KATSURAMUKI_PHOTO_OBSERVATIONS_20261022.md)で、左右親指の**粗い2D位置のみ**。切れ刃と帯の3D接点は未観察、実技認定0件。こちらは権利・埋込許諾未確認につき外部リンクで参照する。
- 既存30点：**KPHOTO-013の再選定**。

## 連続動作で確認する補助動画（静止画像としては複製しない）

| ID | 原動画 | 観察目的 | 注意 |
|---|---|---|---|
| POV-V01 | [むそう塾：右手の動き](https://www.youtube.com/watch?v=IS5qRtH-WQ8) | 右手のストロークと柄の関係 | 動画フレームを未抽出・未校正 |
| POV-V02 | [むそう塾：右親指と人差し指の関係](https://www.youtube.com/watch?v=SOv7hZTZg-8) | 包丁を持つ親指・人差し指の関係 | 未フレーム観察 |
| POV-V03 | [むそう塾：左手の動き](https://www.youtube.com/watch?v=uStNiqjueY8) | 大根回転時の左手 | 未フレーム観察 |
| POV-V04 | [むそう塾：大根から見た桂剥き GoPro](https://www.youtube.com/watch?v=aDIg1e4R_DQ) | 接点側の極端な別視点 | **大根側のカメラであり、料理人本人の目線ではない** |

動画の掲載元：[むそう塾・技法動画一覧](https://musojuku.jp/nakagawa-blog/?p=116680)。

## 第1ビューに当てはめるときの最小比較

1. **向き**：前に見える大根の横軸・右手の柄が、カメラの目線で自然な位置へ来るか。
2. **持ち手**：左手が大根、右手が包丁。写真側の手の左右は実演者の向きとカメラの裏表を確かめ、ラベルだけの鏡映で解決したことにしない。
3. **接触**：切れ刃が円柱側面へ当たり、薄片の根元が切れ刃へ接しているか。
4. **遮蔽**：調理者目線で親指・刃先・薄片の出口が全て見えるとは限らない。現実の重なりは許容し、無理にすべて露出させない。
5. **未完成**：pose-labの球・棒の仮支点を「人の正しい手」と認定しない。写真の実寸・物理刃面角を単純な2D投影から捏造しない。

**今回は参照ボードのみ更新**。 `experiments/pose-lab.js`、`src/rig/pose-lab-model.js`、R0、公開Pagesの描画動作、写真・動画の複製物は変更しない。

次の1操作：**POV-001／POV-002／POV-003のうち撮影方向が最も目的に合う1枚を選び、その1枚と第1ビューの左右手・大根軸・接触位置を人間が見比べる**。実機検収なしで姿勢合格や完成率を更新しない。
