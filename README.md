# My Check-in Map — Hướng dẫn Phase 2

Đây là bộ khung dự án (project skeleton) đã cấu hình sẵn: Next.js 14, TypeScript strict, TailwindCSS, shadcn/ui, Dexie (IndexedDB), MapLibre GL, PWA (Serwist). Ở phase này app **chưa có giao diện thật** — chỉ có các trang trắng để xác nhận mọi thứ chạy được. Giao diện thật sẽ tới ở Phase 3.

## BƯỚC 1 — Cài Node.js (chỉ làm 1 lần trên máy bạn)

1. Vào https://nodejs.org
2. Tải bản **LTS** (khuyến nghị, số phiên bản chẵn, ví dụ 20.x)
3. Cài đặt như phần mềm bình thường (Next, Next, Install, Finish)
4. Mở **Terminal** (Mac: ứng dụng "Terminal") hoặc **Command Prompt / PowerShell** (Windows), gõ:
   ```
   node -v
   npm -v
   ```
   Nếu hiện ra số phiên bản (vd `v20.15.1`) là đã cài thành công.

## BƯỚC 2 — Giải nén dự án

1. Tải file `my-checkin-map.zip` tôi gửi bên dưới.
2. Giải nén ra một thư mục bất kỳ, ví dụ Desktop.
3. Mở Terminal/Command Prompt, di chuyển vào thư mục đó:
   ```
   cd Desktop/my-checkin-map
   ```

## BƯỚC 3 — Cài thư viện

Gõ lệnh sau và đợi (lần đầu có thể mất 1-3 phút, cần có mạng internet):

```
npm install
```

Lệnh này đọc file `package.json` và tự động tải toàn bộ thư viện tôi đã liệt kê (Dexie, MapLibre, shadcn/ui...) về thư mục `node_modules`.

## BƯỚC 4 — Chạy thử ứng dụng

```
npm run dev
```

Mở trình duyệt vào địa chỉ: **http://localhost:3000**

Nếu bạn thấy dòng chữ "Home" giữa màn hình trắng — vậy là **Phase 2 đã thành công**. Bộ khung đã chạy đúng, sẵn sàng để tôi xây giao diện thật ở Phase 3.

Nhấn `Ctrl + C` trong Terminal để dừng server khi không dùng nữa.

## Cấu trúc đã tạo trong phase này

```
my-checkin-map/
├── app/
│   ├── (main)/                # Nhóm 6 trang chính: Home, Map, Places, Favorites, Timeline, Settings
│   ├── layout.tsx             # Layout gốc, bọc Providers (React Query, seed dữ liệu)
│   ├── globals.css            # Theme màu light/dark cho toàn app
│   ├── manifest.ts            # Khai báo PWA (tên, icon, màu)
│   └── sw.ts                  # Service worker — giúp app chạy offline
├── components/
│   └── shared/providers.tsx   # Khởi tạo DB, xin quyền lưu trữ bền vững
├── lib/
│   ├── db/schema.ts           # Toàn bộ cấu trúc database (Dexie)
│   ├── db/seed.ts             # 20 danh mục địa điểm mặc định
│   └── utils/cn.ts            # Hàm tiện ích cho shadcn/ui
├── types/index.ts             # Toàn bộ kiểu dữ liệu TypeScript
├── public/icons/              # Icon PWA tạm thời (sẽ thay bằng icon đẹp hơn sau)
├── package.json                # Danh sách thư viện
├── tailwind.config.ts          # Cấu hình màu sắc, bo góc, animation
└── next.config.mjs              # Cấu hình PWA/offline
```

## Một vài điều bạn KHÔNG cần làm gì thêm ở bước này

- **shadcn/ui**: đã cấu hình sẵn qua `components.json`. Ở Phase 3 tôi sẽ trực tiếp thêm các component (Button, Dialog, Toast...) vào code, bạn không cần tự chạy lệnh CLI.
- **Icon PWA**: tôi đã tạo icon tạm (chấm ghim bản đồ đơn giản). Nếu bạn muốn logo riêng, cứ nói ở phase sau, tôi sẽ thay.

## Nếu gặp lỗi ở Bước 3-4

- Báo lại **chính xác dòng lỗi** hiển thị trong Terminal, tôi sẽ chẩn đoán ngay (thường là do phiên bản Node quá cũ, hoặc thiếu mạng khi cài).

