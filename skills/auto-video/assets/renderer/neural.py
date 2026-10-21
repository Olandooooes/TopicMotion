import asyncio, json, sys
import edge_tts
async def main():
    text, destination, rate = sys.argv[1:]
    for attempt in range(2):
        try:
            await asyncio.wait_for(edge_tts.Communicate(text, 'zh-CN-XiaoxiaoNeural', rate=f'{int(rate):+d}%').save(destination), 40)
            return
        except Exception:
            if attempt: raise
            await asyncio.sleep(1)
asyncio.run(main())
