export function readPcmWave(bytes) {
 if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')throw new Error('需要 PCM WAV。');
 let format,data;
 for(let offset=12;offset+8<=bytes.length;){
  const type=bytes.toString('ascii',offset,offset+4),length=bytes.readUInt32LE(offset+4),start=offset+8;
  if(start+length>bytes.length)throw new Error('WAV 数据损坏。');
  if(type==='fmt ')format={codec:bytes.readUInt16LE(start),channels:bytes.readUInt16LE(start+2),rate:bytes.readUInt32LE(start+4),bits:bytes.readUInt16LE(start+14)};
  if(type==='data')data=bytes.subarray(start,start+length);
  offset=start+length+(length%2);
 }
 if(!format||!data||format.codec!==1||format.channels!==1||format.rate!==24000||format.bits!==16)throw new Error('语音必须为 24kHz 单声道 16-bit PCM WAV。');
 return {data,duration:data.length/48000};
}
export function assembleWave(clips,duration) {
 if(!Number.isFinite(duration)||duration<=0||duration>180)throw new Error('无效音轨长度。');
 const data=Buffer.alloc(Math.round(duration*24000)*2);
 for(const clip of clips){
  const offset=Math.round(clip.start*24000)*2;
  if(offset<0||offset+clip.data.length>data.length)throw new Error('配音超出场景，拒绝截断。');
  clip.data.copy(data,offset);
 }
 const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+data.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(24000,24);header.writeUInt32LE(48000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(data.length,40);
 return Buffer.concat([header,data]);
}
