with open("src/components/Slideshow.tsx") as f:
    text = f.read()

# Make it valid React component.
# Replace the first `<>` and last `</>` or rather just wrap it in a return statement.
lines = text.split("\n")
# find export default function Slideshow
start_idx = 0
for i, line in enumerate(lines):
    if line.startswith("export default function Slideshow"):
        start_idx = i
        break

# The code in slideshow_code.txt starts with {galleryImages.length > 0 ? (
lines.insert(start_idx + 13, "  return (")
lines.insert(start_idx + 14, "    <>")
lines.insert(len(lines)-1, "    </>")
lines.insert(len(lines)-1, "  );")

with open("src/components/Slideshow.tsx", "w") as f:
    f.write("\n".join(lines))
