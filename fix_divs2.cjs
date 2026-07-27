const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Subtítulo da Página Biografia \*\/}/g, '</div>\n          {/* Subtítulo da Página Biografia */}');
content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Subtítulo de Contacto \*\/}/g, '</div>\n          {/* Subtítulo de Contacto */}');
content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Subtítulo do Livro de Visitas \*\/}/g, '</div>\n          {/* Subtítulo do Livro de Visitas */}');
content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Subtítulo da Página de Links \*\/}/g, '</div>\n          {/* Subtítulo da Página de Links */}');

// And the ones at the end of Subtitle sections
content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Texto Biográfico, Trabalhos Publicados & Exposições \*\/}/g, '</div>\n        </div>\n\n        {/* Texto Biográfico, Trabalhos Publicados & Exposições */}');
content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Etiquetas do Formulário \*\/}/g, '</div>\n\n          {/* Etiquetas do Formulário */}');
content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Estilos dos Registos \*\/}/g, '</div>\n\n          {/* Estilos dos Registos */}');
content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Tipografia dos Links \*\/}/g, '</div>\n\n          {/* Tipografia dos Links */}');
content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Layout dos Links \*\/}/g, '</div>\n\n          {/* Layout dos Links */}');

fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', content);
