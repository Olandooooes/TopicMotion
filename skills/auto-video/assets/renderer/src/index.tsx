import React from 'react';
import {AbsoluteFill,Audio,CanvasImage,Composition,Easing,interpolate,registerRoot,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
type Scene={note?:string;detail?:string;result?:string;sourceLabel?:string;title:string;visual:string;labels:string[];startFrame:number;durationInFrames:number;audioSrc:string;captions:{text:string;from:number;to:number}[]};
type Movie={topic:string;style:string;duration:number;scenes:Scene[]};
const palettes:Record<string,typeof base>={cartoon:null as unknown as typeof base};
const base={ink:'#283d42',paper:'#fff9ed',gold:'#ffd36e',mint:'#b9dfce',blue:'#bfdaf0',peach:'#f8b8a0',muted:'#71837b'};
palettes.cartoon=base;palettes.diagram={...base,paper:'#eaf1f8',gold:'#a9c9ee',mint:'#a9dccd',peach:'#e5b9ca'};palettes.editorial={...base,paper:'#fafafa',gold:'#e6e4dc',mint:'#d6dfd7',blue:'#e0e5e9',peach:'#e9d9d0'};
const Theme=React.createContext(base);
const bounded={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const lerp=(p:number,a:number,b:number)=>a+(b-a)*p;
function Sheet({x,y,w=220,h=240,fill=base.gold,opacity=1,children}:{x:number;y:number;w?:number;h?:number;fill?:string;opacity?:number;children?:React.ReactNode}){const C=React.useContext(Theme);return <g opacity={opacity}><rect x={x+5} y={y+7} width={w} height={h} rx="20" fill="#dfd6c2"/><rect x={x} y={y} width={w} height={h} rx="20" fill={fill} stroke={C.ink} strokeWidth="3"/>{children}</g>}
function Label({x,y,text,size=25,maxWidth=440,fill=base.ink,anchor='start'}:{x:number;y:number;text:string;size?:number;maxWidth?:number;fill?:string;anchor?:'start'|'middle'}){return <text x={x} y={y} fill={fill} fontSize={Math.min(size,maxWidth/Math.max(text?.length||1,1))} fontWeight="750" textAnchor={anchor}>{text}</text>}
function Arrow({d,opacity=1,color=base.ink}:{d:string;opacity?:number;color?:string}){return <path d={d} opacity={opacity} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>}
function SceneView({scene,index,topic,style}:{scene:Scene;index:number;topic:string;style:string}){
 const C=React.useContext(Theme); scene={...scene,visual:({flow:'context',search:'retrieve',evidence:'answer',summary:'limits'} as Record<string,string>)[scene.visual]||scene.visual}; const words=scene.labels;const word=(i:number)=>words[i]||words[0];
 const f=useCurrentFrame(),{fps}=useVideoConfig(),seconds=scene.durationInFrames/fps,t=f/fps*10/seconds;
 const r=(a:number,b:number)=>interpolate(t,[a,b],[0,1],{...bounded,easing:Easing.bezier(.2,.8,.2,1)});
 const intro=r(0,.55),outro=1-r(9.72,10);
 const caption=scene.captions.find(c=>f>=c.from&&f<c.to);
 const labels=[String(index+1).padStart(2,'0'),style];
 const bob=Math.sin(t*2.1)*5;
 return <AbsoluteFill style={{color:C.ink,fontFamily:'"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif',opacity:outro}}>
  <div style={{position:'absolute',left:62,top:34,maxWidth:850,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontSize:17,letterSpacing:2,fontWeight:800,color:C.muted}}>{topic} / AUTO VIDEO</div>
  <div style={{position:'absolute',right:62,top:30,display:'flex',gap:8}}>{labels.map((s,i)=><span key={s} style={{padding:'6px 10px',borderRadius:20,background:i===index?C.ink:'#ebe9db',color:i===index?'#fff9ed':C.muted,fontSize:12,fontWeight:700}}>{s}</span>)}</div>
  <h1 style={{position:'absolute',left:62,right:50,top:96,margin:0,fontSize:scene.title.length>14?48:55,lineHeight:1.25,letterSpacing:-1,opacity:intro,transform:`translateY(${(1-intro)*20}px)`}}>{scene.title}</h1>
  <svg width="1280" height="720" viewBox="0 0 1280 720" style={{position:'absolute',inset:0}} aria-label={scene.title}>
   {scene.visual==='hook'&&(()=>{
    const shift=r(3.8,5.2),a=r(.45,1.1),better=r(4.8,5.8);
    return <g>
     <g opacity={a*(1-shift)}><Sheet x={140} y={245} w={490} h={210} fill={C.peach}><Label x={180} y={302} text={scene.detail||word(0)} size={28}/><Arrow d="M180 344 H555 M180 378 H490"/><Label x={535} y={427} text="?" size={44}/></Sheet><Label x={385} y={508} text={scene.result||scene.title} size={27} anchor="middle"/></g>
     {[0,1,2].map(j=><g key={j} opacity={better} transform={`translate(${lerp(shift,70,0)} 0)`}><Sheet x={100+j*335} y={270+j%2*12} w={285} h={155} fill={[C.blue,C.gold,C.mint][j]}><Label x={242+j*335} y={330+j%2*12} text={word(j)} anchor="middle" size={30} maxWidth={250}/><Label x={242+j*335} y={385+j%2*12} text={String(j+1).padStart(2,'0')} anchor="middle" size={15} fill={C.muted}/></Sheet>{j<2&&<Arrow d={`M${397+j*335} 350 h28 l-8 -8 m8 8 l-8 8`}/>}</g>)}
     {[0,1,2,3,4].map(j=>{const p=(t*.18+j*.2)%1;return <circle key={j} cx={360+p*520} cy={470-Math.sin(p*Math.PI)*70} r="5" fill={C.gold} opacity={better*.8}/>})}
    </g>;
   })()}
   {scene.visual==='index'&&(()=>{
    const cut=r(1.5,3.6),arrange=r(4.5,6.2);
    return <g>
     {[2,1,0].map(j=><Sheet key={j} x={lerp(cut,350+j*9,350+j*195)} y={lerp(arrange,240+j*17,245)} w={lerp(cut,330,165)} h={lerp(cut,280,210)} fill={[C.gold,C.mint,C.blue][j]}><Label x={lerp(cut,380+j*9,370+j*195)} y={lerp(arrange,288+j*17,291)} text={word(j)} size={24} maxWidth={125}/>{[0,1,2].map(k=><path key={k} d={`M${lerp(cut,380+j*9,370+j*195)} ${lerp(arrange,330+j*17,330)+k*30} h${lerp(cut,250,120)}`} stroke={C.ink} strokeWidth="4" strokeLinecap="round"/>)}</Sheet>)}
     {[0,1,2].map(j=><g key={j} opacity={arrange}><rect x={362+j*195} y="473" width="140" height="42" rx="10" fill={C.paper} stroke={C.ink} strokeWidth="2"/><Label x={432+j*195} y={501} text={String.fromCharCode(65+j)} size={19} anchor="middle"/><Arrow d={`M${432+j*195} 456 v12`}/></g>)}
     <g opacity={r(6.3,7.1)}><rect x="975" y="270" width="180" height="220" rx="20" fill={C.mint} stroke={C.ink} strokeWidth="3"/><Label x={1065} y={316} text={scene.result||"整理"} size={27} maxWidth={150} anchor="middle"/>{[0,1,2].map(j=><rect key={j} x="1000" y={344+j*39} width={110-j*16} height="19" rx="5" fill={C.ink} opacity={.6-j*.1}/>)}<Arrow d="M920 377 H960 l-9 -9 m9 9 l-9 9"/></g>
    </g>;
   })()}
   {scene.visual==='retrieve'&&(()=>{
    const ranked=r(1.4,3.1),filter=r(4.7,6.4),gather=r(6.6,8.0);
    return <g>
     {[2,1,0].map(j=>{
      const w=lerp(ranked,300,[650,475,325][j]);const x=lerp(gather,205,500),y=lerp(gather,230+j*95,275);
      return <g key={j} opacity={j===0?1:1-filter}><Sheet x={x} y={y} w={lerp(gather,w,460)} h={lerp(gather,70,190)} fill={[C.gold,C.blue,C.peach][j]}><Label x={x+24} y={y+45} text={gather>.5?(scene.result||word(0)):word(j)} size={26}/></Sheet></g>;
     })}
     <g opacity={filter*(1-gather)}><path d="M930 252 l14 15 l29 -35" fill="none" stroke="#4b8868" strokeWidth="7" strokeLinecap="round"/><Label x={990} y={267} text="保留" size={23}/><Label x={740} y={363} text="核验 / 过滤" size={21} fill={C.muted}/></g>
     <g opacity={gather}><path d="M555 345 H905 M555 383 H853" stroke={C.ink} strokeWidth="5" strokeLinecap="round"/><Label x={730} y={507} text={scene.detail||scene.title} size={25} anchor="middle"/></g>
     <g transform={`translate(${lerp(r(0,1),-80,0)} 0)`}><circle cx="122" cy="346" r="42" fill={C.paper} stroke={C.ink} strokeWidth="4"/><path d="M150 376 l30 31" stroke={C.ink} strokeWidth="9" strokeLinecap="round"/><circle cx="122" cy="346" r="25" fill={C.blue} opacity=".6"/></g>
    </g>;
   })()}
   {scene.visual==='context'&&(()=>{
    const merge=r(3.7,5.5),answer=r(6.8,8.4);
    return <g>
     {[0,1].map(j=><g key={j} opacity={1-merge}><Sheet x={lerp(merge,125,560)} y={245+j*142} w={370} h={105} fill={j?C.mint:C.blue}><Label x={310+merge*350} y={310+j*142} text={word(j)} anchor="middle" size={29}/></Sheet></g>)}
     <Sheet x={lerp(merge,660,360)} y={255} w={lerp(merge,350,550)} h={240} fill={C.gold}><Label x={lerp(merge,835,635)} y={315} text={merge>.7?(scene.result||word(2)):word(2)} size={33} anchor="middle"/><g opacity={merge}><path d="M410 355 H858 M410 385 H810" stroke={C.ink} strokeWidth="5" strokeLinecap="round"/><Label x={635} y={456} text={scene.detail||scene.title} size={27} anchor="middle"/></g></Sheet>
     {[0,1,2,3,4,5].map(j=>{const p=r(1.4+j*.3,4.5+j*.3);return <circle key={j} cx={lerp(p,490,720)} cy={lerp(p,290+(j%2)*140,365)-Math.sin(p*Math.PI)*65} r={7+j%2*3} fill={[C.gold,C.blue,C.mint][j%3]} stroke={C.ink} strokeWidth="2" opacity={(1-merge)*.8}/>})}
     <g opacity={answer}><path d="M935 360 h65 l-10 -10 m10 10 l-10 10" fill="none" stroke={C.ink} strokeWidth="4"/><rect x="1025" y="325" width="150" height="90" rx="20" fill={C.mint} stroke={C.ink} strokeWidth="3"/><Label x={1100} y={381} text={scene.result||"完成"} size={31} maxWidth={120} anchor="middle"/></g>
    </g>;
   })()}
   {scene.visual==='answer'&&(()=>{
    const find=r(2.6,4.3),morph=r(5.1,6.7),cite=r(7.0,8.0);
    return <g>
     <g opacity={1-find}><Sheet x={155} y={245} w={760} h={145} fill={C.blue}><Label x={195} y={305} text={word(0)} size={36}/><Label x={195} y={353} text={scene.detail||scene.title} size={22} fill={C.muted}/></Sheet></g>
     <g opacity={find}><Sheet x={lerp(morph,240,170)} y={245} w={lerp(morph,680,790)} h={270} fill={morph>.5?C.mint:C.gold}>
      <Label x={lerp(morph,280,212)} y={303} text={morph>.5?(scene.result||word(1)):word(1)} size={28}/>
      <Label x={lerp(morph,280,212)} y={380} text={word(2)} size={39}/>
      <g opacity={1-morph}><path d="M280 423 H820 M280 458 H755" stroke={C.ink} strokeWidth="5" strokeLinecap="round"/></g>
      <g opacity={cite}><rect x="210" y="425" width="565" height="48" rx="11" fill={C.paper} stroke={C.ink} strokeWidth="2"/><Label x={234} y={457} text={scene.sourceLabel||"查看依据"} size={25}/><path d="M800 449 l12 12 l25 -29" fill="none" stroke="#4b8868" strokeWidth="6" strokeLinecap="round"/></g>
     </Sheet><path d={`M380 514 l${morph*35} ${morph*27} l${morph*28} -${morph*27}`} fill={C.mint} stroke={C.ink} strokeWidth="3" opacity={morph}/></g>
    </g>;
   })()}
   {scene.visual==='limits'&&(()=>{
    const checks=r(1.5,4),final=r(5.5,7.7);
    return <g>
     {scene.labels.map((_,j)=><g key={j} opacity={r(.5+j*.55,1.2+j*.55)*(1-final)}><Sheet x={120+j*335} y={250} w={290} h={190} fill={[C.blue,C.gold,C.mint][j]}><Label x={265+j*335} y={315} text={scene.labels[j]||scene.labels[0]} size={27} maxWidth={250} anchor="middle"/><g opacity={checks}><circle cx={265+j*335} cy="378" r="25" fill={C.paper} stroke={C.ink} strokeWidth="2"/><path d={`M${250+j*335} 378 l10 10 l19 -22`} fill="none" stroke="#4b8868" strokeWidth="5" strokeLinecap="round"/></g></Sheet></g>)}
     <g opacity={final} transform={`translate(0 ${lerp(final,35,0)})`}><rect x="145" y="250" width="790" height="247" rx="35" fill={C.mint} stroke={C.ink} strokeWidth="3"/><Label x={200} y={320} text={scene.detail||scene.title} size={35}/><Label x={200} y={410} text={scene.result||word(0)} size={49}/><Label x={200} y={464} text={scene.labels.join(" · ")} size={22} fill={C.muted}/></g>
    </g>;
   })()}
  </svg>
  {['hook','answer','limits'].includes(scene.visual)&&<CanvasImage src={staticFile('robot.svg')} style={{position:'absolute',left:scene.visual==='hook'?1030:1008,top:315+bob,width:195,height:190,opacity:intro,transform:`translateX(${(1-intro)*50}px)`}}/>}
  {scene.visual==='index'&&<CanvasImage src={staticFile('librarian.svg')} style={{position:'absolute',left:55,top:315+bob,width:220,height:190,opacity:intro}}/>}
  {scene.note&&<div style={{position:'absolute',left:62,right:62,top:564,color:C.muted,fontSize:14}}>{scene.note}</div>}

  <div style={{position:'absolute',left:62,right:62,bottom:92,height:3,background:'#ded8c8'}}><div style={{height:3,background:'#d3a22b',width:`${f/scene.durationInFrames*100}%`}}/></div>
  {caption&&<div style={{position:'absolute',left:74,right:74,bottom:28,textAlign:'center',fontSize:29,fontWeight:750,lineHeight:1.4}}>{caption.text}</div>}
  <Audio src={staticFile(scene.audioSrc)}/>
 </AbsoluteFill>;
}
function MovieView({scenes,topic,style}:Movie){const C=palettes[style]||base;const{fps}=useVideoConfig();return <AbsoluteFill style={{background:C.paper}}><div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(#ddcfb6 1px, transparent 1px)',backgroundSize:'26px 26px',opacity:.35}}/>{scenes.map((scene,index)=><Sequence key={index} name={scene.title} from={scene.startFrame} durationInFrames={scene.durationInFrames} premountFor={fps}><Theme.Provider value={C}><SceneView scene={scene} index={index} topic={topic} style={style}/></Theme.Provider></Sequence>)}</AbsoluteFill>}
const Root=()=> <Composition id="AutoVideo" component={MovieView} width={1280} height={720} fps={30} durationInFrames={1800} defaultProps={{topic:"自动视频",style:"cartoon",duration:60,scenes:[]}} calculateMetadata={({props})=>({durationInFrames:Math.round(props.duration*30)})}/>;
registerRoot(Root);
