"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetHandlers = exports.configs = exports.unload = exports.load = void 0;
const PACKAGE_NAME = 'custom-template-plugin';
const load = function () {
    console.debug(`${PACKAGE_NAME} load`);
};
exports.load = load;
const unload = function () {
    console.debug(`${PACKAGE_NAME} unload`);
};
exports.unload = unload;
exports.configs = {
    '*': {
        hooks: './hooks',
        doc: 'editor/publish/custom-build-plugin.html',
        options: {
            gameTitle: {
                label: `Game Title`,
                description: `Enter game title`,
                default: '',
                render: {
                    /**
                     * @en Please refer to Developer -> UI Component for a list of all supported UI components
                     * @zh 请参考 开发者 -> UI 组件 查看所有支持的 UI 组件列表
                     */
                    ui: 'ui-input',
                    attributes: {
                        placeholder: `Game title here...`,
                    },
                },
            }
        },
    },
};
exports.assetHandlers = './asset-handlers';
