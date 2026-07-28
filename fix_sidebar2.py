with open("src/components/DesktopSidebar.tsx", "r") as f:
    code = f.read()

lines = code.split("\n")
# find return (
idx = -1
for i, line in enumerate(lines):
    if line.strip() == "return (":
        idx = i
        break

lines.insert(idx + 1, "    <>")
lines.insert(len(lines) - 2, "    </>")

with open("src/components/DesktopSidebar.tsx", "w") as f:
    f.write("\n".join(lines))
