with open("src/App.tsx") as f:
    text = f.read()

text = text.replace("      if (selectedImageIndex !== null) {\n        return;\n      } else {\n", "      if (selectedImageIndex !== null) {\n        return;\n      }\n      if (true) {\n")

with open("src/App.tsx", "w") as f:
    f.write(text)
