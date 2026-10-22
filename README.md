# かつらむき道場 🥬

> 一本の大根から、日本料理の技と文化が広がる。

桂むきを中心に、和包丁・料理・技法の歴史を探究するWebシミュレーターの開発リポジトリです。

**APP-ID：APP-022**  
**開発段階（2026-10-19）：R0切削＋Three.jsの3Dモデル連動コードを実装。Node幾何テスト19件・CIの確認とWebGL実描画受入を区別。R1切削抵抗、R2帯の柔軟物理、R3破断は未実装。GitHub Pagesは公開済み（2026-10-19 12:10 JST、CI内HTTPでHTMLと3D JSの到達を確認）。実画面のWebGL操作は未検証。**

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
| [docs/REAL_PHYSICS_ENGINE_PLAN_V2.md](docs/REAL_PHYSICS_ENGINE_PLAN_V2.md) | 実物理ベースの設計 v2：局所接触、材料除去、抵抗、帯の柔軟物理、破断 |
| [docs/PHYSICS_MEASUREMENT_VALIDATION_V1.md](docs/PHYSICS_MEASUREMENT_VALIDATION_V1.md) | 実測資料の信頼区分、校正プロトコル、妥当性検証ゲート |
| [docs/R0_IMPLEMENTATION.md](docs/R0_IMPLEMENTATION.md) | R0の実装範囲、数理的限界、検証手順 |
| [docs/3D_PROGRESS_CHECKPOINT_20261019.md](docs/3D_PROGRESS_CHECKPOINT_20261019.md) | 全体12項目・3D個別8項目の確認可能な進捗台帳 |
| [docs/PHOTO_MATCHED_ANIMATION_PIPELINE_V1.md](docs/PHOTO_MATCHED_ANIMATION_PIPELINE_V1.md) | 写実的な見本画像を実際の桂むき動作へ変換するアセット・物理統合計画 |
| [docs/REAL_KATSURAMUKI_PHOTO_REFERENCES_30.md](docs/REAL_KATSURAMUKI_PHOTO_REFERENCES_30.md) | 調理学校・職人による実写30点の参照リンク、出典、角度照合の候補 |
| [docs/KATSURAMUKI_TECHNIQUE_REFERENCE_V1.md](docs/KATSURAMUKI_TECHNIQUE_REFERENCE_V1.md) | 手持ち桂むきの文章13件・実演動画4件、保持方式の相違・技法の検証条件 |
| [docs/KATSURAMUKI_VIDEO_MOTION_AUDIT_V1.md](docs/KATSURAMUKI_VIDEO_MOTION_AUDIT_V1.md) | 京都調理師専門学校公式実演の字幕による8つの動作条件、映像未確認点とR0差分 |
| [data/katsuramuki_motion_audit_20261020.json](data/katsuramuki_motion_audit_20261020.json) | 動作と字幕証拠レベル・未検証動画フレーム・確認ゲートの台帳 |
| [data/katsuramuki_technique_evidence_v1.json](data/katsuramuki_technique_evidence_v1.json) | 主張12件と出典IDの対応、フレーム未確認状況を機械可読で保持 |
| [data/real_katsuramuki_photo_references_30.json](data/real_katsuramuki_photo_references_30.json) | 30点の機械可読な参照データ（画像自体の転載は禁止複製なし） |
| [src/rig/knife-pose.js](src/rig/knife-pose.js) | 切れ刃・包丁面・柄の独立座標とGLB用アンカー（画面への接続は後続） |
| [src/rig/pose-evidence.js](src/rig/pose-evidence.js) | 実写の3回レビュー・別視点校正・ランドマーク記録の証拠ゲート（自動3D採用は禁止） |
| [experiments/pose-lab.html](experiments/pose-lab.html) | 独立の実験ページ。**一つの未校正3D姿勢**を正面斜め・側面・軸方向で表示（本体ゲームへ未接続） |
| [docs/POSE_LAB_SINGLE_SCENE_V01_20261022.md](docs/POSE_LAB_SINGLE_SCENE_V01_20261022.md) | 3視点の座標・指の仮支点・受入条件・未検証事項 |
| [docs/KATSURAMUKI_POSE_EVIDENCE_V1_20261022.md](docs/KATSURAMUKI_POSE_EVIDENCE_V1_20261022.md) | 手の保持・刃接点の判定規則と2023年の研究論文の検証状況 |
| [docs/KATSURAMUKI_PHOTO_OBSERVATIONS_20261022.md](docs/KATSURAMUKI_PHOTO_OBSERVATIONS_20261022.md) | 実物写真4点の直接目視・隠れた刃先・親指の概略2点を記録（3D姿勢未承認） |
| [data/katsuramuki_pose_review_candidates_v1.json](data/katsuramuki_pose_review_candidates_v1.json) | 実写5点＋動画1点の未承認姿勢候補と8対応点の空欄テンプレート |
| [docs/PAGES_RELEASE_20261019.md](docs/PAGES_RELEASE_20261019.md) | GitHub Pagesの承認、最小公開配信、確認結果・公開進捗 |
| [src/view3d/geometry.js](src/view3d/geometry.js) | R0から3D大根・刃先・帯の幾何形状への変換 |
| [src/view3d/scene.js](src/view3d/scene.js) | Three.js描画と全体/接触拡大の2カメラ |
| [src/physics/surface.js](src/physics/surface.js) | 局所切削・帯/屑・体積積算エンジン |
| [src/physics/stroke-cycle.js](src/physics/stroke-cycle.js) | 未校正の包丁上げ/戻し位相モデル。公開ゲームへは未接続 |
| [docs/STROKE_CYCLE_R05_20261020.md](docs/STROKE_CYCLE_R05_20261020.md) | 技法根拠、R0連携方法、工程検収の5項目 |
| [index.html](index.html) | [GitHub Pages公開試作](https://moyashimisosoup.github.io/katsuramuki-dojo/)（WebGL実画面の操作検証は未完了） |
| [docs/CONTENT_POLICY.md](docs/CONTENT_POLICY.md) | 出典・史実・仮説・ゲーム表現の線引き |
| [data/encyclopedia.json](data/encyclopedia.json) | ゲーム用の図鑑カード初稿 |
| [data/sources.json](data/sources.json) | 典拠・追加確認先の台帳 |
| [data/simulation_presets.json](data/simulation_presets.json) | 擬似物理・モードの調整案（実測値ではない） |
| [tools/validate_data.py](tools/validate_data.py) | JSON整合性のオフライン検査 |

## 開発方針

静的Web優先、スマホとPCを想定。現在の主画面はThree.js 0.180.0（CDN）の試作で、ブラウザが3Dを利用できない場合は従来のCanvas 2Dへ戻ります。R0の数理的切削結果を表面メッシュと帯メッシュに接続するもので、柔軟体・抵抗・破断を物理的に再現する段階ではありません。ランキング、サーバー・ログインは初期対象外。

**注意:** 現在の記載数値はゲーム内の仮調整値で、現実の包丁技能や正確な厚みを保証しません。料理・歴史カードは編集初稿で、参照資料の再確認・専門的な監修が未完了です。

## 来歴

- 新規Publicリポジトリを [App Factory Issue #7](https://github.com/moyashimisosoup/app-factory/issues/7) から生成。
- アプリの名称・デザイン・図鑑内容は今後変更される可能性があります。
- **ライセンスは未決定です。** 外部サイトの文章・写真・映像を転載しません。

## R0試作の確認方法

Node.js 20以上で `npm test` を実行すると、局所切削・体積保存12件＋3D形状の純粋な幾何計算7件の合計19テストが実行されます。描画はThree.jsの外部CDNを参照するため、オンラインのWebGL対応ブラウザを別途使用します。テスト成功とWebGLの実描画を混同しません。

`index.html` は静的Webアプリです。ES Modulesを使うため、`file://` 直開きではなく静的HTTPサーバー上で閲覧します。例：`python3 -m http.server 8000` で起動し `http://localhost:8000` を開く方法があります。**これは公開URLではありません**。ブラウザ操作とデータ検証、iPhone Safari実機検証はそれぞれ区別します。

次の操作：公開済みURLをPCブラウザ/iPhone Safari/Androidで実際に操作し、3D表示・カメラ切替・操作性能を検証する。配信とHTTP確認は完了。
