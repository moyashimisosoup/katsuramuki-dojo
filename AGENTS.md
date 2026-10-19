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
