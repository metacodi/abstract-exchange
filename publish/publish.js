"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = __importDefault(require("commander"));
const node_utils_1 = require("@metacodi/node-utils");
node_utils_1.Terminal.title('PUBLISH');
commander_1.default
    .option('-v, --verbose', 'Log verbose');
commander_1.default.parse(process.argv);
if (commander_1.default.verbose) {
    console.log('Arguments: ', commander_1.default.opts());
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, node_utils_1.incrementPackageVersion)();
    if (node_utils_1.Resource.exists(`dist`)) {
        node_utils_1.Terminal.log(`Eliminant la carpeta de distribució ${chalk_1.default.bold(`dist`)}.`);
        node_utils_1.Resource.removeSync(`dist`);
    }
    const ok = yield node_utils_1.Git.publish({ branch: 'main', commit: commander_1.default.commit });
    if (ok) {
        node_utils_1.Terminal.log(`Git published successfully!`);
    }
    node_utils_1.Terminal.log(chalk_1.default.bold(`Compilant projecte typescript`));
    yield node_utils_1.Terminal.run(`tsc`);
    node_utils_1.Terminal.log(`npm publish`);
    yield node_utils_1.Terminal.run(`npm publish`);
}))();
//# sourceMappingURL=publish.js.map