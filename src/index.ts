import server from "./server";

const port = process.env.PORT ?? 3000;

server.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
