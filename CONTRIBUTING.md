# Contributing to TopicMotion

English | [简体中文](CONTRIBUTING.zh-CN.md)

Contributions are welcome. Start with `npm ci` and `npm run check`, then validate the behavior affected by your change.

- **Skill, storyboard format or automatic renderer:** render a bundled RAG job on macOS into a new output directory. Check narration, captions, scene duration and the report—not just the original five-second demo. Add behavioral tests when they protect an important invariant; avoid tests that only match wording.
- **Original five-second animation:** inspect the opening, ranking, evidence cards, answer and ending in Remotion Studio.
- **Website:** run `npm run skill:pack` and `npm run demo:build`. Verify the voiced introduction, other samples, prompt copying, Skill download and five-second recording preview. Only the introduction should preload.
- **Standalone Skill package:** rebuild the ZIPs. Exclude `node_modules`, private caches, system voice tracks, user assets and credentials. CI installs the locked dependencies into an isolated directory.

For a useful issue, include your OS, Node/Python versions, the command or Skill request, expected and actual behavior, and a sanitized error log. Include a minimal storyboard when relevant. Keep private narration, credentials and customer information out of issues and pull requests.

Describe the concrete problem, resulting behavior and relevant validation in your pull request. For new assets or dependencies, update `SOURCES.md` and the applicable license notices. Original contributions are provided under the project's MIT license; do not submit voice tracks or other material without redistribution rights.

The full voice workflow is currently validated on macOS with Chinese narration. If you add a new platform or voice language, document its requirements and demonstrate an actual render before claiming support.
