with open("src/App.tsx", "r") as f:
    app_code = f.read()

bad_str = """const navItems = [
  { id: 'inicio', label: 'INÍCIO', icon: Home },
  { id: 'galeria', label: 'GALERIA', icon: ImageIcon },
  { id: 'biografia', label: 'BIOGRAFIA', icon: User },
  { id: 'livro', label: 'LIVRO DE VISITAS', icon: BookOpen },
  { id: 'contacto', label: 'CONTACTO', icon: Mail },
  { id: 'links', label: 'LINKS', icon: LinkIcon },
  { id: 'admin', label: 'ADMIN', icon: Settings }
];"""

app_code = app_code.replace(bad_str, "")

# Add import
import_stmt = "import { navItems } from './components/NavigationItems';\n"
if "import { View, ImageProps, SiteSettings } from './types';" in app_code:
    app_code = app_code.replace("import { View, ImageProps, SiteSettings } from './types';", "import { View, ImageProps, SiteSettings } from './types';\n" + import_stmt)

with open("src/App.tsx", "w") as f:
    f.write(app_code)
