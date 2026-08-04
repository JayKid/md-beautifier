FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

ENV NODE_ENV=production
ENV PORT=3010
ENV HOST=0.0.0.0
ENV MCP_TRANSPORT=http

EXPOSE 3010

CMD ["node", "src/server.js"]
