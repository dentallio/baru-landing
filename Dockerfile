FROM mhart/alpine-node:14

# Set the working directory to /app
WORKDIR /

#Install useful tools
RUN apk add --no-cache curl

# Set the log level for container
RUN npm config set loglevel warn

# Install app dependencies
COPY package*.json /
RUN yarn install && yarn cache clean
COPY . .

EXPOSE 8022

CMD ["node", "index.js"]