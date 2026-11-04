/** Check dimensions before the browser decodes an uploaded image. */
export function imageDimensions(bytes:Uint8Array){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 let width=0,height=0;
 if(bytes.length>=24&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)&&String.fromCharCode(...bytes.slice(12,16))==='IHDR'){
  width=view.getUint32(16);height=view.getUint32(20);
 }else if(bytes.length>4&&bytes[0]===255&&bytes[1]===216){
  let offset=2,count=0;
  while(offset+4<=bytes.length&&count++<1000){
   if(bytes[offset]!==255)throw Error('Invalid JPEG marker.');
   while(bytes[offset]===255)offset++;
   const marker=bytes[offset++];if(marker===217||marker===218)break;
   if(marker===1||(marker>=208&&marker<=215))continue;
   if(offset+2>bytes.length)break;const length=view.getUint16(offset);
   if(length<2||offset+length>bytes.length)throw Error('Invalid JPEG segment.');
   if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){
    if(length<8)throw Error('Invalid JPEG frame.');height=view.getUint16(offset+3);width=view.getUint16(offset+5);break;
   }
   offset+=length;
  }
 }
 if(width<1||height<1||width>4000||height>4000||width*height>3_000_000)throw Error('Use a PNG/JPEG up to three megapixels and 4,000 pixels per side.');
 return {width,height};
}
