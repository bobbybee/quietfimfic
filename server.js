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
}

http.createServer( (req, res) => {
    res.writeHead(200, {"Content-Type": "text/html"});

    if(req.url == "/")  {
        res.end(mustache.render(templates.home, {style: styles}));
    } else {
        const parts = req.url.split("/")
        const verb = parts[1];
        const object = parts[2];

        if(verb == "story") {
           /* fetch the story via the legitimate API */

            console.log(STORY_ENDPOINT + object);
           request(STORY_ENDPOINT + object, (error, resp, body) => {
               try {
                   const story = JSON.parse(body).story;

                   story.style = styles;

                   res.end(mustache.render(templates.story, story));
               } catch(e) {
                   console.log("Bad body " + body);
               }
           });
        } else if(verb == "read") {
            /* fetch the story via the download HTML button (messy but meh) */

            request(DOWNLOAD_ENDPOINT + object + "&html", (err, resp, body) => {
                res.end(body + "<style>" + styles + "</style>");
            });
        } else {
            res.end("Unknown verb " + verb);
        }
    }

    console.log(req.url);
}).listen(8080);
