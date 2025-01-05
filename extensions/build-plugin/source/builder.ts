import { BuildPlugin } from '../@types';

const PACKAGE_NAME = 'custom-template-plugin';

export const load: BuildPlugin.load = function () {
    console.debug(`${PACKAGE_NAME} load`);
};

export const unload: BuildPlugin.load = function () {
    console.debug(`${PACKAGE_NAME} unload`);
};

export const configs: BuildPlugin.Configs = {
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

export const assetHandlers: BuildPlugin.AssetHandlers = './asset-handlers';
