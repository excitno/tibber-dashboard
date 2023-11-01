FROM node:20.9 as build

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --network-timeout 100000

# Bundle app source
COPY . .

# Install dependencies for production
RUN yarn build

# Serve the content with NGINX
FROM nginx:1.20 as serve

# Copy built and config files
COPY --from=build /usr/src/app/dist/ /usr/share/nginx/html

# Expose the default ports
EXPOSE 80
EXPOSE 443