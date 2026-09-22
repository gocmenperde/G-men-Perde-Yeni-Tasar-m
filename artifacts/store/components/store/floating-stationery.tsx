"use client";
import { motion } from "framer-motion";
import { House, Layers3, PanelTop, Ruler, Scissors, Sparkles, Sun, Star } from "lucide-react";
const items = [
  { Icon: PanelTop, x: "5%", y: "15%", size: 28, delay: 0, duration: 7, color: "text-amber-400/20" },
  { Icon: Sun, x: "85%", y: "10%", size: 32, delay: 1.2, duration: 9, color: "text-amber-300/15" },
  { Icon: House, x: "92%", y: "60%", size: 36, delay: 0.5, duration: 8, color: "text-amber-500/20" },
  { Icon: Ruler, x: "3%", y: "70%", size: 30, delay: 2, duration: 10, color: "text-amber-400/15" },
  { Icon: Scissors, x: "78%", y: "80%", size: 24, delay: 1.5, duration: 6, color: "text-amber-300/20" },
  { Icon: Layers3, x: "15%", y: "85%", size: 28, delay: 0.8, duration: 11, color: "text-amber-500/15" },
  { Icon: Sparkles, x: "50%", y: "5%", size: 26, delay: 1.8, duration: 8, color: "text-amber-400/20" },
  { Icon: Star, x: "40%", y: "90%", size: 20, delay: 0.3, duration: 9, color: "text-amber-300/25" },
];
export default function FloatingStationery(){return <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">{items.map(({Icon,x,y,size,delay,duration,color},i)=><motion.div key={i} className={`absolute ${color}`} style={{left:x,top:y}} animate={{y:[0,-20,0,15,0],x:[0,10,0,-8,0],rotate:[0,15,0,-10,0],opacity:[0.4,0.8,0.4,0.9,0.4]}} transition={{delay,duration,repeat:Infinity,ease:"easeInOut"}}><Icon size={size} strokeWidth={1.5}/></motion.div>)}</div>}
