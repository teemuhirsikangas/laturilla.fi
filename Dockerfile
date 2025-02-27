#Docker file for rca + node server from one
FROM node:16-alpine AS ui-build

WORKDIR /home/node/app
RUN chown -R node:node /home/node/app
COPY --chown=node:node client/ ./client/
USER node
RUN cd client && npm ci --legacy-peer-deps --omit=dev && npm run build

FROM node:16-alpine AS server-build
WORKDIR /home/node/app
RUN chown -R node:node /home/node/app
COPY --chown=node:node --from=ui-build /home/node/app/client/build ./client/build

COPY --chown=node:node package*.json ./
#copy the prod env file here
COPY --chown=node:node .env_prod .env

USER node

RUN npm ci --omit=dev

COPY --chown=node:node . .

EXPOSE 5000

CMD ["npm", "start"]