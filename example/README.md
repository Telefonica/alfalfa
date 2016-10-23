## Alfalfa example (with Docker)

This example has Docker compose support for demonstrating the server resilence implemented by alfalfa

```sh
# build and launch the service in background
docker-compose up
# Open a new terminal
curl -s http://localhost:3000/
curl -s http://localhost:3000/slow
curl -s http://localhost:3000/error
```



