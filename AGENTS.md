# Katsuramuki Dojo | agent notes

- 正本: `moyashimisosoup/katsuramuki-dojo`。初期設計の重要な決定は `docs/`、カードは `data/` に保存。
- R0局所切削コアと静的操作画面（index.html）は実装済み。現実の材料力学、帯の物理的なしなり、破断、Pages配信、iPhone実機動作は未実装・未検証。コード保存・CI・実機・サイト公開を区別する。
- 桂むきの体験を主役とする。料理・包丁・歴史を最初から巨大な機能群として同時実装しない。
- 言い伝え・語源説を歴史上の事実として断言しない。出典と `review_status` を保つ。
- 実際の包丁作業を安全に教える保証はしない。ゲーム内擬似物理の値は仮設定とする。
- 公開Repoに秘密情報・学校/個人情報・認証情報・非公開会話のURLを置かない。
- データ変更後 `python3 tools/validate_data.py`。テスト合格と実機/学術監修を混同しない。
- 公開サイト（GitHub Pagesなど）はユーザーによる別の明示的な公開方針決定後に実施する。
- R0の更新時は `npm test` と `python3 tools/validate_data.py` を実行。半径・体積の保存則と部分角度の削りが破綻しないことを確認する。
