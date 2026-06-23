FROM mcr.microsoft.com/playwright:v1.61.0-jammy
WORKDIR /app
ENV PNPM_MINIMUM_RELEASE_AGE=0

RUN npm install -g pnpm@10.28.2

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm prisma generate

RUN pnpm build

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]