---

## PHASE 3 — Đã cập nhật: giao diện & component nền tảng

Vì Phase 3 thêm 2 dependency mới không có trong `npm install` cũ của bạn (không đúng — thật ra Phase 3 **không thêm thư viện mới**, chỉ dùng lại những gì đã cài ở Phase 2), bạn **không cần chạy lại `npm install`**. Chỉ cần:

1. Giải nén đè bản zip mới lên thư mục cũ (hoặc giải nén ra thư mục mới rồi copy lại)
2. Chạy lại:
   ```
   npm run dev
   ```
3. Mở `http://localhost:3000`, bạn sẽ thấy:
   - **Trang chủ**: thanh tìm kiếm nổi, khung "bản đồ sẽ hiện ở đây", 5 con dấu rating mẫu (xanh lá → đỏ), nút (+) tròn góc dưới phải
   - **Sidebar bên trái** (thu nhỏ trình duyệt xuống dưới ~1024px để xem Bottom Nav mobile thay vào)
   - **Places / Favorites / Timeline**: màn hình trống có hướng dẫn hành động rõ ràng
   - **Settings**: danh sách 3 mục cài đặt kiểu Notion

Thử kéo giãn/thu nhỏ cửa sổ trình duyệt để xem app chuyển từ layout mobile (Bottom Nav) sang desktop (Sidebar) mượt mà không.

---

## PHASE 4 — Đã cập nhật: Bản đồ MapLibre + Form Check-in

**Không cần `npm install` lại** — toàn bộ thư viện cần cho phase này (`maplibre-gl`, `react-map-gl`, `react-hook-form`, `zod`, `dexie-react-hooks`...) đã có sẵn trong `package.json` từ Phase 2.

1. Giải nén đè bản zip mới lên thư mục cũ.
2. Chạy `npm run dev`, mở `http://localhost:3000`.

**Bạn sẽ thấy và có thể thử:**
- Bản đồ thật (MapLibre GL) hiển thị toàn màn hình, mặc định canh giữa TP.HCM
- Bấm nút tròn "Sáng / Tối / Vệ tinh" góc trên phải để đổi kiểu bản đồ
- Bấm nút (+) **hoặc bấm bất kỳ đâu trên bản đồ** → mở form Check-in đầy đủ (tên, danh mục, GPS, ngày giờ, rating sao, review, tag, toggle quay lại/recommend, link mạng xã hội, chi phí, ghi chú...)
- Nút "Vị trí hiện tại" trong form sẽ xin quyền truy cập GPS của trình duyệt
- Sau khi Lưu: marker xuất hiện ngay trên bản đồ (màu theo rating: 5★ xanh lá → 1★ đỏ), đồng thời trang **Địa điểm** cũng tự động hiện card mới — không cần tải lại trang
- Nhiều địa điểm gần nhau sẽ tự gộp thành 1 vòng tròn số (cluster), bấm vào để zoom vào

### 3 điểm cần bạn lưu ý / giúp kiểm tra

1. **Style bản đồ "Sáng"/"Tối"** lấy từ OpenFreeMap (dịch vụ miễn phí, không cần đăng ký) — đây là dịch vụ tôi không thể tự kiểm thử trực tiếp vì môi trường của tôi không có mạng. Nếu bạn thấy bản đồ **trắng trơn/không hiện tile**, đó là dấu hiệu URL style cần chỉnh lại — cứ chụp màn hình gửi tôi, tôi sẽ sửa ngay.
2. **Chế độ Tối** hiện dùng một mẹo CSS (đảo màu bản đồ sáng) vì OpenFreeMap chưa có style tối riêng — nhìn sẽ hơi khác tông so với chế độ tối "chuẩn", nhưng vẫn dùng được tốt. Có thể nâng cấp sau nếu bạn muốn đẹp hơn (cần đăng ký free API key ở MapTiler).
3. **Chế độ Vệ tinh** dùng ảnh vệ tinh miễn phí từ Esri — chỉ nên dùng cho mục đích cá nhân (đúng như app này), không phù hợp nếu sau này bạn thương mại hoá app.

### Nếu gặp lỗi khi chạy `npm run dev`

Vì Phase này có nhiều kiểu dữ liệu TypeScript phức tạp (bản đồ), khả năng nhỏ là sẽ có lỗi kiểu dữ liệu tôi chưa lường hết dù đã cố gắng viết cẩn thận. Nếu Terminal báo lỗi màu đỏ, **dán nguyên văn lỗi cho tôi**, đừng lo — đây là việc bình thường khi code, tôi sẽ sửa nhanh.

