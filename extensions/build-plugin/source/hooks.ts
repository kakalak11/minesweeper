import { readdir, readFileSync, writeFileSync } from 'fs-extra';
import { IBuildTaskOption, BuildHook, IBuildResult } from '../@types';

interface IOptions {
    gameTitle: string;
}

const PACKAGE_NAME = 'custom-template-plugin';

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        'kakalak-build-plugin': IOptions;
    };
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
};

export const unload: BuildHook.unload = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
};


export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
    const { outputName } = options;
    const gameTitle = options.packages[PACKAGE_NAME].gameTitle;
    const buildDirectory = Editor.Utils.Path.join(Editor.Project.path, "build", outputName);
    const rootDirectory = Editor.Package.getPath(PACKAGE_NAME);
    const resourcesDirectory = Editor.Utils.Path.join(rootDirectory, "resources");

    Editor.Utils.File.copy(resourcesDirectory, buildDirectory);

    readdir(buildDirectory)
        .then(files => {
            files.forEach(fileName => {
                switch (fileName) {
                    case "index.html":
                        const htmlPath = Editor.Utils.Path.join(buildDirectory, fileName);
                        let htmlString = readFileSync(htmlPath, { encoding: "utf-8" });
                        htmlString = replaceAll(htmlString, "{{PLACE_HOLDER}}", gameTitle);
                        writeFileSync(htmlPath, htmlString);
                        break;
                    default:
                        break;
                }
            })
        })
};

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}