# Spideration — Post Production Department Simulator

## Chạy local (development)

```bash
# Tab 1: Frontend
npm install
npm run dev

# Tab 2: Backend
cd server && npm install && node index.js
```

## Deploy lên Railway (production)

### Bước 1: Push lên GitHub
```bash
cd /Users/teki77/.gemini/antigravity/scratch/ai-department-sim
git init
git add .
git commit -m "Initial Spideration deployment"
# Tạo repo mới trên github.com rồi:
git remote add origin https://github.com/YOUR_USERNAME/spideration.git
git push -u origin main
```

### Bước 2: Deploy Railway
1. Vào https://railway.app → Login bằng GitHub
2. Click **New Project → Deploy from GitHub Repo**
3. Chọn repo `spideration`
4. Railway sẽ tự build và deploy!

### Bước 3: Thêm biến môi trường
Trong Railway Dashboard → Settings → Variables, thêm:
```
BOT_TOKEN=8653414429:AAFDJLdxvfdMVxT8xFGf1-Q2kU-y5g1NQMM
```

### Bước 4: Lấy URL
Sau khi deploy xong, Railway cho URL dạng:
```
https://spideration-production.up.railway.app
```

> Chia sẻ URL này cho toàn bộ team! Không cần cài đặt gì cả.

## Cấu trúc project

- **Frontend** (Vite): được build ra thư mục `dist/`
- **Backend** (Express + Socket.IO): chạy từ `server/` và serve cả `dist/`
- **Telegram Bot**: chạy chung trong backend server
