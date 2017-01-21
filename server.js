/**
 * quietfimfic
 * Distraction-free fimfiction
 * 
 * Copyright (C) 2017 Alyssa Rosenzweig

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const http = require("http"),
      fs = require("fs"),
      request = require("request"),
      mustache = require("mustache")

const endpoints = {
    "story": (id) => "https://fimfiction.net/api/story.php?story="+id,
    "read":  (id) => "https://fimfiction.net/download_story.php?story="+id+"&html"
};

const styles = fs.readFileSync("style.css");

const templates = fs.readdirSync("templates").reduce( (o, e) => (
    o[e.slice(0, -5)] = fs.readFileSync("templates/"+e).toString(), o), {});

const errcb = (err) => err ? console.error(err) : null;
const erras = (err, v) => err ? console.error(err) : v;
const srequest = (u, cb) => request(u, (e, r, b) => erras(e, cb(b)));

const cache = (endpoint, id) => "cache/" + endpoint + "/" + id;
const fetch = (ep, id, cb) => fs.readFile(cache(ep, id), (e, data) =>
                e ? srequest(endpoints[ep](id), (r) => (fs.writeFile(cache(ep, id), r, errcb), cb(r)))
                :   cb(data));

const verbs = {
    "read": (id, cb) => fetch("read", id, (body) =>
        cb(body + "<style>" + styles + "</style>")),

    "story": (id, cb) => fetch("story", id, (body) => {
        const story = JSON.parse(body).story;
        story.style = styles;

        cb(mustache.render(templates.story, story));
    }),
}

http.createServer( (req, res) => {
    res.writeHead(200, {"Content-Type": "text/html"});

    try {
        if(req.url == "/")  {
            res.end(mustache.render(templates.home, {style: styles}));
        } else {
            const parts = req.url.split("/");
            const verb = parts[1];

            if(typeof verbs[verb] !== 'undefined') {
                verbs[verb](parts[2], (a) => res.end(a));
            } else {
                res.end("Unknown verb " + verb);
            }
        }
    } catch(e) {
        console.error(e);
    }
}).listen(8080);
