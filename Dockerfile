# syntax=docker/dockerfile:1.7
#
# Canonical multi-stage Next.js + Prisma Dockerfile
# ─────────────────────────────────────────────────
#
# このテンプレートは `scripts/create-dockerfiles.mjs` によって各アプリに配置される。
# 変更するときは本ファイルを編集し、スクリプトを再実行して各アプリへ反映する。
#
# 前提:
#   - Next.js App Router
#   - Prisma schema が prisma/schema.prisma に存在
#   - `npm start` が `next start` を呼ぶ
#   - `/api/health` が 200 を返す
#
# 最適化余地:
#   - next.config に `output: "standalone"` を設定すると image サイズを大幅削減可能。
#     その場合、ランナー stage の node_modules コピーは `.next/standalone` / `.next/static`
#     の 2 行に置き換える（コメント参照）。

ARG NODE_VERSION=22-alpine


# ============================================================
# Stage 1: deps — install all deps (dev + prod) for the builder
# ============================================================
FROM node:${NODE_VERSION} AS deps
# openssl / libc6-compat: Prisma engine が要求する native deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
# npm ci は lockfile を厳密に使い、全依存を deterministic にインストール。
# cache mount は BuildKit 前提。
RUN --mount=type=cache,target=/root/.npm \
    npm ci


# ============================================================
# Stage 2: builder — prisma generate + next build
# ============================================================
FROM node:${NODE_VERSION} AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js テレメトリ無効化（ビルド時に anonymous usage data を送らない）
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma Client を先に生成してから build。Next.js が schema.prisma を import する
# features/api route を含むため順序が重要。
RUN npx prisma generate
RUN npm run build


# ============================================================
# Stage 3: runner — minimal production image
# ============================================================
FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user (Next.js 公式推奨)。container escape / privilege escalation 対策。
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Build artifact をコピー。node_modules は builder stage から丸ごと運ぶ
# （prisma generate 済みの .prisma フォルダも同梱される）。
# next.config で `output: "standalone"` を有効化した場合は以下 4 行を
# コメントアウトし、下のコメントブロックに差し替える。
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# ↓ standalone 有効化時はこのブロックに差し替える
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# CMD ["node", "server.js"]

USER nextjs
EXPOSE 3000

# 起動後の readiness check。/api/health は canonical テンプレで全アプリに配置済み。
# node 22 は fetch がグローバル利用可能。
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"

CMD ["npm", "start"]
