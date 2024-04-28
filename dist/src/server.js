"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(app);
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const body_parser_1 = __importDefault(require("body-parser"));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.use(body_parser_1.default.json());
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(process.env.DATABASE_URL);
const db = mongoose_1.default.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to mongo DB'));
app.use('/public', express_1.default.static('public'));
const post_route_1 = __importDefault(require("./routes/post_route"));
const auth_route_js_1 = __importDefault(require("./routes/auth_route.js"));
app.use('/post', post_route_1.default);
app.use('/auth', auth_route_js_1.default);
if (process.env.NODE_ENV === "development") {
    const options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "SCE Web Application Backend API",
                version: "1.0.1",
                description: "List all the routes of the backend REST API...",
            },
            servers: [
                {
                    url: "http://localhost:" + process.env.PORT,
                },
            ],
        },
        apis: ["./src/routes/*.ts"],
    };
    const specs = (0, swagger_jsdoc_1.default)(options);
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
}
module.exports = server;
//# sourceMappingURL=server.js.map