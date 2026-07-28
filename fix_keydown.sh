sed -i.bak -e '680,709c\
      if (selectedImageIndex !== null) {\
        return;\
' src/App.tsx
