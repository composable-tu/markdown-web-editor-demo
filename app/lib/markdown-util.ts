// 创建自定义渲染器来处理 mermaid 图表
import {marked} from "marked";
import mermaid from "mermaid";
import {nextTick} from "vue";

mermaid.initialize({startOnLoad: false, suppressErrorRendering: true});

export const renderMarkdownWithMermaid = async (markdown: string): Promise<string> => {
    // 存储所有 mermaid 图表的映射
    const mermaidCharts: Map<string, string> = new Map();
    let chartIndex = 0;

    // 创建自定义渲染器
    const renderer = new marked.Renderer();

    // 重写 code 方法来处理 mermaid 代码块
    renderer.code = function ({text, lang}: { text: string; lang?: string }): string {
        if (lang === 'mermaid') {
            // 为每个 mermaid 图表生成唯一标识符
            const chartId = `mermaid-chart-${chartIndex++}`;
            // 存储图表内容以便后续渲染
            mermaidCharts.set(chartId, text);
            // 返回占位符元素
            return `<div class="mermaid-placeholder" data-mermaid-id="${chartId}"></div>`;
        }

        // 其他代码块按默认方式处理
        const langClass = lang ? ` language-${lang}` : '';
        return `<pre><code class="hljs${langClass}">${text}</code></pre>`;
    };

    // 使用自定义渲染器解析 markdown
    let html = await marked(markdown, {renderer}) as string;

    // 渲染所有 mermaid 图表
    for (const [chartId, chartDefinition] of mermaidCharts) {
        try {
            const {
                svg, bindFunctions
            } = await mermaid.render(`mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, chartDefinition);
            html = html.replace(`<div class="mermaid-placeholder" data-mermaid-id="${chartId}"></div>`, svg);
        } catch (error) {
            console.error('Mermaid rendering error:', error);
            html = html.replace(`<div class="mermaid-placeholder" data-mermaid-id="${chartId}"></div>`, `<pre class="error">Mermaid diagram rendering failed: ${(error as Error).message}</pre>`);
        }
    }

    return html;
};

// 渲染 mermaid 图表
export const renderMermaidDiagrams = async () => {
    await nextTick(() => {
        // 查找所有 mermaid 图表容器
        const mermaidElements = document.querySelectorAll('.mermaid');
        mermaidElements.forEach((element, index) => {
            // 确保元素不为空且未被渲染过
            if (element.textContent && !element.querySelector('svg')) {
                try {
                    // 生成唯一的 ID
                    const id = `mermaid-${Date.now()}-${index}`;
                    element.setAttribute('id', id);

                    // 渲染 mermaid 图表
                    mermaid.render(id, element.textContent.trim()).then(({svg, bindFunctions}) => {
                        element.innerHTML = svg;
                        if (bindFunctions) {
                            bindFunctions(element);
                        }
                    }).catch(error => {
                        console.error('Mermaid rendering error:', error);
                        element.innerHTML = `<pre class="error">Mermaid diagram rendering failed: ${error.message}</pre>`;
                    });
                } catch (error) {
                    console.error('Mermaid error:', error);
                }
            }
        });
    });
};

