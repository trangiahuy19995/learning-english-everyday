# Kế hoạch: Ứng dụng học cụm từ song ngữ Anh–Việt ("Cụm Từ")

## Tóm tắt
Web app React 19 + Vite + Tailwind v4, chạy hoàn toàn trên trình duyệt (dữ liệu lưu localStorage, có nhập/xuất JSON/CSV). Giao diện tiếng Việt, phong cách tươi sáng, thân thiện, nhiều màu (kiểu Duolingo, nút "khối" nổi, bo tròn lớn). Điều hướng bằng state nội bộ, không dùng router. Phần domain (`sessionConfig`, `sessionBuilder`, `srsEngine`, `phraseStore`, …) là TypeScript thuần, tách khỏi UI và có unit test.

Dự án hiện là scaffold trống (`src/App.tsx` rỗng, chưa có dependency ngoài React/Tailwind).

## Dependency bổ sung
- `lucide-react`: hệ icon.
- dev: `vitest`, thêm script `"test": "vitest run"` và `"typecheck": "tsc --noEmit"`. Dùng pnpm (theo `.mise.toml`).
- Font qua Google Fonts CSS2 `@import` ở đầu `src/index.css`: **Nunito** (UI, có subset vietnamese, đậm 400–900) và **Noto Sans** (cho IPA, hỗ trợ đủ ký tự ə ʌ ɪ ʊ ˈ ˌ …). Theme Tailwind: `--font-sans: Nunito`, `--font-ipa: "Noto Sans"`.

## Cấu trúc thư mục
```
src/
  main.tsx, App.tsx, index.css
  domain/                      # thuần TS, không import React
    types.ts                   # Phrase, Deck, Progress, Session, Exercise, HistoryEntry…
    sessionConfig.ts           # hằng số 5–60, preset, validate, ước tính thời gian
    sessionBuilder.ts          # chọn cụm từ theo nguồn/bộ lọc, bổ sung khi thiếu, chia chặng
    srsEngine.ts               # SM-2, suy ra status, auto-grade từ kết quả luyện tập
    exercises.ts               # sinh câu trắc nghiệm, điền từ; chuẩn hoá & chấm đáp án
    stats.ts                   # streak, đếm theo status, hoạt động 14 ngày
    csv.ts                     # parse/serialize CSV (tự viết, hỗ trợ ngoặc kép)
    importExport.ts            # JSON/CSV <-> Phrase/Deck, validate, merge/replace
    random.ts                  # shuffle có seed (để phiên khôi phục ổn định)
    __tests__/*.test.ts
  store/
    storage.ts                 # wrapper localStorage, key `cumtu:v1:*`, try/catch, version
    phraseStore.ts             # decks + phrases + progress; CRUD; subscribe
    sessionStore.ts            # phiên đang học (lưu sau mỗi thay đổi), lịch sử
    settingsStore.ts           # cấu hình phiên gần nhất, tốc độ đọc, giọng
    useStore.ts                # hook useSyncExternalStore chung
  data/sampleData.ts           # 4 deck, 20 cụm từ mẫu (seed lần đầu)
  lib/speech.ts                # Web Speech API: speak(text, lang, rate) -> Promise, cancel, hasVoice
  ui/
    components/  Button, Card, Chip, ProgressBar, Toggle, Modal/ConfirmDialog, Toast,
                 IpaText, HighlightedSentence, SpeakButton, EmptyState, NumberStepper
    layout/      AppShell (sidebar desktop ≥ md, bottom tab bar mobile), screen header
    screens/
      HomeScreen.tsx           # chào, banner "Tiếp tục phiên dở dang", số từ đến hạn, streak, CTA
      SessionSetupScreen.tsx
      SessionRunner.tsx        # điều phối phase của phiên
      StudyCardView.tsx
      PracticeView.tsx         # MCQ nghĩa, MCQ đồng nghĩa, điền cụm từ
      StageSummaryView.tsx     # tóm tắt chặng + tự đánh giá
      SessionCompleteView.tsx
      AudioPlaylistScreen.tsx
      DecksScreen.tsx, DeckDetailScreen.tsx, PhraseEditor.tsx, ImportExportPanel.tsx
      StatsScreen.tsx
  navigation.ts                # type Route = {name:'home'} | {name:'setup'} | {name:'session'} | {name:'playlist'} | {name:'decks'} | {name:'deck', deckId} | {name:'phrase', phraseId?, deckId} | {name:'stats'}
README.md                      # cách chạy, cấu trúc, định dạng CSV/JSON
```
`App.tsx` giữ `route` trong state (và lưu route cuối vào sessionStorage để không mất khi reload), render `AppShell` + màn hình tương ứng.

