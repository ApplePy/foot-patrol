FROM nginx:1-alpine

# Get all the code needed to run the app
ADD dist /usr/share/nginx/html/

COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

# Expose the port the app runs in
EXPOSE 80
