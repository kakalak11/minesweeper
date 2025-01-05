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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterBuild = exports.unload = exports.load = exports.throwError = void 0;
const fs_extra_1 = require("fs-extra");
const PACKAGE_NAME = 'custom-template-plugin';
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
exports.throwError = true;
const load = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    });
};
exports.load = load;
const unload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    });
};
exports.unload = unload;
const onAfterBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const { outputName } = options;
        const gameTitle = options.packages[PACKAGE_NAME].gameTitle;
        const buildDirectory = Editor.Utils.Path.join(Editor.Project.path, "build", outputName);
        const rootDirectory = Editor.Package.getPath(PACKAGE_NAME);
        const resourcesDirectory = Editor.Utils.Path.join(rootDirectory, "resources");
        Editor.Utils.File.copy(resourcesDirectory, buildDirectory);
        (0, fs_extra_1.readdir)(buildDirectory)
            .then(files => {
            files.forEach(fileName => {
                switch (fileName) {
                    case "index.html":
                        const htmlPath = Editor.Utils.Path.join(buildDirectory, fileName);
                        let htmlString = (0, fs_extra_1.readFileSync)(htmlPath, { encoding: "utf-8" });
                        htmlString = replaceAll(htmlString, "{{PLACE_HOLDER}}", gameTitle);
                        (0, fs_extra_1.writeFileSync)(htmlPath, htmlString);
                        break;
                    default:
                        break;
                }
            });
        });
    });
};
exports.onAfterBuild = onAfterBuild;
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
