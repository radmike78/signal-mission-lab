"""Reproducible code-native SML icon; owner artwork approval is a release gate."""
from pathlib import Path
import struct
import zlib
ROOT = Path(__file__).resolve().parents[1]
# Explicit 5x7 forms, kept simple and readable at launcher sizes.
GLYPHS = [['11111','10000','10000','11111','00001','00001','11111'], ['10001','11011','10101','10101','10001','10001','10001'], ['10000','10000','10000','10000','10000','10000','11111']]
def icon(width, height=None):
    height = height or width
    scale = max(1, min(width, height)//26)
    left, top = (width-17*scale)//2, (height-7*scale)//2
    bg, fg = bytes((14,18,16)), bytes((208,223,132))
    rows=[]
    for y in range(height):
        row=bytearray(bg*width)
        gy=(y-top)//scale
        if 0<=gy<7:
            for letter,glyph in enumerate(GLYPHS):
                for gx,bit in enumerate(glyph[gy]):
                    if bit=='1':
                        start=left+(letter*6+gx)*scale
                        row[start*3:(start+scale)*3]=fg*scale
        rows.append(b'\0'+row)
    def chunk(kind,data): return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',width,height,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(rows),9))+chunk(b'IEND',b'')
if __name__=='__main__':
    target=ROOT/'web/public/icons';target.mkdir(parents=True,exist_ok=True)
    for size in (192,512): (target/f'icon-{size}.png').write_bytes(icon(size))
