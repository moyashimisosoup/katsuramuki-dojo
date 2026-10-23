# APP-022｜HANDOFF_READY｜かつらむき道場・姿勢／切削表示の再評価

- **一時停止指示**：2026-10-23 JST。ユーザーの明示指示「一時停止して引き継ぎを発行」。**STOPPED / HANDOFF_READY**。以後この作業単位では実装・画像制作・PR作成・公開を進めない。新セッションでの再開指示を待つ。
- APP-ID: **APP-022**
- 作業領域: **右利きの手元姿勢・包丁の当て方・薄片の表示の写実性**
- 登録済みwork_id: **未確認／この引継ぎでは新規発番しない**
- 正本Repo: [moyashimisosoup/katsuramuki-dojo](https://github.com/moyashimisosoup/katsuramuki-dojo) （Public）
- branch: `main`
- **本引継ぎ作成直前に確認したmain HEAD**：[`2e75444ae85fb7c113a7de51147957f858d2fc4b`](https://github.com/moyashimisosoup/katsuramuki-dojo/commit/2e75444ae85fb7c113a7de51147957f858d2fc4b)。引継ぎ文書の追加自体はHEADを更新する。新セッションでは必ず最新HEADを取り直し、前提を上書きする。
- 開いているPR：**0件（確認時点）**
- 台帳：[Session Deck APP_PORTFOLIO.md](https://github.com/moyashimisosoup/session-deck/blob/main/docs/APP_PORTFOLIO.md)。引継ぎ後の停止状態の登録は、書込成功と読戻しで検証すること。

## 目的とユーザー評価

目標は「一見包丁と大根に見える」ことではなく、**実際の右利き桂むきの手・大根・刃元／切先・帯の発生位置が矛盾しないWebシミュレーター**。ユーザーは左右の役割（**左手＝大根の保持・回転、右手＝包丁操作**）は認めたが、**手前から見た配置の反転**を指摘。PR #18で画面上の左右順を修正した後も「やや改善したが不自然」と明示している。

**最新のユーザー評価は不合格寄り・未受入**。前回応答が「R0の2D模式図の問題」として評価した部分と、3視点の姿勢ラボは**別の表示対象**。添付スクリーンショットの実表示モード（R0 3D／R0 2D fallback／独立pose-lab）を新セッションで最初に切り分け、旧版の画面を最新実装の欠陥と誤認しないこと。ユーザーによる視覚評価は、CIのPASSと別物。

## 2026-10-23までに保存・統合済みの主な成果（再実装しない）

| 段階 | 根拠 | 完了内容／境界 |
|---|---|---|
| 技法・動画字幕の調査 | [基準資料](../KATSURAMUKI_TECHNIQUE_REFERENCE_V1.md)、[動作監査](../KATSURAMUKI_VIDEO_MOTION_AUDIT_V1.md) | 実技の左右役割、上げ時回転・戻し時無回転等を文献／字幕で整理。**動画の連続フレーム、実際の刃角は未検証** |
| 実写・姿勢の証拠台帳 | [写真観察](../KATSURAMUKI_PHOTO_OBSERVATIONS_20261022.md)、[姿勢ゲート](../KATSURAMUKI_POSE_EVIDENCE_V1_20261022.md) | 写真30点を索引、原画4点目視、6候補のうち3件部分観察。KPHOTO-013親指近傍2点のみ粗い2D座標。**実技として正式認定した3D姿勢0件** |
| 上げ／戻し位相PoC | [ストロークR0.5](../STROKE_CYCLE_R05_20261020.md)、PR #13 | 独立位相コアは作成・テスト済み。**公開R0へは未接続** |
| 3方向姿勢ラボと左右の画面順 | [PR #16](https://github.com/moyashimisosoup/katsuramuki-dojo/pull/16)、[#17](https://github.com/moyashimisosoup/katsuramuki-dojo/pull/17)、[#18](https://github.com/moyashimisosoup/katsuramuki-dojo/pull/18) | [独立ラボ](https://moyashimisosoup.github.io/katsuramuki-dojo/experiments/pose-lab.html)。3カメラの単一仮3D、役割ラベル。PR #18は`poseRoot.scale.x=-1`で形状全体を鏡映し、ラベルも同じ変換。投影テストは67/67成功。[根拠](../POSE_LAB_OPERATOR_HAND_ORDER_FIX_20261023.md)。**手は仮の球と棒。正しい握りとして未受入** |
| R0刃と薄片の根元 | [PR #19](https://github.com/moyashimisosoup/katsuramuki-dojo/pull/19)、[仕様](../R0_CUT_CONTACT_RIBBON_FIX_20261023.md) | 3D帯の根元と切れ刃を一致。2D代替は横向き大根・全幅の薄片へ刷新。CI **75/75**・Pages成功。**実機の見え方は未確認** |
| R0刃面と柄の接続 | [PR #20](https://github.com/moyashimisosoup/katsuramuki-dojo/pull/20)、[仕様](../R0_KNIFE_HANDLE_JOINT_FIX_20261023.md) | 約5.5モデルmmの隙間を単一の`buildKnifeDisplayData()`で解消。CI **78/78**（[run](https://github.com/moyashimisosoup/katsuramuki-dojo/actions/runs/39894452610)）、[Pages配信](https://github.com/moyashimisosoup/katsuramuki-dojo/actions/runs/39894534217) SUCCESS、公開後HTTP到達確認。**実機WebGLと実物の柄の握りは未受入** |

最新追加の通常CI：[`2e75444`に対応するrun #39894710000](https://github.com/moyashimisosoup/katsuramuki-dojo/actions/runs/39894710000) SUCCESS（2026-10-23照合）。

## 現在の課題・次回の評価順序

1. **まず表示対象とキャッシュを特定する。** [公開R0](https://moyashimisosoup.github.io/katsuramuki-dojo/) と[姿勢ラボ](https://moyashimisosoup.github.io/katsuramuki-dojo/experiments/pose-lab.html)は別ページ。スクリーンショットがR0 2D fallback、R0 WebGL、pose-labのどれか判定する。公開コードのバージョン、スマートフォン幅390px相当、3カメラA/B/軸方向を照合。
2. **人間の構えを優先して再評価。** 実写と比較し、親指が大根と刃にどう接するか、掌・指の位置、刃元と切先、包丁の柄との連続性、帯の根元、大根の側面を点検。「左右が画面上で正しい」だけで合格としない。
3. **証拠の質を守る。** 同一実演者の連続フレームがない限り、複数写真の異なる実演者の手を一体の3D骨格として融合しない。2Dの投影角を実際の3D刃面角と称しない。KPHOTO-007は講師と学生が別人。
4. **修正範囲はユーザーの評価画面を確定した後に最小化。** 表示の問題なら描画側へ限定し、R0物理`src/physics/surface.js`を理由なく変更しない。PR #19/20の帯と柄の接点を後退させない。
5. **再開時の品質ゲート**：`npm test`、`python3 tools/validate_data.py`、PR/CI、mainのHEAD、Pages配信、iPhoneのスクリーンショット/操作、専門実演姿勢の承認をそれぞれ区別。安全で自然な実技を教えられる保証をしない。

## 保留中の達成指標と禁止事項

- 台帳に明示される工程チェック：**APP全体6/12=50%／写実動作1/7=14%／ストローク3/5=60%**。これらはチェックリストの割合であって、モデルの実物再現精度の定量評価ではない。**今回の停止だけで加点・減点しない。**
- **正式採用された3D実技姿勢は0件**。
- **STOPPED**：新しい3D手・参照画像の生成、R0/pose-labコード変更、既存PR/CI再実行、Pages再デプロイの依頼は**ユーザーの再開指示があるまで行わない**。停止中はGitHubの既存成果を正本とする。
- 公開repoへ個人情報・認証情報・非公開会話リンクを保存しない。

## 次のセッションに渡す最初の1操作

**GitHub最新main HEAD・PR・CI・PagesとAGENTS.mdを照合したうえで、ユーザーが「不自然」と評価した画面がR0 2D fallback、R0 WebGL、姿勢ラボのどれであるかを実機表示で確かめ、正しい実写と1場面だけ比較する。** この検収が済むまで新しい手指の写実化や追加の左右反転をしない。

正式状態：**HANDOFF_READY / STOPPED**。再開する作業は新セッションで設定し、現在のwork_idは未確認のまま引き継ぐ。
