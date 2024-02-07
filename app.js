const express = require('express')
const app = express()
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'cricketTeam.db')
app.use(express.json())
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running')
    })
  } catch (e) {
    console.log(` DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const convertDbObjToResponseObj = dbObj => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  }
}

app.get('/players/', async (resquest, response) => {
  const getAllPlayersQuery = `
    SELECT * FROM cricket_team;
    `
  const playersArray = await db.all(getAllPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => {
      convertDbObjToResponseObj(eachPlayer)
    }),
  )
})

app.get('/players/:playerId/', async (resquest, response) => {
  const {playerId} = resquest.params
  const playerQuery = `
   SELECT * FROM cricket_team
   WHERE player_id = ${playerId}
   `
  const player = await db.get(playerQuery)
  response.send(convertDbObjToResponseObj(player))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayerQuery = `
  INSERT INTO cricket_team
  (player_name,jersey_number,role)
  VALUES
  ("${playerName}","${jerseyNumber}","${role}");
  `
  const player = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {player_id} = request.params
  const updateQuery = `
    UPDATE cricket_team
    SET
    player_name = "${playerName}",
    jersey_number = "${jerseyNumber}",
    role = "${role}"
    WHERE player_id = ${player_id};
    `
  await db.run(updateQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {player_id} = request.params
  const deletePlayer = `
  DELETE FROM 
  cricket_team
  WHERE player_id = ${player_id}
  `
  await app.run(deletePlayer)
  response.send('Player Removed')
})
module.exports = app
