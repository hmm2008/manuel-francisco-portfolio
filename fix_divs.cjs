const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Subtítulo da Página Biografia \*\/}/, '</div>\n            {/* Subtítulo da Página Biografia */}');
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*{\/\* Texto Biográfico, Trabalhos Publicados & Exposições \*\/}/, '</div>\n          </div>\n          {/* Texto Biográfico, Trabalhos Publicados & Exposições */}');

content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Subtítulo da Página de Contactos \*\/}/, '</div>\n            {/* Subtítulo da Página de Contactos */}');
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*{\/\* Estilos do Formulário \*\/}/, '</div>\n          </div>\n          {/* Estilos do Formulário */}');

content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Subtítulo do Livro de Visitas \*\/}/, '</div>\n            {/* Subtítulo do Livro de Visitas */}');
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*{\/\* Tipografia dos Registos \*\/}/, '</div>\n          </div>\n          {/* Tipografia dos Registos */}');

content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Subtítulo da Página de Links \*\/}/, '</div>\n            {/* Subtítulo da Página de Links */}');
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*{\/\* Tipografia dos Links \*\/}/, '</div>\n          </div>\n          {/* Tipografia dos Links */}');

fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', content);
