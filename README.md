# Cụm Từ — Học từ vựng theo cụm song ngữ Anh–Việt

Ứng dụng web học collocation / idiom / phrasal verb với IPA, nghĩa tiếng Việt theo ngữ cảnh, từ đồng nghĩa, ví dụ song ngữ, luyện tập tương tác và ôn tập ngắt quãng (SRS). Toàn bộ dữ liệu lưu trên trình duyệt (localStorage).

## Chạy ứng dụng

```bash
pnpm install
pnpm dev        # máy chủ phát triển (trong Figma Make đã chạy sẵn)
pnpm test       # unit test phần domain (vitest)
pnpm typecheck  # kiểm tra kiểu TypeScript
pnpm build      # build production
```

Lần chạy đầu tiên tự nạp 20 cụm từ mẫu trong 4 chủ đề: Giao tiếp, Công sở, Du lịch, IELTS.

## Cấu trúc thư mục

```
src/
  domain/        Logic thuần TS, không phụ thuộc React (có unit test)
    types.ts            Phrase, Deck, Progress, ActiveSession…
    sessionConfig.ts    Giới hạn 5–60, preset, kiểm tra hợp lệ, ước tính thời gian, chia chặng
    sessionBuilder.ts   Chọn cụm theo nguồn/bộ lọc, bổ sung khi thiếu
    srsEngine.ts        Thuật toán SM-2
    exercises.ts        Sinh bài trắc nghiệm / điền từ, chấm đáp án
    stats.ts, csv.ts, importExport.ts, dates.ts, random.ts
  store/         Trạng thái + lưu localStorage (useSyncExternalStore)
    phraseStore.ts      Bộ từ, cụm từ, tiến độ
    sessionStore.ts     Phiên đang học (tự lưu), lịch sử, hoạt động theo ngày
    settingsStore.ts    Cấu hình phiên gần nhất, ẩn nghĩa/IPA, tốc độ đọc
  data/sampleData.ts    Dữ liệu mẫu
  lib/speech.ts         Web Speech API (en-US, vi-VN)
  ui/                   Component và màn hình
  navigation.ts         Điều hướng bằng state
```

## Luồng học

1. **Thiết lập phiên**: 5–60 cụm (preset, slider, ô nhập), nguồn Từ mới / Ôn tập đến hạn / Kết hợp, lọc theo chủ đề và từ khó. Thiếu từ thì có tuỳ chọn bổ sung.
2. **Phiên > 20 cụm** được chia thành các chặng 10 cụm. Mỗi chặng gồm: Thẻ học, Luyện tập (2 bài/cụm), Tóm tắt và tự đánh giá.
3. **SRS** được cập nhật khi xác nhận từng chặng. Đánh giá: Quên(1) / Khó(3) / Nhớ(4) / Dễ(5), chọn sẵn theo kết quả luyện tập.
4. Phiên được lưu sau mỗi thao tác, nên bạn có thể thoát rồi học tiếp đúng chỗ cũ.

### SRS (SM-2)
- Quên: lặp lại từ đầu, ôn lại sau 10 phút.
- Lần 1: 1 ngày; lần 2: 6 ngày (Khó: 3 ngày); sau đó `interval × ease` (Khó ×0.8, Dễ ×1.3).
- `ease = max(1.3, ease + 0.1 − (5−q)(0.08 + (5−q)·0.02))`.
- Trạng thái: `mastered` khi interval ≥ 21 ngày; `review` khi đã lặp ≥ 2 lần; còn lại là `learning`.

## Định dạng nhập/xuất

**JSON**: `{ "app": "cumtu", "schemaVersion": 1, "decks": [...], "phrases": [...] }`. Có thể nhập trực tiếp một mảng phrase.

**CSV** (UTF-8):

```csv
phrase,ipa,meaning_vi,nuance_vi,topic,synonyms,examples
take a rain check,/teɪk ə ˈreɪn tʃek/,hẹn dịp khác,Thân mật,Giao tiếp,postpone::trang trọng hơn ; maybe another time,"Can I take a rain check? || Để hôm khác nhé? || take a rain check ;; She took a rain check. || Cô ấy hẹn dịp khác. || took a rain check"
```

- `topic`: tên chủ đề (tự tạo nếu chưa có).
- `synonyms`: `text::ghi chú`, phân tách bằng `;`.
- `examples`: `en || vi || highlight`, phân tách bằng `;;`. `highlight` là phần cụm từ nguyên văn trong câu, dùng cho bài điền từ.

## Giới hạn
- Dữ liệu chỉ nằm trên trình duyệt hiện tại; dùng xuất/nhập để chuyển sang máy khác.
- Giọng đọc phụ thuộc hệ điều hành; nếu thiếu giọng vi-VN, phần tiếng Việt chỉ hiển thị chữ.
