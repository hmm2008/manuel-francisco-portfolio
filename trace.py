with open("src/App.tsx") as f:
    lines = f.readlines()

count = 0
for i, line in enumerate(lines):
    for char in line:
        if char == '{':
            count += 1
        elif char == '}':
            count -= 1
    if count == 0 and i > 85: # App() starts at 85
        print(f"Count hit 0 at line {i+1}")
