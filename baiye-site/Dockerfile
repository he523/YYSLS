# ---- Build Stage ----
FROM node:20-alpine AS builder

# better-sqlite3 需要编译工具
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

# 复制依赖文件和 Prisma schema
COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY prisma/ ./prisma/
COPY generated/ ./generated/

# 安装全部依赖（postinstall 自动 prisma generate）
RUN npm ci

# 复制源码并构建
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY components.json ./
COPY eslint.config.mjs ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

RUN apk add --no-cache sqlite-libs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制 package.json（npm start 需要）
COPY --from=builder /app/package.json ./

# 复制完整 node_modules（含 prisma CLI，方便运行 migration）
COPY --from=builder /app/node_modules ./node_modules

# 复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/next.config.ts ./

# 数据目录（挂载点）
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

# 启动脚本（自动迁移 + 启动服务）
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
