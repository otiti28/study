FROM nginx:alpine
COPY . /usr/share/nginx/html/index.html
EXPOSE 80


