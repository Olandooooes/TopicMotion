# 任务 JSON

```json
{
  "topic": "解释量子纠缠",
  "style": "diagram",
  "duration": 30,
  "sources": [{"title": "参考资料", "url": "https://example.org/verified-source"}],
  "scenes": [
    {"title": "简短场景标题", "visual": "flow", "labels": ["问题", "过程", "结论"], "narration": "这里是自然口播。另一个句子会被自动拆开并对齐。"}
  ]
}
```

仅结构示意，示例网址不能当真实来源。完整可运行例子见 `../examples/rag-15s.json`。

- topic：1–100 字。duration：5–180 秒整数。1–12 个场景，每场至少 2 秒；15 秒通常 3 场，30 秒通常 4–5 场。
- style：`cartoon` 奶油色、粗描边、卡通机器人与平滑形变；`diagram` 蓝色流程图、节点和证据卡；`editorial` 浅色大字与几何信息图。三者共享时间线和配音。
- title：1–18 字。narration：1–240 字/场，按时长进一步控制；中文句号/问号/叹号/分号会拆句，逐句测时。程序保留 0.32 秒句间停顿，按实际音长分配场景；超出总时长则明确失败。
- visual：`flow` 连接节点；`search` 排序条（仅示意，标签必须避免暗示真实数值）；`evidence` 堆叠卡片；`summary` 要点与结论。
- labels：1–3 条；flow 最多 7 字/条，其他最多 17 字/条。
- sources：可选的核验资料记录，不直接作为字幕。配音文本必须能够脱离画面自然理解。

程序依据实际口播音长分配场景时长，保留自然语速与停顿，形成 `timeline.json`；SRT 时间与同一条时间线一致。较短内容保留片尾留白，不重复句子填充时长。超长内容应缩短脚本，不能悄悄截断。

输出：`movie.mp4`（H.264/AAC）、`poster.png`、`script.txt`、`captions.srt`、`input.json`、`timeline.json`、`report.json` 与 `assets/` 中合成的音频。输出含合成声音，不随源码自动公开。

## v0.3 自然配音与连续动效

推荐完整示例 `../examples/rag-60s.json`。`voice: {"provider":"neural","rate":-12}` 为默认；rate 范围 -30 到 +10 百分比。在线发送口播文本给 Edge TTS，无需模型 API。显式 `provider: system` 可使用离线 macOS Tingting。服务失败会报错，不静默回退。可用环境变量 `AUTO_VIDEO_TTS_PYTHON` 指向已安装 edge-tts 7.3.1 的 Python；否则首次自动准备 `.venv-tts`。

新增 visual：`hook` 引入与三步流程，`index` 文档拆分与归档，`retrieve` 示意排序与筛选，`context` 双输入汇聚，`answer` 资料变回答与来源标签，`limits` 三项核查汇聚总结。旧四种 visual 继续映射至相近新动效。动效根据场景时长等比缩放，不再依赖固定十秒片段。

每场可填 `detail`（24 字内）、`result`（18 字内）、`sourceLabel`（30 字内）、`note`（80 字内）。标签及字段必须随话题原创；条形只表示关系时注明示意，真实统计需提供来源。不要在这些字段塞长段落。三种风格共享动效，使用不同配色；diagram 为蓝色流程图，editorial 为低饱和图文。

按实际合成音长分配场景：开头 0.1 秒、句间 0.32 秒、尾部至少 0.3 秒，再平均分配剩余时长。自然语速保持不变；无法容纳时必须压缩讲稿或延长时长。字幕按句的实测音长再按字数分段，因此是句级对齐估计，不是逐字强制对齐。
