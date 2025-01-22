const express = require("express");

const Ajv = require("ajv");

const ajv = new(Ajv);

const crypto = require("crypto");
const {reset} = require("nodemon");

const app = express();

const port = 8000;

app.use(express.json());

app.use(express.urlencoded({extended: true}));

const player = [];

match = [];

app.post("/create/player", (req, res) => {

    const body = req.body;

    const schema = {

        type: "object",
        properties: {
            name:  {type:"string", maxLength: 20, minLength: 1, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            surname: {type:"string", maxLength: 20, minLength: 1, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            id: {type:"number"},
            club: {type:"string", maxLength: 35, minLength: 5, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            gender: {type:"string", maxLength: 4, minLength: 3, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            position: {type:"string", maxLength: 20, minLength: 5,pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"}
        },
        required: ["name", "surname", "id", "club", "gender", "position"],
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

    console.log(player)
});

app.get("/players/list", (req, res) => {

res.send(player)

});

app.post("/update/results", (req, res) => {

    const body = req.body;
    const id = req.body.id;
    const matchIndex = match.findIndex((match)=> match.id === body.id);

    if (matchIndex === -1) {

        res.status(400).json({
            code: "match_not_found",
            message: `Match with id ${id} not found!`
        });

    }

    const tempStudent = student[studentIndex];

    student[studentIndex] = {
        ...tempStudent,
        ...body,
    }

    res.send(student[studentIndex]);


});

app.post("/delete/player", (req,res) => {

    const id = req.body.id;
    const playerIndex = player.findIndex((player)=> player.id=== id);
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
