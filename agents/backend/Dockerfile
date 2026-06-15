FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js gemma-server.js create-assistants.js ./

# Default to gemma-server; override with CMD at runtime
ENV NODE_ENV=production \
    PORT=3001 \
    LLM_BACKEND=hybrid

EXPOSE 3001

CMD ["node", "gemma-server.js"]
