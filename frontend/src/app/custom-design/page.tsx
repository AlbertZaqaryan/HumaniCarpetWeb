"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  HiOutlineUpload, HiOutlineTrash, HiOutlinePencil,
  HiOutlineSave, HiOutlinePaperAirplane, HiOutlineDownload,
  HiOutlineCursorClick, HiOutlinePhotograph, HiOutlineEye,
  HiOutlineEyeOff, HiOutlineZoomIn, HiOutlineZoomOut,
  HiOutlineTemplate, HiOutlineDuplicate, HiOutlineRefresh,
  HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineArrowUp,
  HiOutlineArrowDown, HiOutlineViewGrid,
} from "react-icons/hi";
import {
  FaEraser, FaCircle, FaSquare, FaStar, FaHeart,
  FaFont, FaSlash, FaPaintBrush, FaUndo, FaRedo,
  FaDrawPolygon, FaFillDrip, FaSprayCan,
} from "react-icons/fa";
import { BsTriangle, BsDiamond, BsHexagon, BsPentagon, BsOctagon } from "react-icons/bs";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import type { Canvas as FabricCanvas, FabricObject } from "fabric";

type ToolId =
  | "select" | "brush" | "spray" | "eraser" | "line"
  | "rect" | "circle" | "triangle" | "star" | "heart"
  | "diamond" | "hexagon" | "pentagon" | "octagon"
  | "polygon" | "text" | "fill";

const COLORS = [
  "#000000", "#ffffff", "#374151", "#6b7280", "#9ca3af",
  "#ef4444", "#dc2626", "#991b1b",
  "#f97316", "#ea580c", "#c2410c",
  "#eab308", "#ca8a04", "#a16207",
  "#22c55e", "#16a34a", "#15803d",
  "#06b6d4", "#0891b2", "#0e7490",
  "#3b82f6", "#2563eb", "#1d4ed8",
  "#8b5cf6", "#7c3aed", "#6d28d9",
  "#ec4899", "#db2777", "#be185d",
  "#92400e", "#78350f", "#451a03",
  "#d4a574", "#c2956b", "#a87b52",
  "#1e3a5f", "#1e293b", "#0f172a",
];

const BRUSH_PRESETS = [
  { label: "Fine", size: 1 },
  { label: "Thin", size: 3 },
  { label: "Medium", size: 8 },
  { label: "Thick", size: 15 },
  { label: "Bold", size: 25 },
  { label: "Extra", size: 40 },
];

const CANVAS_TEMPLATES = [
  { label: "Blank White", bg: "#ffffff" },
  { label: "Light Gray", bg: "#f5f5f4" },
  { label: "Warm Cream", bg: "#fef3c7" },
  { label: "Dark", bg: "#1c1917" },
  { label: "Sky Blue", bg: "#dbeafe" },
  { label: "Sage Green", bg: "#dcfce7" },
  { label: "Soft Pink", bg: "#fce7f3" },
  { label: "Lavender", bg: "#ede9fe" },
];

interface HistoryEntry {
  json: string;
}

