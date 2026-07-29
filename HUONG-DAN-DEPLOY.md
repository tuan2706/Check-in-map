# Hướng dẫn đưa My Check-in Map lên Internet & cài thành App

Hiện tại app chỉ chạy trên máy bạn (`localhost:3000`) — chỉ bạn mở được, và phải mở Terminal + gõ `npm run dev` mỗi lần. Để biến thành 1 link web thật (ai cũng mở được) và cài như 1 app trên điện thoại, làm theo các bước dưới đây.

**Việc này miễn phí 100%**, dùng dịch vụ tên **Vercel** (chính là công ty tạo ra Next.js — framework app của bạn đang dùng, nên tương thích hoàn hảo).

---

## ⚠️ Đọc trước khi làm: dữ liệu hoạt động thế nào sau khi deploy

App của bạn lưu dữ liệu **trong trình duyệt của từng thiết bị** (IndexedDB), không có server lưu chung. Nghĩa là:

- Sau khi deploy, bạn có 1 link web thật (vd `my-checkin-map.vercel.app`)
- Nhưng nếu bạn mở link đó trên **điện thoại**, rồi mở lại trên **laptop** → đó là **2 nơi lưu dữ liệu riêng biệt**, check-in trên điện thoại sẽ KHÔNG tự hiện trên laptop
- Cách duy nhất để chuyển dữ liệu giữa các thiết bị: dùng **Export/Import JSON** đã có sẵn trong Cài đặt (xem file hướng dẫn sử dụng)

👉 Lời khuyên: chọn **1 thiết bị chính** (thường là điện thoại, vì tiện chụp ảnh + có GPS) để dùng hàng ngày, thiết bị khác chỉ xem qua Import nếu cần.

---

## BƯỚC 1 — Cài Git (nếu máy bạn chưa có)

1. Vào https://git-scm.com/downloads, tải bản cho hệ điều hành của bạn, cài như phần mềm bình thường
2. Kiểm tra: mở Terminal/Command Prompt, gõ `git --version` → thấy số phiên bản là được

## BƯỚC 2 — Tạo tài khoản GitHub (miễn phí)

1. Vào https://github.com, bấm **Sign up**, tạo tài khoản (email + mật khẩu)
2. Sau khi đăng nhập, bấm nút **+** góc trên phải → **New repository**
3. Đặt tên (vd `my-checkin-map`), để **Public** hoặc **Private** đều được, **không** tích vào "Add README" (vì bạn đã có sẵn code) → bấm **Create repository**
4. GitHub sẽ hiện ra 1 trang có sẵn các lệnh — giữ trang này để dùng ở Bước 3

## BƯỚC 3 — Đưa code lên GitHub

Mở Terminal, `cd` vào đúng thư mục dự án (`my-checkin-map`), rồi chạy lần lượt:

```
git init
git add .
git commit -m "My Check-in Map - phien ban dau tien"
git branch -M main
git remote add origin https://github.com/TEN-TAI-KHOAN-CUA-BAN/my-checkin-map.git
git push -u origin main
```

(Thay `TEN-TAI-KHOAN-CUA-BAN` bằng username GitHub thật của bạn — dòng lệnh chính xác GitHub đã hiện sẵn ở Bước 2.4, copy y nguyên từ đó là chắc chắn đúng.)

Nếu Git hỏi đăng nhập, làm theo hướng dẫn trên màn hình (thường mở trình duyệt để xác nhận).

## BƯỚC 4 — Deploy lên Vercel

1. Vào https://vercel.com, bấm **Sign up**, chọn **Continue with GitHub** (dùng luôn tài khoản GitHub vừa tạo, không cần tạo mật khẩu mới)
2. Sau khi vào Dashboard, bấm **Add New** → **Project**
3. Chọn đúng repo `my-checkin-map` bạn vừa đẩy lên → bấm **Import**
4. Vercel tự nhận diện đây là dự án Next.js, để nguyên toàn bộ cấu hình mặc định → bấm **Deploy**
5. Đợi khoảng 1-2 phút, xong bạn sẽ có 1 link dạng `https://my-checkin-map-xxxx.vercel.app`

Mở link đó — app chạy y hệt như trên `localhost:3000`, nhưng giờ ai có link cũng mở được, và có HTTPS thật (bắt buộc để cài PWA).

## BƯỚC 5 — Cài app lên điện thoại (biến thành "app" thật)

Mở link Vercel ở Bước 4 bằng trình duyệt trên điện thoại:

**iPhone (Safari):**
1. Bấm icon **Chia sẻ** (hình vuông có mũi tên) ở thanh dưới
2. Chọn **"Thêm vào MH chính"** (Add to Home Screen)
3. Icon app sẽ xuất hiện trên màn hình chính như 1 app thật, mở ra không còn thanh địa chỉ trình duyệt

**Android (Chrome):**
1. Bấm menu 3 chấm góc trên phải
2. Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào Màn hình chính"**
3. Xác nhận — icon xuất hiện trong danh sách app như app tải từ Google Play

Từ giờ bạn mở app y như mọi app khác, không cần nhớ link, không cần mở Terminal gì cả.

---

## Muốn cập nhật app sau này thì sao?

Mỗi khi bạn nhờ tôi sửa/thêm tính năng và có bộ code mới:
1. Giải nén đè bộ code mới vào đúng thư mục cũ (như bạn vẫn làm)
2. Chạy lại 3 lệnh:
   ```
   git add .
   git commit -m "Cap nhat tinh nang moi"
   git push
   ```
3. Vercel **tự động** phát hiện code mới trên GitHub và deploy lại — không cần làm gì thêm ở Vercel, chỉ cần đợi 1-2 phút rồi mở lại link cũ (hoặc app trên điện thoại) là thấy bản mới

## Câu hỏi thường gặp

**Có tốn phí không?** Không — cả GitHub và Vercel đều miễn phí cho dự án cá nhân ở quy mô này.

**Có cần domain riêng (vd `checkinmap.com`) không?** Không bắt buộc. Nếu muốn, bạn có thể mua domain (vài trăm nghìn/năm) rồi gắn vào Vercel sau — có thể làm bất cứ lúc nào, không ảnh hưởng gì đến app đang chạy.

**Người khác có thấy dữ liệu của tôi không?** Không. Link web là công khai (ai có link đều mở được app), nhưng dữ liệu (check-in, ảnh, wishlist) chỉ lưu trong trình duyệt của người đang mở — mỗi người mở link sẽ thấy 1 app trống, không thấy dữ liệu của bạn.
