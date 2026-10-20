import React from 'react';
import {AbsoluteFill, CanvasImage, Composition, registerRoot, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Audio} from '@remotion/media';
type Scene = {title:string; narration:string; labels:string[]; visual:'flow'|'search'|'evidence'|'summary'; startFrame:number; durationInFrames:number; captions:{text:string;from:number;to:number}[]; audioSrc:string};
type Job = {topic:string;style:'cartoon'|'diagram'|'editorial';duration:number;scenes:Scene[]};
const palette={cartoon:{bg:'#fff8e9',ink:'#273b40',accent:'#efb83b',soft:'#bbdfcf',line:'#d8cbb2'},diagram:{bg:'#111c30',ink:'#edf5ff',accent:'#5edac5',soft:'#283e61',line:'#354864'},editorial:{bg:'#f3efe7',ink:'#171b22',accent:'#ff6542',soft:'#d9e3ec',line:'#d2ccbf'}};
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
function SceneView({scene,style,index,total}:{scene:Scene;style:Job['style'];index:number;total:number}){
 const f=useCurrentFrame(),{fps}=useVideoConfig(),p=palette[style];
 const enter=interpolate(f,[0,fps*.5],[0,1],{...clamp,easing:Easing.out(Easing.cubic)});
 const leave=interpolate(f,[scene.durationInFrames-8,scene.durationInFrames],[1,0],clamp);
 const caption=scene.captions.find(c=>f>=c.from&&f<c.to);
 const phase=f/scene.durationInFrames;
 return <AbsoluteFill style={{background:p.bg,color:p.ink,fontFamily:'"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif',opacity:leave}}>
  <div style={{position:'absolute',inset:0,opacity:.16,backgroundImage:`radial-gradient(${p.line} 1.5px, transparent 1.5px)`,backgroundSize:'28px 28px'}}/>
  <div style={{position:'absolute',left:64,top:36,fontSize:18,letterSpacing:2,fontWeight:700}}>{style==='cartoon'?'CARTOON /':style==='diagram'?'VISUAL NOTES /':'EXPLAIN /'} {index+1} / {total}</div>
  <div style={{position:'absolute',right:64,top:36,fontSize:18,opacity:.6}}>{scene.visual==='search'?'RETRIEVE':scene.visual==='evidence'?'CONTEXT':scene.visual==='summary'?'TAKEAWAY':'OVERVIEW'}</div>
  <h1 style={{position:'absolute',left:64,top:85,right:64,fontSize:style==='editorial'?68:54,margin:0,lineHeight:1.2,opacity:enter,transform:`translateY(${(1-enter)*20}px)`}}>{scene.title}</h1>
  <svg viewBox="0 0 1280 720" style={{position:'absolute',inset:0,width:1280,height:720}}>
   {scene.visual==='search'?scene.labels.map((label,j)=>{
     const grow=interpolate(f,[fps*.35+j*5,fps*1.15+j*5],[.08,1],clamp);
     return <g key={j}><rect x={120} y={245+j*94} width={(870-j*180)*grow} height={65} rx={style==='cartoon'?18:4} fill={j===0?p.accent:p.soft} stroke={p.ink} strokeWidth={style==='diagram'?1:3}/><text x={145} y={288+j*94} fill={j===0?'#16272b':p.ink} fontSize="27" opacity={grow} fontWeight="700">{label}</text></g>;
   }):scene.visual==='summary'?<g transform={`translate(${(1-enter)*60} 0)`} opacity={enter}>
    <rect x="120" y="225" width={style==='cartoon'?850:1040} height="300" rx={style==='cartoon'?35:8} fill={p.soft} stroke={p.ink} strokeWidth="3"/>
    {scene.labels.map((label,j)=><g key={j} opacity={interpolate(f,[j*8,j*8+14],[0,1],clamp)}><circle cx="170" cy={286+j*78} r="14" fill={p.accent}/><text x="205" y={298+j*78} fill={p.ink} fontSize="31" fontWeight="700">{label}</text></g>)}
   </g>:scene.visual==='evidence'?<g opacity={enter} transform={`translate(0 ${(1-enter)*25})`}>
    {[2,1,0].map(j=><rect key={j} x={290+j*12} y={228-j*12} width="700" height="294" rx={style==='cartoon'?22:5} fill={j===0?p.soft:p.bg} stroke={p.ink} strokeWidth="3"/>)}
    {scene.labels.map((label,j)=><text key={j} x="335" y={300+j*78} fill={p.ink} fontSize={j===0?35:28} fontWeight={j===0?800:500}>{label}</text>)}
    <rect x="805" y="455" width="130" height="34" rx="8" fill={p.accent}/><text x="870" y="479" textAnchor="middle" fontSize="18" fill="#16272b">SOURCE</text>
   </g>:<g opacity={enter}>
    {scene.labels.map((label,j)=>{
      const x=100+j*370;const reveal=interpolate(f,[fps*.2+j*8,fps*.7+j*8],[0,1],clamp);
      return <g key={j} opacity={reveal} transform={`translate(0 ${(1-reveal)*35})`}>
       <rect x={x} y={260+Math.sin(phase*Math.PI*2+j)*7} width="335" height="190" rx={style==='cartoon'?30:style==='editorial'?0:10} fill={j===1?p.accent:p.soft} stroke={p.ink} strokeWidth="3"/>
       <circle cx={x+167} cy="303" r="17" fill={p.ink}/><text x={x+167} y="311" textAnchor="middle" fontSize="20" fill={p.bg}>{j+1}</text>
       <text x={x+167} y="389" textAnchor="middle" fontSize="35" fill={j===1?'#16272b':p.ink} fontWeight="800">{label}</text>
       {j<scene.labels.length-1&&<path d={`M${x+341} 355 h20 l-8 -8 m8 8 l-8 8`} stroke={p.ink} strokeWidth="3" fill="none"/>}
      </g>;
    })}
   </g>}
  </svg>
  {style==='cartoon'&&scene.visual==='summary'&&<CanvasImage src={staticFile('robot.svg')} style={{position:'absolute',left:998,top:300,width:200,height:195,transform:`translateY(${Math.sin(f/fps*2)*7}px)`}}/>}
  <div style={{position:'absolute',bottom:88,left:64,right:64,height:2,background:p.line}}><div style={{height:3,background:p.accent,width:`${phase*100}%`}}/></div>
  {caption&&<div style={{position:'absolute',bottom:29,left:72,right:72,fontSize:28,lineHeight:1.35,textAlign:'center',fontWeight:700}}>{caption.text}</div>}
  <Audio src={staticFile(scene.audioSrc)} premountFor={fps}/>
 </AbsoluteFill>;
}
function AutoVideo({scenes,style}:Job){const{fps}=useVideoConfig();return <AbsoluteFill>{scenes.map((scene,index)=><Sequence key={index} from={scene.startFrame} durationInFrames={scene.durationInFrames} premountFor={fps} name={scene.title}><SceneView scene={scene} style={style} index={index} total={scenes.length}/></Sequence>)}</AbsoluteFill>}
const Root=()=> <Composition id="AutoVideo" component={AutoVideo} width={1280} height={720} fps={30} durationInFrames={450} defaultProps={{topic:'自动视频',style:'cartoon',duration:15,scenes:[]}} calculateMetadata={({props})=>({durationInFrames:Math.round(props.duration*30)})}/>;
registerRoot(Root);
