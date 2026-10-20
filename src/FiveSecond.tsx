import React from 'react';
import {AbsoluteFill,Composition,interpolate,interpolateColors,Easing,useCurrentFrame,useVideoConfig,staticFile,CanvasImage,Sequence} from 'remotion';
import {Audio} from '@remotion/media';
import {validateProps, type DemoProps} from './config';
const INK='#263340',PAPER='#fffaf0',GOLD='#ffd971',MINT='#b9dfce',BLUE='#bddaf0';
const ease=Easing.bezier(.2,.8,.2,1);
const lerp=(v:number,a:number,b:number)=>a+(b-a)*v;
const ramp=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{easing:ease,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const FiveSecond:React.FC<DemoProps>=({audioSrc, audioOffsetSeconds, audioVolume, captions})=>{
 const f=useCurrentFrame();const{fps}=useVideoConfig();
 const caption= captions.find(c => f / fps >= c.startSeconds && f / fps < c.endSeconds);
 const bars=ramp(f,19,49),card=ramp(f,52,78),answer=ramp(f,83,113);
 const rankAlpha=ramp(f,34,46)*(1-ramp(f,54,65));
 const cardAlpha=ramp(f,65,77)*(1-ramp(f,87,97));
 const answerAlpha=ramp(f,98,113);
 return <AbsoluteFill style={{backgroundColor:PAPER,color:INK,fontFamily:'"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif',overflow:'hidden'}}>
  <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(#d6ccb5 1px,transparent 1px)',backgroundSize:'24px 24px',opacity:.3}}/>
  <div style={{position:'absolute',left:64,top:40,fontSize:17,fontWeight:800,letterSpacing:2,color:'#6b786c'}}>RAG / 知识流动起来</div>
  <div style={{position:'absolute',right:64,top:40,fontSize:15,color:'#758070'}}>5 秒 · 声音与动效试样</div>
  <h1 style={{position:'absolute',left:64,top:86,fontSize:55,letterSpacing:-2,margin:0,lineHeight:1.3}}>先查资料，再带着证据回答。</h1>
  <svg viewBox="0 0 1280 720" width="1280" height="720" style={{position:'absolute',inset:0}} role="img" aria-label="资料页连续变成排序条、证据卡和带引用的回答气泡">
   <defs><filter id="shadow" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="5" dy="7" stdDeviation="0" floodColor="#d8cfbb"/></filter></defs>
   {/* 所有对象留在同一画布中，以形状和位置变换衔接。 */}
   {[2,1,0].map(j=>{
    const collapse=j===0?0:card;
    const x0=lerp(bars,534+j*13,335),y0=lerp(bars,223-j*11,260+j*94);
    const w0=lerp(bars,212,[610,445,300][j]),h0=lerp(bars,280,64);
    const x1=lerp(card,x0,335),y1=lerp(card,y0,230),w1=lerp(card,w0,610),h1=lerp(card,h0,285);
    const x=lerp(answer,x1,340),y=lerp(answer,y1,240),w=lerp(answer,w1,600),h=lerp(answer,h1,255);
    return <g key={j} opacity={j===0?1:1-collapse} style={{translate:`0px ${lerp(ramp(f,0,16),28,0)}px`}}>
     <rect x={x} y={y} width={Math.max(1,w)} height={Math.max(1,h)} rx={lerp(answer,lerp(bars,18,14),35)} fill={j===0?interpolateColors(answer,[0,1],[GOLD,MINT]):j===1?MINT:BLUE} stroke={INK} strokeWidth="3.5" filter="url(#shadow)"/>
     <text x={x+24} y={y+h/2+9} opacity={rankAlpha} fontSize="25" fontWeight="750" fill={INK}>{['当前有效的制度','过期版本','无关内容'][j]}</text>
    </g>
   })}
   <g opacity={1-ramp(f,18,33)}>
    <rect x="560" y="260" width="96" height="29" rx="5" fill={MINT} stroke={INK} strokeWidth="2"/>
    <text x="607" y="282" textAnchor="middle" fontSize="20" fontWeight="800" fill={INK}>资料</text>
    {[0,1,2,3].map(j=><path key={j} d={`M562 ${325+j*34} H${j===3?658:705}`} stroke={INK} strokeWidth="5" strokeLinecap="round"/>)}
   </g>
   <g opacity={cardAlpha}>
    <text x="375" y="282" fontSize="22" fontWeight="800" fill="#64715d">筛出可以支持回答的证据</text>
    <text x="375" y="355" fontSize="43" fontWeight="850" fill={INK}>《差旅制度》· 第 4 条</text>
    <path d="M375 389 H880 M375 419 H825" stroke="#8d805b" strokeWidth="5" strokeLinecap="round"/>
    <text x="375" y="474" fontSize="22" fill={INK}>当前有效 · 原文可核查</text>
   </g>
   <path d={`M485 494 L${485+38*answer} ${494+32*answer} L${485+65*answer} 494`} fill={MINT} stroke={INK} strokeWidth="3.5" opacity={answerAlpha}/>
   <g opacity={answerAlpha}>
    <rect x="375" y="270" width="140" height="34" rx="8" fill="#fffaf0" stroke={INK} strokeWidth="2"/>
    <text x="445" y="295" textAnchor="middle" fontSize="22" fontWeight="800" fill={INK}>有据可查 ✓</text>
    <text x="375" y="377" fontSize="43" fontWeight="850" fill={INK}>返程后 30 天内提交。</text>
    <text x="375" y="439" fontSize="24" fill="#4a675b">[差旅制度 v2 · §4]</text>
   </g>
   <g opacity={rankAlpha}>
    <path d="M974 276 l14 14 l30 -33" fill="none" stroke="#4f8868" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="1028" y="286" fontSize="21" fontWeight="800" fill="#4f8868">保留</text>
    <text x="820" y="380" fontSize="19" fill="#9a8d78">过滤</text>
   </g>
   {/* 沿弧线汇聚的资料点，连接筛选与回答。 */}
   {[0,1,2,3,4].map(j=>{
    const p=ramp(f,72+j*3,102+j*3);const a=(1-ramp(f,103+j*3,110+j*3))*ramp(f,65,75);
    return <circle key={j} cx={lerp(p,210+j*5,600+j*13)} cy={lerp(p,480-j*50,330)-Math.sin(p*Math.PI)*100} r={10+j%2*4} fill={[GOLD,MINT,BLUE][j%3]} stroke={INK} strokeWidth="2" opacity={a}/>;
   })}
  </svg>
  <CanvasImage src={staticFile('robot.svg')} premountFor={fps} style={{position:'absolute',left:958,top:295,width:210,height:205,opacity:answerAlpha,translate:`${lerp(answer,60,0)}px 0px`}}/>
  <div style={{position:'absolute',left:64,top:550,right:64,fontSize:16,color:'#7b8074',opacity:rankAlpha+answerAlpha}}>检索排序为形状示意；制度与 30 天期限均为虚构教学案例。</div>
  {caption && <div style={{position:'absolute',left:80,right:80,bottom:44,textAlign:'center',fontSize:32,fontWeight:800,color:INK}}>{caption.text}</div>}
  {audioSrc && <Sequence from={Math.round(audioOffsetSeconds * fps)}><Audio src={staticFile(audioSrc)} volume={audioVolume}/></Sequence>}
 </AbsoluteFill>
};
export const FiveSecondComposition=()=> <Composition id="RAG-FiveSecond" component={FiveSecond} width={1280} height={720} fps={30} durationInFrames={150} defaultProps={{audioSrc:null, audioOffsetSeconds:0, audioVolume:1, captions:[
 {text:'先查资料。',startSeconds:0.15,endSeconds:1.65},
 {text:'再带着证据回答。',startSeconds:2.2,endSeconds:4.7}
 ]}} calculateMetadata={({props})=>{ validateProps(props); return {}; }}/>;