Nếu chạy ổn, nhắn **"tiếp tục"** để sang **Phase 5: Quản lý ảnh (chụp/upload/nén/lưu vào IndexedDB)**.

---

## PHASE 5 — Đã cập nhật: Quản lý ảnh đầy đủ

**Không cần `npm install` lại** — `browser-image-compression` đã có sẵn từ Phase 2. Giải nén đè, chạy `npm run dev` như cũ.

**Đã xây:**
- Trong form Check-in: 2 nút riêng **"Chụp ảnh"** (mở thẳng camera trên điện thoại) và **"Chọn ảnh"** (chọn nhiều ảnh từ thư viện), cộng kéo-thả ảnh vào khung
- Ảnh được tự động nén còn ~1MB/ảnh (giữ chất lượng tốt) + tạo riêng 1 bản thumbnail nhỏ để danh sách/lưới load nhanh — **toàn bộ lưu trong IndexedDB, không giới hạn vài MB như trước**
- Trang **Chi tiết địa điểm** (bấm vào 1 card ở trang Địa điểm, hoặc vào marker trên bản đồ rồi bấm tên) giờ hiển thị đầy đủ: gallery ảnh, review, tag, thông tin (món ăn/giá/chi phí/đi cùng ai), link mạng xã hội, nút ❤️ yêu thích, nút xoá
- Trong gallery: **kéo-thả ảnh để sắp xếp lại thứ tự**, bấm ★ để **đổi ảnh bìa**, bấm 🗑 để xoá, bấm vào ảnh để **xem toàn màn hình + zoom** (cuộn chuột hoặc bấm +/-, double-click để zoom nhanh, phím ← → để chuyển ảnh)

**Một quyết định thiết kế bạn nên biết:** khi bạn đang điền form Check-in, ảnh bạn chọn chỉ nằm tạm trong bộ nhớ trình duyệt (chưa lưu) — chúng chỉ thật sự được nén và ghi vào IndexedDB **sau khi** bạn bấm "Lưu check-in" thành công. Nếu bạn đóng form giữa chừng, ảnh đã chọn sẽ mất (đúng theo trực giác thông thường — giống hầu hết app khác).

Video ngắn (mục "nếu có thể" trong yêu cầu gốc) tôi tạm để sau vì không bắt buộc — nếu bạn vẫn muốn, cứ nói, tôi sẽ bổ sung ở phase sau.

Chạy thử: tạo 1 check-in mới kèm vài ảnh, vào trang Địa điểm bấm vào card đó, thử kéo-thả sắp xếp ảnh + xem fullscreen. Nếu ổn, nhắn **"tiếp tục"** để sang **Phase 6: Tìm kiếm, bộ lọc, thống kê, timeline**.

---

## PHASE 6 & 7 — Đã cập nhật: Tìm kiếm/Lọc/Thống kê/Timeline + Tối ưu & Hoàn thiện

**Không cần `npm install` lại** — `recharts` và `date-fns` đã có sẵn từ Phase 2.

### Phase 6 — Bạn sẽ thấy gì

- **Trang Địa điểm:** card giờ có ảnh bìa thật + khoảng cách tới vị trí hiện tại; nút lọc (icon phễu trong thanh tìm kiếm) mở bộ lọc theo danh mục/rating/yêu thích/muốn quay lại/recommend; có nút sắp xếp (Mới nhất/Cũ nhất/Rating cao/Tên A-Z); có chip nhanh **"✨ Đáng quay lại"** (tự lọc rating ≥4 + muốn quay lại + recommend — đúng mục "RECOMMEND" trong yêu cầu gốc)
- **Trang Dòng thời gian:** giờ có dashboard thống kê ở đầu trang (tổng số check-in, tổng ảnh, rating trung bình, tổng chi phí, biểu đồ theo danh mục, món hay được nhắc tới), bên dưới là danh sách nhóm theo **Năm → Tháng**, bấm vào tiêu đề năm để thu gọn/mở rộng
- **Trang Yêu thích:** giờ hiển thị dữ liệu thật (trước đây chỉ là màn hình trống)

### Phase 7 — Tối ưu & hoàn thiện

