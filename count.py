with open("src/App.tsx") as f:
    text = f.read()
print("Braces:", text.count("{") - text.count("}"))
print("Parentheses:", text.count("(") - text.count(")"))
print("Divs:", text.count("<div") - text.count("</div"))
print("AnimatePresence:", text.count("<AnimatePresence") - text.count("</AnimatePresence>"))
