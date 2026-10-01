from PIL import Image, ImageDraw, ImageFont
import math
from pathlib import Path

W,H=900,520
BG=(13,17,23); PANEL=(22,27,34); TEXT=(230,237,243); MUTED=(139,148,158)
GREEN=(46,160,67); BLUE=(88,166,255); FOOD=(80,200,120); ACCENT=(255,200,80)

def font(size,bold=False,mono=False):
    base="/usr/share/fonts/truetype/dejavu/"
    if mono:
        name="DejaVuSansMono-Bold.ttf" if bold else "DejaVuSansMono.ttf"
    else:
        name="DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(base+name,size)

cell=20
board_left,board_top=70,110
board_size=360
scale=board_size/800
snake=[(400,400),(380,400),(360,400),(340,400),(320,400),(300,400),(280,400),(260,400),(240,400),(220,400),(200,400)]
foods=[(640,240),(100,660),(760,700),(60,80),(500,120)]
food_i=0; food=foods[0]; score=0

def wrap(v): return v%800
def dist(a,b):
    rx=abs(a[0]-b[0]); ry=abs(a[1]-b[1])
    return math.hypot(min(rx,800-rx),min(ry,800-ry))
def choose(s,f):
    best=None; bd=10**9
    for dx,dy in [(-20,0),(20,0),(0,-20),(0,20)]:
        n=(wrap(s[0][0]+dx),wrap(s[0][1]+dy))
        if n in s: continue
        d=dist(n,f)
        if d<bd: bd=d; best=(dx,dy)
    return best or (-20,0)

frames=[]
for i in range(62):
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    d.text((34,22),"Snake Game JS",font=font(28,True),fill=TEXT)
    d.text((34,58),"Autopilot + manual wrap-around gameplay",font=font(16),fill=MUTED)
    d.rounded_rectangle((35,92,515,485),radius=18,fill=PANEL)
    x0,y0=board_left,board_top
    d.rectangle((x0,y0,x0+board_size,y0+board_size),fill=(245,248,250),outline=(80,87,96),width=2)
    for g in range(0,801,100):
        p=x0+g*scale; q=y0+g*scale
        d.line((p,y0,p,y0+board_size),fill=(225,229,233))
        d.line((x0,q,x0+board_size,q),fill=(225,229,233))
    fx=x0+food[0]*scale; fy=y0+food[1]*scale; sz=max(7,int(cell*scale))
    d.rounded_rectangle((fx,fy,fx+sz,fy+sz),radius=3,fill=FOOD,outline=(28,110,58))
    for j,(sx,sy) in enumerate(snake):
        px=x0+sx*scale; py=y0+sy*scale
        d.rounded_rectangle((px,py,px+sz,py+sz),radius=2,fill=(28,105,210) if j==0 else (70,140,235))
    d.text((555,118),"LIVE DEMO",font=font(14,True),fill=GREEN)
    d.text((555,153),f"Score   {score}",font=font(25,True,True),fill=TEXT)
    d.text((555,194),"Mode    AUTOPILOT",font=font(18,False,True),fill=BLUE)
    d.text((555,230),"Controls",font=font(18,True),fill=TEXT)
    d.text((555,260),"Arrow keys  manual",font=font(15,False,True),fill=MUTED)
    d.text((555,286),"A           toggle auto",font=font(15,False,True),fill=MUTED)
    d.text((555,312),"R           restart",font=font(15,False,True),fill=MUTED)
    d.text((555,356),"Wrap-around edges",font=font(16,True),fill=TEXT)
    d.text((555,383),"Safe collision checks",font=font(16,True),fill=TEXT)
    d.text((555,410),"Food grows + speeds up",font=font(16,True),fill=TEXT)
    d.rounded_rectangle((548,444,850,478),radius=12,fill=(31,38,47))
    msg="Starting autopilot…" if i<6 else ("CI-tested game core" if i>53 else "Finding shortest safe move")
    d.text((565,452),msg,font=font(14),fill=ACCENT)
    frames.append(im)
    if 5<=i<54:
        dx,dy=choose(snake,food)
        head=(wrap(snake[0][0]+dx),wrap(snake[0][1]+dy))
        snake.insert(0,head)
        if head==food:
            score+=10; food_i=(food_i+1)%len(foods); food=foods[food_i]
        else:
            snake.pop()

frames[0].save("Snake-Demo.gif",save_all=True,append_images=frames[1:],duration=110,loop=0,optimize=True,disposal=2)
