const express = require("express");

const Ajv = require("ajv");

const ajv = new(Ajv);

const crypto = require("crypto");

const app = express();

const port = 8000;

app.use(express.json());

app.use(express.urlencoded({extended: true}));

const player = [];

const match = [];

app.post("/create/player", (req, res) => {

    const body = req.body;

    const schema = {

        type: "object",
        properties: {
            name:  {type:"string", maxLength: 20, minLength: 1, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            surname: {type:"string", maxLength: 20, minLength: 1, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            club: {type:"string", maxLength: 35, minLength: 5, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            gender: {type:"string", maxLength: 4, minLength: 3, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            position: {type:"string", maxLength: 20, minLength: 5,pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"}
        },
        required: ["name", "surname", "club", "gender", "position"],
        additionalProperties: false

    }

    const validate = ajv.compile(schema);
    const valid = validate(body);

    if (!valid) {
        res.status(400).json({
            code: "dtoIn INVALID",
            message: "Input data are invalid",
            errors: validate.errors,
        });
        return;
    }

    const newPlayer = { id: crypto.randomBytes(16).toString("hex"), ...body };

    player.push(newPlayer);

    console.log(player)

    res.json(newPlayer);
});

app.get("/players/list", (req, res) => {

    res.send(player);
});

app.post("/update/results", (req, res) => {

    const body = req.body;
    const id = req.body.id;
    const matchIndex = match.findIndex((match)=> match.id === id);

    if (matchIndex === -1) {

        res.status(400).json({
            code: "match_not_found",
            message: `Match with id ${id} not found!`
        });

    }

    const tempPlayer =player[playerIndex];

    player[playerIndex] = {
        ...tempPlayer,
        ...body,
    }

    res.send(player[playerIndex]);


});

app.post("/delete/player", (req,res) => {

    const id = req.body.id;
    const playerIndex = player.findIndex((player)=> player.id === id);
    if (playerIndex === -1) {

        res.status(400).json({
            code: "player_not_found",
            message: `Player with id ${id} not found!`
        });

    }
    player.splice(playerIndex, 1);
    res.send({});
});

app.listen(port, () => {

    console.log(`Example app listening at http://localhost:${port}`);

});
