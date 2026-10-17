# PHASE 0：桂むき切削・操作・描画 実装計画 v1.0

> **注意（2026-10-18）:** 本書はP0試作向けの簡易近似です。実際の刃と大根の接触、幅方向の厚さ差、部分回転での除去体積については [実物理モデルv2](REAL_PHYSICS_ENGINE_PLAN_V2.md) を優先してください。特に「1回転あたりの送り量＝厚さ」「一周で全円環を削る体積式」は一般条件では成立しません。

- APP-ID: APP-022
- 正本: moyashimisosoup/katsuramuki-dojo
- 作成日: 2026-10-17（JST）
- 区分: 技術設計案。現時点でゲーム本体、公開配信、実機検証はいずれも未実施
- 既存設計: docs/INITIAL_DESIGN.md、docs/ROADMAP.md
- 採用判断: 専用切削コアを初期採用。汎用剛体物理エンジンは必須にしない

## 1. 最初の完成体験を定義する

画面中央の大根が回り、包丁の刃先に触れた位置から薄い帯が伸びる。プレイヤーが刃の送りを変えると、帯の厚みと色、残りの大根の太さ、抵抗や破断が同時に変わる。30秒ほどで一度終了し、最長連続長・平均厚み・均一性・切断理由が表示される。

重要な体験条件：
1. 入力が目に見える結果につながる。
2. 一定の操作では安定してむける。
3. やり過ぎると理由が分かる失敗になる。
4. 帯が美しく伸びる過程自体が心地よい。
5. 初見でも1指の「おためしモード」から始められる。

## 2. 物理エンジンの採否

| 候補 | 判定 | 根拠と導入条件 |
| --- | --- | --- |
| Vanilla JS + Canvas 2D + Pointer Events | Phase 0で採用 | 依存が少なく、PC/スマホ同一モデルを作りやすい |
| 専用の切削幾何・破断ロジック | Phase 0で採用 | 連続的に素材の体積を削る機能をゲーム固有に実装できる |
| 短いVerlet/PBD帯モデル | 必要ならP0-D | 生成済みの帯が揺れて垂れる「表示専用」の物理 |
| Matter.js | Phase 0は不採用 | 剛体接触のエンジン。切削計算の置き換えにはならない |
| Rapier 2D/3D | Phase 0は不採用 | 落ちた帯や道具と環境の本格的な衝突が必要になれば比較 |
| Three.js | 3D化を選ぶ場合の表示候補 | 3Dレンダリング向きだが切削そのものを計算しない |
| 高精度材料解析（FEM等） | 現時点では不採用 | データの同定が困難で、スマホでの試作に過剰 |

制約：どのライブラリを後で採用する場合も、更新状態、配布ライセンス、依存サイズを再確認する。Three.jsを採用しても切削コアは独立させる。

## 3. 大根と包丁の最小幾何

円柱大根の横断面を近似する。大根は中心軸周りに回転する。

- R0: 初期半径。例：35 game-mm
- Rmin: むけなくなる半径。設定値
- W: 桂むきの幅。例：50 game-mm
- theta: 累積回転角、ラジアン
- f: 刃の1回転当たりの内向き送り量、game-mm/revolution
- ribbonLength: 連続してむいた帯の長さ
- engaged: 刃先が接触しているか
- phase: ready / contact / cutting / stalled / torn / finished

【重要なモデルの修正点】
従来の刃の深さ（bladeDepth）をそのまま帯の厚さとみなすのではなく、回転に対する刃の径方向の送り f を主変数にする。一定送りのとき、ちょうど1回転で大根半径は f だけ減る。これは簡略化したアルキメデス螺旋の切削モデル。

固定時間刻みで次を積算する。

    positiveAngleStep = max(0, cuttingAngularVelocity) * dt
    radiusStep = feedPerRevolution * positiveAngleStep / (2 * PI)
    newRadius = max(minRadius, radius - radiusStep)
    ribbonLengthStep = (radius + newRadius) * 0.5 * positiveAngleStep
    ribbonLength += ribbonLengthStep
    removedVolume += PI * bladeWidth * (radius*radius - newRadius*newRadius)

radiusStep は下限半径で必ずクランプし、帯の伸長も実際に切れた角度区間と整合させる。大根停止時、刃先が離れたとき、逆転時はむけた長さを増やさない。逆転で大根は太くならない。

厚さ表示 t はPhase 0では送り f から近似。より精密にするなら「同じ角度方向の一回転前の表面半径との差」を履歴で求める。入力の変化に対する遅れを含むため、こちらは切削コアが動いてから検討する。

例：R0=35、f=1、1回転の試験は最終半径34、帯の長さ約216.8 game-mm。体積は円環の体積と一致するはず。

注意：game-mmはゲーム内部のモデル単位であり、切削の実測精度や実物の変形を保証するものではない。

## 4. 入力をどのように物理状態へ変換するか

正規化コントロール項目：

