# Rest Api Node and Mysql

## Description
This is an Restful API for Node.js and Mysql. Designed after PHP's beautiful Laravel. This is in the MVC format,
except because it is an API there are no views, just models and controllers.

tutorial can be found here: https://medium.com/@brianalois/build-a-rest-api-for-node-mysql-2018-jwt-6957bcfc7ac9
##### Routing         : Express
##### ORM Database    : Sequelize
##### Authentication  : Passport, JWT

## Installation

#### Download Code | Clone the Repo

```
git clone {repo_name}
```

#### Install Node Modules
```
npm install
```

#### Create .env File
You will find a example.env file in the home directory. Paste the contents of that into a file named .env in the same directory. 
Fill in the variables to fit your application


POST
http://127.0.0.1:8082/v1/users
{
  "email":"hi@163.com", 
  "phone": "600123549",
  "first": "Min",
  "last": "Zhang",
  "password":"123456",
  "region": "CHINA 上海"
}

POST
http://127.0.0.1:8082/v1/users/login
{
  "email":"hi@163.com", 
  "password":"123456"
}
 
GET
http://127.0.0.1:8082/v1/users/
Authorization Bearer 

PUT
http://127.0.0.1:8082/v1/users/
Authorization Bearer 
{
  "email":"hi@163.com", 
  "password":"654321",
  "phone": "18616960000",
  "wechat": "belem007"
}

GET
http://127.0.0.1:8082/v1/news
Authorization Bearer 

GET
http://127.0.0.1:8082/v1/news/3
Authorization Bearer 

PUT
http://127.0.0.1:8082/v1/news/3
Authorization Bearer 
{
  "title":"这个标题要更新"
}