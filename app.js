const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const cors = require("cors");
const requestIp = require("request-ip");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());
app.use(cors());

let database = null;
app.use(requestIp.mw());

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(process.env.PORT || 3004, () =>
      console.log("Server Running at http://localhost:3004/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/ipconfig", (req, res) => {
  const clientIpV4 = req.clientIp;
  const clientIpV6 = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  res.send(`Your IPv4 Address is ${clientIpV4} and your IPv6 Address is ${clientIpV6}.`);
});

app.get("/todos/", async (request, response) => {
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo`;
  const todos = await database.all(getTodoQuery);
  response.send({ todos });
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, isChecked } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, isChecked)
  VALUES
    (${id}, '${todo}', ${isChecked});`;
  await database.run(postTodoQuery);
  //response.send("hai");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const { isChecked } = request.body;
  const updateTodoQuery = `
    UPDATE
      todo
    SET
    isChecked=${isChecked}
    WHERE
      id = ${todoId};`;
  await database.run(updateTodoQuery);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
});
