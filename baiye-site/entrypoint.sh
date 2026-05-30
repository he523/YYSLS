#!/bin/sh
set -e

# ── 确保持久化目录存在 ──
mkdir -p /app/data/uploads /app/data/avatars /app/data/music

# ── 如果是首次运行，把镜像里已有的文件迁移到持久卷 ──
for dir in uploads avatars music; do
  if [ -d "/app/public/$dir" ] && [ ! -L "/app/public/$dir" ]; then
    # 把已有文件搬过去（不覆盖已存在的）
    cp -rn /app/public/$dir/* /app/data/$dir/ 2>/dev/null || true
    # 删除原目录，换成软链接
    rm -rf "/app/public/$dir"
    ln -sf "/app/data/$dir" "/app/public/$dir"
  fi
done

echo "📦 正在运行数据库迁移..."
npx prisma migrate deploy

echo "🚀 启动白夜站点..."
exec npm start
