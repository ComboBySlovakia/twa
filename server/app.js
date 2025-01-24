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
const clubs = [];

// Cast kodu - Urban

// Vytvorenie hráča
app.post("/create/player", (req, res) => {

    const body = req.body;

    // Definovanie zoznnamu pozící, využije sa pri overovaní platnosti pozície.
    const footballPositions = [
        "brankár",
        "obranca",
        "stredopoliar",
        "útočník",
        "krídlo",
        "stopér",
        "ofenzívny stredopoliar",
        "defenzívny stredopoliar",
    ];

    // Vytvorenie validačnej schémy za pomoci knižnice ajv
    const schema = {

        type: "object",
        properties: {
            name:  {type:"string", maxLength: 20, minLength: 1, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            surname: {type:"string", maxLength: 20, minLength: 1, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            club: {type:"string", maxLength: 35, minLength: 5, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ]+$"},
            gender: {type:"string", enum: ["muž", "žena"]},
            position: {type:"string", maxLength: 20, minLength: 5, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ ]+$"}
        },
        required: ["name", "surname", "club", "gender", "position"],
        additionalProperties: false

    }

    const validate = ajv.compile(schema);
    const valid = validate(body);

    // Doplňujúce podmienky, pre neplatný vstup dát
    if (!valid) {
        res.status(400).json({
            code: "dtoIn INVALID",
            message: "Input data are invalid",
            errors: validate.errors,
        });
        return;
    }

    // Overenie, či klub existuje
    const clubIndex = clubs.findIndex((club) => club.name === body.club);
    if (clubIndex === -1) {
        return res.status(400).json({
            code: "club_not_found",
            message: `Club with name '${body.club}' does not exist!`,
        });
    }

    // Overenie, či pozícia je platná
    if (!footballPositions.includes(body.position)) {
        return res.status(400).json({
            code: "invalid_position",
            message: `Position '${body.position}' is not valid! Valid positions are: ${footballPositions.join(", ")}`,
        });
    }

    const newPlayer = { id: crypto.randomBytes(16).toString("hex"), ...body };

    player.push(newPlayer);

    console.log(player)

    res.json(newPlayer);
});

app.post("/create/match", (req, res) => {
    const body = req.body;

    // Ďalšie vytvorenie schémy pre validáciu vstupu
    const schema = {
        type: "object",
        properties: {
            club1: { type: "string", minLength: 1 },
            club2: { type: "string", minLength: 1 },
        },
        required: ["club1", "club2"],
        additionalProperties: false,
    };

    const validate = ajv.compile(schema);
    const valid = validate(body);

    if (!valid) {
        return res.status(400).json({
            code: "dtoIn INVALID",
            message: "Input data are invalid",
            errors: validate.errors,
        });
    }

    // Konštanty pre zistenie, či kluby existujú.
    const club1Index = clubs.findIndex((clubs) => clubs.id === body.club1);
    const club2Index = clubs.findIndex((clubs) => clubs.id === body.club2);

    if (club1Index === -1 || club2Index === -1) {
        return res.status(400).json({
            code: "club_not_found",
            message: `One or both clubs do not exist. Check IDs: ${body.club1}, ${body.club2}`,
        });
    }

    // Vytvorenie nového zápasu.
    const newMatch = {
        id: crypto.randomBytes(16).toString("hex"),
        club1: clubs[club1Index].name,
        club2: clubs[club2Index].name,
        date: body.date || new Date().toISOString(), // Predvolené: aktuálny dátum
    };

    match.push(newMatch);

    console.log(match);
    res.json(newMatch);
});

// Endpoint pre vypísanie zoznamu hráčov.
app.get("/players/list", (req, res) => {

    // Jednoduchý príkaz, pošle všetkých študentov.
    res.send(player);
});

// Endpoint pre aktualizovanie výsledkov zápasu
app.post("/update/results", (req, res) => {
    const body = req.body;
    const { id, scoreClub1, scoreClub2 } = body;

    // Nájdeme zápas podľa ID
    const matchIndex = match.findIndex((match) => match.id === id);

    if (matchIndex === -1) {
        return res.status(400).json({
            code: "match_not_found",
            message: `Match with id ${id} not found!`,
        });
    }

    // Aktualizovanie výsledkov zápasu.
    const updatedMatch = {
        ...match[matchIndex],
        scoreClub1: scoreClub1 !== undefined ? scoreClub1 : match[matchIndex].scoreClub1,
        scoreClub2: scoreClub2 !== undefined ? scoreClub2 : match[matchIndex].scoreClub2,
    };

    match[matchIndex] = updatedMatch;

    console.log(match); // Log aktuálneho zoznamu zápasov

    res.json({
        message: "Match results updated successfully",
        match: updatedMatch,
    });
});


//Endpoint pre vymazanie hráča.
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
    res.send("Player was sucessfully deleted!");
});


// Cast kodu Kucera

