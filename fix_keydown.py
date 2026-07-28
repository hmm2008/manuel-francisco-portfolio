with open("src/App.tsx") as f:
    text = f.read()

import re

new_text = re.sub(
    r"if \(selectedImageIndex !== null\) \{.*?\n\s+\} else \{",
    "if (selectedImageIndex !== null) {\n        return;\n      } else {",
    text,
    flags=re.DOTALL
)

with open("src/App.tsx", "w") as f:
    f.write(new_text)
print("Replaced:", text != new_text)
