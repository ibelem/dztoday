const { News } = require('../models');
const { to, ReE, ReS } = require('../services/util.service');

const create = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    let err, news;
    let user = req.user;

    let news_info = req.body;


    [err, news] = await to(News.create(news_info));
    if(err) return ReE(res, err, 422);

    news.addUser(user, { through: { status: 'started' }})

    [err, news] = await to(news.save());
    if(err) return ReE(res, err, 422);

    let news_json = news.toWeb();
    news_json.users = [{user:user.id}];

    return ReS(res, {news:news_json}, 201);
}
module.exports.create = create;

const getAll = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    let user = req.user;
    let err, newsfull;

    [err, newsfull] = await to(user.getNews({include: [ {association: News.Users} ] }));

    let newsfull_json =[]
    for( let i in newsfull){
        let news = newsfull[i];
        let users =  news.Users;
        let news_info = news.toWeb();
        let users_info = [];
        for (let i in users){
            let user = users[i];
            // let user_info = user.toJSON();
            users_info.push({user:user.id});
        }
        news_info.users = users_info;
        newsfull_json.push(news_info);
    }

    console.log('c t', newsfull_json);
    return ReS(res, {news:newsfull_json});
}
module.exports.getAll = getAll;

const get = function(req, res){
    res.setHeader('Content-Type', 'application/json');
    let news = req.news;
    return ReS(res, {news:news.toWeb()});
}
module.exports.get = get;

const update = async function(req, res){
    let err, news, data;
    news = req.news;
    data = req.body;
    news.set(data);

    [err, news] = await to(news.save());
    if(err){
        return ReE(res, err);
    }
    return ReS(res, {news:news.toWeb()});
}
module.exports.update = update;

const remove = async function(req, res){
    let news, err;
    news = req.news;

    [err, news] = await to(news.destroy());
    if(err) return ReE(res, 'error occured trying to delete the news');

    return ReS(res, {message:'Deleted news'}, 204);
}
module.exports.remove = remove;