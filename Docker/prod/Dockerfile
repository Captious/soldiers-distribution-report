FROM node:24

WORKDIR /app

COPY package.json ./

RUN npm install -g pnpm && pnpm install --force

COPY .. .

RUN sed -i 's/\r$//' /app/*.sh && chmod +x /app/*.sh
RUN npm run build

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
