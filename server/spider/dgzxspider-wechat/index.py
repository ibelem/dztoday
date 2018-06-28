#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys, time
import requests
import wechatsogou
from newspaper import Article
from newspaper import fulltext
from bs4 import BeautifulSoup
import MySQLdb

conn = MySQLdb.connect(
    host = 'localhost',
    port = 3306,
    user = 'root',
    passwd = '',
    db ='',
    charset = 'utf8'
)


def timestamp_to_date(time_stamp, format_string="%Y-%m-%d"):
    time_array = time.localtime(time_stamp)
    str_date = time.strftime(format_string, time_array)
    return str_date


def timestamp_to_datetime(time_stamp, format_string="%Y-%m-%d %H:%M:%S"):
    time_array = time.localtime(time_stamp)
    str_date = time.strftime(format_string, time_array)
    return str_date


def getArticleSummary(name):
    ws_api = wechatsogou.WechatSogouAPI()
    gzh_article = ws_api.get_gzh_article_by_history(name)
    data_list = []
    j = gzh_article['article']
    print(len(gzh_article['article']))

    cur = conn.cursor()
    cur.execute("SELECT VERSION()")
    data = cur.fetchone()
    print("Database version : %s " % data)

    if j:
        for i in j:
            title = i['title']
            author = i['author']
            dt = timestamp_to_date(i['datetime'])

            selectsql = "SELECT COUNT(`title`) AS count FROM `dgzx`.`news` \
                        WHERE `title` = '%s' AND `author` = '%s' AND `date` = '%s'" % \
                        (title, author, dt)
            cur.execute(selectsql)
            results = cur.fetchall()
            if results[0][0] < 1:
                sql = "INSERT INTO `dgzx`.`news` (`title`, `author`, `ifrom`, `date`) \
                VALUES (%s,%s,%s,%s)"
                cur.execute(sql, (title, author, name, dt))
                conn.commit()
                print('SQL Success: ' + title)
                try:
                    getArticleDescription(i['content_url'], i['cover'], title, author, dt)
                except:
                    print('SQL Update Failed for '+ title)
                    print('Failed URL:' + i['content_url'])
                    pass
            else:
                print("Existed: " + title + " " + author + " " + dt)
    cur.close()


def getArticleDescription(url, imgcover, title, author, date):
    a = Article(url, language='zh')
    a.download()
    a.parse()
    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html.parser')
    mediastring = ''
    try:
        for image_tag in soup.find(name='div', attrs={"class":"rich_media_content"}).findAll('img'):
            if image_tag.get('data-src').find('gif') < 0:
                tmp = image_tag.get('data-src') + ', '
                mediastring += tmp
        for video_tag in soup.find(name='div', attrs={"class":"rich_media_content"}).findAll('iframe'):
            if video_tag.get('data-src').find('v.qq.com') > -1:
                tmp = video_tag.get('data-src') + ', '
                mediastring += tmp
        if imgcover:
            mediastring = imgcover + '||| ' + mediastring
    except:
        print('SQL Update Failed for ' + title)
        print('Failed URL: ' + url)
        print(imgcover)
        mediastring = imgcover
        pass
    cur = conn.cursor()
    updatesql = "UPDATE `dgzx`.`news` SET `content` = '%s', `img` = '%s' \
                WHERE `title` = '%s' AND `author` = '%s' AND `date` = '%s'" % \
                (a.text, mediastring, title, author, date)
    cur.execute(updatesql)
    conn.commit()
    time.sleep(12)


def main():
     getArticleSummary('丁中高一家校讲堂')
     getArticleSummary('丁中家校讲堂高二版')
     getArticleSummary('丁中家校讲堂高三版')
     getArticleSummary('丁沟中学')
     getArticleSummary('朱少华PHOTO')
     getArticleSummary('丁中广祥')
     conn.close()

if __name__ == '__main__':
    sys.exit(main())
