"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  placeholder?: string;
  className?: string;
}

const EMOJI_CATEGORIES = {
  "Belohnungen": ["🏆", "🎁", "⭐", "🌟", "💎", "🎯", "🎮", "🎨", "🎪", "🎭", "🎬", "🎼", "🏅", "🥇", "🥈", "🥉"],
  "Konsequenzen": ["⚠️", "🚫", "❌", "⛔", "🔴", "🟡", "🟠", "📝", "🚨", "⏰", "📵", "🔇", "🚷", "❗", "‼️", "⁉️"],
  "Aktivitäten": ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🥊", "🎳", "♟️", "🎲", "🎯", "🏹", "🎣", "🏊"],
  "Schule": ["📚", "📖", "📝", "✏️", "🖊️", "🖍️", "📐", "📏", "🔬", "🔭", "🎓", "🎒", "📎", "📌", "📍", "🗂️"],
  "Emotionen": ["😊", "😎", "🤩", "😍", "🥳", "😤", "😢", "😴", "🤔", "😮", "😯", "😲", "🙄", "😑", "😐", "🤗"],
  "Natur": ["🌈", "☀️", "🌤️", "⛅", "☁️", "🌧️", "⛈️", "❄️", "🌸", "🌺", "🌻", "🌷", "🌹", "🌿", "🍀", "🌳"],
  "Essen": ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🍍", "🥝", "🍅", "🥗", "🍕", "🍔", "🍟"],
  "Tiere": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🦄"]
};

export function EmojiPicker({ value, onChange, placeholder = "🎁", className }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start", className)}
        >
          <span className="text-2xl mr-2">{value || placeholder}</span>
          <span className="text-muted-foreground">Emoji wählen</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-2" align="start">
        <div className="space-y-2">
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    className="h-10 w-10 p-0 hover:bg-accent"
                    onClick={() => onChange(emoji)}
                  >
                    <span className="text-xl">{emoji}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}