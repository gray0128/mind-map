// 简单的防抖函数
function debounce(fn, delay) {
    let timer = null
    return function (...args) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}

// 获取 URL 参数
function getFileIdFromUrl() {
    try {
        // 先尝试从当前窗口 URL 获取（直接集成模式）
        let path = window.location.pathname;
        let match = path.match(/\/edit\/([^/]+)/);
        
        // 如果当前窗口没有匹配，再尝试从父窗口获取（iframe 模式）
        if (!match && window.parent !== window) {
            path = window.parent.location.pathname;
            match = path.match(/\/edit\/([^/]+)/);
        }
        
        return match ? match[1] : null;
    } catch (error) {
        console.error('获取 FileId 失败:', error);
        return null;
    }
}

// 获取 Token（支持直接集成和 iframe 模式）
function getToken() {
    try {
        // 先尝试从当前窗口 localStorage 获取
        let token = localStorage.getItem('token');
        
        // 如果当前窗口没有，再尝试从父窗口获取（iframe 模式）
        if (!token && window.parent !== window) {
            token = window.parent.localStorage.getItem('token');
        }
        
        return token;
    } catch (error) {
        console.error('获取 Token 失败:', error);
        return null;
    }
}

// 发送消息到父窗口
function postMessageToParent(type, data = {}) {
    try {
        if (window.parent !== window) {
            window.parent.postMessage({ type, ...data }, '*');
        }
    } catch (error) {
        console.error('发送消息失败:', error);
    }
}

window.takeOverApp = true;

window.takeOverAppMethods = {
    // 获取思维导图数据
    async getMindMapData() {
        const fileId = getFileIdFromUrl();
        
        // 如果没有文件 ID，返回默认数据
        if (!fileId) {
            console.log('No fileId found, returning default data');
            return {
                root: {
                    data: {
                        text: '中心主题'
                    },
                    children: []
                },
                theme: {
                    template: 'avocado',
                    config: {}
                },
                layout: 'logicalStructure',
                config: {}
            };
        }

        try {
            const token = getToken();
            if (!token) {
                throw new Error('未找到登录凭证');
            }

            console.log('Fetching data for file:', fileId);
            postMessageToParent('LOADING_START', { message: '正在加载思维导图...' });

            const res = await fetch(`/api/files/${fileId}/content`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error('登录已过期，请重新登录');
                }
                if (res.status === 404) {
                    throw new Error('文件不存在');
                }
                throw new Error(`加载失败: ${res.status}`);
            }

            const data = await res.json();
            console.log('Data loaded successfully');
            postMessageToParent('LOADING_END');
            
            return data;

        } catch (e) {
            console.error('获取数据失败:', e);
            postMessageToParent('ERROR', { message: e.message || '获取文件内容失败' });
            
            // 返回一个错误占位数据
            return {
                root: {
                    data: {
                        text: '加载失败'
                    },
                    children: [
                        {
                            data: {
                                text: e.message || '获取文件内容失败'
                            },
                            children: []
                        }
                    ]
                },
                theme: {
                    template: 'default',
                    config: {}
                },
                layout: 'logicalStructure',
                config: {}
            };
        }
    },

    // 保存思维导图数据
    saveMindMapData: debounce(async (data) => {
        const fileId = getFileIdFromUrl();
        if (!fileId) {
            console.log('No fileId found, skipping save');
            return; // 新建文件的逻辑在 Vue 组件中处理
        }

        try {
            const token = getToken();
            if (!token) {
                throw new Error('未找到登录凭证');
            }

            console.log('Saving data for file:', fileId);
            postMessageToParent('SAVING_START');

            const res = await fetch(`/api/files/${fileId}/content`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error('登录已过期，请重新登录');
                }
                if (res.status === 404) {
                    throw new Error('文件不存在');
                }
                throw new Error(`保存失败: ${res.status}`);
            }

            console.log('Data saved successfully');
            postMessageToParent('SAVING_END', { success: true });
            
        } catch (e) {
            console.error('保存失败:', e);
            postMessageToParent('SAVING_END', { 
                success: false, 
                error: e.message || '保存失败'
            });
        }
    }, 1000),

    // 获取语言配置
    getLanguage() {
        try {
            // 从 localStorage 获取语言配置
            let lang = localStorage.getItem('mindmap-language');
            if (!lang && window.parent !== window) {
                lang = window.parent.localStorage.getItem('mindmap-language');
            }
            return lang || 'zh';
        } catch (error) {
            console.error('获取语言配置失败:', error);
            return 'zh';
        }
    },

    // 保存语言配置
    saveLanguage(lang) {
        try {
            console.log('保存语言配置:', lang);
            localStorage.setItem('mindmap-language', lang);
            if (window.parent !== window) {
                window.parent.localStorage.setItem('mindmap-language', lang);
            }
        } catch (error) {
            console.error('保存语言配置失败:', error);
        }
    },

    // 获取本地配置
    getLocalConfig() {
        try {
            let configStr = localStorage.getItem('mindmap-local-config');
            if (!configStr && window.parent !== window) {
                configStr = window.parent.localStorage.getItem('mindmap-local-config');
            }
            return configStr ? JSON.parse(configStr) : {};
        } catch (error) {
            console.error('获取本地配置失败:', error);
            return {};
        }
    },

    // 保存本地配置
    saveLocalConfig(config) {
        try {
            console.log('保存本地配置:', config);
            localStorage.setItem('mindmap-local-config', JSON.stringify(config));
            if (window.parent !== window) {
                window.parent.localStorage.setItem('mindmap-local-config', JSON.stringify(config));
            }
        } catch (error) {
            console.error('保存本地配置失败:', error);
        }
    }
};

// 暴露给全局，方便调试
window.cloudSaveDebug = {
    getFileIdFromUrl,
    getToken,
    postMessageToParent
};