## Mô hình dữ liệu (`domain/types.ts`)
```ts
type Deck = { id: string; name: string; color: DeckColor; description?: string; createdAt: number }
type Synonym = { text: string; note_vi?: string }          // ghi chú khác biệt ngắn
type Example = { en: string; vi: string; highlight?: string } // highlight = chuỗi con đúng nguyên văn trong `en` (dạng đã chia, vd "took a rain check")
type ProgressStatus = 'new' | 'learning' | 'review' | 'mastered'
type Progress = { status; easeFactor: number; intervalDays: number; repetitions: number;
                  nextReviewAt: number | null; lastReviewedAt: number | null; lapses: number }
type Phrase = { id; phrase; ipa; meaning_vi; nuance_vi?; synonyms: Synonym[]; examples: Example[];
                topic: string /* = deck id */; starred: boolean; progress: Progress;
                createdAt; updatedAt }
```
"Chủ đề" và "bộ từ (deck)" là cùng một khái niệm: `topic` trỏ tới `Deck.id`. Progress mặc định: `new`, ease 2.5, interval 0, reps 0, nextReviewAt null.

## Domain logic

### sessionConfig
- `MIN=5`, `MAX=60`, `PRESETS=[5,10,15,20,30,60]`, `STAGE_SIZE=10`, `STAGE_THRESHOLD=20`.
- `validateSessionSize(raw: string|number)` → `{ok:true,value}` hoặc `{ok:false,error}` với thông báo: "Vui lòng nhập số nguyên", "Tối thiểu 5 cụm từ", "Tối đa 60 cụm từ".
- `estimateMinutes(n)` → `{min: max(3, round(n*0.5)), max: round(n*0.7 + 1.5)}` (5→3–5, 30→15–23, 60→30–44), hiển thị "≈ 15–23 phút".
- `SessionConfig = { size; source: 'new'|'due'|'mixed'; deckIds: string[] /* rỗng = tất cả */; starredOnly: boolean }`.

### sessionBuilder
- `countAvailable(config, phrases, now)` và `buildSession(config, phrases, now, fill?: FillOptions)`.
- Pool chính: theo deck + starredOnly; nguồn `new` = status new; `due` = có `nextReviewAt <= now`; `mixed` = cụm đến hạn trước (sắp theo quá hạn lâu nhất), rồi cụm mới.
- Nếu pool < size: màn hình cấu hình hiện cảnh báo vàng "Bộ lọc hiện có X/Y cụm từ" kèm lựa chọn (checkbox, bật sẵn):
  1. "Bổ sung cụm đến hạn ôn tập từ mọi chủ đề"
  2. "Bổ sung cụm mới từ chủ đề khác"
  Thứ tự bổ sung: (1) → (2) → nếu vẫn thiếu, các cụm đang học sắp đến hạn sớm nhất. Hiển thị số dự kiến sau khi bổ sung. Nếu tổng kho vẫn không đủ: "Kho chỉ có Z cụm từ — phiên sẽ gồm Z cụm" và vẫn cho bắt đầu (miễn Z ≥ 1). Z = 0 → nút bắt đầu bị khoá, gợi ý thêm cụm từ.