- **Sao lưu/Khôi phục thật:** vào **Cài đặt** → nút "Export JSON" tải về 1 file chứa toàn bộ dữ liệu (kể cả ảnh) → giữ file này an toàn (Google Drive, USB...) phòng khi đổi điện thoại hoặc lỡ xoá cache trình duyệt. Nút "Import JSON" khôi phục lại từ file đó (**sẽ ghi đè toàn bộ dữ liệu hiện tại**, có cảnh báo rõ trong app)
- **Dark mode hoạt động thật:** Cài đặt → Giao diện → Sáng/Tối/Hệ thống, áp dụng ngay lập tức, không cần tải lại trang
- **Xoá có "Hoàn tác":** xoá 1 địa điểm sẽ không mất ngay — có 5 giây để bấm "Hoàn tác" trong thông báo trước khi xoá thật sự, tránh xoá nhầm
- **Hiệu năng danh sách:** danh sách địa điểm tự tải thêm khi cuộn xuống (thay vì render cả nghìn card cùng lúc), ảnh dùng `loading="lazy"` để không tải hết cùng lúc
- **Ước lượng dung lượng đang dùng:** hiện trong Cài đặt, giúp bạn theo dõi app đang chiếm bao nhiêu bộ nhớ trình duyệt

### Điều bạn nên làm định kỳ

Vì đây là app 100% offline, **hãy Export JSON định kỳ** (ví dụ mỗi tháng) và lưu file đó ở nơi an toàn — nếu bạn xoá cache trình duyệt hoặc đổi máy, đây là cách duy nhất để không mất toàn bộ dữ liệu.

### Nếu gặp lỗi

Dán nguyên văn lỗi Terminal hoặc chụp màn hình cho tôi, tôi sẽ sửa ngay — đây là phase gộp nhiều thay đổi nên khả năng có sai sót nhỏ cao hơn bình thường.

---

Đến đây, 7 phase theo kế hoạch ban đầu đã hoàn thành đầy đủ chức năng cốt lõi. Còn 2 việc nhỏ tôi **chưa làm** (không bắt buộc trong yêu cầu gốc, bạn có thể yêu cầu thêm bất cứ lúc nào):
- Lưu **video ngắn** (mục "nếu có thể" trong brief)
- Icon PWA thật (hiện đang dùng icon tạm hình ghim bản đồ đơn giản)

Bạn thử toàn bộ app từ đầu đến cuối — check-in vài nơi, thử tìm kiếm/lọc, xem Timeline, thử Export/Import — rồi báo tôi kết quả nhé.

---

# VERSION 2 — UX/UI Refinement

## V2.1 — Đã cập nhật: Schema Wishlist (nền tảng dữ liệu)

**⚠️ Lần này CẦN chạy `npm install` lại** (đã thêm package `geist`, dùng thật ở V2.5):

1. Giải nén đè bản zip mới lên thư mục cũ
2. Chạy `npm install`
3. Chạy `npm run dev`

**Phase này CHƯA có giao diện mới** — mục tiêu chỉ là xây nền tảng dữ liệu cho Wishlist một cách an toàn:
- Thêm 2 bảng mới `wishlistPlaces` và `wishlistImages` vào IndexedDB (Dexie tự nâng cấp database version 1 → 2 khi bạn mở app, **hoàn toàn không đụng đến dữ liệu check-in cũ**)
- Repository đầy đủ: tạo/sửa/xoá mục Wishlist, quản lý ảnh riêng cho Wishlist
- Hàm quan trọng nhất: `convertWishlistToCheckin()` — chuyển 1 mục Wishlist thành Place thật, giữ nguyên tên/danh mục/địa chỉ/GPS/link Google Maps/tag/ghi chú/ảnh đã có, chỉ cần bổ sung rating/review/ngày check-in/chi phí thực tế

**Bạn cần kiểm tra gì ở phase này:** chạy `npm install` xong, app vẫn phải hoạt động **y hệt như trước** (không có gì mới để bấm cả) — vì UI của Wishlist sẽ xây ở V2.2. Nếu `npm install` hoặc `npm run dev` báo lỗi, gửi tôi ngay.

Nếu ổn, nhắn **"tiếp tục"** để sang **V2.2: Giao diện Wishlist** (2 tab Đã ghé/Muốn đi trong trang Địa điểm, form thêm nhanh, nút "Đã trải nghiệm").

---