- rotation: -1～+1。正方向はむく向き、負方向は戻す動作
- feed: 0～1。刃の径方向送りへの指令
- stroke: -1～+1。刃の上下ストロークのリズム。P0後半で安定性に限定反映
- engaged: true/false。刃先の接触状態

おためしモード：大根は自動回転。指1本・マウスだけで刃の送りを変える。最初は画面上の専用ドラッグ域と数値の反応を比較。放すと安全に切削停止し、勝手に再開しない。

道場モード：左の操作域で回転、右の操作域で送りを制御。二点タッチはpointerId別に管理。PCは左右/A・Dキー+マウス。左右どちらの向きをどの操作に当てるか、画面幅で変わらない入力感度を最初に比較する。

スマホでは指圧や実際の力は取得前提にしない。position/dragを仮想送りへ写像。タッチノイズ対策として一次遅れ、変化量制限、死角（dead zone）をテストする。

## 5. 切削の安定性、失速、破断

初期の「切れるかどうか」は確率ではなく、操作から導いたストレス値を累積させる決定論的なモデル。

- 適正な送り、安定した回転：傷が増えず、長くむける。
- 送りが極端に小さい状態：薄く脆くなる表現。連続すると傷が増える。
- 急に食い込む：厚みの段差、抵抗の増加。最初は失速（stalled）を優先。
- 回転速度の急変：厚みの乱れ、過度のジャークが継続すると傷に反映。
- 刃を離す：ただちに破断させるのではなく切削を止める。
- 素材の下限半径：むける操作を終了。
- 素材や刃の違いは本モデルに別パラメータとして追加する余地を残すが、Phase 0では種類を増やさない。

    stress =
      wThin * thinnessStress(thickness)
      + wFeed * suddenFeedStress(deltaFeedPerDistance)
      + wSpeed * speedJerkStress(deltaAngularVelocity)
      + wStroke * unstableStrokeStress(stroke)
    damage = clamp(damage + (stress - recovery) * dt, 0, 1)
    if damage >= threshold: tear(dominantCause)

破断イベントは too-thin / sudden-feed / blade-caught 等の原因コードを発生させ、表示メッセージはそのログだけから組み立てる。閾値はすべて仮値として管理し、実際の大根の強度値だと説明しない。見た目だけのランダムな破れは避ける。

均一性は帯の長さで重み付けした厚さの分散で算出する。平均値やばらつきを動画FPSから独立して求める。

## 6. むいた帯を気持ちよく描く方法

描画は大根本体・刃先・むけた帯の三層に分ける。まずは円柱の擬似立体表現（2.5D）をCanvas 2Dで描画。帯の区間には長さ・厚さ・生成位置を持たせ、伸びに応じて次のセグメントを継ぎ足す。

透明感：厚い帯は乳白色、薄い帯は半透明にする。境界に陰影を付け、帯が大根から「出てきた」と分かるようにする。

柔らかさ：最初はBezier曲線と緩やかな時間変化だけで表現。必要なら16～32点の表示専用Verlet/PBDで垂れ下がりを再現。揺れの計算と破断判定は分離し、端末負荷によってゲーム結果が変化しないようにする。

長い帯：節点や描画区間を無制限に蓄積しない。間引き・画面外折り畳み・先頭の保持などを段階的に導入。帯が切れたら端部の動きを演出し、計測された長さは残す。

音：切削が進むときだけ小さな切削音を出す。失速や破断では音が途切れる。音OFFと動きを減らす設定を用意。

## 7. 時間・状態遷移の設計

- simulation stepは固定Δt=1/60秒。requestAnimationFrameは描画にだけ使う。
- 端末の120Hzで二倍速にならない。遅い描画でもシミュレーション結果を一貫させる。
- 1フレーム中の更新回数に上限を設ける。背景タブから復帰した際は入力を解放しポーズする。
- 乱数を使わず、同一設定と同一量子化された入力列から同じ結果になるようにする。
- UI表示と採点はゲームの状態変数から導出し、Canvasの座標を逆参照しない。
- 画面のサイズ/DPR/向きを変えてもゲーム内の長さや厚さが変化しない。

ブラウザのPointer Events、setPointerCapture、pointercancel等を利用する。touch-action:noneはゲーム操作域のみに付ける。説明・設定領域のスクロールや文字拡大を妨げない。

## 8. 作るべきプログラムの境界

    index.html
    styles.css
    src/main.js
    src/core/geometry.js       // 角度、半径、長さ、体積
    src/core/state.js          // ready/contact/cutting/stalled/torn/finished
    src/core/blade.js          // 刃の送り、接触、フィルタ
    src/core/stress.js         // 傷の累積と失敗理由
    src/core/step.js           // 固定Δtでの状態更新
    src/core/score.js          // 集計と記録
    src/input/pointer.js       // タッチ、マウス、キャンセル
    src/input/keyboard.js      // PC操作
    src/view/canvas.js         // 大根、包丁、背景
    src/view/ribbon.js         // 帯の描画
    src/game/controller.js     // 30秒セッション
    src/game/feedback.js       // 結果表示
    tests/geometry.test.js
    tests/stress.test.js
    tests/replay.test.js
    tests/controls.test.js

