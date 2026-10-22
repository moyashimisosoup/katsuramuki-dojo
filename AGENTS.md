# Katsuramuki Dojo | agent notes

- 正本: `moyashimisosoup/katsuramuki-dojo`。初期設計の重要な決定は `docs/`、カードは `data/` に保存。
- R0局所切削コア、静的操作画面、R0に連動するThree.js（CDN）3Dメッシュ描画コードは実装済み。ただし**実際のWebGL描画をPC/スマホ実機で受け入れる検証は未完了**。帯の物理的なしなり、切削抵抗、破断、Pages配信、iPhone実機動作も未実装・未検証。コード保存・CI・実機・公開を区別する。
- 桂むきの体験を主役とする。料理・包丁・歴史を最初から巨大な機能群として同時実装しない。
- 言い伝え・語源説を歴史上の事実として断言しない。出典と `review_status` を保つ。
- 実際の包丁作業を安全に教える保証はしない。ゲーム内擬似物理の値は仮設定とする。
- 公開Repoに秘密情報・学校/個人情報・認証情報・非公開会話のURLを置かない。
- データ変更後 `python3 tools/validate_data.py`。テスト合格と実機/学術監修を混同しない。
- 2026-10-19にGitHub Pages公開承認。初回404をPages有効化後に再実行し、同日12:10 JSTに配信成功・公開後のHTML/3D JSのHTTP検証も成功。公開URL `https://moyashimisosoup.github.io/katsuramuki-dojo/`。WebGL実描画、操作感、iPhone/Android動作は未確認。`docs/PAGES_RELEASE_20261019.md` を参照。
- R0の更新時は `npm test` と `python3 tools/validate_data.py` を実行。半径・体積の保存則と部分角度の削りが破綻しないことを確認する。

- 全体12項目・3D個別8項目の進捗カウントは `docs/3D_PROGRESS_CHECKPOINT_20261019.md` を参照。チェック項目の合格を確認してから比率を更新し、描画の未検証を合格としない。
- ユーザーは実際の桂むき姿勢・包丁角度・写実性の不足を確認。既存7/8=88%は実装チェックのみで見た目の品質ではない。`docs/PHOTO_MATCHED_ANIMATION_PIPELINE_V1.md` を新たな品質計画として参照し、未承認のGLB/写真/3D描画を公開済みとして扱わない。
- 桂むき姿勢の根拠は `docs/KATSURAMUKI_TECHNIQUE_REFERENCE_V1.md` と `data/katsuramuki_technique_evidence_v1.json` を参照。**「立て持ち」=不正解と一律判定しない**（技法差あり）。左右の親指・大根の保持・刃の切れ刃線/刃面角/円柱軸/撮影角を分離。動画4件は説明欄まで確認であり映像フレーム未解析、角度の数値は未校正。画像生成と3D移行は専門実演の静止姿勢確認を先行させる。

- 2026-10-20に京都調理師専門学校の公式実演（VID-01）の時刻なし自動字幕を取得。字幕は上げ局面で大根を回し戻し局面では回さないと説明する。`docs/KATSURAMUKI_VIDEO_MOTION_AUDIT_V1.md` を参照。実映像のフレーム検証・刃面角校正は未完了。ゲームの常時回転を実物と同等としない。

- `src/physics/stroke-cycle.js` は公式実演の字幕による仮の上げ/戻し位相モデル。**時間・速度・振幅は未測定の仮値であり公開ゲームの `src/main.js` へは未接続**。独立PoCの状態は `docs/STROKE_CYCLE_R05_20261020.md` を参照。映像と静止姿勢を検証するまで物理忠実性を主張しない。

- 姿勢採用は `docs/KATSURAMUKI_POSE_EVIDENCE_V1_20261022.md` / `src/rig/pose-evidence.js` の **GRIP / CONTACT / CROSS_VIEW 3回ゲート**を先行する。実写候補6件は未観察・未承認で、画像上の2線角度から物理刃面角は逆算できない。出典PDF（2023年の椙山女学園大学論文）は検索断片のみ確認、図の現物は未確認。実写/フレームに架空の座標を付けない。公開Pagesへの追加・変更は別の検収作業とする。

- 2026-10-22、辻調JPEGのKPHOTO-002/007/013と別競技画像KPHOTO-026の**計4原画を目視**。`docs/KATSURAMUKI_PHOTO_OBSERVATIONS_20261022.md` を参照。KPHOTO-013親指2点のみ粗い2D座標を記録、その他刃元・刃先・接触線・帯出口は不明。**正式な3D姿勢認定0/30**。講師と学生の異なる手、および異なる実演者の複数写真を一つの3D動作として混同しない。

- 2026-10-22独立の`experiments/pose-lab.html`と`src/rig/pose-lab-model.js`を追加。**一つの仮3D座標から三カメラで表示**し、手を掌/親指の仮支点として可視化。手指の形状、刃面角、帯曲線はいずれも未校正。検証仕様は`docs/POSE_LAB_SINGLE_SCENE_V01_20261022.md`。本番`index.html`や`src/main.js`へ導入済みと扱わない。

- 2026-10-23 APP-022 pose-labで実演者の左右とカメラの画面左右を区別。左手＝大根（茶色）／右手＝包丁（青色）の役割テキストを3ビューに表示。軸方向では前後が重なることを明記。詳細 `docs/POSE_LAB_HAND_ORIENTATION_20261023.md`。**未校正の球・棒は人の正しい指関節姿勢ではない**ため、左右の役割検証を実技姿勢合格と扱わない。
