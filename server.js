const http = require("http"),
      fs = require("fs"),
      request = require("request"),
      mustache = require("mustache")

const STORY_ENDPOINT = "https://fimfiction.net/api/story.php?story=";
const DOWNLOAD_ENDPOINT = "https://fimfiction.net/download_story.php?story=";

const styles = fs.readFileSync("style.css");

const templates = {
    story: fs.readFileSync("story.html").toString(),
    home: fs.readFileSync("home.html").toString()
};

const verbs = {
    "read": (id, cb) => request(DOWNLOAD_ENDPOINT + id + "&html", (err, resp, body) => {
        cb(body + "<style>" + styles + "</style>");
    }),

    "story": (id, cb) => request(STORY_ENDPOINT + id, (err, resp, body) => {
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