export default function CustomDesignPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const [tool, setTool] = useState<ToolId>("select");
  const [brushColor, setBrushColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("#3b82f6");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [colorMode, setColorMode] = useState<"fill" | "stroke">("fill");
  const [activePanel, setActivePanel] = useState<"tools" | "shapes" | "colors" | "layers">("tools");
  const [layers, setLayers] = useState<{ id: number; name: string; visible: boolean; locked: boolean }[]>([]);
  const [selectedObj, setSelectedObj] = useState<FabricObject | null>(null);

  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);

  const { token } = useAuthStore();
  const [submitForm, setSubmitForm] = useState({ name: "", email: "", phone: "", description: "" });

  const saveHistory = () => {
    if (isUndoRedoRef.current || !fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push({ json });
    historyIndexRef.current = historyRef.current.length - 1;
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  };

  const undo = async () => {
    if (historyIndexRef.current <= 0 || !fabricRef.current) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current--;
    const entry = historyRef.current[historyIndexRef.current];
    await fabricRef.current.loadFromJSON(entry.json);
    fabricRef.current.renderAll();
    refreshLayers();
    isUndoRedoRef.current = false;
  };

  const redo = async () => {
    if (historyIndexRef.current >= historyRef.current.length - 1 || !fabricRef.current) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current++;
    const entry = historyRef.current[historyIndexRef.current];
    await fabricRef.current.loadFromJSON(entry.json);
    fabricRef.current.renderAll();
    refreshLayers();
    isUndoRedoRef.current = false;
  };

  const refreshLayers = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const objs = fc.getObjects();
    setLayers(
      objs.map((o, i) => ({
        id: i,
        name: (o as FabricObject & { customName?: string }).customName || o.type || `Object ${i + 1}`,
        visible: o.visible !== false,
        locked: o.selectable === false,
      })).reverse()
    );
  };

  useEffect(() => {
    let disposed = false;
    let canvasInstance: FabricCanvas | null = null;

    const init = async () => {
      if (!canvasRef.current || !containerRef.current) return;
      const fabricModule = await import("fabric");
      const { Canvas: FCanvas } = fabricModule;

      if (disposed) return;

      const width = containerRef.current.clientWidth - 34;
      const height = Math.round(width * 0.65);

      canvasInstance = new FCanvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "#ffffff",
        isDrawingMode: false,
        selection: true,
        preserveObjectStacking: true,
      });

      fabricRef.current = canvasInstance;

      canvasInstance.on("object:added", () => { saveHistory(); refreshLayers(); });
      canvasInstance.on("object:modified", () => { saveHistory(); refreshLayers(); });
      canvasInstance.on("object:removed", () => { saveHistory(); refreshLayers(); });
      canvasInstance.on("selection:created", (e) => {
        setSelectedObj(e.selected?.[0] || null);
      });
      canvasInstance.on("selection:updated", (e) => {
        setSelectedObj(e.selected?.[0] || null);
      });
      canvasInstance.on("selection:cleared", () => setSelectedObj(null));

      saveHistory();
      setCanvasReady(true);
    };

    init();

    return () => {
      disposed = true;
      if (canvasInstance) {
        canvasInstance.dispose();
        canvasInstance = null;
      }
      fabricRef.current = null;
      setCanvasReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;

    const drawTools: ToolId[] = ["brush", "spray", "eraser"];
    if (drawTools.includes(tool)) {
      fc.isDrawingMode = true;

      import("fabric").then(({ PencilBrush, SprayBrush }) => {
        if (!fc.isDrawingMode) return;

        if (tool === "spray") {
          const spray = new SprayBrush(fc);
          spray.color = brushColor;
          spray.width = brushSize * 2;
          fc.freeDrawingBrush = spray;
        } else {
          const pencil = new PencilBrush(fc);
          pencil.color = tool === "eraser" ? (fc.backgroundColor as string) || "#ffffff" : brushColor;
          pencil.width = tool === "eraser" ? brushSize * 3 : brushSize;
          fc.freeDrawingBrush = pencil;
        }
      });
    } else {
      fc.isDrawingMode = false;
    }
  }, [tool, brushColor, brushSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === "Delete" || e.key === "Backspace") { if (!(e.target as HTMLElement).closest("form")) deleteSelected(); }
      if (e.key === "v" && !ctrl) setTool("select");
      if (e.key === "b" && !ctrl) setTool("brush");
      if (e.key === "e" && !ctrl) setTool("eraser");
      if (e.key === "t" && !ctrl) addText();
      if (e.key === "l" && !ctrl) setTool("line");
      if (ctrl && e.key === "d") { e.preventDefault(); duplicateSelected(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !fabricRef.current) return;
      const { FabricImage } = await import("fabric");
      const reader = new FileReader();
      reader.onload = async () => {
        const img = await FabricImage.fromURL(reader.result as string);
        const canvas = fabricRef.current!;
        const scale = Math.min((canvas.width! * 0.6) / img.width!, (canvas.height! * 0.6) / img.height!, 1);
        img.scale(scale);
        img.set({ left: 50, top: 50 });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setTool("select");
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const addShape = async (type: ToolId) => {
    if (!fabricRef.current) return;
    const fabric = await import("fabric");
    const { Rect, Circle, Triangle, Polygon, Ellipse, FabricText } = fabric;
    const fc = fabricRef.current;
    const cx = fc.width! / 2 - 60;
    const cy = fc.height! / 2 - 60;
    const fill = fillColor;
    const stroke = strokeColor;
    const sw = 2;
    const op = opacity / 100;

    let shape: FabricObject | null = null;

    switch (type) {
      case "rect":
        shape = new Rect({ left: cx, top: cy, width: 120, height: 120, fill, stroke, strokeWidth: sw, opacity: op, rx: 4, ry: 4 });
        break;
      case "circle":
        shape = new Circle({ left: cx, top: cy, radius: 60, fill, stroke, strokeWidth: sw, opacity: op });
        break;
      case "triangle":
        shape = new Triangle({ left: cx, top: cy, width: 120, height: 110, fill, stroke, strokeWidth: sw, opacity: op });
        break;
      case "star": {
        const pts = starPoints(5, 60, 30, cx + 60, cy + 60);
        shape = new Polygon(pts, { fill, stroke, strokeWidth: sw, opacity: op });
        break;
      }
      case "heart": {
        const hPts = heartPoints(cx + 60, cy + 60, 50);
        shape = new Polygon(hPts, { fill: fill || "#ef4444", stroke, strokeWidth: sw, opacity: op });
        break;
      }
      case "diamond": {
        const dPts = [{ x: 60, y: 0 }, { x: 120, y: 70 }, { x: 60, y: 140 }, { x: 0, y: 70 }];
        shape = new Polygon(dPts, { left: cx, top: cy, fill, stroke, strokeWidth: sw, opacity: op });
        break;
      }
      case "hexagon": {
        const hxPts = regularPolygonPoints(6, 60, cx + 60, cy + 60);
        shape = new Polygon(hxPts, { fill, stroke, strokeWidth: sw, opacity: op });
        break;
      }
      case "pentagon": {
        const ppPts = regularPolygonPoints(5, 60, cx + 60, cy + 60);
        shape = new Polygon(ppPts, { fill, stroke, strokeWidth: sw, opacity: op });
        break;
      }
      case "octagon": {
        const oPts = regularPolygonPoints(8, 60, cx + 60, cy + 60);
        shape = new Polygon(oPts, { fill, stroke, strokeWidth: sw, opacity: op });
        break;
      }
      case "line": {
        const { Line } = fabric;
        shape = new Line([cx, cy + 60, cx + 160, cy + 60], { stroke: strokeColor, strokeWidth: brushSize, opacity: op }) as unknown as FabricObject;
        break;
      }
      default:
        return;
    }

    if (shape) {
      fc.add(shape);
      fc.setActiveObject(shape);
      fc.renderAll();
      setTool("select");
    }
  };

  const addText = async () => {
    if (!fabricRef.current) return;
    const { IText } = await import("fabric");
    const fc = fabricRef.current;
    const text = new IText("Your text here", {
      left: fc.width! / 2 - 80,
      top: fc.height! / 2 - 20,
      fontSize: 32,
      fontFamily: "Inter, sans-serif",
      fill: brushColor,
      opacity: opacity / 100,
    });
    fc.add(text);
    fc.setActiveObject(text);
    text.enterEditing();
    fc.renderAll();
    setTool("select");
  };

  const deleteSelected = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const active = fc.getActiveObjects();
    if (active.length > 0) {
      active.forEach((obj) => fc.remove(obj));
      fc.discardActiveObject();
      fc.renderAll();
    }
  };

  const duplicateSelected = async () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const active = fc.getActiveObject();
    if (!active) return;
    const cloned = await active.clone();
    cloned.set({ left: (active.left || 0) + 20, top: (active.top || 0) + 20 });
    fc.add(cloned);
    fc.setActiveObject(cloned);
    fc.renderAll();
  };

  const clearCanvas = () => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = "#ffffff";
    fabricRef.current.renderAll();
    saveHistory();
    refreshLayers();
  };

  const applyTemplate = (bg: string) => {
    if (!fabricRef.current) return;
    fabricRef.current.backgroundColor = bg;
    fabricRef.current.renderAll();
    saveHistory();
  };

  const handleZoom = (delta: number) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const newZoom = Math.max(25, Math.min(200, zoom + delta));
    setZoom(newZoom);
    fc.setZoom(newZoom / 100);
    fc.renderAll();
  };

  const bringForward = () => {
    const fc = fabricRef.current;
    if (!fc || !selectedObj) return;
    fc.bringObjectForward(selectedObj);
    fc.renderAll();
    refreshLayers();
  };

  const sendBackward = () => {
    const fc = fabricRef.current;
    if (!fc || !selectedObj) return;
    fc.sendObjectBackwards(selectedObj);
    fc.renderAll();
    refreshLayers();
  };

  const toggleLayerVisibility = (idx: number) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const objs = fc.getObjects();
    const realIdx = objs.length - 1 - idx;
    const obj = objs[realIdx];
    if (obj) {
      obj.visible = !obj.visible;
      fc.renderAll();
      refreshLayers();
    }
  };

  const toggleLayerLock = (idx: number) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const objs = fc.getObjects();
    const realIdx = objs.length - 1 - idx;
    const obj = objs[realIdx];
    if (obj) {
      obj.selectable = !obj.selectable;
      obj.evented = obj.selectable;
      fc.renderAll();
      refreshLayers();
    }
  };

  const downloadDesign = () => {
    if (!fabricRef.current) return;
    const dataUrl = fabricRef.current.toDataURL({ format: "png", multiplier: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "my-rug-design.png";
    a.click();
    toast.success("Design downloaded!");
  };

  const applyFillToSelected = () => {
    if (!fabricRef.current || !selectedObj) return;
    selectedObj.set("fill", fillColor);
    fabricRef.current.renderAll();
    saveHistory();
  };

  const applyStrokeToSelected = () => {
    if (!fabricRef.current || !selectedObj) return;
    selectedObj.set({ stroke: strokeColor, strokeWidth: 2 });
    fabricRef.current.renderAll();
    saveHistory();
  };

  const applyOpacityToSelected = () => {
    if (!fabricRef.current || !selectedObj) return;
    selectedObj.set("opacity", opacity / 100);
    fabricRef.current.renderAll();
    saveHistory();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fabricRef.current) return;
    setSubmitting(true);
    try {
      const dataUrl = fabricRef.current.toDataURL({ format: "png", multiplier: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const designJson = JSON.stringify(fabricRef.current.toJSON());
      const formData = new FormData();
      formData.append("name", submitForm.name);
      formData.append("email", submitForm.email);
      formData.append("phone", submitForm.phone);
      formData.append("description", submitForm.description);
      formData.append("design_image", blob, "custom-design.png");
      formData.append("design_data", designJson);
      await api.post("/custom-designs/", formData, token);
      toast.success("Design submitted! We'll review it and contact you.");
      setSubmitForm({ name: "", email: "", phone: "", description: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    }
    setSubmitting(false);
  };

  const toolBtn = (id: ToolId, icon: React.ReactNode, label: string, onClick?: () => void) => (
    <button
      key={id}
      onClick={onClick || (() => {
        if (["rect", "circle", "triangle", "star", "heart", "diamond", "hexagon", "pentagon", "octagon", "line"].includes(id)) {
          addShape(id);
        } else if (id === "text") {
          addText();
        } else {
          setTool(id);
        }
      })}
      title={label}
      className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] transition-all cursor-pointer ${
        tool === id
          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shadow-sm"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="leading-none">{label}</span>
    </button>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase mb-2">
          Create Your Own
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white mb-2">
          Design Studio
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
          Draw, paint, add shapes and images, build layers — then submit your vision and we&apos;ll craft it into a rug.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left sidebar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-64 flex-shrink-0 space-y-3">
          {/* Panel tabs */}
          <div className="flex rounded-2xl bg-neutral-100 dark:bg-neutral-900 p-1 gap-1">
            {(["tools", "shapes", "colors", "layers"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePanel(p)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer capitalize ${
                  activePanel === p
                    ? "bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Tools panel */}
          {activePanel === "tools" && (
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Drawing Tools</h3>
              <div className="grid grid-cols-4 gap-1">
                {toolBtn("select", <HiOutlineCursorClick className="w-4 h-4" />, "Select")}
                {toolBtn("brush", <HiOutlinePencil className="w-4 h-4" />, "Brush")}
                {toolBtn("spray", <FaSprayCan className="w-3.5 h-3.5" />, "Spray")}
                {toolBtn("eraser", <FaEraser className="w-3.5 h-3.5" />, "Eraser")}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={addText} className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs cursor-pointer">
                  <FaFont className="w-3 h-3" /> Text
                </button>
                <button onClick={addImage} className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs cursor-pointer">
                  <HiOutlineUpload className="w-4 h-4" /> Image
                </button>
              </div>

              <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider pt-1">Brush Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Size: {brushSize}px</span>
                  <div className="flex gap-1">
                    {BRUSH_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => setBrushSize(p.size)}
                        title={`${p.label} (${p.size}px)`}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                          brushSize === p.size
                            ? "bg-amber-100 dark:bg-amber-900/40"
                            : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        <div className="rounded-full bg-current" style={{ width: Math.min(p.size, 16), height: Math.min(p.size, 16) }} />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="range" min="1" max="60" value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-amber-600 h-1.5"
                />
              </div>

              <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider pt-1">Opacity</h3>
              <div className="flex items-center gap-2">
                <input
                  type="range" min="5" max="100" value={opacity}
                  onChange={(e) => { setOpacity(Number(e.target.value)); applyOpacityToSelected(); }}
                  className="flex-1 accent-amber-600 h-1.5"
                />
                <span className="text-xs text-neutral-500 w-8 text-right">{opacity}%</span>
              </div>
            </div>
          )}

          {/* Shapes panel */}
          {activePanel === "shapes" && (
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Basic Shapes</h3>
              <div className="grid grid-cols-4 gap-1">
                {toolBtn("rect", <FaSquare className="w-3.5 h-3.5" />, "Rect")}
                {toolBtn("circle", <FaCircle className="w-3.5 h-3.5" />, "Circle")}
                {toolBtn("triangle", <BsTriangle className="w-3.5 h-3.5" />, "Triangle")}
                {toolBtn("line", <FaSlash className="w-3.5 h-3.5" />, "Line")}
              </div>
              <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Special Shapes</h3>
              <div className="grid grid-cols-4 gap-1">
                {toolBtn("star", <FaStar className="w-3.5 h-3.5" />, "Star")}
                {toolBtn("heart", <FaHeart className="w-3.5 h-3.5" />, "Heart")}
                {toolBtn("diamond", <BsDiamond className="w-3.5 h-3.5" />, "Diamond")}
                {toolBtn("hexagon", <BsHexagon className="w-3.5 h-3.5" />, "Hexagon")}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {toolBtn("pentagon", <BsPentagon className="w-3.5 h-3.5" />, "Pentagon")}
                {toolBtn("octagon", <BsOctagon className="w-3.5 h-3.5" />, "Octagon")}
              </div>

              <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider pt-1">Shape Colors</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button onClick={() => setColorMode("fill")} className={`flex-1 text-xs py-1.5 rounded-lg cursor-pointer ${colorMode === "fill" ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400" : "bg-neutral-200 dark:bg-neutral-700"}`}>
                    Fill
                  </button>
                  <button onClick={() => setColorMode("stroke")} className={`flex-1 text-xs py-1.5 rounded-lg cursor-pointer ${colorMode === "stroke" ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400" : "bg-neutral-200 dark:bg-neutral-700"}`}>
                    Stroke
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border-2 border-neutral-300 dark:border-neutral-600" style={{ backgroundColor: colorMode === "fill" ? fillColor : strokeColor }} />
                  <input
                    type="color"
                    value={colorMode === "fill" ? fillColor : strokeColor}
                    onChange={(e) => {
                      if (colorMode === "fill") { setFillColor(e.target.value); }
                      else { setStrokeColor(e.target.value); }
                    }}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                {selectedObj && (
                  <div className="flex gap-1.5">
                    <button onClick={applyFillToSelected} className="flex-1 text-xs py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer">
                      Apply Fill
                    </button>
                    <button onClick={applyStrokeToSelected} className="flex-1 text-xs py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer">
                      Apply Stroke
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Colors panel */}
          {activePanel === "colors" && (
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Brush / Text Color</h3>
              <div className="grid grid-cols-6 gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all cursor-pointer ${
                      brushColor === c ? "border-amber-500 scale-110 shadow-md" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Custom:</span>
                <input
                  type="color" value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="flex-1 h-8 rounded-lg cursor-pointer"
                />
              </div>

              <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider pt-1">Canvas Background</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {CANVAS_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => applyTemplate(t.bg)}
                    title={t.label}
                    className="aspect-square rounded-lg border border-neutral-200 dark:border-neutral-700 hover:scale-105 transition-all cursor-pointer"
                    style={{ backgroundColor: t.bg }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Layers panel */}
          {activePanel === "layers" && (
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Layers</h3>
                <span className="text-[10px] text-neutral-400">{layers.length} objects</span>
              </div>
              {layers.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">No objects on canvas</p>
              ) : (
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {layers.map((layer, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs">
                      <button onClick={() => toggleLayerVisibility(idx)} className="cursor-pointer text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                        {layer.visible ? <HiOutlineEye className="w-3.5 h-3.5" /> : <HiOutlineEyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => toggleLayerLock(idx)} className="cursor-pointer text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                        {layer.locked ? <HiOutlineLockClosed className="w-3.5 h-3.5" /> : <HiOutlineLockOpen className="w-3.5 h-3.5" />}
                      </button>
                      <span className="flex-1 truncate text-neutral-700 dark:text-neutral-300 capitalize">{layer.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedObj && (
                <div className="flex gap-1.5 pt-1">
                  <button onClick={bringForward} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer">
                    <HiOutlineArrowUp className="w-3 h-3" /> Forward
                  </button>
                  <button onClick={sendBackward} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer">
                    <HiOutlineArrowDown className="w-3 h-3" /> Back
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Actions</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={undo} className="flex items-center justify-center gap-1 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs cursor-pointer" title="Ctrl+Z">
                <FaUndo className="w-3 h-3" /> Undo
              </button>
              <button onClick={redo} className="flex items-center justify-center gap-1 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs cursor-pointer" title="Ctrl+Y">
                <FaRedo className="w-3 h-3" /> Redo
              </button>
              <button onClick={duplicateSelected} className="flex items-center justify-center gap-1 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs cursor-pointer" title="Ctrl+D">
                <HiOutlineDuplicate className="w-4 h-4" /> Copy
              </button>
              <button onClick={deleteSelected} className="flex items-center justify-center gap-1 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-xs cursor-pointer" title="Delete">
                <HiOutlineTrash className="w-4 h-4" /> Delete
              </button>
              <button onClick={downloadDesign} className="flex items-center justify-center gap-1 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 text-xs cursor-pointer">
                <HiOutlineDownload className="w-4 h-4" /> Save
              </button>
              <button onClick={clearCanvas} className="flex items-center justify-center gap-1 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-xs cursor-pointer">
                <HiOutlineRefresh className="w-4 h-4" /> Clear
              </button>
            </div>
          </div>

          {/* Keyboard shortcuts reference */}
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Shortcuts</h3>
            <div className="space-y-1 text-[10px] text-neutral-400">
              {[
                ["V", "Select"], ["B", "Brush"], ["E", "Eraser"], ["T", "Text"], ["L", "Line"],
                ["Ctrl+Z", "Undo"], ["Ctrl+Y", "Redo"], ["Ctrl+D", "Duplicate"], ["Del", "Delete"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 font-mono">{k}</kbd>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Canvas area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 min-w-0">
          {/* Canvas toolbar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <button onClick={() => handleZoom(-10)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer" title="Zoom Out">
                <HiOutlineZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-neutral-500 w-10 text-center">{zoom}%</span>
              <button onClick={() => handleZoom(10)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer" title="Zoom In">
                <HiOutlineZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
              <button onClick={() => { setZoom(100); fabricRef.current?.setZoom(1); fabricRef.current?.renderAll(); }} className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer">
                Reset
              </button>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <HiOutlineViewGrid className="w-3.5 h-3.5" />
              {fabricRef.current?.width && `${Math.round(fabricRef.current.width)}×${Math.round(fabricRef.current.height!)}`}
            </div>
          </div>

          <div ref={containerRef} className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[#e8e8e8] dark:bg-neutral-900 p-4">
            <div className="overflow-auto rounded-xl shadow-inner bg-white" style={{ maxHeight: 700 }}>
              <canvas ref={canvasRef} />
              {!canvasReady && (
                <div className="flex items-center justify-center py-40">
                  <div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          </div>

          {/* Submit form */}
          <form onSubmit={handleSubmit} className="mt-6 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
              <HiOutlinePaperAirplane className="w-5 h-5 text-amber-600" />
              Submit Your Design
            </h3>
            <p className="text-xs text-neutral-500 -mt-2">We&apos;ll review your design and contact you with a quote within 24 hours.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input name="name" placeholder="Your Name *" required value={submitForm.name}
                onChange={(e) => setSubmitForm((p) => ({ ...p, name: e.target.value }))}
                className="px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-amber-500" />
              <input name="email" type="email" placeholder="Your Email *" required value={submitForm.email}
                onChange={(e) => setSubmitForm((p) => ({ ...p, email: e.target.value }))}
                className="px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-amber-500" />
              <input name="phone" placeholder="Phone Number" value={submitForm.phone}
                onChange={(e) => setSubmitForm((p) => ({ ...p, phone: e.target.value }))}
                className="px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-amber-500" />
            </div>
            <textarea placeholder="Describe your design idea, preferred size, colors, budget..."
              rows={3} value={submitForm.description}
              onChange={(e) => setSubmitForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-amber-500 resize-none" />
            <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2" disabled={submitting}>
              <HiOutlineSave className="w-5 h-5" />
              {submitting ? "Submitting..." : "Submit Design Request"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function starPoints(points: number, outer: number, inner: number, cx: number, cy: number) {
  const arr = [];
  const step = Math.PI / points;
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = i * step - Math.PI / 2;
    arr.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return arr;
}

function heartPoints(cx: number, cy: number, size: number) {
  const pts = [];
  for (let i = 0; i < 360; i += 5) {
    const rad = (i * Math.PI) / 180;
    const x = size * 16 * Math.pow(Math.sin(rad), 3) / 16;
    const y = -size * (13 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad)) / 16;
    pts.push({ x: cx + x, y: cy + y });
  }
  return pts;
}

function regularPolygonPoints(sides: number, radius: number, cx: number, cy: number) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
    pts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  }
  return pts;
}
