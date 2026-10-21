import React from 'react';
import {AbsoluteFill,Audio,Composition,Easing,interpolate,registerRoot,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
type Clip={text:string;from:number;to:number};type Scene={title:string;startFrame:number;durationInFrames:number;audioSrc:string;captions:Clip[]};type Props={scenes:Scene[]};
const c={ink:'#243d40',paper:'#fff9ed',mint:'#b9dfce',gold:'#ffd36e',blue:'#bddaf0',peach:'#f3b9a8'};
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'}as const;
function Card({x,y,w,h,fill=c.paper,children,opacity=1}:{x:number;y:number;w:number;h:number;fill?:string;children?:React.ReactNode;opacity?:number}){return <g opacity={opacity}><rect x={x+6} y={y+8} width={w} height={h} rx="22" fill="#d9d4c4"/><rect x={x} y={y} width={w} height={h} rx="22" fill={fill} stroke={c.ink} strokeWidth="3"/>{children}</g>}
function Text({x,y,text,size=28,anchor='start',color=c.ink}:{x:number;y:number;text:string;size?:number;anchor?:'start'|'middle';color?:string}){return <text x={x} y={y} fontSize={size} fill={color} fontWeight="750" textAnchor={anchor}>{text}</text>}
function Section({scene,index}:{scene:Scene;index:number}){
 const f=useCurrentFrame(),{fps}=useVideoConfig();const p=f/scene.durationInFrames,t=p*10;
 const r=(a:number,b:number)=>interpolate(t,[a,b],[0,1],{...clamp,easing:Easing.bezier(.2,.8,.2,1)});
 const inputTopic='面团为什么会发起来？';const a=r(0,.6),fade=1-r(9.55,10),caption=scene.captions.find(x=>f>=x.from&&f<x.to);
 return <AbsoluteFill style={{opacity:fade,color:c.ink,fontFamily:'"PingFang SC","Microsoft YaHei",sans-serif'}}>
 <div style={{position:'absolute',top:32,left:58,fontSize:19,fontWeight:900,letterSpacing:3}}>TOPICMOTION ✦</div>
 <div style={{position:'absolute',right:58,top:36,fontSize:15,fontWeight:700}}>自动制作 × 动效表达</div>
 <h1 style={{position:'absolute',top:100,left:58,margin:0,fontSize:index===3?82:49,opacity:a,transform:`translateY(${(1-a)*22}px)`,letterSpacing:-1.5}}>{scene.title}</h1>
 <svg viewBox="0 0 1280 720" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
 {index===0&&<g opacity={a}>
  <Card x={110} y={235} w={820} h={282}><Text x={150} y={286} text="你想讲什么？" size={23}/><rect x="147" y="311" width="740" height="78" rx="14" fill={c.paper} stroke={c.ink} strokeWidth="2"/><Text x={173} y={361} text={inputTopic.slice(0,Math.floor(r(.6,3.2)*inputTopic.length))} size={34}/><rect x={173+Math.floor(r(.6,3.2)*inputTopic.length)*34} y="329" width="3" height="37" fill={c.ink} opacity={Math.sin(f*.17)>.1?1:.15}/>
   {['卡通','流程图','极简图文'].map((s,j)=><g key={s}><rect x={150+j*168} y="422" width="148" height="49" rx="24" fill={j===0?c.mint:'#eeeade'} stroke={c.ink} strokeWidth="2"/><Text x={224+j*168} y={455} text={s} size={23} anchor="middle"/></g>)}
   <Text x={820} y={455} text="30 秒" size={28} anchor="middle"/>
  </Card>
  <g opacity={r(4.4,5.4)} transform={`translate(0 ${Math.sin(t*2)*5})`}><circle cx="1055" cy="373" r="83" fill={c.gold} stroke={c.ink} strokeWidth="3"/><path d="M1037 342 l49 31 l-49 31 Z" fill={c.ink}/><Text x={1055} y={501} text="开始制作" size={25} anchor="middle"/></g>
 </g>}
 {index===1&&<g>
 {['讲稿','分镜','配音','字幕','成片'].map((s,j)=>{const q=r(.5+j*.65,1.3+j*.65),x=70+j*238;return <g key={s} opacity={q} transform={`translate(0 ${(1-q)*35})`}><Card x={x} y={275} w={190} h={180} fill={[c.blue,c.gold,c.peach,c.mint,c.gold][j]}><Text x={x+95} y={326} text={s} anchor="middle" size={32}/>{j===2?Array.from({length:9},(_,k)=><rect key={k} x={x+34+k*14} y={365-Math.abs(Math.sin(t*3+k))*24} width="7" height={15+Math.abs(Math.sin(t*3+k))*40} rx="3" fill={c.ink}/>):[0,1,2].map(k=><path key={k} d={`M${x+32} ${359+k*24} h${125-k*15}`} stroke={c.ink} strokeWidth="4" strokeLinecap="round"/>)}</Card>{j<4&&<path d={`M${x+199} 365 h30 l-9 -9 m9 9 l-9 9`} fill="none" stroke={c.ink} strokeWidth="3"/>}</g>})}
 {[0,1,2,3].map(j=><circle key={j} cx={90+((t*.17+j*.25)%1)*1090} cy="500" r="6" fill={c.gold} stroke={c.ink}/>)}
 <Text x={640} y={554} text="自动接力，完成整条制作流程" size={27} anchor="middle"/>
 </g>}
 {index===2&&(()=>{const split=r(.5,3.2),merge=r(4.6,7.2);return <g>
  <Text x={335} y={240} text="图形拆分" size={28} anchor="middle"/><Text x={950} y={240} text="流程汇聚" size={28} anchor="middle"/>
  {[2,1,0].map(j=><Card key={j} x={180+j*10+split*j*105} y={280+j*10+split*j*36} w={280-split*165} h={210-split*55} fill={[c.gold,c.mint,c.blue][j]}><path d={`M${201+j*10+split*j*105} ${330+j*10+split*j*36} h${225-split*150}`} stroke={c.ink} strokeWidth="4"/></Card>)}
  {[0,1,2].map(j=><g key={j} opacity={1-merge}><circle cx={790+j*135} cy={320+(j%2)*110} r="48" fill={[c.blue,c.peach,c.gold][j]} stroke={c.ink} strokeWidth="3"/><path d={`M${790+j*135} ${368+(j%2)*110} Q${950} 475 950 490`} fill="none" stroke={c.ink} strokeWidth="2"/></g>)}
  <Card x={950-merge*180} y={475-merge*135} w={merge*290+70} h={merge*110+65} fill={c.mint}><Text x={985-merge*35} y={516-merge*100} text={merge>.7?'表达更清楚':'汇聚'} anchor="middle" size={merge>.7?34:17}/></Card>
  {[0,1,2].map(j=>{const q=(t*.18+j*.25)%1;return <circle key={j} cx={790+j*135+(950-(790+j*135))*q} cy={320+(j%2)*110+(490-(320+(j%2)*110))*q} r="6" fill={c.gold} opacity={1-merge}/>})}
  <Text x={640} y={565} text="形状 · 路径 · 节奏，随内容变化" size={27} anchor="middle"/>
 </g>})()}
 {index===3&&<g opacity={a}>
  <Text x={63} y={290} text="说一个话题，" size={52}/><Text x={63} y={365} text="自动做成动效视频。" size={52}/>
  <Card x={65} y={420} w={700} h={99} fill={c.mint}><Text x={99} y={460} text="在 Codex 中调用 $auto-video" size={26}/><Text x={99} y={496} text="github.com/Olandooooes/TopicMotion" size={22}/></Card>
  <g transform={`translate(${Math.sin(t)*7} ${Math.cos(t)*5})`}><rect x="930" y="275" width="195" height="155" rx="35" fill={c.gold} stroke={c.ink} strokeWidth="4"/><circle cx="985" cy="330" r="13" fill={c.ink}/><circle cx="1070" cy="330" r="13" fill={c.ink}/><path d="M996 370 Q1030 396 1065 370" stroke={c.ink} strokeWidth="5" fill="none"/><path d="M1028 275 v-32" stroke={c.ink} strokeWidth="4"/><circle cx="1028" cy="235" r="12" fill={c.peach} stroke={c.ink} strokeWidth="3"/></g>
 </g>}
 </svg>
 <div style={{position:'absolute',bottom:95,left:58,right:58,display:'flex',justifyContent:'space-between',fontSize:14,color:'#687c73'}}><span>在 Codex 中运行 · 本机导出 MP4</span><span>{['输入话题','全自动制作','丰富动效','让想法动起来'][index]}</span></div>
 <div style={{position:'absolute',bottom:78,left:58,right:58,height:3,background:'#ded8c8'}}><div style={{width:`${p*100}%`,height:3,background:'#c59a36'}}/></div>
 {caption&&<div style={{position:'absolute',bottom:24,left:55,right:55,textAlign:'center',fontSize:28,fontWeight:750,lineHeight:1.4}}>{caption.text}</div>}
 <Audio src={staticFile(scene.audioSrc)}/>
 </AbsoluteFill>;
}
export function TopicMotionIntro({scenes}:Props){return <AbsoluteFill style={{background:c.paper}}><AbsoluteFill style={{opacity:.35,backgroundImage:'radial-gradient(#d1c6af 1px,transparent 1px)',backgroundSize:'24px 24px'}}/>{scenes.map((s,i)=><Sequence key={i} from={s.startFrame} durationInFrames={s.durationInFrames}><Section scene={s} index={i}/></Sequence>)}</AbsoluteFill>}
const Root=()=> <Composition id="TopicMotionIntro" component={TopicMotionIntro} width={1280} height={720} fps={30} durationInFrames={900} defaultProps={{scenes:[]}}/>;
registerRoot(Root);
