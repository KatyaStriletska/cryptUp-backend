# Venture Launch

## Getting started
These instructions will help you get a copy of the project up and running on your local machine for development and testing purposes.

### Installation

1. Clone the project
   
    ```
    git clone https://github.com/Venture-Launch/venture-launch.git
    ```
    or using SSH
    ```
    git clone git@github.com:Venture-Launch/venture-launch.git
    ```
2. Navigate to the project directory
   
    ```
    cd venture-launch
    ```
3. Build and run application in docker containers

    **_Development_**
   
    Build docker images and start containers
    ```
    npm run start:build:docker:dev
    ```
    Or start containers without build if you already have built images
    ```
    npm run start:docker:dev
    ```

    **_Local production_**
   
    Build docker images and start containers
    ```
    npm run start:build:docker:local
    ```
    Or start containers without build if you already have built images
    ```
    npm run start:docker:local
    ```

4. Stop the application
   
   **_Development_**
   
    ```
    npm run stop:docker:dev
    ```

    **_Local production_**
   
    ```
    npm run stop:docker:local
    ```
    
### Required environment variables
  
  If you are running the application for **_development_** you have to create `.env.dev` file in the root of the project with the following structure:

  ```
  # Frontend environment variables
  VITE_FRONTEND_PORT=3000
  VITE_BACKEND_HOST=http://localhost
  VITE_BACKEND_PORT=8000
  VITE_AUTH_MESSAGE='To verify your wallet sign this message'
  VITE_AUTH_TOKEN_NAME='X-Access-Token'
  VITE_NFT_GENERATOR_PROGRAM_ID=HpAYvZEKRpJMXDGFGqqnrRPHBrxJM2MQqaTJBgy2sXVv
  VITE_TOKEN_METADATA_PROGRAM_ID=metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
  
  # Backend environment variables
  FRONTEND_PORT=3000
  BACKEND_PORT=8000
  
  FRONTEND_HOST=http://localhost
  AUTH_MESSAGE='To verify your wallet sign this message'
  AUTH_TOKEN_NAME='X-Access-Token'
  
  SESSION_SECRET=35a9b4ebdc2ff10403385de00d41ba9aa9afc76e4eade87cee1cea01703c9ad3
  SESSION_MAX_AGE=86400000
  
  THIRDWEB_STORAGE_SECRET=tN8Lga7jrwGyY4HWIs4NCKb8NrQYzg5XBIiFc9v6LIeluJJfVI5FlpWkE1TTEpt1LuuDIlCjmjQ0oKlXQoHPPQ
  NFT_DEFAULT_IMAGE=https://i.imgur.com/sRhxBTu.png
  
  # Database environment variables
  POSTGRES_USER=venture-launch
  POSTGRES_DATABASE=venture-launch
  POSTGRES_PASSWORD=7f8f73e0e2c891ca14f7e814b948361be839dac1241a2a2c1b1450eae1005137
  
  DATABASE_PORT=5432
  DATABASE_HOST=database
  ```

  If you are running the application for **_local production_** you have to create `.env.local` file in the root of the project with the following structure:

  ```
  # Docker additional environment variables
  DOCKER_BACKEND_PORT=8000
  DOCKER_FRONTEND_PORT=3000
  
  # Frontend environment variables
  VITE_FRONTEND_PORT=3000
  VITE_BACKEND_HOST=http://localhost
  VITE_BACKEND_PREFIX=api
  VITE_FRONTEND_HOST=http://localhost
  VITE_BACKEND_PORT=88
  VITE_AUTH_MESSAGE='To verify your wallet sign this message'
  VITE_AUTH_TOKEN_NAME='X-Access-Token'
  VITE_NFT_GENERATOR_PROGRAM_ID=HpAYvZEKRpJMXDGFGqqnrRPHBrxJM2MQqaTJBgy2sXVv
  VITE_TOKEN_METADATA_PROGRAM_ID=metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
  VITE_NGINX_PORT=88
  
  # Backend environment variables
  FRONTEND_PORT=88
  BACKEND_PORT=8000
  
  FRONTEND_HOST=http://localhost
  AUTH_MESSAGE='To verify your wallet sign this message'
  AUTH_TOKEN_NAME='X-Access-Token'
  
  SESSION_SECRET=35a9b4ebdc2ff10403385de00d41ba9aa9afc76e4eade87cee1cea01703c9ad3
  SESSION_MAX_AGE=86400000
  
  THIRDWEB_STORAGE_SECRET=tN8Lga7jrwGyY4HWIs4NCKb8NrQYzg5XBIiFc9v6LIeluJJfVI5FlpWkE1TTEpt1LuuDIlCjmjQ0oKlXQoHPPQ
  NFT_DEFAULT_IMAGE=https://i.imgur.com/sRhxBTu.png
  
  # Database environment variables
  POSTGRES_USER=venture-launch
  POSTGRES_DATABASE=venture-launch
  POSTGRES_PASSWORD=7f8f73e0e2c891ca14f7e814b948361be839dac1241a2a2c1b1450eae1005137
  
  DATABASE_PORT=5432
  DATABASE_HOST=database
  
  # NGINX environment variables
  NGINX_PORT=88
  ```


In summary, this README provides comprehensive instructions for setting up and utilizing the project. Whether you're a developer looking to contribute, a user seeking to understand how to use the application, or simply someone interested in exploring the project's capabilities, we hope this documentation serves as a helpful guide. Should you encounter any issues or have suggestions for improvement, please don't hesitate to reach out. Thank you for your interest and support!

🤝***This README was developed by our team with [RateIT](https://rateit.expert).***

