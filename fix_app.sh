sed -i.bak '/const \[showZenMode/i\
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);\
  const [showExifPanel, setShowExifPanel] = useState<boolean>(false);\
' src/App.tsx