## V2.2 → V2.7 — Đã cập nhật toàn bộ (làm 1 lần theo yêu cầu)

**Vẫn cần `npm install`** nếu bạn chưa làm ở bước V2.1 phía trên. Sau đó giải nén đè + `npm run dev` như cũ.

### V2.2 — Wishlist
- Trang **Địa điểm** giờ có 2 tab gạt trên cùng: **📍 Đã ghé** / **⭐ Muốn đi** (kèm số lượng)
- Tab Muốn đi: chip lọc theo danh mục, sắp xếp (Mới thêm/Ưu tiên/Gần nhất), tìm kiếm riêng, nút (+) mở form thêm nhanh (tên, danh mục, địa chỉ, GPS tuỳ chọn, link Google Maps, mức độ muốn đi, nguồn biết đến, chi phí ước tính, tag, ảnh, ghi chú)
- Mỗi card Wishlist có nút **"✓ Đã trải nghiệm"** → mở form rút gọn (chỉ hỏi rating/review/ngày/chi phí thực tế) → lưu xong **tự động chuyển sang tab Đã ghé**, giữ nguyên toàn bộ dữ liệu cũ + ảnh đã có

### V2.3 — Bản đồ 2 loại marker
- Marker tròn = đã đi (màu theo rating, giữ nguyên từ Phase 4)
- Marker ngôi sao = Wishlist (màu theo mức ưu tiên: cam=rất muốn đi, vàng=muốn đi, xám=để sau)
- Nút lọc bản đồ góc trên phải: **Tất cả / 📍 Đã đi / ⭐ Wishlist**
- Bấm vào marker đã chọn sẽ có hiệu ứng ping (gợn sóng) nhẹ

### V2.4 — Trang chủ
- Nút **"💡 Gợi ý cho bạn"** (chỉ hiện khi Wishlist có dữ liệu) mở bottom sheet với 2 mục: **"Có thể đi cuối tuần này"** (chấm điểm theo khoảng cách + mức ưu tiên + đa dạng danh mục — không dùng rating Google Maps vì cần API trả phí, đã thống nhất với bạn trước đó) và **"Gần đây thêm vào Wishlist"**

### V2.5 — Typography (Geist)
- Đổi toàn bộ font sang **Geist Sans** (chữ) + **Geist Mono** (số liệu/ngày giờ)
- Hệ thống 9 cấp typography hoàn chỉnh: Display/H1/H2/H3/H4/Body Large/Body/Caption/Label — line-height + letter-spacing tinh chỉnh riêng từng cấp, chỉ dùng weight 400/500/600 (bỏ hẳn 700 theo yêu cầu)

### V2.6 & V2.7 — Polish & Micro-interactions
- Card (địa điểm, Wishlist, gợi ý) nổi nhẹ + đổ bóng khi hover
- Nút bấm có hiệu ứng gợn sóng (ripple) kiểu Material, tinh tế hơn bản gốc
- FAB phình nhẹ + icon xoay 90° khi hover ("hiệu ứng mở rộng")
- Skeleton loading đổi từ pulse đơn thuần sang hiệu ứng shimmer (loang sáng)
- Marker trên bản đồ có ping khi được chọn
- Bottom sheet/Dialog chỉnh lại thời lượng animation về đúng 300ms
- Zoom ảnh trong Fullscreen Viewer mượt hơn (250ms)
- Chuyển trang có hiệu ứng fade-in nhẹ

### Một điều quan trọng cần bạn xác nhận
Export/Import (Cài đặt) đã được cập nhật để **bao gồm cả dữ liệu Wishlist** — nếu bạn có file backup cũ từ trước V2, import vẫn hoạt động bình thường (chỉ là sẽ không có Wishlist trong đó, điều này hợp lý vì lúc đó tính năng chưa tồn tại).

### Nếu gặp lỗi
Đây là lần cập nhật lớn nhất từ trước đến giờ (7 phase, rất nhiều file mới). Khả năng có lỗi nhỏ cao hơn bình thường — dán nguyên văn lỗi Terminal cho tôi, tôi sẽ sửa ngay, không cần lo lắng.

Bạn thử toàn bộ luồng Wishlist: thêm 1 nơi vào Wishlist → xem trên bản đồ (marker sao) → bấm "Đã trải nghiệm" → xác nhận nó chuyển sang tab Đã ghé đúng như mong đợi.
