التشغيل محليًا (Local)

بعد فك الضغط:

cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev


ثم:

الموقع: http://localhost:3000 (يحّول إلى /ar)

الإدارة: http://localhost:3000/ar/admin

لتشغيل المشغل فعليًا: ادخل لوحة الإدارة → Streams → أضف رابط HLS قانوني وفعّله (Enabled).