const Company 			    = require('./../models').Company;
const News 			    = require('./../models').News;
const { to, ReE, ReS } = require('../services/util.service');

let company = async function (req, res, next) {
    console.log(res)
    let company_id, err, company;
    company_id = req.params.company_id;

    console.log("----------" + Company.findOne({where:{id:company_id}}))

    [err, company] = await to(Company.findOne({where:{id:company_id}}));


    if(err) return ReE(res, "err finding company");

    if(!company) return ReE(res, "Company not found with id: "+company_id);
    let user, users_array, users;
    user = req.user;
    [err, users] = await to(company.getUsers());

    users_array = users.map(obj=>String(obj.user));

    if(!users_array.includes(String(user._id))) return ReE(res, "User does not have permission to read app with id: "+app_id);

    req.company = company;
    next();
}
module.exports.company = company;


let news = async function (req, res, next) {
    let news_id, err, news;
    news_id = req.params.news_id;

    [err, news] = await to(News.findOne({where:{id:news_id}}));

    if(err) return ReE(res, "err finding news");

    if(!news) return ReE(res, "News not found with id: "+news_id);
    let user, users_array, users;
    user = req.user;
    [err, users] = await to(news.getUsers());

    users_array = users.map(obj=>String(obj.user));

    if(!users_array.includes(String(user._id))) return ReE(res, "User does not have permission to read app with id: "+app_id);

    req.news = news;
    next();
}
module.exports.news = news;