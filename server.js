const http = require("http"),
      fs = require("fs"),
      request = require("request"),
      mustache = require("mustache")

const endpoints = {
    "story": (id) => "https://fimfiction.net/api/story.php?story="+id,
    "read":  (id) => "https://fimfiction.net/download_story.php?story="+id+"&html"
};

const styles = fs.readFileSync("style.css");

const templates = {
    story: fs.readFileSync("story.html").toString(),
    home: fs.readFileSync("home.html").toString()
};

errcb = (err) => err ? console.error(err) : null;
erras = (err, v) => err ? console.error(err) : v;
srequest = (u, cb) => request(u, (e, r, b) => erras(e, cb(b)));

cache = (endpoint, id) => "cache/" + endpoint + "/" + id;
fetch = (ep, id, cb) => fs.readFile(cache(ep, id), (e, data) =>
    e ? srequest(endpoints[ep](id), (r) => (fs.writeFile(cache(ep, id), r, errcb), cb(r)))
    :    cb(data));

const verbs = {
    "read": (id, cb) => fetch("read", id, (body) => {
        cb(body + "<style>" + styles + "</style>");
    }),

    "story": (id, cb) => fetch("story", id, (body) => {
        console.log(body);
        const story = JSON.parse(body).story;
        story.style = styles;

        cb(mustache.render(templates.story, story));
    }),
}

http.createServer( (req, res) => {
    res.writeHead(200, {"Content-Type": "text/html"});

    if(req.url == "/")  {
        res.end(mustache.render(templates.home, {style: styles}));
    } else {
        const parts = req.url.split("/")
        const verb = parts[1];

        if(typeof verbs[verb] !== 'undefined') {
            verbs[verb](parts[2], (a) => res.end(a));
        } else {
            res.end("Unknown verb " + verb);
        }
    }

}).listen(8080);
