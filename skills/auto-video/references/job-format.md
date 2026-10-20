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
- style：`cartoon` 奶油色、粗描边、卡通机器人与弹性移动；`diagram` 深色流程图、节点和证据卡；`editorial` 浅色大字与几何信息图。三者共享时间线和配音。
- title：1–18 字。narration：1–240 字/场，按时长进一步控制；中文句号/问号/叹号/分号会拆句，逐句测时。程序保持至少 0.14 秒句间停顿，语速最多加快到 1.6 倍，超出则明确失败。
- visual：`flow` 连接节点；`search` 排序条（仅示意，标签必须避免暗示真实数值）；`evidence` 堆叠卡片；`summary` 要点与结论。
- labels：1–3 条；flow 最多 7 字/条，其他最多 17 字/条。
- sources：可选的核验资料记录，不直接作为字幕。配音文本必须能够脱离画面自然理解。

程序依据口播文字长度分配场景时长，再用实际配音长度缩放语速，形成 `timeline.json`；SRT 时间与同一条时间线一致。较短内容保留片尾留白，不重复句子填充时长。超长内容应缩短脚本，不能悄悄截断。

输出：`movie.mp4`（H.264/AAC）、`poster.png`、`script.txt`、`captions.srt`、`input.json`、`timeline.json`、`report.json` 与 `assets/` 中合成的音频。输出含本地系统声音，不随源码自动公开。
