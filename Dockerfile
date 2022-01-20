FROM mhart/alpine-node:14
ARG ENV_SETTING
ENV ENV_SETTING ${ENV_SETTING:-"staging"}
# Set the working directory to /app
WORKDIR /

#Install useful tools
RUN apk add --no-cache curl

# Set the log level for container
RUN npm config set loglevel warn

# Install app dependencies
COPY . .
RUN npm i
COPY . .

EXPOSE 8022

CMD node -r dotenv/config index.js dotenv_config_path=.env.${ENV_SETTING}