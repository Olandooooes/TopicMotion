# 内容与素材来源

| 内容 | 来源与处理 | 分发说明 |
| --- | --- | --- |
| HTTP 缓存独立验证 | RFC 9111 https://www.rfc-editor.org/rfc/rfc9111.html 的基础概念改写；只作第二话题本地验证，不复制标准正文。 | 有声输出留本地 |
| RAG 核心概念 | Lewis et al., *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*, https://arxiv.org/abs/2005.11401 。以检索内容辅助生成的通俗改写，无大段原文引用。 | 任务 JSON 记录来源；不是论文附属或作者背书项目 |
| “出处方便核查，仍需验证” | 项目对生成式问答的使用说明；不把引用等同于事实保证。 | 原创说明 |
| 五秒差旅制度示例 | 项目虚构：制度名、版本、条款和 30 天期限。 | 非真实制度、非法律或 HR 建议 |
| 排序条、节点、卡片 | 程序化 SVG/React 几何图形，初始实现由 AI 辅助编写。 | 项目 MIT；不是实测数据图表 |
| robot.svg | 本项目自制矢量角色，无第三方角色或品牌素材。 | 项目 MIT |
| 15 秒视频与风格静帧 | 从公开分镜和渲染器产生；公开 MP4 已去掉系统语音音轨。 | 项目原创视觉内容按 MIT |
| 中文字体 | 尝试系统苹方、微软雅黑、Noto Sans CJK 等；仓库不分发字体文件。 | 字体软件依各自许可 |
| macOS Tingting 系统语音 | 仅用于本地流程验证，未确认公开再分发和商用输出授权。 | 不纳入公开视频、源码包或项目 MIT |
| Remotion 及依赖 | package-lock.json 锁定版本；未打包浏览器/FFmpeg/node_modules。 | 见 THIRD_PARTY_NOTICES.md |

没有使用素材网站上的未授权配乐、照片或他人录音。访客在演示页选择的录音只在其本地浏览器处理；本项目不会收集或公开这些文件。

## v0.3 新增来源与验证

- 一分钟 RAG 分镜：公开 `skills/auto-video/examples/rag-60s.json`，沿用上表论文来源；差旅条款和排序条均为教学示意。
- 一分钟无声 MP4 与封面：本项目程序化原创画面，公开版去除合成配音；`librarian.svg` 为自制矢量插画。
- 默认配音：edge-tts 7.3.1 / zh-CN-XiaoxiaoNeural，在线发送口播文本，-12% 语速、0.32 秒句间停顿；未纳入公开音轨或 MIT 输出授权。
- 另用“面包为什么会发起来”生成 15.019 秒、450 帧 H.264/AAC 成片，验证通用分镜与自然配音可替换话题；酵母产气和面团膨胀为基础过程示意，不含实测统计。

## v0.4 解释型样例

- 面团发酵：依据 [Exploratorium Bread Science](https://dev-annex.exploratorium.edu/cooking/bread/bread_science.html) 改写为简短中文口播，表现酵母产气、面筋留气、面团膨胀；不代表烘烤完成。SVG由本项目绘制，无真实比例、实测百分比或真实时间。
- HTTP缓存：依据 [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) 的新鲜复用和存储规则通俗改写，仅演示新鲜命中与无副本回源，不展开过期条件校验、禁止存储等情形。
- 两条公开MP4均来自公开分镜与本项目渲染器，已移除合成音轨；有声成片与私密缓存留本地。公开视觉适用项目MIT，配音许可边界未改变。
