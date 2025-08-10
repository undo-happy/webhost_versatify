from openai import OpenAI
import os

# 참고용 스크립트: Upstage Solar Pro 2 호출 (reasoning_effort='high')
# 실행 전 환경 변수 설정: export UPSTAGE_API_KEY=...

client = OpenAI(
    api_key=os.getenv("UPSTAGE_API_KEY", "YOUR_UPSTAGE_API_KEY"),
    base_url="https://api.upstage.ai/v1/solar",
)

resp = client.chat.completions.create(
    model="solar-pro2",
    messages=[
        {"role": "system", "content": "당신은 논리적 추론에 능한 어시스턴트입니다."},
        {"role": "user", "content": "여러 단계의 추론이 필요한 복잡한 문제를 제시합니다..."},
    ],
    temperature=0.7,
    max_tokens=1024,
    reasoning_effort="high",
)

print(resp.choices[0].message.content)