主要なAPI契約：
- createInitialState(config) → SimulationState
- stepSimulation(state, control, fixedDt) → {state, events}
- getScore(state) → Score
- renderScene(ctx, state, interpolation) → 描画のみ

src/coreはDOM・Canvas・CSSから独立。静的サイトから読めるES Modulesを基本とし、TypeScript化は実装の複雑さに応じて判断。

## 9. フェーズ・ゲート

P0-A【計算だけを成立】大根と包丁を描く前に、半径、回転、送り、帯の長さ、消費体積の純粋な計算を作り、数式の試験に合格させる。

P0-B【画面でむける】自動回転と一指操作。大根・包丁・帯の視覚連動、30秒の再試行導線を完成させる。最初のテストは端末上で「むいた！」と感じられるか。

P0-C【失敗が分かる】薄すぎ、急な送り、失速、刃先の離脱を区別。帯の表現と結果の原因コードが合うか検証。

P0-D【質感の向上】厚さに応じた透明感、大根の細り、切削音、帯のしなり、切れた端部の演出。表示用バネ/Verletの必要性をこの段階で決める。

P0-E【複数操作・実機】二指モード、PC入力、タブ復帰・回転・画面端での中断、設定、アクセシビリティ。iPhone Safari、Android Chrome、PCを別々に検収。

Phase 1以降：無限桂むき、課題、自己ベスト、他の包丁。Phase 2以降：料理、歴史の図鑑とプレイ接続。最初からすべてを一度に実装しない。

## 10. テストすべき条件

| ID | 条件 | 期待する結果 |
| --- | --- | --- |
| GEO-01 | R0=35、送り1、ちょうど1回転 | 半径34、帯約216.8 game-mm |
| GEO-02 | 送り0 | 帯も消費体積も増えない |
| GEO-03 | 回転0、送りのみ変化 | 削れない |
| GEO-04 | 逆回転 | 帯を増やさず、半径は戻らない |
| GEO-05 | 最小半径に達する | 過削りせずfinishedへ |
| GEO-06 | 任意の切削区間 | 消費体積はπ×幅×(切削前半径²−切削後半径²)に整合 |
| CUT-01 | 安定操作を継続 | 予測できない破断は発生しない |
| CUT-02 | 極薄操作を継続 | 傷とtoo-thinの原因ログが増える |
| CUT-03 | 急激な送り増加 | 失速か破断が発生し、原因ログと一致 |
| CUT-04 | 接触解除 | 切削のみ止まり、即破断しない |
| SYS-01 | 同一入力ログをリプレイ | 半径・帯・イベントが一致 |
| SYS-02 | 30/60/120Hz表示 | 同一固定刻みで最終結果が同じ |
| UI-01 | 1指で開始・離す・再開 | 意図しない切削が続かない |
| UI-02 | 2指追加・片指解除 | 入力が混線しない |
| UI-03 | 端末回転・復帰・タブ非表示 | 表示崩れ・入力暴走・大量加算がない |
| UX-01 | 初めて30秒遊ぶ | 操作と帯の伸長の関係が分かる |
| UX-02 | 結果画面 | 長さ・厚み・均一性・破断原因を分けて表示 |

自動テストだけで「感触」は判定できないため、実機テストの観察記録を別に残す。

## 11. 既存設定との接続・移行

現在の data/simulation_presets.json はschema v1、depth_min_game_mm等の概念を持つ。これは仮のゲーム設定であり、正確な物理値ではない。

新しい切削モデルでは「半径方向の送り／1回転」を中心にする。旧depth系フィールドと意味を混同しない。実装時には移行表を作り、新schema v2を検討する。今回の設計フェーズでは既存プリセットの数値は変更しない。

主要な未決定事項：
1. 縦／横スワイプのどちらで送りを操作するか。
2. 刃の上下ストロークがスコアにどの程度影響するか。
3. 帯の描画をBezierのみとするか、軽量なVerletを採用するか。
4. 画面構図を擬似立体の斜め視点にするか、断面図を併置するか。
5. 抵抗・傷・破断の初期閾値（試遊で校正）。
6. 長い帯のメモリ上限と描画表現。
7. 実際の包丁技能との混同を防ぐ安全注記。

## 12. 技術・技法の参考資料

- 辻調理師専門学校：大根の桂むき https://www.tsuji.ac.jp/hp/gihou/japan/yasai/katura/katu.htm
- 京都調理師専門学校：桂むき https://www.kyoto-chorishi.ac.jp/knowledge/c0016/
- Matter.js公式 https://brm.io/matter-js/
- Rapier公式 https://rapier.rs/docs/
- Three.js公式 Physics https://threejs.org/manual/pages/physics.html
- MDN Pointer Events https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Multi-touch_interaction
- MDN touch-action https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action

※ 出典はシステムの参考資料であり、野菜の材料物性を特定・実測した根拠ではない。実装、ブラウザ検証、専門家の校閲は本計画とは別の成果。
