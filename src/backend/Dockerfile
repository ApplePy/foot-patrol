FROM node:8

# Create a directory where our app will be placed
RUN mkdir -p /usr/src/app

# Change directory so that our commands run inside this new directory
WORKDIR /usr/src/app

# Get all the code needed to run the app
COPY dist/ /usr/src/app
COPY node_modules/ /usr/src/app/node_modules/

# Expose the port the app runs in
EXPOSE 80

# Set the app to production-mode
ENV NODE_ENV=production
ENV PORT=80

# Serve the app
CMD ["node", "index.js"]