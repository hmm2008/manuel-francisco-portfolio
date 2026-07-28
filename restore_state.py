import sys

with open("src/App.tsx", "r") as f:
    lines = f.readlines()

insert_idx = -1
for i, line in enumerate(lines):
    if "const [selectedImageIndex, setSelectedImageIndex] = useState" in line:
        insert_idx = i + 1
        break

if insert_idx != -1:
    state_lines = [
        "  const [hideLightboxControls, setHideLightboxControls] = useState<boolean>(false);\n",
        "  const [showExifPanel, setShowExifPanel] = useState<boolean>(false);\n",
        "  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);\n",
        "  const [showZenMode, setShowZenMode] = useState<boolean>(false);\n",
        "  const [isAutoPlayActive, setIsAutoPlayActive] = useState<boolean>(false);\n",
        "  const [slideshowSpeed, setSlideshowSpeed] = useState<number>(4000);\n",
        "  const [swipeHintVisible, setSwipeHintVisible] = useState<boolean>(false);\n",
        "  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);\n",
        "  const [touchDelta, setTouchDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });\n",
        "  const [slideIndex, setSlideIndex] = useState(0);\n",
        "  const [zoomLevel, setZoomLevel] = useState(100);\n",
        "  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });\n",
        "  const pinchStartDistRef = useRef<number | null>(null);\n",
        "  const pinchStartZoomRef = useRef<number>(100);\n",
        "  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });\n",
        "  const lastTapTimeRef = useRef<number>(0);\n",
        "  const lastTapPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });\n"
    ]
    lines = lines[:insert_idx] + state_lines + lines[insert_idx:]
    with open("src/App.tsx", "w") as f:
        f.writelines(lines)
    print("State restored")
