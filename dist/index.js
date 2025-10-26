"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const swagger_js_1 = require("./config/swagger.js");
const auth_route_js_1 = __importDefault(require("./api/auth/auth.route.js"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
(0, swagger_js_1.setupSwagger)(app);
app.use('/api/auth', auth_route_js_1.default);
app.get('/', (req, res) => {
    res.send('Chào mừng đến với Codery API! Truy cập /api-docs để xem tài liệu.');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
