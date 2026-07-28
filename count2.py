import sys
with open(sys.argv[1]) as f:
    text = f.read()
print("Braces:", text.count("{") - text.count("}"))
print("Divs:", text.count("<div") - text.count("</div"))
