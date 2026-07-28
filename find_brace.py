import sys

with open("src/App.tsx") as f:
    text = f.read()

count = 0
for i, char in enumerate(text):
    if char == '{':
        count += 1
    elif char == '}':
        count -= 1
    
    if count < 0:
        line_num = text[:i].count('\n') + 1
        print(f"Extra '}}' found at line {line_num}")
        sys.exit(0)
