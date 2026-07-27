const fs = require('fs');
let content = fs.readFileSync('src/components/Guestbook.tsx', 'utf8');

const target = `{settings?.guestbookSectionSubtitle || 'Visitantes'} - {signatures.length} {signatures.length === 1 ? 'registo' : 'registos'}`;
const injection = `
            {(!settings?.guestbookSubtitleMode || settings.guestbookSubtitleMode === 'both') && (
              <>{settings?.guestbookSectionSubtitle || 'Visitantes'} - {signatures.length} {signatures.length === 1 ? 'registo' : 'registos'}</>
            )}
            {settings?.guestbookSubtitleMode === 'subtitle_only' && (
              <>{settings?.guestbookSectionSubtitle || 'Visitantes'}</>
            )}
            {settings?.guestbookSubtitleMode === 'count_only' && (
              <>{signatures.length} {signatures.length === 1 ? 'registo' : 'registos'}</>
            )}
`;

content = content.replace(target, injection.trim());
fs.writeFileSync('src/components/Guestbook.tsx', content);
