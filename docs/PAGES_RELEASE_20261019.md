# APP-022 | GitHub Pages公開と検証 | 2026-10-19

## 承認と対象
- 2026-10-19ユーザーがGitHub Pages公開を明示承認。
- 対象: 公開GitHubリポジトリ `moyashimisosoup/katsuramuki-dojo` の既存R0+3D試作。
- 公開候補URL: `https://moyashimisosoup.github.io/katsuramuki-dojo/`
- 外部写真、非公開資料、ユーザーの個人情報・鍵を配信物に含めない。
- 画面表現は試作レベル。実物包丁技術の認証・力学校正済みとの説明はしない。

## 公開方式
- `.github/workflows/deploy-pages.yml` で `main`へのpush/手動実行時に起動。
- まずPythonデータ検査、Node 19数値テスト、JavaScript構文検査を通す。
- 配信用 `_site/`には `index.html`, `styles.css`, `src/main.js`, `src/physics/surface.js`, `src/view/draw.js`, `src/view3d/geometry.js`, `src/view3d/scene.js`, `.nojekyll`のみ複製。
- GitHub公式 `actions/upload-pages-artifact@v3` と `actions/deploy-pages@v4`、`github-pages`環境を利用。
- 成功後はURLへHTTPアクセスして `index.html` と `src/view3d/scene.js`が実際に取得できることを確認する。
- Three.js 0.180.0は固定URLの外部CDN。CDN接続、WebGL機能、FPS、Safariでの描画は別途検証が必要。
- 初期のPages設定がまだなら`Settings > Pages > Build and deployment > Source: GitHub Actions`を選択する必要がある。GitHub接続の対応操作にはPages設定の変更が無いので、GUIでの操作が必要になる可能性がある。

## 進捗計算
全体は `docs/3D_PROGRESS_CHECKPOINT_20261019.md` の12項目を使用。
- M12（Webサイト公開・公開後HTTPチェック）は**Pages deploy成功・静的ファイルのHTTP確認が揃った時のみ完了**。
- M06（3D実ブラウザ受入）はHTTPチェックだけでは完了にならない。
- M11（iPhone/Android/PCの実機受入）はユーザー等による実機試験後に更新する。

### 公開細目（5項目）
| ID | 完了基準 | 状態（事実確認後に更新） |
| --- | --- | --- |
| PUB-01 | 安全な公開ファイルだけをパッケージする配信workflowがmainへ保存 | ✅ [PR #6](https://github.com/moyashimisosoup/katsuramuki-dojo/pull/6)でmain統合（commit d32181b） |
| PUB-02 | Node19試験・データ検証・workflow構文のCIが成功 | ✅ [Actions run #39185603725](https://github.com/moyashimisosoup/katsuramuki-dojo/actions/runs/39185603725)内 verify-and-package success |
| PUB-03 | GitHub PagesのSourceがActionsで運用されdeployが成功 | ✅ 2026-10-19 12:10 JST 再実行attemptで `Deploy to Pages` 成功（job 117870913584） |
| PUB-04 | 公開URLのHTMLと3DモジュールのHTTP 200相当を確認 | ✅ GitHub Actionsの公開後curlで `/index.html` と `/src/view3d/scene.js` を取得、内容を照合して成功 |
| PUB-05 | 3D表示・カメラ切替・操作・2D fallbackをPCブラウザで目視確認 | ☐ 未検証 |

**現在: PUB-01〜PUB-04完了、4/5=80%。M12は公開成功＋HTTP検証で完了。PUB-05の実際のWebGL描画・操作受入は未完了。**

計算: 検証済み完了件数÷5×100%。細目の達成と全体M12の達成条件は異なる。

## つまずき時の対応
- `Pages site not enabled`、`Unable to get Pages site`、`Not Found` が出れば、権限のないAPIやtokenによる迂回はしない。`Settings > Pages`のSource設定後に、ユーザーまたは許可された環境からworkflowを再実行する。
- CDN読み込み失敗時は自動で2D描画へ戻る。ただし外部依存のThree.jsをローカル配置する案を別途検討。
- 単純なHTTP表示成功をWebGLの画像品質の合格と混同しない。

本書は公開手順と進捗根拠。未確認の公開成功を既成事実として記録しない。

## 実行済みチェックポイント 2026-10-19 10:30頃 JST

- Pages配信PR [#6](https://github.com/moyashimisosoup/katsuramuki-dojo/pull/6) mainへ統合、commit `d32181b3ed24bc2b0f9b1f87b7e74f35db5ce141`。
- [配信試行 #39185603725](https://github.com/moyashimisosoup/katsuramuki-dojo/actions/runs/39185603725): `verify-and-package`は成功（19テスト・データ・JS構文・8ファイルの成果物アップロード）。
- `deploy`の`actions/deploy-pages@v4`がHTTP 404: `Ensure GitHub Pages has been enabled` により失敗、HTTP到達性チェックはskip。
- **未公開**。候補URLを公開済みのURLとして案内しない。
- 今回のGithub接続はPages Sourceの設定用アクションを公開していない。ユーザーが `https://github.com/moyashimisosoup/katsuramuki-dojo/settings/pages` を開き、`Build and deployment → Source → GitHub Actions` を選ぶ必要がある。設定後、同一runの失敗ジョブを再実行するかmainのアプリファイルを更新する。
- 以後、docsのみのpushでは公開workflowを不要に再実行しないよう、アプリ本体または配信workflowに限ってpushトリガーを設定（手動workflow_dispatchは残す）。

## 公開成功チェックポイント（2026-10-19 12:10 JST）

- ユーザーがSettings > Pages > Sourceを **GitHub Actions** に変更した旨を明示報告。
- 初回404だった [workflow run #39185603725](https://github.com/moyashimisosoup/katsuramuki-dojo/actions/runs/39185603725) について、GitHub連携の `rerun_failed_workflow_run_jobs` により失敗ジョブの再実行を要求し、APIが `success: true` を返した。
- 再実行の `deploy` job **117870913584** は `completed/success`。配信サービスが `Reported success!` を記録。
- `Check published static site` が `completed/success`。ログには `Static site and 3D module are reachable: https://moyashimisosoup.github.io/katsuramuki-dojo/` と記録。
- 公開URL：**https://moyashimisosoup.github.io/katsuramuki-dojo/**。確認はGitHub-hosted runnerのHTTPからであり、アシスタント側の一般Web閲覧ツールは公開ページの読込に失敗した。実際の3D視認・FPS・モバイル操作は未確認。
- 公開対象は過去の配信コミット `d32181b3ed24bc2b0f9b1f87b7e74f35db5ce141` の検証済み静的ファイルセット。今後の変更が即時公開されたと無検証で扱わない。
- 進捗：**公開細目4/5=80%、全体6/12=50%、3D個別7/8=88%**。HTTP成功だけでM06（3D表示の実ブラウザ受入）、M11（iPhone/Android/PC実機受入）、PUB-05を完了にはしない。
