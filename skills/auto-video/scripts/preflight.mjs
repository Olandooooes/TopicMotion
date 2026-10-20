export function checkRuntime(platform,version,hasSay) {
 const [major,minor]=version.split('.').map(Number);
 if(!Number.isFinite(major)||major<22||(major===22&&minor<13))throw new Error('需要 Node 22.13+，建议安装 Node 24 后重试。');
 if(platform!=='darwin')throw new Error('当前自动配音仅支持 macOS；Windows/Linux 需要先实现语音适配器。未安装渲染依赖。');
 if(!hasSay)throw new Error('找不到 macOS say，无法自动合成配音。未安装渲染依赖。');
}