// Vytvorenie klubu
app.post("/club/create", (req, res) => {
    const body = req.body; // Získanie tela požiadavky
    const schema = { // Schéma na validáciu vstupu
        type: 'object',
        properties: {
            logo: { type: 'string' },
            name: { type: 'string', maxLength: 30, minLength: 1, pattern: "^[a-zA-ZáäčďéíľĺňóôřšťúýžÁÄČĎÉÍĽĹŇÓÔŘŠŤÚÝŽ ]+$" },
            players: { type: 'number' },
        },
        required: ['name', 'logo', 'players'],
        additionalProperties: false,
    };
    const validate = ajv.compile(schema); // Kompilácia schémy
    const valid = validate(body); // Validácia vstupu

    if (!valid) { // Ak vstup nie je validný, vráti chybovú odpoveď
        res.status(400).json({
            code: "dtoIn INVALID",
            message: "input data are invalid",
            errors: validate.errors,
        });
        return;
    }

    const newClub = { id: crypto.randomBytes(16).toString("hex"), ...body }; // Vytvorenie nového klubu s unikátnym ID
    clubs.push(newClub); // Pridanie nového klubu do poľa klubov
    console.log(clubs); // Výpis aktuálneho zoznamu klubov do konzoly
    res.json(newClub); // Vrátenie odpovede s novým klubom
});

// Zoznam klubov
app.get("/clubs/list", (req, res) => {
    res.send(clubs); // Vrátenie zoznamu klubov
});

// Detaily klubu
app.get("/club/details", (req, res) => {
    const id = req.query.id; // Získanie id z query parameterov
    const clubIndex = clubs.findIndex((clubs) => clubs.id === id); // Nájdite index klubu podľa id
    if (clubIndex === -1) { // Ak klub neexistuje, vráti chybovú odpoveď
        return res.status(400).json({
            code: "club_not_found",
            message: `Club with id: ${id} not found`,
        });
    }
    res.json(clubs[clubIndex]); // Vrátenie objektu klubu
});

// Aktualizácia klubu
app.post("/club/update", (req, res) => {
    const body = req.body; // Získanie tela požiadavky
    const clubIndex = clubs.findIndex((clubs) => clubs.id === body.id); // Nájdite index klubu podľa id
    if (clubIndex === -1) { // Ak klub neexistuje, vráti chybovú odpoveď
        return res.status(400).json({
            code: "club_not_found",
            message: `Club with id: ${body.id} not found`,
        });
    }
    const tempClub = clubs[clubIndex]; // Dočasné uloženie pôvodného klubu
    clubs[clubIndex] = { // Aktualizácia klubu
        ...tempClub, // Ponechanie pôvodných údajov
        ...body, // Prepísanie údajmi z požiadavky
    };
    res.send(clubs[clubIndex]); // Vrátenie aktualizovaného klubu
});

// Vymazanie klubu
app.post("/club/delete", (req, res) => {
    const id = req.body.id; // Získanie id z tela požiadavky
    const clubIndex = clubs.findIndex((club) => club.id === id); // Nájdite index klubu podľa id
    if (clubIndex === -1) { // Ak klub neexistuje, vráti chybovú odpoveď
        return res.status(400).json({
            code: "club_not_found",
            message: `Club with id: ${id} not found`,
        });
    }
    clubs.splice(clubIndex, 1); // Odstránenie klubu zo zoznamu
    res.send({ message: "Club deleted successfully" }); // Odpoveď s úspešným vymazaním
});


// Cast kodu Martonak
app.get("/player/details", (req, res) => {
    const id = req.query.id;
    const playerIndex = player.findIndex((player) => player.id === id);
    if (playerIndex === -1) {
        return res.status(400).json({
            code: "player_not_found",
            message: "Player with id: ${id} not found",
        });
    }
    res.json(player[playerIndex]);
});

app.post("/player/update", (req, res) => {

    const body = req.body;

    const id = req.body.id;
    const playerIndex = player.findIndex((player) => player.id === id);
    if (playerIndex === -1) {
        return res.status(400).json({
            code: "player_not_found",
            message: 'Player with id: ${body.id} not found',
        });
    }
    const tempPlayer = player[playerIndex];
    player[playerIndex] = {
        ...tempPlayer,
        ...body,
    };
    res.send(player[playerIndex]);
});

app.listen(port, () => {

    console.log(`  _____ _   _ _____ ____    _    _     _   _ _____ _____            ___  _   _ 
 |  ___| | | |_   _| __ )  / \\  | |   | \\ | | ____|_   _|          / _ \\| \\ | |
 | |_  | | | | | | |  _ \\ / _ \\ | |   |  \\| |  _|   | |    _____  | | | |  \\| |
 |  _| | |_| | | | | |_) / ___ \\| |___| |\\  | |___  | |   |_____| | |_| | |\\  |
 |_|    \\___/  |_| |____/_/   \\_\\_____|_| \\_|_____| |_|            \\___/|_| \\_|
                             http://localhost:${port}`);

});