- Chia chặng: size ≤ 20 → 1 chặng; > 20 → các chặng 10 cụm (chặng cuối có thể ngắn hơn).
- Thứ tự trong chặng được xáo bằng seed lưu trong session.

### exercises
Mỗi cụm trong chặng có 2 bài luyện, xáo trộn trong chặng:
- **Bài 1 (trắc nghiệm)** xen kẽ theo index: chọn nghĩa tiếng Việt (4 lựa chọn; 3 nhiễu lấy `meaning_vi` của cụm khác, ưu tiên cùng chủ đề), hoặc — nếu cụm có synonym — chọn cụm đồng nghĩa đúng ngữ cảnh (hiển thị câu ví dụ có cụm được tô sáng; đáp án = 1 synonym của cụm; nhiễu = synonym/cụm của cụm khác). Kho < 4 cụm → ít lựa chọn hơn (tối thiểu 2).
- **Bài 2 (điền cụm từ)**: câu `en` với `highlight` thay bằng ô trống `_____`, kèm câu `vi` làm gợi ý và nút "Gợi ý" (hiện chữ cái đầu mỗi từ). Nếu không có `highlight`, tìm `phrase` không phân biệt hoa thường trong câu; không tìm thấy → thay bằng trắc nghiệm nghĩa.
- Chấm: chuẩn hoá (lowercase, trim, gộp khoảng trắng, bỏ dấu câu cuối, thống nhất ’/'). Đúng nếu khớp `highlight`. Sai → cho thử lại 1 lần, rồi hiện đáp án. Kết quả bài = `correctFirstTry: boolean`.
- Phản hồi tức thì: xanh lá/đỏ, rung nhẹ khi sai, banner dưới với nút "Tiếp tục" (phím Enter).

### srsEngine (SM-2 biến thể)
- Điểm tự đánh giá: Quên=1, Khó=3, Nhớ=4, Dễ=5.
- Auto-grade gợi ý: 2/2 đúng lần đầu → 4; 1/2 → 3; 0/2 → 1.
- `review(progress, q, now)`:
  - q < 3: reps=0, lapses+1, interval=0, nextReviewAt = now + 10 phút.
  - q ≥ 3: reps=0→interval 1; reps=1→ (q=3 ? 3 : 6); sau đó round(interval × ease × (q=3 ? 0.8 : q=5 ? 1.3 : 1)), tối thiểu interval cũ + 1. reps+1.
  - ease = max(1.3, ease + 0.1 − (5−q)(0.08 + (5−q)·0.02)).
  - nextReviewAt = startOfLocalDay(now) + interval ngày (q ≥ 3).
- Status: `mastered` nếu interval ≥ 21; `review` nếu reps ≥ 2; ngược lại `learning`.
- Cập nhật SRS khi người dùng xác nhận màn tóm tắt **mỗi chặng** (không mất tiến độ nếu bỏ dở giữa phiên lớn).

### stats
- Ngày hoạt động = ngày (giờ địa phương) có ít nhất 1 chặng hoàn thành; lưu `activityDays: string[]` dạng `YYYY-MM-DD`.
- Streak: đếm ngày liên tiếp lùi từ hôm nay (nếu hôm nay chưa học thì tính từ hôm qua, hiện "Học hôm nay để giữ chuỗi!").
- Đếm theo status, số đến hạn hôm nay, độ chính xác trung bình, biểu đồ cột 14 ngày (số cụm ôn mỗi ngày, CSS thuần).

## Lưu trữ (store/)
- Key: `cumtu:v1:decks`, `:phrases`, `:activeSession`, `:history`, `:activity`, `:settings`. Có `schemaVersion`; JSON lỗi → bỏ qua key đó, giữ app chạy và báo toast.
- Lần đầu (chưa có key phrases) → seed `sampleData`. Mục "Khôi phục dữ liệu mẫu" trong màn Bộ từ.
- Mỗi store: state module-level + `subscribe/getSnapshot`, ghi localStorage ngay khi thay đổi (debounce không cần — dữ liệu nhỏ).
- `ActiveSession = { id, config, seed, startedAt, phraseIds, stages: string[][], stageIndex, phase: 'study'|'practice'|'stageSummary'|'complete', cardIndex, exercises: Exercise[], exerciseIndex, results: Record<exerciseId, {correctFirstTry, answer}>, ratings: Record<phraseId, 1|3|4|5>, appliedStages: number[] }`. Lưu sau mỗi hành động.
- Khôi phục: trang chủ hiện banner "Bạn đang học dở: Chặng 2/4 · thẻ 3/10 — Tiếp tục / Bỏ phiên". Bắt đầu phiên mới khi đang có phiên dở → hộp xác nhận. Khi khôi phục, loại bỏ id cụm từ đã bị xoá; chặng rỗng thì bỏ qua.
- `HistoryEntry = { id, startedAt, finishedAt, size, stagesCompleted, totalStages, accuracy, ratingsCount, completed: boolean }` — ghi khi phiên xong hoặc bị bỏ (chỉ khi đã xong ≥ 1 chặng). Giữ tối đa 100 mục.

## Luồng & màn hình

### Cấu hình phiên (SessionSetupScreen)
- Số lượng: chip preset (5,10,15,20,30,60), slider 5–60, ô số + nút −/+. Đồng bộ 2 chiều. Ô số giữ nguyên giá trị người dùng gõ; không hợp lệ → viền đỏ + thông báo dưới ô, nút "Bắt đầu" khoá. Slider/stepper không vượt giới hạn.
- Nguồn: segmented "Từ mới / Ôn tập đến hạn / Kết hợp" kèm số lượng có sẵn của mỗi nguồn.
- Chủ đề: chip đa chọn theo màu deck + "Tất cả"; toggle "Chỉ cụm đã đánh dấu khó".
- Thẻ tóm tắt: "20 cụm từ · 1 chặng · ≈ 10–16 phút"; khi > 20: "30 cụm từ · 3 chặng × 10".
- Cảnh báo thiếu từ + tuỳ chọn bổ sung như trên.
- Cấu hình cuối được lưu lại làm mặc định.

### Phiên học (SessionRunner) — mỗi chặng: Học thẻ → Luyện tập → Tóm tắt chặng
- Thanh trên: nút thoát (lưu và về trang chủ, toast "Đã lưu tiến độ"), thanh tiến độ, "Chặng 1/3", bộ đếm "đã học / tổng".
- **Thẻ học (StudyCardView)**: cụm từ lớn (Nunito 800), IPA (font IPA, màu phụ), nghĩa Việt, nhãn sắc thái (`nuance_vi`, dạng chip), danh sách đồng nghĩa (chip + ghi chú), 1–3 ví dụ song ngữ với cụm từ được tô sáng; nút loa cho cụm từ và từng câu ví dụ (en-US); nút ngôi sao "Đánh dấu khó". Toggle "Ẩn nghĩa" / "Ẩn IPA" (nhớ trong settings); khi ẩn, vùng bị làm mờ, chạm để hiện. Điều hướng: Trước / Tiếp (phím ← →), thẻ cuối → "Bắt đầu luyện tập".
- **Luyện tập (PracticeView)**: như mục exercises; tiến độ riêng "Bài 4/20".
- **Tóm tắt chặng (StageSummaryView)**: độ chính xác của chặng, danh sách cụm từ mỗi dòng có 4 nút Quên/Khó/Nhớ/Dễ đã chọn sẵn theo auto-grade (người dùng sửa được) + lịch ôn tiếp dự kiến ("Ôn lại sau 6 ngày"). Nút "Lưu & sang chặng tiếp" / "Hoàn thành phiên" → áp SRS, ghi activity. Đây cũng là màn nghỉ giữa các chặng (gợi ý nghỉ mắt khi phiên lớn).
- **Hoàn thành (SessionCompleteView)**: tổng kết, streak, nút "Nghe lại phiên này" (playlist), "Phiên mới", "Về trang chủ". Xoá activeSession.

### Nghe thụ động (AudioPlaylistScreen)
- Nguồn: phiên vừa học/đang học, hoặc một deck. Trình tự mỗi mục: cụm từ (en-US) → nghĩa (vi-VN) → câu ví dụ đầu (en) → bản dịch (vi), nghỉ 600 ms giữa các phần, 1.2 s giữa các mục.
- Điều khiển: phát/tạm dừng, trước/sau, tốc độ 0.75/1/1.25, tuỳ chọn "Bỏ qua tiếng Việt", lặp lại. Mục đang phát được tô sáng và cuộn tới.
- Không có giọng vi-VN → thông báo và chỉ hiển thị chữ cho phần tiếng Việt. Trình duyệt không hỗ trợ speechSynthesis → ẩn nút loa, hiện ghi chú.

### Bộ từ (DecksScreen / DeckDetailScreen / PhraseEditor)
- Lưới deck: tên, màu, số cụm, thanh phân bố status. Tạo/đổi tên/đổi màu/xoá deck (xoá kèm cụm từ, xác nhận ghi rõ số lượng).
- Chi tiết deck: tìm kiếm, lọc status, danh sách cụm (cụm, IPA, nghĩa, badge status, sao). Nút sửa/xoá/đặt lại tiến độ.
- PhraseEditor (trang/modal toàn màn hình trên mobile): trường phrase*, ipa, meaning_vi*, nuance_vi, deck*, danh sách động synonyms (text + ghi chú), examples (en*, vi*, highlight — có nút "Lấy cụm từ đang chọn" từ ô en; báo lỗi nếu highlight không nằm trong câu). Yêu cầu ≥ 1 ví dụ. Cảnh báo trùng cụm từ trong cùng deck.
- ImportExportPanel:
  - Xuất JSON: `{ app:'cumtu', schemaVersion:1, exportedAt, decks, phrases }` (tuỳ chọn kèm tiến độ).
  - Xuất CSV (một deck hoặc tất cả). Cột: `phrase,ipa,meaning_vi,nuance_vi,topic,synonyms,examples`; `topic` = tên deck; `synonyms` = `text::ghi chú` nối bằng ` ; `; `examples` = `en || vi || highlight` nối bằng ` ;; `. UTF-8 có BOM để mở bằng Excel không lỗi dấu.
  - Nhập: chọn file (.json/.csv), xem trước "Hợp lệ X, lỗi Y (dòng 3: thiếu meaning_vi…)", chế độ "Gộp" (trùng theo id, hoặc phrase+deck → cập nhật nội dung, giữ tiến độ) hoặc "Thay thế toàn bộ" (xác nhận). Deck chưa tồn tại theo tên → tự tạo.

### Thống kê (StatsScreen)
Thẻ số: streak 🔥-free (dùng icon Flame của lucide), đã nắm vững, đang học, đến hạn hôm nay, tổng cụm. Thanh phân bố status, biểu đồ 14 ngày, tiến độ phiên hiện tại (nếu có, "đã học/tổng"), danh sách lịch sử phiên (ngày giờ, số cụm, chặng hoàn thành, % đúng, hoàn thành/dở).

### Trang chủ
Lời chào, streak, thẻ "Đến hạn hôm nay: N" (nút "Ôn ngay" → setup với nguồn due), banner phiên dở, nút lớn "Bắt đầu học", lối tắt deck.

## Thiết kế giao diện
- Bảng màu tươi: nền `#F7F9FC`, chính xanh lá `#3DBE5A` (nút chính, đúng), xanh dương `#2F8CFF` (thông tin, IPA), cam `#FF9F1C` (streak, đánh dấu khó), đỏ san hô `#FF5A5F` (sai), tím `#8B5CF6`; mỗi deck một màu (green/blue/orange/purple/pink/teal). Khai báo trong `@theme` của `index.css`.
- Nút "khối": bo `rounded-2xl`, viền đáy 4px màu đậm hơn, nhấn xuống khi active; chữ đậm viết hoa nhẹ. Thẻ trắng bo 24px, viền 2px xám nhạt.
- Typography: cụm từ 32–40px/800, IPA 16–18px Noto Sans màu xanh, nghĩa Việt 18–20px/700, ví dụ 16px line-height 1.6. Nhãn ngôn ngữ nhỏ "EN"/"VI" trước câu ví dụ.
- Responsive: mobile một cột, tab bar dưới (Trang chủ, Học, Bộ từ, Thống kê); desktop ≥ 768px sidebar trái, nội dung tối đa 720px (thẻ học) / 1100px (bộ từ). Trong phiên học ẩn nav, tập trung nội dung.
- Hoạt ảnh nhẹ bằng CSS: lật/trượt thẻ, rung khi sai, pop khi đúng; tôn trọng `prefers-reduced-motion`.
- Truy cập: nút có `aria-label`, focus ring rõ, phím tắt (←/→, 1–4 chọn đáp án, Enter tiếp tục), tương phản đạt AA.
- Không dùng emoji; icon từ lucide-react.

## Dữ liệu mẫu (20 cụm, 4 deck)
Mỗi cụm có IPA, nghĩa, sắc thái, 1–3 đồng nghĩa có ghi chú, 2 ví dụ song ngữ có `highlight`.
- **Giao tiếp**: take a rain check, meet halfway, break the ice, hit it off, keep in touch
- **Công sở**: touch base, get the ball rolling, on the same page, call it a day, behind schedule
- **Du lịch**: off the beaten track, travel light, catch a flight, get away from it all, hit the road
- **IELTS**: play a key role in, a double-edged sword, raise awareness of, take into account, have a significant impact on

## Kiểm thử & xác minh
- Unit test vitest (`src/domain/__tests__`):
  - `sessionConfig`: biên 4/5/60/61, chuỗi rỗng, số thập phân, chữ; ước tính 5/30/60.
  - `sessionBuilder`: các nguồn new/due/mixed, bổ sung theo thứ tự ưu tiên, kho thiếu, chia chặng (20 → 1 chặng; 21 → 10/10/1; 60 → 6).
  - `srsEngine`: chuỗi đánh giá tạo interval 1 → 6 → …, Quên đặt lại, ease không < 1.3, ngưỡng mastered.
  - `exercises`: chuẩn hoá đáp án, tạo ô trống từ highlight, fallback khi không tìm thấy.
  - `csv`/`importExport`: round-trip export→import, ô có dấu phẩy/ngoặc kép/xuống dòng, dòng lỗi.
  - `stats`: streak qua ranh giới ngày, hôm nay chưa học.
- Chạy `pnpm test`, `pnpm typecheck`, `pnpm build`.
- Kiểm tra thủ công trên preview: phiên 5 từ trọn vẹn; phiên 30 từ thoát giữa chặng 2 rồi tiếp tục đúng vị trí sau reload; nhập 4/61 bị chặn; bộ lọc thiếu từ hiện tuỳ chọn bổ sung; CRUD + nhập/xuất CSV; bố cục mobile 375px.

## README
Cách chạy (`pnpm install`, `pnpm dev`, `pnpm test`, `pnpm build`), sơ đồ thư mục, mô tả thuật toán SRS, định dạng JSON/CSV kèm ví dụ, giới hạn (dữ liệu chỉ lưu trên trình duyệt hiện tại, giọng TTS phụ thuộc hệ điều hành).

## Ngoài phạm vi
Tài khoản/đồng bộ đa thiết bị, backend, file audio thu sẵn, PWA offline cache, đa ngôn ngữ giao diện.
