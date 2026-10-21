# TopicMotion · 30秒有声项目介绍

四段内容：输入话题 → 自动制作接力 → 图形拆分与流程汇聚 → 品牌和调用入口。原创讲稿、React/SVG程序化图形与动效，字幕根据每句真实音长生成，再按字数分段。明确在Codex中运行，未展示虚构的网页云端生成服务。

## 声音来源

中文普通合成音色：`hexgrad/Kokoro-82M-v1.1-zh`，`zf_001`，模型按 Apache-2.0 发布；不是模仿或克隆某位真人。模型卡说明中文专业数据由龙猫数据许可提供。本介绍片没有使用先前未纳入公开分发的 Edge/macOS 音轨。

- 模型与许可：https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh
- 固定模型版本与文件SHA-256：[voice-source.json](voice-source.json)；音色 `zf_001`、速度 `0.96`。
- Kokoro运行库：https://github.com/hexgrad/kokoro
- 项目原创讲稿与视觉内容适用仓库MIT；模型、客户端及传递依赖保留自身许可，仓库不分发模型权重。

## 复现

需要Python 3.12、Node 22.13+、macOS上可用Chrome；首次配音需下载开放模型和依赖，渲染使用根目录锁定的npm依赖。其余平台尚未实机验证。

```sh
npm ci
python3.12 -m venv .venv-intro
.venv-intro/bin/python -m pip install -r examples/topicmotion-intro/requirements.txt
.venv-intro/bin/python scripts/create-intro-voice.py \
  --job examples/topicmotion-intro/job.json --out out/intro-voice
npm run intro:render -- --voice-dir out/intro-voice --out out/intro-render
```

音频目录和渲染输出均必须是新的空目录，避免覆盖原文件。模型仅首次下载，可通过HF_HOME指定本地缓存位置。语音依赖不是普通 `$auto-video` 的新增必装项，本目录仅复现公开介绍片。输出 `movie.mp4`、`poster.png`、`captions.srt`、`script.txt`、`timeline.json` 和实测报告。

普通 `$auto-video` 默认仍使用 Edge；Kokoro 仅用于这条公开项目介绍片。

## 网页播放版

首页使用 `intro-web-v1.mp4`：720p/30fps、H.264 4:2:0、每秒关键帧、AAC单声道64kbps，MP4索引前置。文件1,602,290字节，比原版2,471,731字节减少35.2%；原版下载保留。运行 `node scripts/optimize-intro.mjs` 可从原版重新编码。首页仅预加载介绍片，其他样片点击后才加载；慢连接显示重试和原版下载入口。实际速度仍受访客至GitHub Pages的网络影响。
