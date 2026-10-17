# かつらむき道場 🥬

> 一本の大根から、日本料理の技と文化が広がる。

桂むきを中心に、和包丁・料理・技法の歴史を探究するWebシミュレーターの開発リポジトリです。

**APP-ID：APP-022**  
**開発段階（2026-10-17）：構想・初期設計 / データ土台整備。ゲーム本体未実装。GitHub Pages未公開。**

## 目指す体験

- 大根を回し、包丁を送り、薄い帯が伸びていく気持ちよさを再現する。
- 厚さ、ばらつき、帯の長さ、破断理由が操作と対応するようにする。
- 初回は指1本の「おためし」、慣れたら両手の「道場」、後に「無限桂むき」を楽しむ。
- 桂むきの技が上達すると、包丁・けん作り・語源説などの図鑑が広がる。

## このリポジトリの中身

| パス | 内容 |
| --- | --- |
| [docs/INITIAL_DESIGN.md](docs/INITIAL_DESIGN.md) | ゲーム体験、入力、評価、技法と文化の初期設計 |
| [docs/ROADMAP.md](docs/ROADMAP.md) | 実装フェーズと受入条件 |
| [docs/PHASE0_KATSURAMUKI_PHYSICS_PLAN_V1.md](docs/PHASE0_KATSURAMUKI_PHYSICS_PLAN_V1.md) | 桂むき専用物理モデル・操作・表示・検証の詳細計画 |
| [docs/CONTENT_POLICY.md](docs/CONTENT_POLICY.md) | 出典・史実・仮説・ゲーム表現の線引き |
| [data/encyclopedia.json](data/encyclopedia.json) | ゲーム用の図鑑カード初稿 |
| [data/sources.json](data/sources.json) | 典拠・追加確認先の台帳 |
| [data/simulation_presets.json](data/simulation_presets.json) | 擬似物理・モードの調整案（実測値ではない） |
| [tools/validate_data.py](tools/validate_data.py) | JSON整合性のオフライン検査 |

## 開発方針

静的Web優先、スマホとPCを想定。まずはCanvas 2D・Pointer Eventsを使って「包丁1本、大根1本、帯1本」の操作検証を行います。精密な物理演算、ランキング、サーバー・ログインは初期対象外。

**注意:** 現在の記載数値はゲーム内の仮調整値で、現実の包丁技能や正確な厚みを保証しません。料理・歴史カードは編集初稿で、参照資料の再確認・専門的な監修が未完了です。

## 来歴

- 新規Publicリポジトリを [App Factory Issue #7](https://github.com/moyashimisosoup/app-factory/issues/7) から生成。
- アプリの名称・デザイン・図鑑内容は今後変更される可能性があります。
- **ライセンスは未決定です。** 外部サイトの文章・写真・映像を転載しません。

次の操作：Phase 0の入力・リボン描画の小さな実装と、iPhone Safariでの操作確認。
