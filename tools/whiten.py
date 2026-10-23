"""Turn a logo PNG (any colours, transparent OR white background) into a white-on-transparent PNG, cropped to its artwork.
Usage: python3 -I tools/whiten.py input.png output.png     (PNG only; convert JPG first with: sips -s format png in.jpg --out out.png)
No dependencies (pure Python). SVG logos are used as they are."""
import zlib,struct,sys
src,dst=sys.argv[1],sys.argv[2]
d=open(src,'rb').read(); assert d[:8]==b'\x89PNG\r\n\x1a\n'
pos=8; idat=b''; plte=None
while pos<len(d):
    n,t=struct.unpack('>I4s',d[pos:pos+8]); body=d[pos+8:pos+8+n]; pos+=12+n
    if t==b'IHDR': w,h,bd,ct,_,_,il=struct.unpack('>IIBBBBB',body)
    elif t==b'IDAT': idat+=body
    elif t==b'PLTE': plte=body
assert bd==8 and il==0 and ct in (2,6,0,4,3),(bd,il,ct)
ch={0:1,2:3,3:1,4:2,6:4}[ct]; bpp=ch; raw=zlib.decompress(idat); stride=w*ch
rows=[]; prev=bytearray(stride); p=0
for y in range(h):
    f=raw[p]; line=bytearray(raw[p+1:p+1+stride]); p+=1+stride
    for i in range(stride):
        a=line[i-bpp] if i>=bpp else 0; b=prev[i]; c=prev[i-bpp] if i>=bpp else 0
        if f==1: line[i]=(line[i]+a)&255
        elif f==2: line[i]=(line[i]+b)&255
        elif f==3: line[i]=(line[i]+((a+b)>>1))&255
        elif f==4:
            pa=abs(b-c); pb=abs(a-c); pc=abs(a+b-2*c)
            pr=a if (pa<=pb and pa<=pc) else (b if pb<=pc else c)
            line[i]=(line[i]+pr)&255
    rows.append(line); prev=line
def px(line,x):
    if ct==6: return line[x*4:x*4+4]
    if ct==2: return bytes(line[x*3:x*3+3])+b'\xff'
    if ct==0: return bytes([line[x]]*3)+b'\xff'
    if ct==4: return bytes([line[x*2]]*3)+bytes([line[x*2+1]])
    i=line[x]; return bytes(plte[i*3:i*3+3])+b'\xff'
P=[[px(l,x) for x in range(w)] for l in rows]
amin=min(q[3] for r in P for q in r)
if amin>=250:   # opaque (white) background: darkness = distance from white
    A=[[255-min(q[0],q[1],q[2]) for q in r] for r in P]
else:
    A=[[q[3] for q in r] for r in P]
xs=[x for r in A for x,v in enumerate(r) if v>12]; ys=[y for y,r in enumerate(A) if any(v>12 for v in r)]
pad=4; x0=max(0,min(xs)-pad); x1=min(w-1,max(xs)+pad); y0=max(0,min(ys)-pad); y1=min(h-1,max(ys)+pad)
ow=x1-x0+1; oh=y1-y0+1
out=bytearray()
for y in range(y0,y1+1):
    out.append(0)
    for x in range(x0,x1+1): out+=bytes((255,255,255,A[y][x]))
def chunk(t,b): return struct.pack('>I',len(b))+t+b+struct.pack('>I',zlib.crc32(t+b)&0xffffffff)
open(dst,'wb').write(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',ow,oh,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(bytes(out),9))+chunk(b'IEND',b''))
print(dst,ow,oh,'opaque-bg' if amin>=250 else 'has-alpha')
