const read = require('node-readability')
const request = require('superagent')
require('superagent-proxy')(request)
const Throttle = require('superagent-throttle')
const cheerio = require("cheerio")
const mysql = require('mysql')
const schedule = require("node-schedule");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: ""
})

class Ut {
  /** 
   * 异步延迟 
   * @param {number} time 延迟的时间,单位毫秒 
   */
  static sleep(time = 0) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    })
  };
}

con.connect()

// let proxy = process.env.http_proxy || 'http://*:*'
let throttle = new Throttle({
  active: true,
  rate: 10,
  ratePer: 10000,
  concurrent: 5
})

var newsitem = []
let start = 1637
let end = 1700

let getAuthor = function(html) {
  const $ = cheerio.load(html)
  let t = $('.contArticle_bot_text').text().replace('：', '|').replace(/：/g, '|').split('|')
  let a = t[1].replace('来源', '').trim()
  if (a) {
    return a
  } else {
    return ''
  }
}

let getSource = function(html) {
  const $ = cheerio.load(html)
  let t = $('.contArticle_bot_text').text().replace('：', '|').replace(/：/g, '|').split('|')
  let a = t[2].replace('本站原创', '母校官网').trim()
  if (a) {
    return a
  } else {
    return ''
  }
}

let getPubDate = function(html) {
  const $ = cheerio.load(html)
  let t = $('.contArticle_author span').text()
  t = t.replace('发布时间：', '').replace('点击数：', '').replace('年', '.').replace('月', '.').replace('日', '').trim()
  return t
}

let getImgURLs = function(html) {
  const $ = cheerio.load(html)
  let t = $('.contArticle_text img')
  let g = []
  $(t).each(function(i, e) {
    let img = 'http://www.dgzx.org' + $(this).attr('src')
    g.push(img)
  })
  if (g) {
    let t = g.toString()
    t = t.replace(/,/g, '||| ')
    return t
  } else {
    return ''
  }
}

let fetchNews = function(url) {
  read(url, function(err, article, meta) {
    if (article.textBody.length > 10) {
      // console.log(article.title.replace('-扬州市江都区丁沟中学','').trim())
      // console.log(article.textBody)
      newsitem = [article.title.replace('-扬州市江都区丁沟中学', '').trim(), article.textBody, url]
      insertNewswithCheck(url, newsitem)
      article.close()
      fetchNewsMore(url)
    }
  })
}

let fetchNewsMore = async function(url) {
  // request.get(url).proxy(proxy).use(throttle.plugin()).end((err, res) => {
  request.get(url).use(throttle.plugin()).end((err, res) => {
    if (err) {
      console.log(err)
    } else {
      (async() => {
        let pubdate = getPubDate(res.text)
        let author = getAuthor(res.text)
        let source = getSource(res.text)
        let imgurls = getImgURLs(res.text)
        await Ut.sleep(2000)
        await updateNewsMore(pubdate, author, source, imgurls, url)
      })()
    }
  })
}

let insertNewswithCheck = async function(url, values) {
  var selectsql = "SELECT COUNT(`url`) AS count FROM `dgzx`.`news` WHERE `url` = \"" + url + "\""
  await con.query(selectsql, function(err, result, fields) {
    if (err) throw err
    result = JSON.stringify(result)
    result = JSON.parse(result)
    console.log(result[0].count)
    if (result[0].count < 1) {
      insertNews(url, values)
    } else {
      console.log(url + ' existed')
    }
  })
}

let insertNews = async function(url, values) {
  var sql = "INSERT INTO `dgzx`.`news` (`title`, `content`, `url`) VALUES (?, ?, ?)"
  await con.query(sql, values, function(err, result) {
    if (err) throw err;
    console.log(url + "　number of records inserted: " + result.affectedRows);
  })
}

let updateNewsMore = async function(pubdate, author, source, imgurls, url) {
  var sql = "UPDATE `dgzx`.`news` SET `author`=\"" + author + "\", `img`=\"" + imgurls + "\", `ifrom`=\"" + source + "\", `date`=\"" + pubdate + "\" WHERE `url`=\"" + url + "\""
  await con.query(sql, function(err, result) {
    if (err) throw err;
    console.log(url + ' ' + result.affectedRows + " record(s) updated");
  });
}

let fetchURL = function() {
  for (start; start < end; start++) {
    let url = 'http://www.dgzx.org/Item/' + start + '.aspx'
    fetchNews(url)
  }
}

const rule = new schedule.RecurrenceRule();
rule.minute = [0, 30];
let j = schedule.scheduleJob(rule, function() {
  fetchURL()
});