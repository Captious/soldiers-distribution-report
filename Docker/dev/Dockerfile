FROM node:24

WORKDIR /app

COPY package.json ./

RUN npm install -g pnpm && pnpm install --force

COPY .. .

RUN chmod +x *.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
