with open("src/components/DesktopSidebar.tsx", "r") as f:
    code = f.read()

code = code.replace("  return (\n      {/* Desktop Sidebar */}", "  return (\n    <>\n      {/* Desktop Sidebar */}")
code = code.replace("  );\n}", "    </>\n  );\n}")

with open("src/components/DesktopSidebar.tsx", "w") as f:
    f.write(code)
