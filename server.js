const http = require("http"),
      request = require("request");

const STORY_ENDPOINT = "https://fimfiction.net/api/story.php?story=";

http.createServer( (req, res) => {
    res.writeHead(200, {"Content-Type": "text/html"});

    if(req.url == "/")  {
        res.end(home());
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

                   console.log(story);
           
                   res.end(story.title);
               } catch(e) {
                   console.log("Bad body " + body);
               }
           });
        } else {
            res.end("Unknown verb " + verb);
        }
    }

    console.log(req.url);
}).listen(8080);
