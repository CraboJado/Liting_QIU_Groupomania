## Brief introduction of the project :
Groupomania is a corporate social network web application, responsive and respecting WCAG standards, implemented mainly with technology stacks : 
Frontend : react JS ( version 18.0 ) , react-moment, axios, sass
Backend : node JS, express, mysql2, multer , bcrypt, jsonwebtoken

## How to start the projet:
1. clone project to your local machine <br>
clone the current version on main branch : https://github.com/CraboJado/Liting_QIU_Groupomania.git
<br>
git clone in gitbash or commande line

2. configuration at Backend:
    1. execute mysql scripts to create necessary tables in advance
    2. create .env file in server folder to configurate the necessary environement variables, please refer to the .env_example file
    3. run  'npm i or npm install' to install necessary dependencies at server folder
    4. after all dependencies are installed, run 'node server or nodemon server' to start the server

3. configuration at Frontend:
    1. create .env file in client folder and configurate the necessary environement variable as below :
         REACT_APP_API_URL = 'http://localhost:5000/api'
         <br>
         !! if your port is not 5000, please change to your port 
    2. run  'npm i or npm install' to install necessary dependencies at client folder
    3. after all dependencies are installed, run 'npm start' to open the web application


