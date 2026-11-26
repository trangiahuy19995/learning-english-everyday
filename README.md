# Cụm Từ — Learning English Everyday (Học Tiếng Anh Mỗi Ngày)

Ứng dụng học collocation / idiom / phrasal verb song ngữ Anh–Việt với phiên âm IPA, giải nghĩa theo ngữ cảnh, từ đồng nghĩa, ví dụ song ngữ, luyện tập tương tác và ôn tập lặp lại ngắt quãng (Spaced Repetition System - SRS).

---

## 🌐 Trải nghiệm Trực tuyến & Tải App

- 🚀 **Online Web Demo (GitHub Pages):** [https://trangiahuy19995.github.io/learning-english-everyday/](https://trangiahuy19995.github.io/learning-english-everyday/)
- 📱 **Tải App Android (.APK):** [Tải file APK từ GitHub Releases](https://github.com/trangiahuy19995/learning-english-everyday/releases)
- 📂 **GitHub Repository:** [https://github.com/trangiahuy19995/learning-english-everyday](https://github.com/trangiahuy19995/learning-english-everyday)

---

## 💡 Tính năng chính

1. **Học theo cụm (Collocations, Idioms, Phrasal Verbs):**
   - Hơn 20+ cụm từ mẫu phân theo 4 chủ đề chính: Giao tiếp, Công sở, Du lịch, IELTS.
   - Hỗ trợ phát âm chuẩn qua Web Speech API (giọng US bản ngữ).
   - Tra cứu nghĩa tiếng Việt, sắc thái biểu đạt (nuance) và từ đồng nghĩa.
2. **Thiết lập phiên học linh hoạt:**
   - Tùy chọn 5–60 cụm từ mỗi phiên học.
   - Lọc theo từ mới, ôn tập đến hạn hoặc kết hợp thông minh.
   - Phiên học dài tự động chia thành các chặng 10 cụm giúp tiếp thu dễ dàng.
3. **Luyện tập tương tác & Thẻ học (Flashcards):**
   - Bài tập trắc nghiệm nghĩa, hoàn thành câu ví dụ và điền từ vào chỗ trống.
4. **Thuật toán Spaced Repetition (SRS - SM-2):**
   - Tự động tính toán chu kỳ ôn tập ngắt quãng dựa trên mức độ đánh giá: Quên (1), Khó (3), Nhớ (4), Dễ (5).
   - Tự động phân loại trạng thái: `learning` (đang học), `review` (cần ôn), `mastered` (đã thành thạo).
5. **Nhập / Xuất dữ liệu:**
   - Dễ dàng xuất và nhập kho từ vựng qua file CSV hoặc JSON.

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Bundler & Build:** Vite
- **Mobile Native (Android):** Capacitor Android SDK
- **CI/CD:** GitHub Actions (Tự động build Web lên GitHub Pages & đóng gói file `.apk` vào GitHub Releases)

---

## 💻 Chạy dự án cục bộ

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Chạy Web Development Server:
```bash
npm run dev
```

### 3. Build Web production:
```bash
npm run build
```

### 4. Đồng bộ và Build Android App:
```bash
npm run cap:build
npx cap open android
```
