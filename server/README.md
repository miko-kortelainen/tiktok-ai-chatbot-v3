### explanations

/api/ - API endpoint route declarations (POST, GET etc)
/config/ - configurables and options (eg. cors options and env variables)
/models/ - shared types used throughout the backend (todo: use zodd/openapi)
/servises/ - core business logic
/utils/ - utilities to help development workflow (now only helper logger function)

/server.ts - program entry point, HTTP server, socket.io binding
/app.ts - middlewares, routes and frontend static files serving
/sockets.ts - initialization for socket.io listeners
